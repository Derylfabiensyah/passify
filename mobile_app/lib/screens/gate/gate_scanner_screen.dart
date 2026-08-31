import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:provider/provider.dart';
import '../../constants/app_colors.dart';
import '../../models/scan_log_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/gate_scanner_provider.dart';
import '../../widgets/scan_result_sheet.dart';
import '../../widgets/scanner_overlay.dart';
import 'gate_stats_screen.dart';
import 'offline_manifest_screen.dart';

class GateScannerScreen extends StatefulWidget {
  const GateScannerScreen({super.key});

  @override
  State<GateScannerScreen> createState() => _GateScannerScreenState();
}

class _GateScannerScreenState extends State<GateScannerScreen> {
  final MobileScannerController _scannerController = MobileScannerController(
    detectionSpeed: DetectionSpeed.normal,
    facing: CameraFacing.back,
    torchEnabled: false,
  );

  bool _isModalShowing = false;
  bool _isContinuousMode = true; // Continuous HUD Mode by default for high throughput
  ValidateResultModel? _hudResult;
  Timer? _hudTimer;
  String? _lastScannedPayload;
  DateTime? _lastScannedTime;

  @override
  void dispose() {
    _hudTimer?.cancel();
    _scannerController.dispose();
    super.dispose();
  }

  void _showDetailModal(ValidateResultModel result) {
    if (_isModalShowing) return;
    setState(() => _isModalShowing = true);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => ScanResultSheet(
        result: result,
        onDismiss: () {
          Navigator.of(ctx).pop();
          setState(() => _isModalShowing = false);
        },
      ),
    ).then((_) {
      if (mounted) {
        setState(() => _isModalShowing = false);
      }
    });
  }

  void _onDetect(BarcodeCapture capture) async {
    if (_isModalShowing) return;

    final barcodes = capture.barcodes;
    if (barcodes.isEmpty) return;

    final rawCode = barcodes.first.rawValue;
    if (rawCode == null || rawCode.isEmpty) return;

    // Debounce duplicate scans within 2 seconds
    final now = DateTime.now();
    if (_lastScannedPayload == rawCode && _lastScannedTime != null) {
      if (now.difference(_lastScannedTime!) < const Duration(milliseconds: 2000)) {
        return;
      }
    }

    final scannerProvider = Provider.of<GateScannerProvider>(context, listen: false);
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    if (scannerProvider.isProcessing) return;

    _lastScannedPayload = rawCode;
    _lastScannedTime = now;

    // Audio click / beep feedback
    SystemSound.play(SystemSoundType.click);

    final result = await scannerProvider.processScannedCode(
      rawPayload: rawCode,
      deviceId: authProvider.selectedDeviceId,
    );

    if (!mounted) return;

    if (_isContinuousMode) {
      // Continuous HUD Mode: Show auto-dismiss floating HUD banner without stopping camera
      setState(() {
        _hudResult = result;
      });

      _hudTimer?.cancel();
      _hudTimer = Timer(const Duration(milliseconds: 1800), () {
        if (mounted) {
          setState(() {
            _hudResult = null;
          });
        }
      });
    } else {
      // Modal Detail Mode: Show modal bottom sheet
      _showDetailModal(result);
    }
  }

  @override
  Widget build(BuildContext context) {
    final scannerProvider = Provider.of<GateScannerProvider>(context);
    final screenSize = MediaQuery.of(context).size;
    final scanWindowSize = screenSize.width * 0.72;
    final scanWindow = Rect.fromCenter(
      center: Offset(screenSize.width / 2, screenSize.height * 0.42),
      width: scanWindowSize,
      height: scanWindowSize,
    );

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // 1. Mobile Scanner View
          MobileScanner(
            controller: _scannerController,
            scanWindow: scanWindow,
            onDetect: _onDetect,
          ),

          // 2. Custom Overlay & Reticle
          ScannerOverlay(scanWindow: scanWindow),

          // 3. Top Action Bar
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Back / Close
                  CircleAvatar(
                    backgroundColor: Colors.black45,
                    child: IconButton(
                      icon: const Icon(Icons.arrow_back, color: Colors.white),
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                  ),

                  // Mode Switcher (Continuous HUD vs Detail Modal) & Online/Offline
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Continuous Mode Toggle
                      GestureDetector(
                        onTap: () {
                          setState(() {
                            _isContinuousMode = !_isContinuousMode;
                            _hudResult = null;
                          });
                          ScaffoldMessenger.of(context).clearSnackBars();
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(
                                _isContinuousMode
                                    ? '⚡ Mode Kontinu Aktif (HUD Cepat & Auto-Dismiss)'
                                    : '📋 Mode Detail Aktif (Modal Sheet)',
                              ),
                              duration: const Duration(seconds: 1),
                              behavior: SnackBarBehavior.floating,
                            ),
                          );
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          margin: const EdgeInsets.only(right: 6),
                          decoration: BoxDecoration(
                            color: _isContinuousMode
                                ? const Color(0xFF059669).withValues(alpha: 0.9)
                                : Colors.black54,
                            borderRadius: AppRadius.radiusXl,
                            border: Border.all(
                              color: _isContinuousMode ? AppColors.leaf : Colors.white30,
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                _isContinuousMode ? Icons.bolt : Icons.view_agenda_outlined,
                                color: Colors.white,
                                size: 14,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                _isContinuousMode ? 'KONTINU' : 'DETAIL',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      // Offline/Online Mode Indicator
                      GestureDetector(
                        onTap: () => scannerProvider.toggleOfflineMode(),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: scannerProvider.forceOfflineMode ? AppColors.bark : AppColors.forest,
                            borderRadius: AppRadius.radiusXl,
                            border: Border.all(color: Colors.white30),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                scannerProvider.forceOfflineMode ? Icons.cloud_off : Icons.cloud_done,
                                color: Colors.white,
                                size: 14,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                scannerProvider.forceOfflineMode ? 'OFFLINE' : 'ONLINE',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),

                  // Torch & Switch Camera Controls
                  Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: Colors.black45,
                        child: IconButton(
                          icon: Icon(
                            scannerProvider.isTorchOn ? Icons.flash_on : Icons.flash_off,
                            color: scannerProvider.isTorchOn ? Colors.amber : Colors.white,
                          ),
                          onPressed: () {
                            _scannerController.toggleTorch();
                            scannerProvider.toggleTorch();
                          },
                        ),
                      ),
                      const SizedBox(width: 6),
                      CircleAvatar(
                        backgroundColor: Colors.black45,
                        child: IconButton(
                          icon: const Icon(Icons.flip_camera_ios, color: Colors.white),
                          onPressed: () => _scannerController.switchCamera(),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // 4. Instructions & Scan Target Text
          Positioned(
            top: screenSize.height * 0.42 + (scanWindowSize / 2) + 20,
            left: 20,
            right: 20,
            child: Column(
              children: [
                const Text(
                  'Arahkan kamera ke QR Code Tiket Wisata',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    shadows: [Shadow(color: Colors.black54, blurRadius: 6)],
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  _isContinuousMode
                      ? '⚡ Mode Kontinu Aktif • Scan instan tanpa jeda modal'
                      : 'Mendukung Dynamic TOTP & Tiket Reguler (< 500ms)',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.8),
                    fontSize: 12,
                    shadows: const [Shadow(color: Colors.black54, blurRadius: 6)],
                  ),
                ),
              ],
            ),
          ),

          // 5. Continuous Mode Floating HUD Toast (Auto-Dismiss)
          if (_hudResult != null) _buildHudToast(_hudResult!),

          // 6. Bottom Live Stats Dashboard
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
              decoration: const BoxDecoration(
                color: AppColors.forestDeep,
                borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildStatItem('Total Scan', '${scannerProvider.sessionTotal}', Colors.white),
                      _buildStatDivider(),
                      _buildStatItem('Tiket Valid', '${scannerProvider.sessionValid}', AppColors.leaf),
                      _buildStatDivider(),
                      _buildStatItem('Ditolak', '${scannerProvider.sessionInvalid}', Colors.redAccent),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (_) => const OfflineManifestScreen()),
                            );
                          },
                          icon: const Icon(Icons.storage, size: 16, color: Colors.white),
                          label: const Text('Cache Tiket', style: TextStyle(color: Colors.white, fontSize: 12)),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: Colors.white24),
                            shape: const RoundedRectangleBorder(borderRadius: AppRadius.radiusMd),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (_) => const GateStatsScreen()),
                            );
                          },
                          icon: const Icon(Icons.bar_chart, size: 16, color: Colors.white),
                          label: const Text('Statistik Gate', style: TextStyle(color: Colors.white, fontSize: 12)),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: Colors.white24),
                            shape: const RoundedRectangleBorder(borderRadius: AppRadius.radiusMd),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHudToast(ValidateResultModel result) {
    final isValid = result.valid;
    final statusColor = isValid ? const Color(0xFF10B981) : const Color(0xFFEF4444);
    final bgCardColor = isValid
        ? const Color(0xFF064E3B).withValues(alpha: 0.94)
        : const Color(0xFF7F1D1D).withValues(alpha: 0.94);

    return Positioned(
      top: 90,
      left: 16,
      right: 16,
      child: GestureDetector(
        onTap: () => _showDetailModal(result),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: bgCardColor,
            borderRadius: AppRadius.radiusLg,
            border: Border.all(color: statusColor, width: 2),
            boxShadow: [
              BoxShadow(
                color: statusColor.withValues(alpha: 0.35),
                blurRadius: 18,
                spreadRadius: 2,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            children: [
              // Large Status Icon with Circular border
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.25),
                  shape: BoxShape.circle,
                  border: Border.all(color: statusColor, width: 2),
                ),
                child: Icon(
                  isValid ? Icons.check_circle_rounded : Icons.cancel_rounded,
                  color: statusColor,
                  size: 28,
                ),
              ),
              const SizedBox(width: 12),

              // Info Column
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            isValid ? 'TIKET VALID • MASUK' : 'TIKET DITOLAK',
                            style: TextStyle(
                              color: statusColor,
                              fontSize: 13,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                        if (result.isOffline)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                            decoration: const BoxDecoration(
                              color: Colors.white24,
                              borderRadius: AppRadius.radiusSm,
                            ),
                            child: const Text(
                              'OFFLINE',
                              style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      result.visitorName.isNotEmpty
                          ? result.visitorName
                          : (isValid ? 'Pengunjung Terverifikasi' : 'Tiket Tidak Dikenal'),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (result.ticketCode.isNotEmpty)
                      Text(
                        result.ticketCode,
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.7),
                          fontSize: 10,
                          fontFamily: 'monospace',
                        ),
                      ),
                  ],
                ),
              ),

              // Tap hint icon
              const SizedBox(width: 8),
              Icon(
                Icons.chevron_right,
                color: Colors.white.withValues(alpha: 0.5),
                size: 20,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value, Color color) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            color: Colors.white70,
          ),
        ),
      ],
    );
  }

  Widget _buildStatDivider() {
    return Container(
      width: 1,
      height: 28,
      color: Colors.white24,
    );
  }
}

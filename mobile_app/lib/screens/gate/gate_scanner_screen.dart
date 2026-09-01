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
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.5),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
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
                          HapticFeedback.selectionClick();
                          setState(() {
                            _isContinuousMode = !_isContinuousMode;
                            _hudResult = null;
                          });
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          margin: const EdgeInsets.only(right: 6),
                          decoration: BoxDecoration(
                            color: _isContinuousMode
                                ? AppColors.forestSoft.withValues(alpha: 0.9)
                                : Colors.black54,
                            borderRadius: BorderRadius.circular(AppRadius.xl),
                            border: Border.all(
                              color: _isContinuousMode ? AppColors.leafPale : Colors.white24,
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                _isContinuousMode ? Icons.bolt_rounded : Icons.view_agenda_rounded,
                                color: Colors.white,
                                size: 14,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                _isContinuousMode ? 'KONTINU' : 'DETAIL',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      // Offline/Online Mode Indicator
                      GestureDetector(
                        onTap: () {
                          HapticFeedback.selectionClick();
                          scannerProvider.toggleOfflineMode();
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: scannerProvider.forceOfflineMode ? AppColors.bark : AppColors.forest,
                            borderRadius: BorderRadius.circular(AppRadius.xl),
                            border: Border.all(color: Colors.white30),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                scannerProvider.forceOfflineMode ? Icons.cloud_off_rounded : Icons.cloud_done_rounded,
                                color: Colors.white,
                                size: 14,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                scannerProvider.forceOfflineMode ? 'OFFLINE' : 'ONLINE',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.w800,
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
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.5),
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
                        ),
                        child: IconButton(
                          icon: Icon(
                            scannerProvider.isTorchOn ? Icons.flash_on_rounded : Icons.flash_off_rounded,
                            color: scannerProvider.isTorchOn ? AppColors.gold : Colors.white,
                            size: 20,
                          ),
                          onPressed: () {
                            HapticFeedback.selectionClick();
                            _scannerController.toggleTorch();
                            scannerProvider.toggleTorch();
                          },
                        ),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.5),
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
                        ),
                        child: IconButton(
                          icon: const Icon(Icons.flip_camera_ios_rounded, color: Colors.white, size: 20),
                          onPressed: () {
                            HapticFeedback.selectionClick();
                            _scannerController.switchCamera();
                          },
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
                  'Arahkan kamera ke QR Code Tiket Pengunjung',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 13.5,
                    fontWeight: FontWeight.w700,
                    shadows: [Shadow(color: Colors.black87, blurRadius: 8)],
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  _isContinuousMode
                      ? '⚡ Mode Kontinu Aktif • Scan instan otomatis'
                      : 'Mendukung Dynamic QR & Tiket Fisik',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.85),
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    shadows: const [Shadow(color: Colors.black87, blurRadius: 8)],
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
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              decoration: BoxDecoration(
                color: AppColors.forestDeep.withValues(alpha: 0.96),
                borderRadius: const BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.3),
                    blurRadius: 16,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildStatItem('Total Scan', '${scannerProvider.sessionTotal}', Colors.white),
                      _buildStatDivider(),
                      _buildStatItem('Tiket Valid', '${scannerProvider.sessionValid}', AppColors.leafPale),
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
                          icon: const Icon(Icons.storage_rounded, size: 16, color: Colors.white),
                          label: const Text('Cache Offline', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700)),
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(color: Colors.white.withValues(alpha: 0.25)),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.md)),
                            padding: const EdgeInsets.symmetric(vertical: 10),
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
                          icon: const Icon(Icons.bar_chart_rounded, size: 16, color: Colors.white),
                          label: const Text('Statistik Gate', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700)),
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(color: Colors.white.withValues(alpha: 0.25)),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.md)),
                            padding: const EdgeInsets.symmetric(vertical: 10),
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
        ? const Color(0xFF1B3B24).withValues(alpha: 0.96)
        : const Color(0xFF5A1E1E).withValues(alpha: 0.96);

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
            borderRadius: BorderRadius.circular(AppRadius.lg),
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
                    Text(
                      isValid ? 'TIKET VALID • DIPERBOLEHKAN MASUK' : 'TIKET DITOLAK',
                      style: TextStyle(
                        color: statusColor,
                        fontSize: 12.5,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      result.visitorName.isNotEmpty
                          ? '${result.visitorName} (${result.categoryName.isNotEmpty ? result.categoryName : 'Pengunjung'})'
                          : result.message,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
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

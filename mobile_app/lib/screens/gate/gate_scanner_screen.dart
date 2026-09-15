import 'dart:async';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:provider/provider.dart';
import '../../constants/app_colors.dart';
import '../../models/scan_log_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/gate_scanner_provider.dart';
import '../../widgets/glass_container.dart';
import '../../widgets/scan_result_sheet.dart';
import '../../widgets/scanner_overlay.dart';
import 'gate_stats_screen.dart';
import 'offline_manifest_screen.dart';
import 'pairing_scanner_screen.dart';

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
  int _quarterTurns = 0; // Manual rotation correction (0, 90, 180, 270) if sensor hardware requires it
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

  void _showManualInputDialog() {
    final textController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Row(
          children: [
            Icon(Icons.edit_note_rounded, color: AppColors.forest),
            SizedBox(width: 8),
            Text(
              'Input Kode Tiket',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.ink),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Masukkan kode tiket pengunjung secara manual:',
              style: TextStyle(fontSize: 12, color: AppColors.inkSoft),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: textController,
              autofocus: true,
              textCapitalization: TextCapitalization.characters,
              decoration: InputDecoration(
                hintText: 'Contoh: TWA-QR-21712',
                hintStyle: const TextStyle(fontSize: 13, color: AppColors.textMuted),
                filled: true,
                fillColor: AppColors.canvas,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Batal', style: TextStyle(color: AppColors.inkSoft)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.forest,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            onPressed: () async {
              final code = textController.text.trim();
              if (code.isEmpty) return;
              Navigator.of(ctx).pop();

              final scannerProvider = Provider.of<GateScannerProvider>(context, listen: false);
              final authProvider = Provider.of<AuthProvider>(context, listen: false);

              final result = await scannerProvider.processScannedCode(
                rawPayload: code,
                deviceId: authProvider.selectedDeviceId,
              );

              if (!mounted) return;
              _showDetailModal(result);
            },
            child: const Text('Validasi Tiket'),
          ),
        ],
      ),
    );
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
          // 1. Mobile Scanner View (with rotation offset if device sensor needs correction)
          RotatedBox(
            quarterTurns: _quarterTurns,
            child: MobileScanner(
              controller: _scannerController,
              scanWindow: scanWindow,
              onDetect: _onDetect,
            ),
          ),

          // 2. Custom Overlay & Reticle
          ScannerOverlay(scanWindow: scanWindow),

          // 3. Top Action Bar (Frosted Glass)
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Back / Close Frosted Circle Button
                  _buildFrostedCircleButton(
                    icon: Icons.arrow_back_rounded,
                    color: Colors.white,
                    onTap: () => Navigator.of(context).pop(),
                  ),

                  // Mode Switcher (Continuous HUD vs Detail Modal) & Online/Offline
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Continuous Mode Toggle
                      GlassContainer.frostedPill(
                        isDark: true,
                        isActive: _isContinuousMode,
                        activeColor: const Color(0xFF10B981),
                        margin: const EdgeInsets.only(right: 6),
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        onTap: () {
                          HapticFeedback.selectionClick();
                          setState(() {
                            _isContinuousMode = !_isContinuousMode;
                            _hudResult = null;
                          });
                        },
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              _isContinuousMode ? Icons.bolt_rounded : Icons.view_agenda_rounded,
                              color: _isContinuousMode ? const Color(0xFF34D399) : Colors.white70,
                              size: 13,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              _isContinuousMode ? 'KONTINU' : 'DETAIL',
                              style: TextStyle(
                                color: _isContinuousMode ? Colors.white : Colors.white70,
                                fontSize: 10.5,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.3,
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Offline/Online Mode Indicator
                      GlassContainer.frostedPill(
                        isDark: true,
                        isActive: scannerProvider.forceOfflineMode,
                        activeColor: AppColors.warning,
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        onTap: () {
                          HapticFeedback.selectionClick();
                          scannerProvider.toggleOfflineMode();
                        },
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              scannerProvider.forceOfflineMode ? Icons.cloud_off_rounded : Icons.cloud_done_rounded,
                              color: scannerProvider.forceOfflineMode ? AppColors.warning : const Color(0xFF34D399),
                              size: 13,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              scannerProvider.forceOfflineMode ? 'OFFLINE' : 'ONLINE',
                              style: TextStyle(
                                color: scannerProvider.forceOfflineMode ? AppColors.warning : Colors.white,
                                fontSize: 10.5,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.3,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  // Quick Controls: Torch, Flip, More
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      _buildFrostedCircleButton(
                        icon: scannerProvider.isTorchOn ? Icons.flash_on_rounded : Icons.flash_off_rounded,
                        color: scannerProvider.isTorchOn ? AppColors.gold : Colors.white,
                        tooltip: 'Flashlight',
                        onTap: () {
                          HapticFeedback.selectionClick();
                          _scannerController.toggleTorch();
                          scannerProvider.toggleTorch();
                        },
                      ),
                      const SizedBox(width: 5),
                      _buildFrostedCircleButton(
                        icon: Icons.flip_camera_ios_rounded,
                        color: Colors.white,
                        tooltip: 'Ganti Kamera',
                        onTap: () {
                          HapticFeedback.selectionClick();
                          _scannerController.switchCamera();
                        },
                      ),
                      const SizedBox(width: 5),
                      _buildFrostedCircleButton(
                        icon: Icons.more_vert_rounded,
                        color: Colors.white,
                        tooltip: 'Menu Lainnya',
                        onTap: _showMoreOptionsMenu,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // 4. Instructions & Scan Target Text (Frosted Glass Card)
          Positioned(
            top: screenSize.height * 0.42 + (scanWindowSize / 2) + 14,
            left: 20,
            right: 20,
            child: GlassContainer.dark(
              borderRadius: BorderRadius.circular(AppRadius.lg),
              blur: 20,
              borderWidth: 1.2,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'Arahkan kamera ke QR Code Tiket Pengunjung',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 12.5,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    _isContinuousMode
                        ? '⚡ Mode Kontinu Aktif • Scan instan berurutan'
                        : 'Mendukung Dynamic QR & Tiket Fisik',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.8),
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 6),
                  InkWell(
                    onTap: () {
                      HapticFeedback.selectionClick();
                      _showManualInputDialog();
                    },
                    borderRadius: BorderRadius.circular(6),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: const [
                          Icon(Icons.keyboard_outlined, size: 14, color: Color(0xFF6EE7B7)),
                          SizedBox(width: 4),
                          Text(
                            'Ada kendala scan? Input Kode Manual',
                            style: TextStyle(
                              color: Color(0xFF6EE7B7),
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // 5. Continuous Mode Floating HUD Toast (Auto-Dismiss)
          if (_hudResult != null) _buildHudToast(_hudResult!),

          // 6. Bottom Live Stats Dashboard (Frosted Dark Glass Dock)
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
                child: Container(
                  padding: const EdgeInsets.fromLTRB(20, 14, 20, 26),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        const Color(0xFF14261C).withValues(alpha: 0.68),
                        const Color(0xFF08120C).withValues(alpha: 0.82),
                      ],
                    ),
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
                    border: Border(
                      top: BorderSide(
                        color: Colors.white.withValues(alpha: 0.35),
                        width: 1.2,
                      ),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.45),
                        blurRadius: 28,
                        offset: const Offset(0, -6),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Top Sheet Grabber Handle
                      Center(
                        child: Container(
                          width: 36,
                          height: 4,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.25),
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),
                      // Stats Row with Frosted Metric Chips
                      Row(
                        children: [
                          Expanded(
                            child: _buildGlassStatCard('Total Scan', '${scannerProvider.sessionTotal}', Colors.white),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: _buildGlassStatCard('Tiket Valid', '${scannerProvider.sessionValid}', const Color(0xFF34D399)),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: _buildGlassStatCard('Ditolak', '${scannerProvider.sessionInvalid}', const Color(0xFFF87171)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      Row(
                        children: [
                          Expanded(
                            child: _buildGlassActionButton(
                              icon: Icons.storage_rounded,
                              label: 'Cache Offline',
                              onTap: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(builder: (_) => const OfflineManifestScreen()),
                                );
                              },
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: _buildGlassActionButton(
                              icon: Icons.bar_chart_rounded,
                              label: 'Statistik Gate',
                              onTap: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(builder: (_) => const GateStatsScreen()),
                                );
                              },
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showMoreOptionsMenu() {
    HapticFeedback.selectionClick();
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
        ),
        child: SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.border,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 18),
              const Text(
                'Menu Operasional Gerbang',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.forestDeep,
                ),
              ),
              const SizedBox(height: 14),
              ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 8),
                leading: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppColors.forestSoft,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.edit_note_rounded, color: AppColors.forestDeep, size: 22),
                ),
                title: const Text('Input Kode Tiket Manual', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                subtitle: const Text('Ketik kode jika tiket fisik basah / barcode tidak terbaca', style: TextStyle(fontSize: 11.5)),
                onTap: () {
                  Navigator.of(ctx).pop();
                  _showManualInputDialog();
                },
              ),
              const Divider(height: 12),
              ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 8),
                leading: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppColors.forestSoft,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.qr_code_scanner_rounded, color: AppColors.forestDeep, size: 22),
                ),
                title: const Text('Pairing Gerbang Turnstile', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                subtitle: const Text('Sinkronkan smartphone dengan barrier gate gerbang IoT', style: TextStyle(fontSize: 11.5)),
                onTap: () {
                  Navigator.of(ctx).pop();
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const PairingScannerScreen()),
                  );
                },
              ),
              const Divider(height: 12),
              ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 8),
                leading: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppColors.forestSoft,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.rotate_90_degrees_cw_rounded, color: AppColors.forestDeep, size: 22),
                ),
                title: const Text('Koreksi Putar Kamera (90°)', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                subtitle: Text('Sudut saat ini: ${_quarterTurns * 90}° • Klik untuk memutar viewfinder 90°', style: const TextStyle(fontSize: 11.5)),
                trailing: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.forestSoft,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '${_quarterTurns * 90}°',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppColors.forestDeep),
                  ),
                ),
                onTap: () {
                  HapticFeedback.selectionClick();
                  setState(() {
                    _quarterTurns = (_quarterTurns + 1) % 4;
                  });
                  Navigator.of(ctx).pop();
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFrostedCircleButton({
    required IconData icon,
    required Color color,
    double size = 36,
    String? tooltip,
    required VoidCallback onTap,
  }) {
    return GlassContainer(
      width: size,
      height: size,
      borderRadius: BorderRadius.circular(size / 2),
      blur: 16,
      borderWidth: 1.0,
      borderGradient: LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          Colors.white.withValues(alpha: 0.40),
          Colors.white.withValues(alpha: 0.10),
        ],
      ),
      fillGradient: LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          Colors.black.withValues(alpha: 0.45),
          Colors.black.withValues(alpha: 0.25),
        ],
      ),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.2),
          blurRadius: 10,
          offset: const Offset(0, 2),
        ),
      ],
      onTap: onTap,
      child: Center(
        child: Icon(icon, color: color, size: size * 0.52),
      ),
    );
  }

  Widget _buildHudToast(ValidateResultModel result) {
    final isValid = result.valid;
    final statusColor = isValid ? const Color(0xFF10B981) : const Color(0xFFEF4444);

    return Positioned(
      top: 90,
      left: 16,
      right: 16,
      child: GestureDetector(
        onTap: () => _showDetailModal(result),
        child: GlassContainer(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          blur: 20,
          borderWidth: 1.5,
          borderGradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              statusColor.withValues(alpha: 0.9),
              statusColor.withValues(alpha: 0.3),
            ],
          ),
          fillGradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              (isValid ? const Color(0xFF0F2B17) : const Color(0xFF3B1212)).withValues(alpha: 0.80),
              (isValid ? const Color(0xFF06150B) : const Color(0xFF200909)).withValues(alpha: 0.65),
            ],
          ),
          boxShadow: [
            BoxShadow(
              color: statusColor.withValues(alpha: 0.35),
              blurRadius: 24,
              offset: const Offset(0, 4),
            ),
          ],
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            children: [
              // Large Status Icon with Circular border
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.22),
                  shape: BoxShape.circle,
                  border: Border.all(color: statusColor, width: 2),
                ),
                child: Icon(
                  isValid ? Icons.check_circle_rounded : Icons.cancel_rounded,
                  color: statusColor,
                  size: 26,
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

  Widget _buildGlassStatCard(String label, String value, Color valueColor) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 6),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.14),
          width: 1,
        ),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              fontSize: 21,
              fontWeight: FontWeight.w900,
              color: valueColor,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: TextStyle(
              fontSize: 10.5,
              color: Colors.white.withValues(alpha: 0.75),
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGlassActionButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.md),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.10),
            borderRadius: BorderRadius.circular(AppRadius.md),
            border: Border.all(
              color: Colors.white.withValues(alpha: 0.22),
              width: 1,
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 16, color: Colors.white),
              const SizedBox(width: 8),
              Text(
                label,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

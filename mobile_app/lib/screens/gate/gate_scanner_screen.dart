import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:provider/provider.dart';
import '../../constants/app_colors.dart';
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

  @override
  void dispose() {
    _scannerController.dispose();
    super.dispose();
  }

  void _onDetect(BarcodeCapture capture) async {
    if (_isModalShowing) return;

    final barcodes = capture.barcodes;
    if (barcodes.isEmpty) return;

    final rawCode = barcodes.first.rawValue;
    if (rawCode == null || rawCode.isEmpty) return;

    final scannerProvider = Provider.of<GateScannerProvider>(context, listen: false);
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    if (scannerProvider.isProcessing) return;

    setState(() => _isModalShowing = true);

    final result = await scannerProvider.processScannedCode(
      rawPayload: rawCode,
      deviceId: authProvider.selectedDeviceId,
    );

    if (mounted) {
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

                  // Mode Indicator Badge
                  GestureDetector(
                    onTap: () => scannerProvider.toggleOfflineMode(),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: scannerProvider.forceOfflineMode ? AppColors.bark : AppColors.forest,
                        borderRadius: BorderRadius.circular(20),
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
                          const SizedBox(width: 6),
                          Text(
                            scannerProvider.forceOfflineMode ? 'MODE OFFLINE' : 'MODE ONLINE',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
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
                      const SizedBox(width: 8),
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
                  'Mendukung Dynamic TOTP & Tiket Reguler (< 500ms)',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.8),
                    fontSize: 12,
                    shadows: const [Shadow(color: Colors.black54, blurRadius: 6)],
                  ),
                ),
              ],
            ),
          ),

          // 5. Bottom Live Stats Dashboard
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
              decoration: const BoxDecoration(
                color: AppColors.forestDeep,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
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
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
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
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
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

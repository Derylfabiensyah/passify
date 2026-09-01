import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../constants/app_colors.dart';
import '../../widgets/scanner_overlay.dart';

class WalletScannerScreen extends StatefulWidget {
  const WalletScannerScreen({super.key});

  @override
  State<WalletScannerScreen> createState() => _WalletScannerScreenState();
}

class _WalletScannerScreenState extends State<WalletScannerScreen> {
  final MobileScannerController _controller = MobileScannerController(
    detectionSpeed: DetectionSpeed.normal,
    facing: CameraFacing.back,
  );
  bool _hasScanned = false;
  bool _isTorchOn = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onDetect(BarcodeCapture capture) {
    if (_hasScanned) return;

    final barcodes = capture.barcodes;
    if (barcodes.isEmpty) return;

    final code = barcodes.first.rawValue;
    if (code != null && code.isNotEmpty) {
      _hasScanned = true;
      Navigator.of(context).pop(code);
    }
  }

  @override
  Widget build(BuildContext context) {
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
          MobileScanner(
            controller: _controller,
            scanWindow: scanWindow,
            onDetect: _onDetect,
          ),
          ScannerOverlay(scanWindow: scanWindow),

          // Floating Glassmorphic Top Bar
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.55),
                  borderRadius: BorderRadius.circular(AppRadius.xl),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 22),
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                    const Text(
                      'Scan Wallet / Gelang',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 15,
                      ),
                    ),
                    IconButton(
                      icon: Icon(
                        _isTorchOn ? Icons.flash_on_rounded : Icons.flash_off_rounded,
                        color: _isTorchOn ? AppColors.gold : Colors.white,
                        size: 22,
                      ),
                      onPressed: () {
                        setState(() => _isTorchOn = !_isTorchOn);
                        _controller.toggleTorch();
                      },
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Bottom Instruction Banner
          Positioned(
            bottom: 36,
            left: 20,
            right: 20,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
              decoration: BoxDecoration(
                color: const Color(0xFF1F2B1A).withValues(alpha: 0.92),
                borderRadius: BorderRadius.circular(AppRadius.lg),
                border: Border.all(color: Colors.white.withValues(alpha: 0.18)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.4),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.leafPale.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(AppRadius.sm),
                    ),
                    child: const Icon(Icons.qr_code_scanner_rounded, color: Colors.white, size: 22),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text(
                      'Arahkan kamera ke kode QR di layar ponsel atau gelang RFID pengunjung.',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 12.5,
                        fontWeight: FontWeight.w500,
                        height: 1.35,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

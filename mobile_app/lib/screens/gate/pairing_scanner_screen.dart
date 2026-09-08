import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../constants/api_endpoints.dart';
import '../../constants/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../services/database_helper.dart';
import '../../widgets/scanner_overlay.dart';

class PairingScannerScreen extends StatefulWidget {
  const PairingScannerScreen({super.key});

  @override
  State<PairingScannerScreen> createState() => _PairingScannerScreenState();
}

class _PairingScannerScreenState extends State<PairingScannerScreen> {
  final MobileScannerController _scannerController = MobileScannerController(
    detectionSpeed: DetectionSpeed.normal,
    facing: CameraFacing.back,
    torchEnabled: false,
  );

  bool _isProcessing = false;
  bool _isTorchOn = false;
  String? _statusMessage;
  bool _isSuccess = false;

  @override
  void dispose() {
    _scannerController.dispose();
    super.dispose();
  }

  void _onDetect(BarcodeCapture capture) async {
    if (_isProcessing) return;

    final barcodes = capture.barcodes;
    if (barcodes.isEmpty) return;

    final rawCode = barcodes.first.rawValue;
    if (rawCode == null || rawCode.trim().isEmpty) return;

    final cleanCode = rawCode.trim();

    // Check if it matches Passify pairing JSON
    try {
      final Map<String, dynamic> data = jsonDecode(cleanCode);

      final host = (data['host'] ?? '').toString().trim();
      final deviceId = (data['device_id'] ?? data['deviceId'] ?? '').toString().trim();
      final deviceCode = (data['device_code'] ?? data['deviceCode'] ?? 'GATE-01').toString();
      final deviceName = (data['device_name'] ?? data['deviceName'] ?? 'Gerbang Petugas').toString();
      final destinationId = (data['destination_id'] ?? data['destinationId'] ?? '').toString();
      final hmacKey = (data['hmac_key'] ?? data['hmacKey'] ?? '').toString();

      if (deviceId.isEmpty) {
        _showError('QR Code tidak memuat Device ID yang valid');
        return;
      }

      setState(() {
        _isProcessing = true;
        _statusMessage = 'Menghubungkan ke $deviceName...';
      });

      HapticFeedback.mediumImpact();
      SystemSound.play(SystemSoundType.click);

      // 1. Save host if provided
      if (host.isNotEmpty) {
        await ApiEndpoints.setHost(host);
      }

      // 2. Set active device in AuthProvider & SharedPreferences
      if (mounted) {
        final auth = Provider.of<AuthProvider>(context, listen: false);
        await auth.setSelectedDevice(
          deviceId,
          destinationId: destinationId.isNotEmpty ? destinationId : null,
          deviceName: deviceName,
          deviceCode: deviceCode,
        );
      }

      // 3. Save HMAC key if provided
      if (hmacKey.isNotEmpty) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('passify_gate_hmac_key', hmacKey);
      }

      // 4. Pre-fetch today's manifest for offline backup
      setState(() {
        _statusMessage = 'Mengunduh manifest tiket hari ini...';
      });

      int manifestCount = 0;
      try {
        final apiService = ApiService();
        final manifestRes = await apiService.getTodayManifest(deviceId: deviceId);
        if (manifestRes.ticketManifest.isNotEmpty) {
          await DatabaseHelper.instance.saveTicketManifest(manifestRes.ticketManifest);
          manifestCount = manifestRes.ticketManifest.length;
        }
      } catch (e) {
        // Even if server is temporarily unreachable, pairing is saved
      }

      HapticFeedback.heavyImpact();
      if (mounted) {
        setState(() {
          final detail = manifestCount > 0 ? '$manifestCount tiket siap offline' : 'Siap memindai tiket';
          _isSuccess = true;
          _statusMessage = 'Berhasil Terhubung!\n$deviceName ($deviceCode)\n$detail';
        });

        await Future.delayed(const Duration(milliseconds: 1400));
        if (mounted) {
          Navigator.of(context).pop(true);
        }
      }
    } catch (_) {
      _showError('Format QR tidak sesuai. Gunakan QR Pairing dari Admin Web.');
    }
  }

  void _showError(String message) {
    if (_isProcessing) return;
    HapticFeedback.lightImpact();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.redAccent,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final scanWindowSize = size.width * 0.72;
    final scanWindow = Rect.fromCenter(
      center: Offset(size.width / 2, size.height * 0.42),
      width: scanWindowSize,
      height: scanWindowSize,
    );

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Camera Preview
          MobileScanner(
            controller: _scannerController,
            onDetect: _onDetect,
            scanWindow: scanWindow,
          ),

          // High-contrast semi-transparent overlay
          ScannerOverlay(
            scanWindow: scanWindow,
            borderRadius: 20,
          ),

          // Header Bar
          Positioned(
            top: 48,
            left: 16,
            right: 16,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton(
                  icon: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 26),
                  onPressed: () => Navigator.of(context).pop(),
                  style: IconButton.styleFrom(
                    backgroundColor: Colors.black45,
                    shape: const CircleBorder(),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.black54,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white24),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.qr_code_scanner_rounded, color: AppColors.leafPale, size: 16),
                      SizedBox(width: 6),
                      Text(
                        'PAIRING GERBANG',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w800,
                          fontSize: 12,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
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
                    _scannerController.toggleTorch();
                  },
                  style: IconButton.styleFrom(
                    backgroundColor: Colors.black45,
                    shape: const CircleBorder(),
                  ),
                ),
              ],
            ),
          ),

          // Bottom Instruction Card
          Positioned(
            bottom: 40,
            left: 20,
            right: 20,
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: _isSuccess
                    ? const Color(0xFF1B3B24).withValues(alpha: 0.95)
                    : Colors.black.withValues(alpha: 0.85),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                  color: _isSuccess ? AppColors.leaf : Colors.white24,
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.4),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (_isProcessing) ...[
                    if (_isSuccess)
                      const Icon(Icons.check_circle_rounded, color: AppColors.leaf, size: 42)
                    else
                      const SizedBox(
                        width: 32,
                        height: 32,
                        child: CircularProgressIndicator(
                          strokeWidth: 3,
                          color: AppColors.leaf,
                        ),
                      ),
                    const SizedBox(height: 12),
                    Text(
                      _statusMessage ?? 'Memproses pairing...',
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 13.5,
                        fontWeight: FontWeight.w700,
                        height: 1.4,
                      ),
                    ),
                  ] else ...[
                    const Icon(Icons.crop_free_rounded, color: AppColors.leafPale, size: 36),
                    const SizedBox(height: 10),
                    const Text(
                      'Arahkan Kamera ke QR Code Admin',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Buka menu Gerbang di Admin Web (GatesPage), klik tombol "Pairing HP Scanner" pada gerbang yang diinginkan.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 11.5,
                        height: 1.35,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

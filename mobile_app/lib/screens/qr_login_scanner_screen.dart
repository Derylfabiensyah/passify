import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/api_endpoints.dart';
import '../constants/app_colors.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../services/database_helper.dart';
import '../widgets/scanner_overlay.dart';
import 'home_screen.dart';

class QrLoginScannerScreen extends StatefulWidget {
  const QrLoginScannerScreen({super.key});

  @override
  State<QrLoginScannerScreen> createState() => _QrLoginScannerScreenState();
}

class _QrLoginScannerScreenState extends State<QrLoginScannerScreen> {
  final MobileScannerController _scannerController = MobileScannerController(
    detectionSpeed: DetectionSpeed.normal,
    facing: CameraFacing.back,
    torchEnabled: false,
  );

  bool _isProcessing = false;
  String? _statusMessage;
  String? _errorMessage;

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

    try {
      final Map<String, dynamic> data = jsonDecode(cleanCode);

      final username = (data['username'] ?? data['email'] ?? '').toString().trim();
      final password = (data['password'] ?? '').toString();
      final host = (data['host'] ?? '').toString().trim();

      if (username.isEmpty || password.isEmpty) {
        _showError('QR Code tidak memuat data login petugas yang valid');
        return;
      }

      setState(() {
        _isProcessing = true;
        _errorMessage = null;
        _statusMessage = 'Memverifikasi akun @$username...';
      });

      HapticFeedback.mediumImpact();
      SystemSound.play(SystemSoundType.click);

      // 1. Update host if server host is provided in QR
      if (host.isNotEmpty) {
        await ApiEndpoints.setHost(host);
      }

      // 2. Perform Login via AuthProvider
      if (!mounted) return;
      final auth = Provider.of<AuthProvider>(context, listen: false);
      final success = await auth.login(username, password);

      if (success && mounted) {
        // Otomatis pairing jika QR memuat data gerbang (QR Combo)
        final gateDeviceId = (data['gate_device_id'] ?? data['device_id'] ?? '').toString().trim();
        if (gateDeviceId.isNotEmpty) {
          setState(() {
            _statusMessage = 'Menghubungkan ke gerbang...';
          });

          final gateDeviceCode = (data['gate_device_code'] ?? data['device_code'] ?? 'GATE-01').toString();
          final gateDeviceName = (data['gate_device_name'] ?? data['device_name'] ?? 'Gerbang Petugas').toString();
          final gateDestinationId = (data['gate_destination_id'] ?? data['destination_id'] ?? '').toString();
          final gateHmacKey = (data['gate_hmac_key'] ?? data['hmac_key'] ?? '').toString();

          await auth.setSelectedDevice(
            gateDeviceId,
            destinationId: gateDestinationId.isNotEmpty ? gateDestinationId : null,
            deviceName: gateDeviceName,
            deviceCode: gateDeviceCode,
          );

          if (gateHmacKey.isNotEmpty) {
            try {
              final prefs = await SharedPreferences.getInstance();
              await prefs.setString('passify_gate_hmac_key', gateHmacKey);
            } catch (_) {}
          }

          // Unduh manifest tiket offline hari ini di latar belakang
          try {
            final manifestRes = await ApiService().getTodayManifest(deviceId: gateDeviceId);
            if (manifestRes.ticketManifest.isNotEmpty) {
              await DatabaseHelper.instance.saveTicketManifest(manifestRes.ticketManifest);
            }
          } catch (_) {}
        }

        HapticFeedback.heavyImpact();
        if (!mounted) return;
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (_) => const HomeScreen()),
          (route) => false,
        );
      } else {
        if (mounted) {
          _showError(auth.errorMessage ?? 'Gagal login dengan QR. Periksa koneksi atau kredensial.');
        }
      }
    } catch (_) {
      _showError('Format QR Code tidak dikenali sebagai QR Login Passify');
    }
  }

  void _showError(String message) {
    HapticFeedback.vibrate();
    setState(() {
      _isProcessing = false;
      _errorMessage = message;
      _statusMessage = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final screenSize = MediaQuery.of(context).size;
    final scanWindowSize = (screenSize.width * 0.72).clamp(220.0, 290.0);
    final scanWindow = Rect.fromCenter(
      center: Offset(screenSize.width / 2, screenSize.height * 0.38),
      width: scanWindowSize,
      height: scanWindowSize,
    );

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          'Scan QR Login Petugas',
          style: GoogleFonts.plusJakartaSans(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.flash_on_rounded, color: Colors.white),
            onPressed: () => _scannerController.toggleTorch(),
          ),
          IconButton(
            icon: const Icon(Icons.flip_camera_ios_rounded, color: Colors.white),
            onPressed: () => _scannerController.switchCamera(),
          ),
        ],
      ),
      body: Stack(
        children: [
          // 1. Camera Viewfinder
          MobileScanner(
            controller: _scannerController,
            scanWindow: scanWindow,
            onDetect: _onDetect,
          ),

          // 2. Overlay
          ScannerOverlay(scanWindow: scanWindow),

          // 3. Instructions & Status Card
          Positioned(
            top: scanWindow.bottom + 20,
            left: 24,
            right: 24,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF0F1713).withValues(alpha: 0.88),
                borderRadius: BorderRadius.circular(AppRadius.lg),
                border: Border.all(color: Colors.white.withValues(alpha: 0.18)),
                boxShadow: const [
                  BoxShadow(
                    color: Colors.black45,
                    blurRadius: 16,
                    offset: Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (_isProcessing) ...[
                    const SizedBox(
                      width: 28,
                      height: 28,
                      child: CircularProgressIndicator(color: AppColors.leaf, strokeWidth: 2.5),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      _statusMessage ?? 'Memproses login...',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.plusJakartaSans(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ] else if (_errorMessage != null) ...[
                    const Icon(Icons.error_outline_rounded, color: AppColors.error, size: 28),
                    const SizedBox(height: 8),
                    Text(
                      _errorMessage!,
                      textAlign: TextAlign.center,
                      style: GoogleFonts.plusJakartaSans(
                        color: AppColors.errorBg,
                        fontSize: 12.5,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 10),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white24,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.sm)),
                      ),
                      onPressed: () => setState(() => _errorMessage = null),
                      child: const Text('Coba Scan Lagi', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    ),
                  ] else ...[
                    const Icon(Icons.qr_code_2_rounded, color: AppColors.leaf, size: 28),
                    const SizedBox(height: 8),
                    Text(
                      'Arahkan kamera ke QR Code Login Petugas',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.plusJakartaSans(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'QR Code dapat dilihat di Dashboard Web Admin pada menu "Perangkat & Petugas Gate"',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.plusJakartaSans(
                        color: Colors.white70,
                        fontSize: 11.5,
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

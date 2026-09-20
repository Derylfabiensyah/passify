import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import '../../constants/api_endpoints.dart';
import '../../constants/app_colors.dart';
import '../../widgets/glass_container.dart';
import '../../widgets/mesh_gradient_background.dart';

class ServerConfigScreen extends StatefulWidget {
  const ServerConfigScreen({super.key});

  @override
  State<ServerConfigScreen> createState() => _ServerConfigScreenState();
}

class _ServerConfigScreenState extends State<ServerConfigScreen> {
  final TextEditingController _hostController = TextEditingController();
  bool _isTesting = false;
  String? _testResult;
  bool? _testSuccess;

  @override
  void initState() {
    super.initState();
    _loadHost();
  }

  Future<void> _loadHost() async {
    final host = await ApiEndpoints.getHost();
    _hostController.text = host;
  }

  Future<void> _saveHost(String host) async {
    await ApiEndpoints.setHost(host);
    setState(() {
      _hostController.text = host;
    });

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Server host berhasil diubah ke: $host'),
          backgroundColor: AppColors.forest,
        ),
      );
    }
  }

  Future<void> _testConnection() async {
    final host = _hostController.text.trim();
    if (host.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Masukkan IP Host terlebih dahulu')),
      );
      return;
    }

    setState(() {
      _isTesting = true;
      _testResult = null;
      _testSuccess = null;
    });

    final stopwatch = Stopwatch()..start();
    try {
      final dio = Dio(
        BaseOptions(
          connectTimeout: const Duration(seconds: 3),
          receiveTimeout: const Duration(seconds: 3),
        ),
      );

      await dio.get('http://$host:8081/health');
      stopwatch.stop();
      if (mounted) {
        setState(() {
          _isTesting = false;
          _testSuccess = true;
          _testResult = 'Koneksi Berhasil! Respons diterima (${stopwatch.elapsedMilliseconds} ms)';
        });
      }
    } catch (err) {
      stopwatch.stop();
      if (err is DioException && err.response != null) {
        if (mounted) {
          setState(() {
            _isTesting = false;
            _testSuccess = true;
            _testResult = 'Host Terhubung! Server aktif (${stopwatch.elapsedMilliseconds} ms)';
          });
        }
      } else {
        if (mounted) {
          setState(() {
            _isTesting = false;
            _testSuccess = false;
            _testResult = 'Koneksi Gagal: Server tidak merespons. Periksa IP host dan koneksi Wi-Fi.';
          });
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      backgroundColor: const Color(0xFFF9F9F8),
      appBar: AppBar(
        title: const Text('Konfigurasi Server API', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18, color: AppColors.forestDeep)),
        backgroundColor: Colors.transparent,
        foregroundColor: AppColors.ink,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(height: 1, color: AppColors.glassBorder),
        ),
      ),
      body: MeshGradientBackground(
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(18, 14, 18, 28),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Alamat IP Backend Microservice',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.ink),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Masukkan IP host komputer yang menjalankan microservices Go (auth, gate, cashless, tiket).',
                  style: TextStyle(fontSize: 13, color: AppColors.inkSoft),
                ),
                const SizedBox(height: 20),

                // Input field
                GlassContainer.light(
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: TextField(
                    controller: _hostController,
                    decoration: const InputDecoration(
                      labelText: 'Host IP / Domain',
                      hintText: 'Contoh: 192.168.18.91 atau 10.0.2.2',
                      filled: false,
                      prefixIcon: Icon(Icons.dns, color: AppColors.forestSoft),
                      border: InputBorder.none,
                      enabledBorder: InputBorder.none,
                      focusedBorder: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    ),
                  ),
                ),
                const SizedBox(height: 14),

            // Buttons Row: Uji Koneksi & Simpan
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _isTesting ? null : _testConnection,
                    icon: _isTesting
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.forest),
                          )
                        : const Icon(Icons.network_ping, size: 18),
                    label: Text(_isTesting ? 'Menguji...' : 'Uji Koneksi'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.forest,
                      side: const BorderSide(color: AppColors.forest),
                      padding: const EdgeInsets.symmetric(vertical: 13),
                      shape: const RoundedRectangleBorder(borderRadius: AppRadius.radiusMd),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _saveHost(_hostController.text),
                    icon: const Icon(Icons.save, size: 18),
                    label: const Text('Simpan Host'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.forest,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 13),
                      shape: const RoundedRectangleBorder(borderRadius: AppRadius.radiusMd),
                      elevation: 0,
                    ),
                  ),
                ),
              ],
            ),

            // Test Ping Status Result Banner
            if (_testResult != null) ...[
              const SizedBox(height: 14),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: _testSuccess == true ? AppColors.successBg : AppColors.errorBg,
                  borderRadius: AppRadius.radiusMd,
                  border: Border.all(
                    color: _testSuccess == true
                        ? AppColors.success.withValues(alpha: 0.4)
                        : AppColors.error.withValues(alpha: 0.4),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      _testSuccess == true ? Icons.check_circle : Icons.error_outline,
                      color: _testSuccess == true ? AppColors.success : AppColors.error,
                      size: 20,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        _testResult!,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: _testSuccess == true ? AppColors.success : AppColors.error,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 28),
            const Text(
              'Preset Cepat:',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.ink),
            ),
            const SizedBox(height: 12),

            _buildPresetTile(
              title: 'Wi-Fi Lokal Host (192.168.18.91)',
              subtitle: 'Untuk HP Fisik terhubung ke Wi-Fi yang sama',
              host: '192.168.18.91',
            ),
            const SizedBox(height: 8),
            _buildPresetTile(
              title: 'Android Emulator (10.0.2.2)',
              subtitle: 'Untuk Android Studio / VS Code Emulator',
              host: '10.0.2.2',
            ),
            const SizedBox(height: 8),
            _buildPresetTile(
              title: 'Localhost (127.0.0.1)',
              subtitle: 'Untuk iOS Simulator / Desktop App',
              host: '127.0.0.1',
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.leafPale.withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.forestSoft.withValues(alpha: 0.3)),
              ),
              child: const Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.wifi_tethering_rounded, color: AppColors.forest, size: 22),
                  SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Cara Pakai Hotspot HP Scanner:',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.forestDeep),
                        ),
                        SizedBox(height: 4),
                        Text(
                          '1. Aktifkan Hotspot di HP ini dan sambungkan laptop Anda ke hotspot ini.\n'
                          '2. Di laptop buka CMD/PowerShell, ketik "ipconfig".\n'
                          '3. Masukkan alamat IPv4 laptop (misal: 192.168.43.xxx) ke kolom Host di atas.\n'
                          '4. Klik "Uji Koneksi" lalu "Simpan Host".',
                          style: TextStyle(fontSize: 11.5, color: AppColors.inkSoft, height: 1.4),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPresetTile({required String title, required String subtitle, required String host}) {
    return GlassContainer.light(
      borderRadius: BorderRadius.circular(12),
      child: ListTile(
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13.5, color: AppColors.forestDeep)),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 12, color: AppColors.inkSoft)),
        trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: AppColors.forestSoft),
        onTap: () => _saveHost(host),
      ),
    );
  }
}

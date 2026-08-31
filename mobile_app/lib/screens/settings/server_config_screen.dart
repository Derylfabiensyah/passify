import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import '../../constants/api_endpoints.dart';
import '../../constants/app_colors.dart';

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
      backgroundColor: AppColors.canvas,
      appBar: AppBar(
        title: const Text('Konfigurasi Server API', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.ink,
        elevation: 0,
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(height: 1, color: AppColors.border),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
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
            TextField(
              controller: _hostController,
              decoration: InputDecoration(
                labelText: 'Host IP / Domain',
                hintText: 'Contoh: 192.168.18.87 atau 10.0.2.2',
                filled: true,
                fillColor: AppColors.surface,
                prefixIcon: const Icon(Icons.dns, color: AppColors.forestSoft),
                border: OutlineInputBorder(
                  borderRadius: AppRadius.radiusMd,
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: AppRadius.radiusMd,
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                focusedBorder: const OutlineInputBorder(
                  borderRadius: AppRadius.radiusMd,
                  borderSide: BorderSide(color: AppColors.forest, width: 2),
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
              title: 'Wi-Fi Lokal Host (192.168.18.87)',
              subtitle: 'Untuk HP Fisik terhubung ke Wi-Fi yang sama',
              host: '192.168.18.87',
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
          ],
        ),
      ),
    );
  }

  Widget _buildPresetTile({required String title, required String subtitle, required String host}) {
    return Card(
      elevation: 0,
      color: AppColors.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: AppColors.border),
      ),
      child: ListTile(
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 12, color: AppColors.inkSoft)),
        trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: AppColors.forestSoft),
        onTap: () => _saveHost(host),
      ),
    );
  }
}

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
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.forest, width: 2),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Save Button
            ElevatedButton(
              onPressed: () => _saveHost(_hostController.text),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.forest,
                foregroundColor: Colors.white,
                minimumSize: const Size.fromHeight(48),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Simpan Konfigurasi', style: TextStyle(fontWeight: FontWeight.bold)),
            ),

            const SizedBox(height: 32),
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

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../providers/gate_scanner_provider.dart';
import '../../services/api_service.dart';

class GateStatsScreen extends StatefulWidget {
  const GateStatsScreen({super.key});

  @override
  State<GateStatsScreen> createState() => _GateStatsScreenState();
}

class _GateStatsScreenState extends State<GateStatsScreen> {
  final ApiService _apiService = ApiService();
  Map<String, dynamic> _stats = {};
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    setState(() => _isLoading = true);
    final auth = Provider.of<AuthProvider>(context, listen: false);
    try {
      final data = await _apiService.getScanStats(destinationId: auth.selectedDestinationId);
      setState(() => _stats = data);
    } catch (_) {}
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    final scannerProvider = Provider.of<GateScannerProvider>(context);

    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: AppBar(
        title: const Text('Statistik Pintu Masuk (Gate)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.ink,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppColors.forest),
            onPressed: _loadStats,
          ),
        ],
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(height: 1, color: AppColors.border),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.forest))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Statistik Hari Ini (Destinasi)',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.ink),
            ),
            const SizedBox(height: 12),

            // Stats Grid
            Row(
              children: [
                Expanded(
                  child: _buildMetricCard(
                    title: 'Total Pengunjung',
                    value: '${_stats['total_scans'] ?? scannerProvider.sessionTotal}',
                    icon: Icons.groups,
                    color: AppColors.forest,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildMetricCard(
                    title: 'Tiket Valid',
                    value: '${_stats['valid_scans'] ?? scannerProvider.sessionValid}',
                    icon: Icons.check_circle,
                    color: AppColors.leaf,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: _buildMetricCard(
                    title: 'Ditolak / Invalid',
                    value: '${_stats['invalid_scans'] ?? scannerProvider.sessionInvalid}',
                    icon: Icons.cancel,
                    color: AppColors.error,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildMetricCard(
                    title: 'Scan Offline',
                    value: '${_stats['offline_scans'] ?? 0}',
                    icon: Icons.cloud_off,
                    color: AppColors.bark,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),
            const Text(
              'Aktivitas Scan Sesi Ini',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.ink),
            ),
            const SizedBox(height: 10),

            if (scannerProvider.scanHistory.isEmpty)
              Container(
                padding: const EdgeInsets.all(24),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: AppRadius.radiusLg,
                  border: Border.all(color: AppColors.border),
                ),
                child: const Text('Belum ada tiket yang di-scan pada sesi ini.', style: TextStyle(color: AppColors.textMuted)),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: scannerProvider.scanHistory.length,
                separatorBuilder: (_, _) => const SizedBox(height: 8),
                itemBuilder: (ctx, idx) {
                  final log = scannerProvider.scanHistory[idx];
                  return Card(
                    elevation: 0,
                    color: AppColors.surface,
                    shape: const RoundedRectangleBorder(
                      borderRadius: AppRadius.radiusMd,
                      side: BorderSide(color: AppColors.border),
                    ),
                    child: ListTile(
                      leading: Icon(
                        log.valid ? Icons.check_circle : Icons.error,
                        color: log.valid ? AppColors.forest : AppColors.error,
                      ),
                      title: Text(
                        log.ticketCode,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                      subtitle: Text(
                        '${log.visitorName.isNotEmpty ? log.visitorName : '-'} • ${log.message}',
                        style: const TextStyle(fontSize: 11, color: AppColors.inkSoft),
                      ),
                      trailing: Text(
                        '${log.scannedAt.hour.toString().padLeft(2, '0')}:${log.scannedAt.minute.toString().padLeft(2, '0')}:${log.scannedAt.second.toString().padLeft(2, '0')}',
                        style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                      ),
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricCard({required String title, required String value, required IconData icon, required Color color}) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: AppRadius.radiusLg,
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(height: 10),
          Text(
            value,
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: color),
          ),
          const SizedBox(height: 2),
          Text(
            title,
            style: const TextStyle(fontSize: 11, color: AppColors.inkSoft),
          ),
        ],
      ),
    );
  }
}

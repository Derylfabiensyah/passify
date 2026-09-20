import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../providers/gate_scanner_provider.dart';
import '../../services/api_service.dart';
import '../../widgets/glass_container.dart';
import '../../widgets/mesh_gradient_background.dart';

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
    final totalScans = (_stats['total_scans'] as num?)?.toInt() ?? scannerProvider.sessionTotal;
    final validScans = (_stats['valid_scans'] as num?)?.toInt() ?? scannerProvider.sessionValid;
    final invalidScans = (_stats['invalid_scans'] as num?)?.toInt() ?? scannerProvider.sessionInvalid;
    final offlineScans = (_stats['offline_scans'] as num?)?.toInt() ?? 0;

    final quota = 500;
    final validRate = totalScans > 0 ? ((validScans / totalScans) * 100).toInt() : 100;

    return Scaffold(
      extendBodyBehindAppBar: true,
      backgroundColor: const Color(0xFFF9F9F8),
      appBar: AppBar(
        title: const Text(
          'Statistik Pintu Masuk',
          style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18, color: AppColors.forestDeep),
        ),
        backgroundColor: Colors.transparent,
        foregroundColor: AppColors.ink,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        centerTitle: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppColors.forest),
            onPressed: _loadStats,
          ),
        ],
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(height: 1, color: AppColors.glassBorder),
        ),
      ),
      body: MeshGradientBackground(
        child: SafeArea(
          child: _isLoading
              ? const Center(child: CircularProgressIndicator(color: AppColors.success))
              : SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(18, 14, 18, 28),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Hero Summary Glass Card
                GlassContainer(
                  padding: const EdgeInsets.all(18),
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  borderWidth: 1.4,
                  borderGradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      AppColors.forestSoft.withValues(alpha: 0.8),
                      Colors.white.withValues(alpha: 0.25),
                    ],
                  ),
                  fillGradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      AppColors.forestDeep.withValues(alpha: 0.90),
                      const Color(0xFF132B1A).withValues(alpha: 0.85),
                    ],
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.forestDeep.withValues(alpha: 0.25),
                      blurRadius: 18,
                      offset: const Offset(0, 6),
                    ),
                  ],
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'TOTAL PENGUNJUNG VALID',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 1.1,
                                color: AppColors.leafPale,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(AppRadius.sm),
                              ),
                              child: Text(
                                '$validRate% Valid',
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Colors.white),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.baseline,
                          textBaseline: TextBaseline.alphabetic,
                          children: [
                            Text(
                              '$validScans',
                              style: const TextStyle(
                                fontSize: 36,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              '/ $quota kuota hari ini',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: Colors.white.withValues(alpha: 0.7),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        // Progress Bar
                        ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: (validScans / quota).clamp(0.0, 1.0),
                            minHeight: 6,
                            backgroundColor: Colors.white.withValues(alpha: 0.2),
                            valueColor: const AlwaysStoppedAnimation<Color>(AppColors.gold),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // 2x2 Metric Grid
                  Row(
                    children: [
                      Expanded(
                        child: _buildMetricCard(
                          title: 'Total Percobaan Scan',
                          value: '$totalScans',
                          icon: Icons.qr_code_scanner_rounded,
                          color: AppColors.forest,
                          bgColor: AppColors.leafPale.withValues(alpha: 0.5),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _buildMetricCard(
                          title: 'Tiket Ditolak',
                          value: '$invalidScans',
                          icon: Icons.cancel_rounded,
                          color: AppColors.error,
                          bgColor: AppColors.errorBg,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: _buildMetricCard(
                          title: 'Validasi Offline',
                          value: '$offlineScans',
                          icon: Icons.cloud_off_rounded,
                          color: AppColors.bark,
                          bgColor: AppColors.barkPale,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _buildMetricCard(
                          title: 'Sesi Aktif Saat Ini',
                          value: '${scannerProvider.sessionValid} masuk',
                          icon: Icons.how_to_reg_rounded,
                          color: AppColors.forestSoft,
                          bgColor: AppColors.leafPale.withValues(alpha: 0.5),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 24),
                  const Text(
                    'Riwayat Scan Sesi Ini',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.forestDeep),
                  ),
                  const SizedBox(height: 10),

                  if (scannerProvider.scanHistory.isEmpty)
                    GlassContainer.light(
                      padding: const EdgeInsets.all(24),
                      borderRadius: BorderRadius.circular(AppRadius.lg),
                      child: const Center(
                        child: Text('Belum ada tiket yang di-scan pada sesi ini.', style: TextStyle(color: AppColors.textMuted)),
                      ),
                    )
                  else
                    ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: scannerProvider.scanHistory.length,
                      separatorBuilder: (_, _) => const SizedBox(height: 8),
                      itemBuilder: (ctx, idx) {
                        final log = scannerProvider.scanHistory[idx];
                        return GlassContainer.light(
                          borderRadius: BorderRadius.circular(AppRadius.md),
                          child: ListTile(
                            leading: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: log.valid ? AppColors.leafPale : AppColors.errorBg,
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                log.valid ? Icons.check_rounded : Icons.close_rounded,
                                color: log.valid ? AppColors.forest : AppColors.error,
                                size: 20,
                              ),
                            ),
                            title: Text(
                              log.ticketCode,
                              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: AppColors.forestDeep),
                            ),
                            subtitle: Text(
                              '${log.visitorName.isNotEmpty ? log.visitorName : 'Pengunjung'} • ${log.message}',
                              style: const TextStyle(fontSize: 11.5, color: AppColors.inkSoft),
                            ),
                            trailing: Text(
                              '${log.scannedAt.hour.toString().padLeft(2, '0')}:${log.scannedAt.minute.toString().padLeft(2, '0')}:${log.scannedAt.second.toString().padLeft(2, '0')}',
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textMuted),
                            ),
                          ),
                        );
                      },
                    ),
                ],
              ),
            ),
          ),
        ),
    );
  }

  Widget _buildMetricCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
    required Color bgColor,
  }) {
    return GlassContainer.light(
      padding: const EdgeInsets.all(14),
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(7),
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius: BorderRadius.circular(AppRadius.sm),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(height: 10),
          Text(
            value,
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: color),
          ),
          const SizedBox(height: 2),
          Text(
            title,
            style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, color: AppColors.inkSoft),
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../constants/app_colors.dart';
import '../providers/auth_provider.dart';
import '../providers/sync_provider.dart';
import 'booth/booth_pos_screen.dart';
import 'gate/gate_scanner_screen.dart';
import 'gate/gate_stats_screen.dart';
import 'gate/offline_manifest_screen.dart';
import 'login_screen.dart';
import 'settings/server_config_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<SyncProvider>(context, listen: false).refreshDatabaseCounts();
    });
  }

  void _handleSync() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final sync = Provider.of<SyncProvider>(context, listen: false);

    await sync.syncAll(auth.selectedDeviceId);

    if (mounted && sync.syncMessage != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(sync.syncMessage!),
          backgroundColor: AppColors.forest,
          duration: const Duration(seconds: 4),
        ),
      );
    }
  }

  Future<void> _showLogoutConfirmationDialog() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final sync = Provider.of<SyncProvider>(context, listen: false);
    final pendingCount = sync.pendingScansCount;

    final shouldLogout = await showDialog<bool>(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: const RoundedRectangleBorder(borderRadius: AppRadius.radiusLg),
          backgroundColor: AppColors.surface,
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.error.withValues(alpha: 0.12),
                  borderRadius: AppRadius.radiusMd,
                ),
                child: const Icon(Icons.logout_rounded, color: AppColors.error, size: 22),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Text(
                  'Konfirmasi Keluar',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                    color: AppColors.ink,
                  ),
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Apakah Anda yakin ingin mengakhiri sesi operasional lapangan ini?',
                style: TextStyle(fontSize: 13, color: AppColors.inkSoft, height: 1.4),
              ),
              if (pendingCount > 0) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.warningBg,
                    borderRadius: AppRadius.radiusMd,
                    border: Border.all(color: AppColors.warning.withValues(alpha: 0.4)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.warning_amber_rounded, color: AppColors.warning, size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Peringatan: Terdapat $pendingCount log scan offline yang belum disinkronkan ke server.',
                          style: const TextStyle(fontSize: 11, color: AppColors.warning, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
          actionsPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(false),
              style: TextButton.styleFrom(
                foregroundColor: AppColors.inkSoft,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              ),
              child: const Text('Batal', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
            ElevatedButton(
              onPressed: () => Navigator.of(ctx).pop(true),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.error,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: const RoundedRectangleBorder(borderRadius: AppRadius.radiusMd),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              ),
              child: const Text('Ya, Keluar', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );

    if (shouldLogout == true && mounted) {
      await auth.logout();
      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const LoginScreen()),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final sync = Provider.of<SyncProvider>(context);
    final user = auth.currentUser;

    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.forest,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.forest_rounded, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 10),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Passify Field Ops', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                Text('Operasional Lapangan & Offline-First', style: TextStyle(fontSize: 11, color: AppColors.inkSoft)),
              ],
            ),
          ],
        ),
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.ink,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined, color: AppColors.inkSoft),
            tooltip: 'Pengaturan Server',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const ServerConfigScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: AppColors.error),
            tooltip: 'Keluar',
            onPressed: _showLogoutConfirmationDialog,
          ),
        ],
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(height: 1, color: AppColors.border),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () => sync.refreshDatabaseCounts(),
        color: AppColors.forest,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // User Greeting Card
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: AppColors.forestDeep,
                  borderRadius: AppRadius.radiusLg,
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.forestDeep.withValues(alpha: 0.2),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 24,
                      backgroundColor: AppColors.forestSoft,
                      child: Text(
                        (user?.fullName.isNotEmpty == true ? user!.fullName[0] : 'P').toUpperCase(),
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 20),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            user?.fullName ?? 'Petugas Lapangan',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Role: ${user?.role.toUpperCase() ?? 'STAFF'}',
                            style: const TextStyle(color: AppColors.leaf, fontSize: 12, fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Offline Sync Status Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: AppRadius.radiusLg,
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.sync, color: AppColors.forest, size: 20),
                            SizedBox(width: 8),
                            Text(
                              'Status Cache & Offline Sync',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.ink),
                            ),
                          ],
                        ),
                        if (sync.isSyncing)
                          const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(color: AppColors.forest, strokeWidth: 2),
                          ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildSyncMetric('${sync.cachedTicketsCount}', 'Tiket di Cache'),
                        Container(width: 1, height: 28, color: AppColors.border),
                        _buildSyncMetric('${sync.pendingScansCount}', 'Antrean Sync', isWarning: sync.pendingScansCount > 0),
                        Container(width: 1, height: 28, color: AppColors.border),
                        _buildSyncMetric(
                          sync.lastSyncTime != null ? DateFormat('HH:mm').format(sync.lastSyncTime!) : '-',
                          'Sinkron Terakhir',
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    ElevatedButton.icon(
                      onPressed: sync.isSyncing ? null : _handleSync,
                      icon: const Icon(Icons.cloud_download_outlined, size: 18),
                      label: Text(
                        sync.isSyncing ? 'Sedang Sinkronisasi...' : 'Sinkronkan Tiket & Log Hari Ini',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.forestSoft,
                        foregroundColor: Colors.white,
                        minimumSize: const Size.fromHeight(42),
                        shape: const RoundedRectangleBorder(borderRadius: AppRadius.radiusMd),
                        elevation: 0,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),
              const Text(
                'Menu Operasional',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.ink),
              ),
              const SizedBox(height: 14),

              // Feature Cards Grid
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 14,
                crossAxisSpacing: 14,
                childAspectRatio: 1.05,
                children: [
                  _buildMenuCard(
                    title: 'Gate Access Scanner',
                    subtitle: 'Scan QR Tiket & Validasi Gerbang',
                    icon: Icons.qr_code_scanner,
                    color: AppColors.forest,
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const GateScannerScreen()),
                      );
                    },
                  ),
                  _buildMenuCard(
                    title: 'Kasir Booth Cashless',
                    subtitle: 'Terima Bayar QR Wallet Stan',
                    icon: Icons.point_of_sale,
                    color: AppColors.bark,
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const BoothPosScreen()),
                      );
                    },
                  ),
                  _buildMenuCard(
                    title: 'Manifest Tiket Offline',
                    subtitle: 'Daftar & Check-in Manual',
                    icon: Icons.checklist_rtl,
                    color: AppColors.forestSoft,
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const OfflineManifestScreen()),
                      );
                    },
                  ),
                  _buildMenuCard(
                    title: 'Statistik Pintu Masuk',
                    subtitle: 'Laporan Kuota & Total Scan',
                    icon: Icons.insights,
                    color: AppColors.ink,
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const GateStatsScreen()),
                      );
                    },
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSyncMetric(String value, String label, {bool isWarning = false}) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: isWarning ? AppColors.warning : AppColors.forest,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(fontSize: 11, color: AppColors.inkSoft),
        ),
      ],
    );
  }

  Widget _buildMenuCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: 0,
      color: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: AppRadius.radiusLg,
        side: BorderSide(color: AppColors.border),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: AppRadius.radiusLg,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.12),
                  borderRadius: AppRadius.radiusMd,
                ),
                child: Icon(icon, color: color, size: 24),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.ink),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(fontSize: 10, color: AppColors.inkSoft),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

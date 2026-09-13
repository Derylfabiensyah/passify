import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../constants/app_colors.dart';
import '../providers/auth_provider.dart';
import '../providers/sync_provider.dart';
import 'booth/booth_pos_screen.dart';
import 'gate/gate_scanner_screen.dart';
import 'gate/gate_stats_screen.dart';
import 'gate/offline_manifest_screen.dart';
import 'gate/pairing_scanner_screen.dart';
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
    HapticFeedback.lightImpact();
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
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.lg)),
          backgroundColor: AppColors.surface,
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.error.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
                child: const Icon(Icons.logout_rounded, color: AppColors.error, size: 22),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Text(
                  'Konfirmasi Keluar',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.forestDeep),
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
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                    border: Border.all(color: AppColors.warning.withValues(alpha: 0.4)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.warning_amber_rounded, color: AppColors.warning, size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Terdapat $pendingCount scan offline belum disinkronkan ke server.',
                          style: const TextStyle(fontSize: 11, color: AppColors.warning, fontWeight: FontWeight.w700),
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
              style: TextButton.styleFrom(foregroundColor: AppColors.inkSoft),
              child: const Text('Batal', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
            ElevatedButton(
              onPressed: () => Navigator.of(ctx).pop(true),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.error,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.sm)),
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
      extendBodyBehindAppBar: true,
      backgroundColor: AppColors.canvas,
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(kToolbarHeight + 1),
        child: ClipRect(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.7),
                border: Border(
                  bottom: BorderSide(
                    color: Colors.white.withValues(alpha: 0.5),
                    width: 1,
                  ),
                ),
              ),
              child: AppBar(
                title: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(7),
                      decoration: BoxDecoration(
                        color: AppColors.forestDeep,
                        borderRadius: BorderRadius.circular(AppRadius.sm),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.forestDeep.withValues(alpha: 0.2),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: const Icon(Icons.forest_rounded, color: Colors.white, size: 19),
                    ),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Passify Field Ops',
                          style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: AppColors.forestDeep),
                        ),
                        Text(
                          user?.role == 'tenant_admin' ? 'Pengelola Wisata' : 'Operasional Gerbang & Kasir',
                          style: const TextStyle(fontSize: 11, color: AppColors.inkSoft, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ],
                ),
                backgroundColor: Colors.transparent,
                elevation: 0,
                actions: [
                  IconButton(
                    icon: const Icon(Icons.settings_outlined, color: AppColors.forestDeep, size: 22),
                    tooltip: 'Pengaturan Server',
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const ServerConfigScreen()),
                      );
                    },
                  ),
                  IconButton(
                    icon: const Icon(Icons.logout_rounded, color: AppColors.error, size: 22),
                    tooltip: 'Keluar',
                    onPressed: _showLogoutConfirmationDialog,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
      body: Stack(
        children: [
          // Ambient Gradient Orbs for Glassmorphism depth
          Positioned(
            top: -80,
            left: -40,
            child: Container(
              width: 280,
              height: 280,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.leaf.withValues(alpha: 0.35),
              ),
            ),
          ),
          Positioned(
            top: 250,
            right: -60,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.gold.withValues(alpha: 0.25),
              ),
            ),
          ),
          Positioned(
            bottom: -50,
            left: -30,
            child: Container(
              width: 320,
              height: 320,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.forestDeep.withValues(alpha: 0.2),
              ),
            ),
          ),

          // Global Soft Blur Filter
          Positioned.fill(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 50, sigmaY: 50),
              child: Container(
                color: AppColors.canvas.withValues(alpha: 0.55),
              ),
            ),
          ),

          // Scrollable Screen Content
          SafeArea(
            child: RefreshIndicator(
              onRefresh: () => sync.refreshDatabaseCounts(),
              color: AppColors.forest,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Sylvan Earth Frosted Hero Officer Card
                    Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            AppColors.forestDeep.withValues(alpha: 0.92),
                            AppColors.forest.withValues(alpha: 0.88),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(AppRadius.xl),
                        border: Border.all(
                          color: Colors.white.withValues(alpha: 0.2),
                          width: 1.5,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.forestDeep.withValues(alpha: 0.28),
                            blurRadius: 18,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              CircleAvatar(
                                radius: 22,
                                backgroundColor: AppColors.leafPale,
                                child: Text(
                                  (user?.fullName.isNotEmpty == true ? user!.fullName[0] : 'P').toUpperCase(),
                                  style: const TextStyle(color: AppColors.forestDeep, fontWeight: FontWeight.w900, fontSize: 18),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      user?.fullName ?? 'Petugas Lapangan',
                                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      user?.email ?? 'Petugas Aktif',
                                      style: TextStyle(color: Colors.white.withValues(alpha: 0.75), fontSize: 11.5, fontWeight: FontWeight.w500),
                                    ),
                                  ],
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(AppRadius.sm),
                                  border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Container(width: 6, height: 6, decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle)),
                                    const SizedBox(width: 5),
                                    const Text(
                                      'ONLINE',
                                      style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 14),

                    // Gate Device Pairing Frosted Card
                    ClipRRect(
                      borderRadius: BorderRadius.circular(AppRadius.lg),
                      child: BackdropFilter(
                        filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.68),
                            borderRadius: BorderRadius.circular(AppRadius.lg),
                            border: Border.all(
                              color: Colors.white.withValues(alpha: 0.85),
                              width: 1.5,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.03),
                                blurRadius: 14,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(9),
                                decoration: BoxDecoration(
                                  color: AppColors.leafPale,
                                  borderRadius: BorderRadius.circular(AppRadius.md),
                                ),
                                child: const Icon(Icons.sensor_door_rounded, color: AppColors.forestDeep, size: 22),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Text(
                                          auth.selectedDeviceCode,
                                          style: const TextStyle(
                                            fontSize: 10.5,
                                            fontWeight: FontWeight.w800,
                                            color: AppColors.forest,
                                            letterSpacing: 0.5,
                                          ),
                                        ),
                                        const SizedBox(width: 6),
                                        Container(
                                          width: 6,
                                          height: 6,
                                          decoration: const BoxDecoration(
                                            color: Color(0xFF10B981),
                                            shape: BoxShape.circle,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 1),
                                    Text(
                                      auth.selectedDeviceName,
                                      style: const TextStyle(
                                        fontSize: 13.5,
                                        fontWeight: FontWeight.w800,
                                        color: AppColors.forestDeep,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ],
                                ),
                              ),
                              ElevatedButton.icon(
                                onPressed: () async {
                                  HapticFeedback.selectionClick();
                                  final paired = await Navigator.of(context).push<bool>(
                                    MaterialPageRoute(builder: (_) => const PairingScannerScreen()),
                                  );
                                  if (paired == true && mounted) {
                                    if (context.mounted) {
                                      Provider.of<SyncProvider>(context, listen: false).refreshDatabaseCounts();
                                    }
                                  }
                                },
                                icon: const Icon(Icons.qr_code_scanner_rounded, size: 15),
                                label: const Text(
                                  'Pairing',
                                  style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w800),
                                ),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.forestDeep,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                  elevation: 0,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.sm)),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 14),

                    // Offline Sync Status Frosted Card
                    ClipRRect(
                      borderRadius: BorderRadius.circular(AppRadius.lg),
                      child: BackdropFilter(
                        filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.68),
                            borderRadius: BorderRadius.circular(AppRadius.lg),
                            border: Border.all(
                              color: Colors.white.withValues(alpha: 0.85),
                              width: 1.5,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.03),
                                blurRadius: 14,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Row(
                                    children: [
                                      Icon(Icons.cloud_sync_rounded, color: AppColors.forest, size: 20),
                                      SizedBox(width: 8),
                                      Text(
                                        'Status Sinkronisasi & Cache',
                                        style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13.5, color: AppColors.forestDeep),
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
                              const SizedBox(height: 14),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceAround,
                                children: [
                                  _buildSyncMetric('${sync.cachedTicketsCount}', 'Tiket di Cache'),
                                  Container(width: 1, height: 26, color: AppColors.border),
                                  _buildSyncMetric('${sync.pendingScansCount}', 'Antrean Sync', isWarning: sync.pendingScansCount > 0),
                                  Container(width: 1, height: 26, color: AppColors.border),
                                  _buildSyncMetric(
                                    sync.lastSyncTime != null ? DateFormat('HH:mm').format(sync.lastSyncTime!) : '-',
                                    'Sinkron Terakhir',
                                  ),
                                ],
                              ),
                              const SizedBox(height: 14),
                              ElevatedButton.icon(
                                onPressed: sync.isSyncing ? null : _handleSync,
                                icon: const Icon(Icons.sync_rounded, size: 18),
                                label: Text(
                                  sync.isSyncing ? 'Sedang Menyinkronkan...' : 'Sinkronkan Tiket & Log Lapangan',
                                  style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800),
                                ),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.forestSoft,
                                  foregroundColor: Colors.white,
                                  minimumSize: const Size.fromHeight(42),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.sm)),
                                  elevation: 0,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 22),
                    const Text(
                      'MENU OPERASIONAL LAPANGAN',
                      style: TextStyle(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.1,
                        color: AppColors.forestDeep,
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Operational Cards Grid (Frosted Glass)
                    GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      mainAxisSpacing: 12,
                      crossAxisSpacing: 12,
                      childAspectRatio: 1.05,
                      children: [
                        _buildMenuCard(
                          title: 'Gate Scanner',
                          subtitle: 'Scan QR Tiket Pengunjung',
                          icon: Icons.qr_code_scanner_rounded,
                          color: AppColors.forest,
                          tag: 'Gerbang',
                          onTap: () {
                            HapticFeedback.selectionClick();
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (_) => const GateScannerScreen()),
                            );
                          },
                        ),
                        _buildMenuCard(
                          title: 'Kasir Booth POS',
                          subtitle: 'Pembayaran Stan & Gelang',
                          icon: Icons.point_of_sale_rounded,
                          color: AppColors.bark,
                          tag: 'Stan / POS',
                          onTap: () {
                            HapticFeedback.selectionClick();
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (_) => const BoothPosScreen()),
                            );
                          },
                        ),
                        _buildMenuCard(
                          title: 'Manifest Offline',
                          subtitle: 'Daftar & Check-In Manual',
                          icon: Icons.storage_rounded,
                          color: AppColors.forestSoft,
                          tag: 'Cache',
                          onTap: () {
                            HapticFeedback.selectionClick();
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (_) => const OfflineManifestScreen()),
                            );
                          },
                        ),
                        _buildMenuCard(
                          title: 'Statistik Gate',
                          subtitle: 'Laporan Kuota & Total Masuk',
                          icon: Icons.bar_chart_rounded,
                          color: AppColors.forestDeep,
                          tag: 'Laporan',
                          onTap: () {
                            HapticFeedback.selectionClick();
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
          ),
        ],
      ),
    );
  }

  Widget _buildSyncMetric(String value, String label, {bool isWarning = false}) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w900,
            color: isWarning ? AppColors.warning : AppColors.forestDeep,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(fontSize: 11, color: AppColors.inkSoft, fontWeight: FontWeight.w600),
        ),
      ],
    );
  }

  Widget _buildMenuCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    String? tag,
    required VoidCallback onTap,
  }) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.68),
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(
              color: Colors.white.withValues(alpha: 0.85),
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: AppColors.forestDeep.withValues(alpha: 0.04),
                blurRadius: 16,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: onTap,
              borderRadius: BorderRadius.circular(AppRadius.lg),
              splashColor: color.withValues(alpha: 0.12),
              highlightColor: color.withValues(alpha: 0.06),
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          width: 42,
                          height: 42,
                          decoration: BoxDecoration(
                            color: color.withValues(alpha: 0.14),
                            borderRadius: BorderRadius.circular(AppRadius.md),
                            border: Border.all(
                              color: color.withValues(alpha: 0.25),
                              width: 1,
                            ),
                          ),
                          child: Icon(icon, color: color, size: 22),
                        ),
                        if (tag != null)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                            decoration: BoxDecoration(
                              color: color.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(AppRadius.sm),
                              border: Border.all(
                                color: color.withValues(alpha: 0.2),
                                width: 0.8,
                              ),
                            ),
                            child: Text(
                              tag,
                              style: TextStyle(
                                fontSize: 9.5,
                                fontWeight: FontWeight.w800,
                                color: color,
                              ),
                            ),
                          ),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13.5, color: AppColors.forestDeep),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          subtitle,
                          style: const TextStyle(fontSize: 10.5, color: AppColors.inkSoft, fontWeight: FontWeight.w600),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

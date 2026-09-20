import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../constants/app_colors.dart';
import '../providers/auth_provider.dart';
import '../providers/sync_provider.dart';
import '../widgets/glass_container.dart';
import '../widgets/mesh_gradient_background.dart';
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
      backgroundColor: const Color(0xFFF9F9F8),
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(kToolbarHeight + 1),
        child: ClipRect(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.65),
                border: Border(
                  bottom: BorderSide(
                    color: Colors.white.withValues(alpha: 0.75),
                    width: 1.2,
                  ),
                ),
              ),
              child: AppBar(
                title: Text(
                  'passify',
                  style: GoogleFonts.plusJakartaSans(
                    fontWeight: FontWeight.w900,
                    fontSize: 22,
                    color: AppColors.forestDeep,
                    letterSpacing: -0.6,
                  ),
                ),
                backgroundColor: Colors.transparent,
                elevation: 0,
                actions: [
                  IconButton(
                    icon: const Icon(Icons.settings_outlined, color: AppColors.forestDeep, size: 21),
                    tooltip: 'Pengaturan Server',
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const ServerConfigScreen()),
                      );
                    },
                  ),
                  IconButton(
                    icon: const Icon(Icons.logout_rounded, color: Color(0xFFF87171), size: 21),
                    tooltip: 'Keluar',
                    onPressed: _showLogoutConfirmationDialog,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
      body: MeshGradientBackground(
        child: SafeArea(
            child: RefreshIndicator(
              onRefresh: () => sync.refreshDatabaseCounts(),
              color: AppColors.success,
              backgroundColor: const Color(0xFF162315),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(18, 14, 18, 28),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Officer & Device Info Glass Capsule
                    Builder(
                      builder: (context) {
                        final officerName = (user?.fullName.isNotEmpty == true && user!.fullName.toLowerCase() != 'petugas lapangan')
                            ? user.fullName
                            : (auth.selectedDeviceName.isNotEmpty ? auth.selectedDeviceName : 'Petugas Lapangan');
                        final roleSubtitle = user?.role == 'tenant_admin'
                            ? 'Pengelola Destinasi'
                            : (user?.role == 'vendor' ? 'Petugas Vendor' : 'Petugas Lapangan');

                        return GlassContainer.light(
                          borderRadius: BorderRadius.circular(AppRadius.lg),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          child: Row(
                            children: [
                              Container(
                                width: 38,
                                height: 38,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  gradient: LinearGradient(
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                    colors: [
                                      const Color(0xFF10B981).withValues(alpha: 0.28),
                                      const Color(0xFF10B981).withValues(alpha: 0.12),
                                    ],
                                  ),
                                  border: Border.all(
                                    color: const Color(0xFF10B981).withValues(alpha: 0.4),
                                    width: 1.5,
                                  ),
                                ),
                                child: Center(
                                  child: Text(
                                    (officerName.isNotEmpty ? officerName[0] : 'P').toUpperCase(),
                                    style: GoogleFonts.plusJakartaSans(
                                      color: const Color(0xFF047857),
                                      fontWeight: FontWeight.w900,
                                      fontSize: 15,
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      officerName,
                                      style: GoogleFonts.plusJakartaSans(
                                        color: AppColors.forestDeep,
                                        fontWeight: FontWeight.w800,
                                        fontSize: 14,
                                        letterSpacing: -0.2,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 1),
                                    Text(
                                      roleSubtitle,
                                      style: GoogleFonts.plusJakartaSans(
                                        color: const Color(0xFF6B7280),
                                        fontSize: 11.5,
                                        fontWeight: FontWeight.w600,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 12),
                              // Pairing Chip
                              GestureDetector(
                                onTap: () async {
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
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5.5),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF10B981).withValues(alpha: 0.12),
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(
                                      color: const Color(0xFF10B981).withValues(alpha: 0.28),
                                      width: 1,
                                    ),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Container(
                                        width: 6.5,
                                        height: 6.5,
                                        decoration: const BoxDecoration(
                                          color: Color(0xFF10B981),
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                      const SizedBox(width: 6),
                                      Text(
                                        auth.selectedDeviceCode,
                                        style: GoogleFonts.plusJakartaSans(
                                          color: AppColors.forestDeep,
                                          fontSize: 11,
                                          fontWeight: FontWeight.w800,
                                          letterSpacing: 0.2,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),

                    const SizedBox(height: 16),

                    // PRIMARY HERO SCANNER CARD (True Frosted Glassmorphism)
                    GlassContainer.light(
                      borderRadius: BorderRadius.circular(AppRadius.xl),
                      blur: 28,
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF10B981).withValues(alpha: 0.14),
                          blurRadius: 32,
                          spreadRadius: 1,
                          offset: const Offset(0, 10),
                        ),
                        BoxShadow(
                          color: Colors.white.withValues(alpha: 0.7),
                          blurRadius: 2,
                          spreadRadius: 0,
                          offset: const Offset(0, 1),
                        ),
                      ],
                      onTap: () {
                        HapticFeedback.heavyImpact();
                        Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => const GateScannerScreen()),
                        );
                      },
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 26),
                      child: Column(
                        children: [
                          // Big Glowing Scanner Reticle Icon Badge with Radial Aura
                          Container(
                            width: 76,
                            height: 76,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: const LinearGradient(
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                                colors: [
                                  Colors.white,
                                  Color(0xFFD1FAE5),
                                ],
                              ),
                              border: Border.all(
                                color: const Color(0xFF10B981).withValues(alpha: 0.45),
                                width: 2,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFF10B981).withValues(alpha: 0.28),
                                  blurRadius: 24,
                                  spreadRadius: 2,
                                ),
                              ],
                            ),
                            child: const Icon(
                              Icons.qr_code_scanner_rounded,
                              color: Color(0xFF059669),
                              size: 40,
                            ),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'Gate Scanner Tiket',
                            style: TextStyle(
                              fontSize: 21,
                              fontWeight: FontWeight.w900,
                              color: AppColors.forestDeep,
                              letterSpacing: -0.3,
                            ),
                          ),
                          const SizedBox(height: 5),
                          Text(
                            'Sentuh di sini untuk memindai tiket pengunjung',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 12.5,
                              color: AppColors.inkSoft.withValues(alpha: 0.85),
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const SizedBox(height: 18),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                                colors: [Color(0xFF10B981), Color(0xFF047857)],
                              ),
                              borderRadius: BorderRadius.circular(AppRadius.md),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFF059669).withValues(alpha: 0.35),
                                  blurRadius: 16,
                                  offset: const Offset(0, 5),
                                ),
                              ],
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.camera_alt_rounded, color: Colors.white, size: 17),
                                SizedBox(width: 8),
                                Text(
                                  'Buka Kamera Pemindai',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 13,
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: 0.2,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Offline Sync & Cache Frosted Strip
                    GlassContainer.light(
                      borderRadius: BorderRadius.circular(AppRadius.lg),
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Row(
                                children: [
                                  Icon(Icons.cloud_sync_rounded, color: Color(0xFF059669), size: 18),
                                  SizedBox(width: 8),
                                  Text(
                                    'Status Sinkronisasi & Cache',
                                    style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: AppColors.forestDeep),
                                  ),
                                ],
                              ),
                              if (sync.isSyncing)
                                const SizedBox(
                                  width: 14,
                                  height: 14,
                                  child: CircularProgressIndicator(color: Color(0xFF059669), strokeWidth: 2),
                                ),
                            ],
                          ),
                          const SizedBox(height: 14),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              _buildLightSyncMetric('${sync.cachedTicketsCount}', 'Tiket di Cache'),
                              Container(width: 1, height: 26, color: Colors.black.withValues(alpha: 0.08)),
                              _buildLightSyncMetric(
                                '${sync.pendingScansCount}',
                                'Antrean Sync',
                                isWarning: sync.pendingScansCount > 0,
                              ),
                              Container(width: 1, height: 26, color: Colors.black.withValues(alpha: 0.08)),
                              _buildLightSyncMetric(
                                sync.lastSyncTime != null ? DateFormat('HH:mm').format(sync.lastSyncTime!) : '-',
                                'Terakhir Sync',
                              ),
                            ],
                          ),
                          const SizedBox(height: 14),
                          ElevatedButton.icon(
                            onPressed: sync.isSyncing ? null : _handleSync,
                            icon: const Icon(Icons.sync_rounded, size: 16),
                            label: Text(
                              sync.isSyncing ? 'Sedang Menyinkronkan...' : 'Sinkronkan Tiket & Log Lapangan',
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white.withValues(alpha: 0.7),
                              foregroundColor: AppColors.success,
                              side: BorderSide(
                                color: AppColors.success.withValues(alpha: 0.35),
                                width: 1.2,
                              ),
                              minimumSize: const Size.fromHeight(38),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.sm)),
                              elevation: 0,
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),
                    const Text(
                      'ALAT OPERASIONAL LAINNYA',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.1,
                        color: Color(0xFF9CA3AF),
                      ),
                    ),
                    const SizedBox(height: 10),

                    // Secondary Tools (3 Clean Frosted Tiles)
                    Row(
                      children: [
                        Expanded(
                          child: _buildLightToolCard(
                            title: 'Kasir POS',
                            icon: Icons.point_of_sale_rounded,
                            color: const Color(0xFFF59E0B),
                            onTap: () {
                              HapticFeedback.selectionClick();
                              Navigator.of(context).push(
                                MaterialPageRoute(builder: (_) => const BoothPosScreen()),
                              );
                            },
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: _buildLightToolCard(
                            title: 'Manifest',
                            icon: Icons.storage_rounded,
                            color: const Color(0xFF38BDF8),
                            onTap: () {
                              HapticFeedback.selectionClick();
                              Navigator.of(context).push(
                                MaterialPageRoute(builder: (_) => const OfflineManifestScreen()),
                              );
                            },
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: _buildLightToolCard(
                            title: 'Statistik',
                            icon: Icons.bar_chart_rounded,
                            color: Color(0xFF7E22CE),
                            onTap: () {
                              HapticFeedback.selectionClick();
                              Navigator.of(context).push(
                                MaterialPageRoute(builder: (_) => const GateStatsScreen()),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
  }

  Widget _buildLightSyncMetric(String value, String label, {bool isWarning = false}) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w900,
            color: isWarning ? AppColors.warning : AppColors.forestDeep,
          ),
        ),
        const SizedBox(height: 1),
        Text(
          label,
          style: const TextStyle(fontSize: 10.5, color: AppColors.textMuted, fontWeight: FontWeight.w600),
        ),
      ],
    );
  }

  Widget _buildLightToolCard({
    required String title,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GlassContainer.light(
      borderRadius: BorderRadius.circular(AppRadius.md),
      onTap: onTap,
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.16),
              borderRadius: BorderRadius.circular(AppRadius.sm),
              border: Border.all(
                color: color.withValues(alpha: 0.35),
                width: 1,
              ),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(height: 8),
          Text(
            title,
            style: const TextStyle(
              fontWeight: FontWeight.w800,
              fontSize: 11.5,
              color: AppColors.forestDeep,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

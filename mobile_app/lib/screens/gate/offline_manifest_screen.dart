import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../constants/app_colors.dart';
import '../../models/manifest_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/gate_scanner_provider.dart';
import '../../services/database_helper.dart';
import '../../widgets/scan_result_sheet.dart';

class OfflineManifestScreen extends StatefulWidget {
  const OfflineManifestScreen({super.key});

  @override
  State<OfflineManifestScreen> createState() => _OfflineManifestScreenState();
}

class _OfflineManifestScreenState extends State<OfflineManifestScreen> {
  final TextEditingController _searchController = TextEditingController();
  Timer? _debounceTimer;
  List<ManifestEntry> _tickets = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadTickets();
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 300), () {
      if (mounted) {
        _loadTickets(query: query);
      }
    });
  }

  Future<void> _loadTickets({String query = ''}) async {
    setState(() => _isLoading = true);
    final db = DatabaseHelper.instance;
    List<ManifestEntry> results;

    if (query.isEmpty) {
      results = await db.searchCachedTickets('');
    } else {
      results = await db.searchCachedTickets(query);
    }

    if (mounted) {
      setState(() {
        _tickets = results;
        _isLoading = false;
      });
    }
  }

  Future<void> _confirmAndValidate(ManifestEntry ticket) async {
    final confirmed = await showDialog<bool>(
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
                  color: AppColors.leafPale,
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
                child: const Icon(Icons.how_to_reg_rounded, color: AppColors.forestDeep, size: 22),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Text(
                  'Check-In Manual',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                    color: AppColors.forestDeep,
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
                'Apakah Anda yakin ingin memvalidasi tiket pengunjung ini secara manual tanpa scan kamera?',
                style: TextStyle(fontSize: 13, color: AppColors.inkSoft, height: 1.4),
              ),
              const SizedBox(height: 14),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.canvas,
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      ticket.visitorName.isNotEmpty ? ticket.visitorName : 'Pengunjung Umum',
                      style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13.5, color: AppColors.forestDeep),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${ticket.ticketCode} • ${ticket.categoryName}',
                      style: const TextStyle(fontSize: 12, color: AppColors.inkSoft),
                    ),
                  ],
                ),
              ),
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
              child: const Text('Batal', style: TextStyle(fontWeight: FontWeight.w700)),
            ),
            ElevatedButton(
              onPressed: () => Navigator.of(ctx).pop(true),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.forest,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.md)),
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
              ),
              child: const Text('Ya, Check-In', style: TextStyle(fontWeight: FontWeight.w800)),
            ),
          ],
        );
      },
    );

    if (confirmed == true && mounted) {
      await _manualValidate(ticket);
    }
  }

  Future<void> _manualValidate(ManifestEntry ticket) async {
    final scannerProvider = Provider.of<GateScannerProvider>(context, listen: false);
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    final result = await scannerProvider.processScannedCode(
      rawPayload: ticket.ticketCode,
      deviceId: authProvider.selectedDeviceId,
    );

    _loadTickets(query: _searchController.text);

    if (mounted) {
      showModalBottomSheet(
        context: context,
        backgroundColor: Colors.transparent,
        builder: (_) => ScanResultSheet(
          result: result,
          onDismiss: () => Navigator.of(context).pop(),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: AppBar(
        title: const Text(
          'Manifest Tiket Offline',
          style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18, color: AppColors.forestDeep),
        ),
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.ink,
        elevation: 0,
        centerTitle: false,
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(height: 1, color: AppColors.border),
        ),
      ),
      body: Column(
        children: [
          // Search Box
          Container(
            padding: const EdgeInsets.all(16),
            color: AppColors.surface,
            child: TextField(
              controller: _searchController,
              onChanged: _onSearchChanged,
              style: const TextStyle(fontSize: 13.5, color: AppColors.ink, fontWeight: FontWeight.w600),
              decoration: InputDecoration(
                hintText: 'Cari nama pengunjung atau kode tiket...',
                hintStyle: const TextStyle(fontSize: 13, color: AppColors.textMuted),
                prefixIcon: const Icon(Icons.search_rounded, color: AppColors.forestSoft, size: 22),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded, size: 20),
                        onPressed: () {
                          _searchController.clear();
                          _loadTickets();
                        },
                      )
                    : null,
                filled: true,
                fillColor: AppColors.inputBg,
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  borderSide: const BorderSide(color: AppColors.forest, width: 1.5),
                ),
              ),
            ),
          ),

          // Count info
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${_tickets.length} Tiket di Cache Offline',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.inkSoft),
                ),
                IconButton(
                  icon: const Icon(Icons.refresh_rounded, size: 20, color: AppColors.forest),
                  onPressed: () => _loadTickets(query: _searchController.text),
                  tooltip: 'Segarkan',
                ),
              ],
            ),
          ),

          // List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: AppColors.forest))
                : _tickets.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: const BoxDecoration(
                                color: AppColors.leafPale,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.inventory_2_outlined, size: 40, color: AppColors.forest),
                            ),
                            const SizedBox(height: 16),
                            const Text(
                              'Belum ada tiket di cache offline',
                              style: TextStyle(fontSize: 14.5, color: AppColors.forestDeep, fontWeight: FontWeight.w800),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'Lakukan sinkronisasi di dashboard untuk mengunduh tiket hari ini.',
                              style: TextStyle(fontSize: 12, color: AppColors.inkSoft),
                            ),
                          ],
                        ),
                      )
                    : ListView.separated(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
                        itemCount: _tickets.length,
                        separatorBuilder: (_, _) => const SizedBox(height: 10),
                        itemBuilder: (ctx, idx) {
                          final item = _tickets[idx];
                          final isUsed = item.status == 'used';

                          return Card(
                            elevation: 0,
                            color: AppColors.surface,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(AppRadius.lg),
                              side: BorderSide(color: isUsed ? AppColors.border : AppColors.borderHover),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(14),
                              child: Row(
                                children: [
                                  // Leading Status Icon
                                  Container(
                                    width: 44,
                                    height: 44,
                                    decoration: BoxDecoration(
                                      color: isUsed ? AppColors.inputBg : AppColors.leafPale,
                                      borderRadius: BorderRadius.circular(AppRadius.md),
                                    ),
                                    child: Icon(
                                      isUsed ? Icons.check_circle_rounded : Icons.confirmation_number_outlined,
                                      color: isUsed ? AppColors.textMuted : AppColors.forest,
                                      size: 22,
                                    ),
                                  ),
                                  const SizedBox(width: 14),

                                  // Ticket Details
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          item.visitorName.isNotEmpty ? item.visitorName : 'Pengunjung Umum',
                                          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: AppColors.forestDeep),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          '${item.ticketCode} • ${item.categoryName}',
                                          style: const TextStyle(fontSize: 12, color: AppColors.inkSoft),
                                        ),
                                        if (item.timeSlot.isNotEmpty)
                                          Padding(
                                            padding: const EdgeInsets.only(top: 2),
                                            child: Text(
                                              'Sesi: ${item.timeSlot}',
                                              style: const TextStyle(fontSize: 11, color: AppColors.forestSoft, fontWeight: FontWeight.w600),
                                            ),
                                          ),
                                      ],
                                    ),
                                  ),

                                  // Action Button / Status Badge
                                  if (!isUsed)
                                    ElevatedButton(
                                      onPressed: () {
                                        HapticFeedback.selectionClick();
                                        _confirmAndValidate(item);
                                      },
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: AppColors.forest,
                                        foregroundColor: Colors.white,
                                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                        minimumSize: Size.zero,
                                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.sm)),
                                      ),
                                      child: const Text('Check-In', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800)),
                                    )
                                  else
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: AppColors.leafPale.withValues(alpha: 0.5),
                                        borderRadius: BorderRadius.circular(AppRadius.sm),
                                        border: Border.all(color: AppColors.border),
                                      ),
                                      child: const Text(
                                        'SUDAH MASUK',
                                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.forestSoft),
                                      ),
                                    ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}

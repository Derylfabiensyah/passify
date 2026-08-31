import 'dart:async';
import 'package:flutter/material.dart';
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
          shape: const RoundedRectangleBorder(borderRadius: AppRadius.radiusLg),
          backgroundColor: AppColors.surface,
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: const BoxDecoration(
                  color: AppColors.leafPale,
                  borderRadius: AppRadius.radiusMd,
                ),
                child: const Icon(Icons.how_to_reg_rounded, color: AppColors.forest, size: 22),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Text(
                  'Check-In Manual',
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
                'Apakah Anda yakin ingin memvalidasi tiket pengunjung ini secara manual tanpa scan kamera?',
                style: TextStyle(fontSize: 13, color: AppColors.inkSoft, height: 1.4),
              ),
              const SizedBox(height: 14),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.canvas,
                  borderRadius: AppRadius.radiusMd,
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Pengunjung:', style: TextStyle(fontSize: 11, color: AppColors.inkSoft)),
                        Text(
                          ticket.visitorName.isNotEmpty ? ticket.visitorName : 'Umum',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.ink),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Kode Tiket:', style: TextStyle(fontSize: 11, color: AppColors.inkSoft)),
                        Text(
                          ticket.ticketCode,
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.forest),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Kategori:', style: TextStyle(fontSize: 11, color: AppColors.inkSoft)),
                        Text(
                          ticket.categoryName.isNotEmpty ? ticket.categoryName : '-',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.ink),
                        ),
                      ],
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
              child: const Text('Batal', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
            ElevatedButton(
              onPressed: () => Navigator.of(ctx).pop(true),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.forest,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: const RoundedRectangleBorder(borderRadius: AppRadius.radiusMd),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              ),
              child: const Text('Ya, Check-In', style: TextStyle(fontWeight: FontWeight.bold)),
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
        title: const Text('Manifest Tiket Offline', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.ink,
        elevation: 0,
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
              decoration: InputDecoration(
                hintText: 'Cari nama pengunjung atau kode tiket...',
                prefixIcon: const Icon(Icons.search, color: AppColors.forestSoft),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          _loadTickets();
                        },
                      )
                    : null,
                filled: true,
                fillColor: AppColors.inputBg,
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                border: const OutlineInputBorder(
                  borderRadius: AppRadius.radiusMd,
                  borderSide: BorderSide(color: AppColors.border),
                ),
                enabledBorder: const OutlineInputBorder(
                  borderRadius: AppRadius.radiusMd,
                  borderSide: BorderSide(color: AppColors.border),
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
                  '${_tickets.length} Tiket Ditemukan di Cache',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.inkSoft),
                ),
                IconButton(
                  icon: const Icon(Icons.refresh, size: 18, color: AppColors.forest),
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
                            Icon(Icons.inventory_2_outlined, size: 48, color: Colors.grey.shade400),
                            const SizedBox(height: 12),
                            const Text(
                              'Belum ada tiket di cache offline',
                              style: TextStyle(fontSize: 14, color: AppColors.inkSoft, fontWeight: FontWeight.w600),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'Lakukan sinkronisasi di dashboard untuk mengunduh tiket hari ini.',
                              style: TextStyle(fontSize: 12, color: AppColors.textMuted),
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
                              borderRadius: AppRadius.radiusLg,
                              side: BorderSide(color: isUsed ? AppColors.border : AppColors.borderHover),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(14),
                              child: Row(
                                children: [
                                  // Leading Status Icon
                                  Container(
                                    width: 42,
                                    height: 42,
                                    decoration: BoxDecoration(
                                      color: isUsed ? AppColors.inputBg : AppColors.leafPale,
                                      borderRadius: AppRadius.radiusMd,
                                    ),
                                    child: Icon(
                                      isUsed ? Icons.done_all : Icons.confirmation_number_outlined,
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
                                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.ink),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          '${item.ticketCode} • ${item.categoryName}',
                                          style: const TextStyle(fontSize: 12, color: AppColors.inkSoft),
                                        ),
                                        if (item.timeSlot.isNotEmpty)
                                          Text(
                                            'Sesi: ${item.timeSlot}',
                                            style: const TextStyle(fontSize: 11, color: AppColors.forestSoft, fontWeight: FontWeight.w500),
                                          ),
                                      ],
                                    ),
                                  ),

                                  // Action Button
                                  if (!isUsed)
                                    ElevatedButton(
                                      onPressed: () => _confirmAndValidate(item),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: AppColors.forest,
                                        foregroundColor: Colors.white,
                                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                        minimumSize: Size.zero,
                                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                        shape: const RoundedRectangleBorder(borderRadius: AppRadius.radiusSm),
                                      ),
                                      child: const Text('Check-In', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                    )
                                  else
                                    const Text(
                                      'SUDAH MASUK',
                                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.textMuted),
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

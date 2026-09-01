import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../constants/app_colors.dart';

class ReceiptScreen extends StatelessWidget {
  final Map<String, dynamic> receipt;
  final String boothName;
  final double amount;

  const ReceiptScreen({
    super.key,
    required this.receipt,
    required this.boothName,
    required this.amount,
  });

  @override
  Widget build(BuildContext context) {
    final tx = receipt['transaction'] as Map<String, dynamic>? ?? {};
    final wallet = receipt['wallet'] as Map<String, dynamic>? ?? {};
    final remainingBalance = (wallet['balance'] as num?)?.toDouble() ?? 0.0;
    final txId = tx['id'] ?? tx['reference_id'] ?? 'TX-${DateTime.now().millisecondsSinceEpoch}';

    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: AppBar(
        title: const Text(
          'Bukti Transaksi',
          style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18, color: AppColors.ink),
        ),
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.ink,
        elevation: 0,
        centerTitle: true,
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.close_rounded, color: AppColors.ink),
            onPressed: () => Navigator.of(context).pop(),
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    children: [
                      const SizedBox(height: 12),
                      // Success Badge
                      Container(
                        width: 76,
                        height: 76,
                        decoration: BoxDecoration(
                          color: AppColors.leafPale,
                          shape: BoxShape.circle,
                          border: Border.all(color: AppColors.border, width: 2),
                        ),
                        child: const Icon(Icons.check_circle_rounded, color: AppColors.forestSoft, size: 48),
                      ),
                      const SizedBox(height: 14),

                      const Text(
                        'Pembayaran Berhasil',
                        style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.forestDeep),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        boothName,
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.inkSoft),
                      ),
                      const SizedBox(height: 20),

                      // Structured Receipt Paper Card
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(AppRadius.lg),
                          border: Border.all(color: AppColors.border),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.03),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            const Text(
                              'TOTAL PEMBAYARAN',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 1.2,
                                color: AppColors.textMuted,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              AppFormatters.formatRupiah(amount),
                              style: const TextStyle(
                                fontSize: 30,
                                fontWeight: FontWeight.w900,
                                color: AppColors.forestDeep,
                              ),
                            ),
                            const SizedBox(height: 16),
                            const Divider(height: 1, color: AppColors.border),
                            const SizedBox(height: 16),

                            _buildReceiptRow('No. Referensi', txId.toString().length > 18 ? txId.toString().substring(0, 18) : txId.toString()),
                            const SizedBox(height: 10),
                            _buildReceiptRow('Waktu Transaksi', DateFormat('dd MMM yyyy, HH:mm').format(DateTime.now())),
                            const SizedBox(height: 10),
                            _buildReceiptRow('Metode Pembayaran', 'Passify Cashless Wristband / QR'),
                            const SizedBox(height: 10),
                            _buildReceiptRow('Sisa Saldo Pengunjung', AppFormatters.formatRupiah(remainingBalance), isHighlight: true),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Action Buttons
              const SizedBox(height: 12),
              ElevatedButton.icon(
                onPressed: () => Navigator.of(context).pop(),
                icon: const Icon(Icons.check_rounded, size: 20),
                label: const Text('Selesai & Transaksi Baru', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.forest,
                  foregroundColor: Colors.white,
                  minimumSize: const Size.fromHeight(52),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.md)),
                  elevation: 0,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildReceiptRow(String label, String value, {bool isHighlight = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, color: AppColors.inkSoft)),
        const SizedBox(width: 8),
        Flexible(
          child: Text(
            value,
            textAlign: TextAlign.end,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 12.5,
              fontWeight: isHighlight ? FontWeight.w800 : FontWeight.w600,
              color: isHighlight ? AppColors.forest : AppColors.ink,
            ),
          ),
        ),
      ],
    );
  }
}

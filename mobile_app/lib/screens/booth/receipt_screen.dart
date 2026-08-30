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
    final currencyFormat = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);
    final tx = receipt['transaction'] as Map<String, dynamic>? ?? {};
    final wallet = receipt['wallet'] as Map<String, dynamic>? ?? {};
    final remainingBalance = (wallet['balance'] as num?)?.toDouble() ?? 0.0;
    final txId = tx['id'] ?? tx['reference_id'] ?? 'TX-${DateTime.now().millisecondsSinceEpoch}';

    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: AppBar(
        title: const Text('Bukti Transaksi', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.ink,
        elevation: 0,
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.close),
            onPressed: () => Navigator.of(context).pop(),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    const SizedBox(height: 20),
                    // Success Icon
                    Container(
                      width: 72,
                      height: 72,
                      decoration: const BoxDecoration(
                        color: AppColors.leafPale,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.check_circle, color: AppColors.forest, size: 44),
                    ),
                    const SizedBox(height: 16),

                    const Text(
                      'Pembayaran Berhasil!',
                      style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.forestDeep),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      boothName,
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.forestSoft),
                    ),
                    const SizedBox(height: 24),

                    // Amount Display
                    Container(
                      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Column(
                        children: [
                          const Text('Total Pembayaran', style: TextStyle(fontSize: 12, color: AppColors.inkSoft)),
                          const SizedBox(height: 6),
                          Text(
                            currencyFormat.format(amount),
                            style: const TextStyle(
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                              color: AppColors.forest,
                            ),
                          ),
                          const Divider(height: 28, color: AppColors.border),
                          _buildReceiptRow(
                            'No. Transaksi',
                            txId.toString().length > 18 ? txId.toString().substring(0, 18) : txId.toString(),
                          ),
                          const SizedBox(height: 8),
                          _buildReceiptRow('Waktu', DateFormat('dd MMM yyyy, HH:mm:ss').format(DateTime.now())),
                          const SizedBox(height: 8),
                          _buildReceiptRow('Metode', 'Passify Cashless Wallet'),
                          const SizedBox(height: 8),
                          _buildReceiptRow('Sisa Saldo Pengunjung', currencyFormat.format(remainingBalance), isHighlight: true),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Bottom action
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.forest,
                foregroundColor: Colors.white,
                minimumSize: const Size.fromHeight(50),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 0,
              ),
              child: const Text('Selesai & Transaksi Baru', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReceiptRow(String label, String value, {bool isHighlight = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, color: AppColors.inkSoft)),
        const SizedBox(width: 8),
        Flexible(
          child: Text(
            value,
            textAlign: TextAlign.end,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 13,
              fontWeight: isHighlight ? FontWeight.bold : FontWeight.w600,
              color: isHighlight ? AppColors.forest : AppColors.ink,
            ),
          ),
        ),
      ],
    );
  }
}

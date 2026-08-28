import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../models/scan_log_model.dart';

class ScanResultSheet extends StatelessWidget {
  final ValidateResultModel result;
  final VoidCallback onDismiss;

  const ScanResultSheet({
    super.key,
    required this.result,
    required this.onDismiss,
  });

  @override
  Widget build(BuildContext context) {
    final isValid = result.valid;
    final color = isValid ? AppColors.forest : AppColors.error;
    final bgColor = isValid ? AppColors.leafPale : AppColors.errorBg;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.15),
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Status Icon Header
          Center(
            child: Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: bgColor,
                shape: BoxShape.circle,
                border: Border.all(color: color.withOpacity(0.3), width: 2),
              ),
              child: Icon(
                isValid ? Icons.check_circle : Icons.cancel,
                color: color,
                size: 38,
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Title & Message
          Text(
            isValid ? 'TIKET VALID' : 'TIKET TIDAK VALID',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: color,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            result.message,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: isValid ? AppColors.forestSoft : AppColors.inkSoft,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 16),

          // Details Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.canvas,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                _buildInfoRow('Kode Tiket', result.ticketCode, isBold: true),
                const Divider(height: 16, color: AppColors.border),
                _buildInfoRow('Pengunjung', result.visitorName.isNotEmpty ? result.visitorName : '-'),
                const Divider(height: 16, color: AppColors.border),
                _buildInfoRow('Kategori', result.categoryName.isNotEmpty ? result.categoryName : '-'),
                if (result.isOffline) ...[
                  const Divider(height: 16, color: AppColors.border),
                  _buildInfoRow('Sumber Validasi', 'Offline Cache (Lokal)', isHighlight: true),
                ],
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Continue button
          ElevatedButton.icon(
            onPressed: onDismiss,
            icon: const Icon(Icons.qr_code_scanner, size: 20),
            label: const Text('Scan Tiket Berikutnya', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
            style: ElevatedButton.styleFrom(
              backgroundColor: isValid ? AppColors.forest : AppColors.ink,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              elevation: 0,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, {bool isBold = false, bool isHighlight = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 13, color: AppColors.inkSoft),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 14,
            fontWeight: isBold ? FontWeight.bold : FontWeight.w600,
            color: isHighlight ? AppColors.bark : AppColors.ink,
          ),
        ),
      ],
    );
  }
}

import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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
    final statusColor = isValid ? const Color(0xFF10B981) : const Color(0xFFEF4444);
    final bgColor = isValid ? AppColors.leafPale : AppColors.errorBg;

    return ClipRRect(
      borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.92),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
            border: Border.all(
              color: Colors.white.withValues(alpha: 0.8),
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.18),
                blurRadius: 28,
                offset: const Offset(0, -6),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Top Sheet Grabber Handle
              Center(
                child: Container(
                  width: 38,
                  height: 4.5,
                  decoration: BoxDecoration(
                    color: AppColors.inkSoft.withValues(alpha: 0.25),
                    borderRadius: BorderRadius.circular(3),
                  ),
                ),
              ),
              const SizedBox(height: 18),

              // Status Icon Header with Ambient Glow Ring
              Center(
                child: Container(
                  width: 68,
                  height: 68,
                  decoration: BoxDecoration(
                    color: bgColor,
                    shape: BoxShape.circle,
                    border: Border.all(color: statusColor.withValues(alpha: 0.4), width: 2.5),
                    boxShadow: [
                      BoxShadow(
                        color: statusColor.withValues(alpha: 0.2),
                        blurRadius: 16,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: Icon(
                    isValid ? Icons.check_circle_rounded : Icons.cancel_rounded,
                    color: statusColor,
                    size: 42,
                  ),
                ),
              ),
              const SizedBox(height: 14),

              // Title & Message
              Text(
                isValid ? 'TIKET VALID' : 'TIKET TIDAK VALID',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 21,
                  fontWeight: FontWeight.w900,
                  color: color,
                  letterSpacing: -0.3,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                result.message,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13.5,
                  color: isValid ? AppColors.forestSoft : AppColors.inkSoft,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 20),

              // Frosted Details Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.canvas.withValues(alpha: 0.7),
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  border: Border.all(color: AppColors.border.withValues(alpha: 0.7)),
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
              const SizedBox(height: 22),

              // Continue button
              ElevatedButton.icon(
                onPressed: () {
                  HapticFeedback.selectionClick();
                  onDismiss();
                },
                icon: const Icon(Icons.qr_code_scanner_rounded, size: 20),
                label: const Text(
                  'Scan Tiket Berikutnya',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: isValid ? AppColors.forestDeep : AppColors.ink,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.md)),
                  elevation: 2,
                  shadowColor: Colors.black26,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, {bool isBold = false, bool isHighlight = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 13, color: AppColors.inkSoft, fontWeight: FontWeight.w500),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 13.5,
            fontWeight: isBold ? FontWeight.w800 : FontWeight.w600,
            color: isHighlight ? AppColors.bark : AppColors.forestDeep,
          ),
        ),
      ],
    );
  }
}

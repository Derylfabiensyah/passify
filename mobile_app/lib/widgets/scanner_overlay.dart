import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

class ScannerOverlay extends StatelessWidget {
  final Rect scanWindow;
  final double borderRadius;

  const ScannerOverlay({
    super.key,
    required this.scanWindow,
    this.borderRadius = 24,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // 1. Smooth Dark Vignette with Rounded Cutout
        ColorFiltered(
          colorFilter: ColorFilter.mode(
            Colors.black.withValues(alpha: 0.62),
            BlendMode.srcOut,
          ),
          child: Stack(
            children: [
              Container(
                decoration: const BoxDecoration(
                  color: Colors.red,
                  backgroundBlendMode: BlendMode.dstOut,
                ),
              ),
              Positioned.fromRect(
                rect: scanWindow,
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(borderRadius),
                  ),
                ),
              ),
            ],
          ),
        ),

        // 2. Translucent Glass Frame
        Positioned.fromRect(
          rect: scanWindow,
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(borderRadius),
              border: Border.all(
                color: Colors.white.withValues(alpha: 0.18),
                width: 1.2,
              ),
            ),
          ),
        ),

        // 3. High-Tech Precision Corner Brackets
        CustomPaint(
          painter: _CornerBracketsPainter(
            rect: scanWindow,
            cornerRadius: borderRadius,
            bracketLength: 28,
            strokeWidth: 4,
            color: AppColors.leafPale,
          ),
        ),
      ],
    );
  }
}

class _CornerBracketsPainter extends CustomPainter {
  final Rect rect;
  final double cornerRadius;
  final double bracketLength;
  final double strokeWidth;
  final Color color;

  _CornerBracketsPainter({
    required this.rect,
    required this.cornerRadius,
    required this.bracketLength,
    required this.strokeWidth,
    required this.color,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    final glowPaint = Paint()
      ..color = color.withValues(alpha: 0.35)
      ..strokeWidth = strokeWidth + 4
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    void drawCorner(double startX, double startY, double hX, double vY) {
      final path = Path();
      // Horizontal segment
      path.moveTo(hX, startY);
      path.lineTo(startX, startY);
      // Vertical segment
      path.lineTo(startX, vY);

      canvas.drawPath(path, glowPaint);
      canvas.drawPath(path, paint);
    }

    // Top-Left
    drawCorner(rect.left, rect.top, rect.left + bracketLength, rect.top + bracketLength);
    // Top-Right
    drawCorner(rect.right, rect.top, rect.right - bracketLength, rect.top + bracketLength);
    // Bottom-Left
    drawCorner(rect.left, rect.bottom, rect.left + bracketLength, rect.bottom - bracketLength);
    // Bottom-Right
    drawCorner(rect.right, rect.bottom, rect.right - bracketLength, rect.bottom - bracketLength);
  }

  @override
  bool shouldRepaint(covariant _CornerBracketsPainter oldDelegate) {
    return oldDelegate.rect != rect || oldDelegate.color != color;
  }
}

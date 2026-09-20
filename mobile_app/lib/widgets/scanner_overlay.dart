import 'package:flutter/material.dart';

class ScannerOverlay extends StatelessWidget {
  final Rect scanWindow;
  final double borderRadius;
  final Color? bracketColor;

  const ScannerOverlay({
    super.key,
    required this.scanWindow,
    this.borderRadius = 24,
    this.bracketColor,
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

        // 3. High-Tech Precision Curved Corner Brackets
        CustomPaint(
          painter: _CornerBracketsPainter(
            rect: scanWindow,
            cornerRadius: borderRadius,
            bracketLength: 20,
            strokeWidth: 3.5,
            color: bracketColor ?? const Color(0xFF10B981),
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
      ..color = color.withValues(alpha: 0.28)
      ..strokeWidth = strokeWidth + 3
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    // Top-Left: horizontal line, curve, vertical line
    final tlPath = Path()
      ..moveTo(rect.left + cornerRadius + bracketLength, rect.top)
      ..lineTo(rect.left + cornerRadius, rect.top)
      ..arcToPoint(
        Offset(rect.left, rect.top + cornerRadius),
        radius: Radius.circular(cornerRadius),
        clockwise: false,
      )
      ..lineTo(rect.left, rect.top + cornerRadius + bracketLength);

    // Top-Right: horizontal line, curve, vertical line
    final trPath = Path()
      ..moveTo(rect.right - cornerRadius - bracketLength, rect.top)
      ..lineTo(rect.right - cornerRadius, rect.top)
      ..arcToPoint(
        Offset(rect.right, rect.top + cornerRadius),
        radius: Radius.circular(cornerRadius),
        clockwise: true,
      )
      ..lineTo(rect.right, rect.top + cornerRadius + bracketLength);

    // Bottom-Right: vertical line, curve, horizontal line
    final brPath = Path()
      ..moveTo(rect.right, rect.bottom - cornerRadius - bracketLength)
      ..lineTo(rect.right, rect.bottom - cornerRadius)
      ..arcToPoint(
        Offset(rect.right - cornerRadius, rect.bottom),
        radius: Radius.circular(cornerRadius),
        clockwise: true,
      )
      ..lineTo(rect.right - cornerRadius - bracketLength, rect.bottom);

    // Bottom-Left: vertical line, curve, horizontal line
    final blPath = Path()
      ..moveTo(rect.left, rect.bottom - cornerRadius - bracketLength)
      ..lineTo(rect.left, rect.bottom - cornerRadius)
      ..arcToPoint(
        Offset(rect.left + cornerRadius, rect.bottom),
        radius: Radius.circular(cornerRadius),
        clockwise: false,
      )
      ..lineTo(rect.left + cornerRadius + bracketLength, rect.bottom);

    for (final path in [tlPath, trPath, brPath, blPath]) {
      canvas.drawPath(path, glowPaint);
      canvas.drawPath(path, paint);
    }
  }

  @override
  bool shouldRepaint(covariant _CornerBracketsPainter oldDelegate) {
    return oldDelegate.rect != rect ||
        oldDelegate.color != color ||
        oldDelegate.cornerRadius != cornerRadius;
  }
}

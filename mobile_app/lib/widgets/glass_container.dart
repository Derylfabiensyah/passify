import 'dart:ui';
import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

/// Reusable Glassmorphism Container providing frosted backdrop blur,
/// multi-stop specular gradient borders, and soft ambient drop shadows.
class GlassContainer extends StatelessWidget {
  final Widget child;
  final BorderRadius? borderRadius;
  final double blur;
  final double borderWidth;
  final Gradient? borderGradient;
  final Gradient? fillGradient;
  final Color? fillColor;
  final List<BoxShadow>? boxShadow;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final double? width;
  final double? height;
  final VoidCallback? onTap;

  const GlassContainer({
    super.key,
    required this.child,
    this.borderRadius,
    this.blur = 18.0,
    this.borderWidth = 1.2,
    this.borderGradient,
    this.fillGradient,
    this.fillColor,
    this.boxShadow,
    this.padding,
    this.margin,
    this.width,
    this.height,
    this.onTap,
  });

  /// Premium Light Frosted Glass (designed for HomeScreen & Light Backgrounds)
  factory GlassContainer.light({
    Key? key,
    required Widget child,
    BorderRadius? borderRadius,
    double blur = 18.0,
    double borderWidth = 1.2,
    Gradient? borderGradient,
    Gradient? fillGradient,
    List<BoxShadow>? boxShadow,
    EdgeInsetsGeometry? padding,
    EdgeInsetsGeometry? margin,
    double? width,
    double? height,
    VoidCallback? onTap,
  }) {
    final radius = borderRadius ?? BorderRadius.circular(AppRadius.lg);
    return GlassContainer(
      key: key,
      borderRadius: radius,
      blur: blur,
      borderWidth: borderWidth,
      borderGradient: borderGradient ??
          LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.white.withValues(alpha: 0.95),
              Colors.white.withValues(alpha: 0.25),
            ],
            stops: const [0.0, 1.0],
          ),
      fillGradient: fillGradient ??
          LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.white.withValues(alpha: 0.65),
              Colors.white.withValues(alpha: 0.38),
            ],
          ),
      boxShadow: boxShadow ??
          [
            BoxShadow(
              color: const Color(0xFF1F2B1A).withValues(alpha: 0.08),
              blurRadius: 24,
              spreadRadius: 0,
              offset: const Offset(0, 8),
            ),
            BoxShadow(
              color: Colors.white.withValues(alpha: 0.6),
              blurRadius: 2,
              spreadRadius: 0,
              offset: const Offset(0, 1),
            ),
          ],
      padding: padding,
      margin: margin,
      width: width,
      height: height,
      onTap: onTap,
      child: child,
    );
  }

  /// Dark Frosted Glass (designed for GateScanner viewfinder overlays & camera pass-through)
  factory GlassContainer.dark({
    Key? key,
    required Widget child,
    BorderRadius? borderRadius,
    double blur = 20.0,
    double borderWidth = 1.2,
    Gradient? borderGradient,
    Gradient? fillGradient,
    List<BoxShadow>? boxShadow,
    EdgeInsetsGeometry? padding,
    EdgeInsetsGeometry? margin,
    double? width,
    double? height,
    VoidCallback? onTap,
  }) {
    final radius = borderRadius ?? BorderRadius.circular(AppRadius.lg);
    return GlassContainer(
      key: key,
      borderRadius: radius,
      blur: blur,
      borderWidth: borderWidth,
      borderGradient: borderGradient ??
          LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              const Color(0xFF34D399).withValues(alpha: 0.55),
              Colors.white.withValues(alpha: 0.15),
            ],
          ),
      fillGradient: fillGradient ??
          LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              const Color(0xFF13251B).withValues(alpha: 0.65),
              const Color(0xFF09140E).withValues(alpha: 0.45),
            ],
          ),
      boxShadow: boxShadow ??
          [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.35),
              blurRadius: 22,
              spreadRadius: 0,
              offset: const Offset(0, 6),
            ),
          ],
      padding: padding,
      margin: margin,
      width: width,
      height: height,
      onTap: onTap,
      child: child,
    );
  }

  /// Frosted Pill/Capsule Glass (designed for HUD buttons, chips, toggles)
  factory GlassContainer.frostedPill({
    Key? key,
    required Widget child,
    bool isDark = true,
    bool isActive = false,
    Color? activeColor,
    EdgeInsetsGeometry? padding,
    EdgeInsetsGeometry? margin,
    double? width,
    double? height,
    VoidCallback? onTap,
  }) {
    final effectiveActiveColor = activeColor ?? const Color(0xFF10B981);
    final borderGrad = isActive
        ? LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              effectiveActiveColor,
              effectiveActiveColor.withValues(alpha: 0.4),
            ],
          )
        : LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: isDark
                ? [Colors.white.withValues(alpha: 0.35), Colors.white.withValues(alpha: 0.10)]
                : [Colors.white.withValues(alpha: 0.90), Colors.white.withValues(alpha: 0.25)],
          );

    final fillGrad = isActive
        ? LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              effectiveActiveColor.withValues(alpha: 0.30),
              effectiveActiveColor.withValues(alpha: 0.15),
            ],
          )
        : LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: isDark
                ? [Colors.black.withValues(alpha: 0.50), Colors.black.withValues(alpha: 0.30)]
                : [Colors.white.withValues(alpha: 0.70), Colors.white.withValues(alpha: 0.45)],
          );

    return GlassContainer(
      key: key,
      borderRadius: BorderRadius.circular(AppRadius.xl),
      blur: 16.0,
      borderWidth: isActive ? 1.4 : 1.0,
      borderGradient: borderGrad,
      fillGradient: fillGrad,
      boxShadow: [
        if (isActive)
          BoxShadow(
            color: effectiveActiveColor.withValues(alpha: 0.35),
            blurRadius: 12,
            offset: const Offset(0, 2),
          )
        else
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.15),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
      ],
      padding: padding ?? const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      margin: margin,
      width: width,
      height: height,
      onTap: onTap,
      child: child,
    );
  }

  @override
  Widget build(BuildContext context) {
    final resolvedRadius = borderRadius ?? BorderRadius.circular(AppRadius.lg);

    Widget content = Container(
      width: width,
      height: height,
      padding: padding,
      decoration: BoxDecoration(
        color: fillColor,
        gradient: fillGradient,
        borderRadius: resolvedRadius,
      ),
      child: child,
    );

    if (onTap != null) {
      content = Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: resolvedRadius,
          child: content,
        ),
      );
    }

    return Container(
      margin: margin,
      decoration: BoxDecoration(
        borderRadius: resolvedRadius,
        gradient: borderGradient,
        boxShadow: boxShadow,
      ),
      padding: EdgeInsets.all(borderWidth),
      child: ClipRRect(
        borderRadius: resolvedRadius,
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
          child: content,
        ),
      ),
    );
  }
}

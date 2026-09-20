import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

/// Unified Atmospheric Mesh Gradient Background for Passify.
/// Provides a soft canvas atmosphere with vibrant glowing orbs (emerald, mint, gold, lime)
/// that refract cleanly through frosted glassmorphism cards without muddy global blur.
class MeshGradientBackground extends StatelessWidget {
  final Widget child;

  const MeshGradientBackground({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // 1. Subtle canvas atmosphere gradient base
        Positioned.fill(
          child: Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Color(0xFFF7F8F5),
                  Color(0xFFEFF3EB),
                ],
              ),
            ),
          ),
        ),

        // 2. Strategic Atmospheric Glowing Orbs for Frosted Glass Refraction
        // Top-Right: Vibrant Emerald Orb
        Positioned(
          top: -40,
          right: -30,
          child: Container(
            width: 350,
            height: 350,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  AppColors.orbEmerald,
                  AppColors.orbEmerald.withValues(alpha: 0.0),
                ],
              ),
            ),
          ),
        ),

        // Upper-Mid Soft Ambient Emerald/Mint glow under Hero Scanner
        Positioned(
          top: 150,
          right: 40,
          child: Container(
            width: 280,
            height: 280,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  AppColors.orbEmerald.withValues(alpha: 0.38),
                  AppColors.orbEmerald.withValues(alpha: 0.0),
                ],
              ),
            ),
          ),
        ),

        // Mid-Left: Vibrant Mint / Cyan Orb
        Positioned(
          top: 220,
          left: -60,
          child: Container(
            width: 360,
            height: 360,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  AppColors.orbMint,
                  AppColors.orbMint.withValues(alpha: 0.0),
                ],
              ),
            ),
          ),
        ),

        // Mid-Right: Warm Amber / Gold Orb
        Positioned(
          top: 450,
          right: -50,
          child: Container(
            width: 320,
            height: 320,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  AppColors.orbGold,
                  AppColors.orbGold.withValues(alpha: 0.0),
                ],
              ),
            ),
          ),
        ),

        // Bottom-Left: Fresh Forest Lime Orb
        Positioned(
          bottom: -30,
          left: -40,
          child: Container(
            width: 320,
            height: 320,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  AppColors.orbLime,
                  AppColors.orbLime.withValues(alpha: 0.0),
                ],
              ),
            ),
          ),
        ),

        // 3. Child Screen Content
        child,
      ],
    );
  }
}

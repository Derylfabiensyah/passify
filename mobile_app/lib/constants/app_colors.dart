import 'package:flutter/material.dart';

class AppColors {
  // Core Nature Brand Palette
  static const Color forestDeep = Color(0xFF102D20);
  static const Color forest = Color(0xFF1E4B35);
  static const Color forestSoft = Color(0xFF3C7152);
  static const Color leaf = Color(0xFF9CBD72);
  static const Color leafPale = Color(0xFFE8F1DC);
  static const Color bark = Color(0xFF8A5638);
  static const Color barkPale = Color(0xFFF2E5DA);

  // Surfaces & Backgrounds
  static const Color canvas = Color(0xFFF8FBF5);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color elevated = Color(0xFFF1F6EC);
  static const Color inputBg = Color(0xFFF6F9F2);
  static const Color border = Color(0xFFD6E2CF);
  static const Color borderHover = Color(0xFFA9C598);

  // Typography
  static const Color ink = Color(0xFF193024);
  static const Color inkSoft = Color(0xFF586D5D);
  static const Color textMuted = Color(0xFF556859); // Adjusted for WCAG AA >= 4.5:1 contrast against light background

  // Dark Theme Tokens (Night Gate / Sunrise Outdoor Ops)
  static const Color darkCanvas = Color(0xFF0D1712);
  static const Color darkSurface = Color(0xFF15241D);
  static const Color darkElevated = Color(0xFF1C3127);
  static const Color darkBorder = Color(0xFF284638);
  static const Color darkInk = Color(0xFFF3F7F2);
  static const Color darkInkSoft = Color(0xFFA5C4B0);
  static const Color darkTextMuted = Color(0xFF83A28F);

  // Status & Feedback
  static const Color success = Color(0xFF2E7D32);
  static const Color successBg = Color(0xFFE8F5E9);
  static const Color error = Color(0xFFD32F2F);
  static const Color errorBg = Color(0xFFFFEBEE);
  static const Color warning = Color(0xFFF57C00);
  static const Color warningBg = Color(0xFFFFF3E0);
  static const Color info = Color(0xFF1976D2);
  static const Color infoBg = Color(0xFFE3F2FD);
}

/// 4-Tier Standardized Border Radius System (8, 12, 16, 24px)
class AppRadius {
  static const double sm = 8.0;   // Chips, badges, small buttons, tags
  static const double md = 12.0;  // Input fields, standard buttons, list items
  static const double lg = 16.0;  // Cards, standard sheets, dialogs
  static const double xl = 24.0;  // Modal tops, large hero cards, floating containers

  static const BorderRadius radiusSm = BorderRadius.all(Radius.circular(sm));
  static const BorderRadius radiusMd = BorderRadius.all(Radius.circular(md));
  static const BorderRadius radiusLg = BorderRadius.all(Radius.circular(lg));
  static const BorderRadius radiusXl = BorderRadius.all(Radius.circular(xl));
}

class AppFormatters {
  static String formatRupiah(num value) {
    return 'Rp ${value.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}';
  }
}

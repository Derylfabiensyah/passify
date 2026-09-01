import 'package:flutter/material.dart';

class AppColors {
  static const Color forestDeep = Color(0xFF394032);
  static const Color forest = Color(0xFF454F2D);
  static const Color forestSoft = Color(0xFF797F3E);
  static const Color leaf = Color(0xFF797F3E);
  static const Color leafPale = Color(0xFFECEBD9);
  static const Color bark = Color(0xFF534332);
  static const Color barkPale = Color(0xFFEEE6D9);
  static const Color gold = Color(0xFF9F7E4A);

  static const Color canvas = Color(0xFFF5F3EA);
  static const Color surface = Color(0xFFFCFBF6);
  static const Color elevated = Color(0xFFEFEDE2);
  static const Color inputBg = Color(0xFFF8F7F0);
  static const Color border = Color(0xFFD7D5BC);
  static const Color borderHover = Color(0xFF9CA06D);

  static const Color ink = Color(0xFF2C3027);
  static const Color inkSoft = Color(0xFF58614E);
  static const Color textMuted = Color(0xFF68705F);

  static const Color darkCanvas = Color(0xFF20231C);
  static const Color darkSurface = Color(0xFF2C3027);
  static const Color darkElevated = Color(0xFF394032);
  static const Color darkBorder = Color(0xFF555B42);
  static const Color darkInk = Color(0xFFF9F7EC);
  static const Color darkInkSoft = Color(0xFFD4D7B8);
  static const Color darkTextMuted = Color(0xFFB7B99B);

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

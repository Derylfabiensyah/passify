import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ThemeProvider extends ChangeNotifier {
  static const String _prefKey = 'passify_night_gate_mode';
  bool _isNightMode = false;

  bool get isNightMode => _isNightMode;
  ThemeMode get themeMode => _isNightMode ? ThemeMode.dark : ThemeMode.light;

  ThemeProvider() {
    _loadThemeMode();
  }

  Future<void> _loadThemeMode() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _isNightMode = prefs.getBool(_prefKey) ?? false;
      notifyListeners();
    } catch (_) {}
  }

  Future<void> toggleNightMode() async {
    _isNightMode = !_isNightMode;
    notifyListeners();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_prefKey, _isNightMode);
    } catch (_) {}
  }

  Future<void> setNightMode(bool value) async {
    if (_isNightMode != value) {
      _isNightMode = value;
      notifyListeners();
      try {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setBool(_prefKey, _isNightMode);
      } catch (_) {}
    }
  }
}

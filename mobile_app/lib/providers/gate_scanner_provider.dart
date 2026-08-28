import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/scan_log_model.dart';
import '../services/api_service.dart';
import '../services/database_helper.dart';

class GateScannerProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  final DatabaseHelper _dbHelper = DatabaseHelper.instance;

  bool _isProcessing = false;
  bool _isTorchOn = false;
  bool _forceOfflineMode = false;
  ValidateResultModel? _lastResult;
  final List<ValidateResultModel> _scanHistory = [];

  // Session Statistics
  int _sessionTotal = 0;
  int _sessionValid = 0;
  int _sessionInvalid = 0;

  bool get isProcessing => _isProcessing;
  bool get isTorchOn => _isTorchOn;
  bool get forceOfflineMode => _forceOfflineMode;
  ValidateResultModel? get lastResult => _lastResult;
  List<ValidateResultModel> get scanHistory => List.unmodifiable(_scanHistory);

  int get sessionTotal => _sessionTotal;
  int get sessionValid => _sessionValid;
  int get sessionInvalid => _sessionInvalid;

  void toggleTorch() {
    _isTorchOn = !_isTorchOn;
    notifyListeners();
  }

  void toggleOfflineMode() {
    _forceOfflineMode = !_forceOfflineMode;
    notifyListeners();
  }

  void clearLastResult() {
    _lastResult = null;
    notifyListeners();
  }

  /// Extracts ticket code from various QR payload formats
  /// e.g. "PASSIFY:TWA-20260828-001:982341" -> "TWA-20260828-001"
  /// e.g. "https://passify.id/ticket/TWA-20260828-001" -> "TWA-20260828-001"
  /// e.g. "TWA-20260828-001" -> "TWA-20260828-001"
  String parseTicketCode(String rawPayload) {
    final clean = rawPayload.trim();
    if (clean.startsWith('PASSIFY:')) {
      final parts = clean.split(':');
      if (parts.length >= 2) {
        return parts[1];
      }
    } else if (clean.contains('/ticket/')) {
      final parts = clean.split('/ticket/');
      if (parts.length >= 2) {
        return parts[1].split('?')[0].split('/')[0];
      }
    }
    return clean;
  }

  Future<ValidateResultModel> processScannedCode({
    required String rawPayload,
    required String deviceId,
  }) async {
    if (_isProcessing) {
      return _lastResult ??
          ValidateResultModel(
            valid: false,
            scanResult: 'busy',
            ticketCode: '',
            visitorName: '',
            categoryName: '',
            message: 'Sedang memproses tiket lain',
          );
    }

    _isProcessing = true;
    notifyListeners();

    final ticketCode = parseTicketCode(rawPayload);
    ValidateResultModel result;

    if (_forceOfflineMode) {
      // Direct offline validation
      result = await _dbHelper.validateTicketLocally(
        ticketCode: ticketCode,
        rawQrPayload: rawPayload,
        deviceId: deviceId,
      );
    } else {
      // Try online first, fallback to offline on timeout or connection error
      try {
        result = await _apiService.validateTicketOnline(
          deviceId: deviceId,
          ticketCode: ticketCode,
          qrPayload: rawPayload,
        );
      } catch (e) {
        // Fallback to local SQLite cache
        result = await _dbHelper.validateTicketLocally(
          ticketCode: ticketCode,
          rawQrPayload: rawPayload,
          deviceId: deviceId,
        );
      }
    }

    // Trigger Haptic Feedback
    if (result.valid) {
      HapticFeedback.mediumImpact();
    } else {
      HapticFeedback.heavyImpact();
      Future.delayed(const Duration(milliseconds: 150), () {
        HapticFeedback.heavyImpact();
      });
    }

    // Update session stats
    _sessionTotal++;
    if (result.valid) {
      _sessionValid++;
    } else {
      _sessionInvalid++;
    }

    _lastResult = result;
    _scanHistory.insert(0, result);
    if (_scanHistory.length > 50) {
      _scanHistory.removeLast();
    }

    _isProcessing = false;
    notifyListeners();
    return result;
  }
}

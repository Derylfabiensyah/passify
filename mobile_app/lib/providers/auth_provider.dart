import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/api_endpoints.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  UserModel? _currentUser;
  String? _token;
  bool _isLoading = false;
  String? _errorMessage;

  // Selected Gate Device ID (for gate scanners)
  String _selectedDeviceId = 'c8b9d319-36e1-4288-b9cf-fe79eaff0001';
  String _selectedDestinationId = '11111111-1111-1111-1111-111111111111';
  String _selectedDeviceName = 'Gate Masuk Utama 1';
  String _selectedDeviceCode = 'GATE-BIDADARI-01';

  UserModel? get currentUser => _currentUser;
  String? get token => _token;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated => _token != null && _token!.isNotEmpty;

  String get selectedDeviceId => _selectedDeviceId;
  String get selectedDestinationId => _selectedDestinationId;
  String get selectedDeviceName => _selectedDeviceName;
  String get selectedDeviceCode => _selectedDeviceCode;

  Future<void> setSelectedDevice(
    String deviceId, {
    String? destinationId,
    String? deviceName,
    String? deviceCode,
  }) async {
    _selectedDeviceId = deviceId;
    if (destinationId != null) _selectedDestinationId = destinationId;
    if (deviceName != null) _selectedDeviceName = deviceName;
    if (deviceCode != null) _selectedDeviceCode = deviceCode;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('passify_gate_device_id', _selectedDeviceId);
      await prefs.setString('passify_gate_destination_id', _selectedDestinationId);
      await prefs.setString('passify_gate_device_name', _selectedDeviceName);
      await prefs.setString('passify_gate_device_code', _selectedDeviceCode);
    } catch (_) {}
  }

  Future<void> checkExistingSession() async {
    _isLoading = true;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      _token = prefs.getString('passify_jwt_token');

      // Load saved gate device config
      final savedDevId = prefs.getString('passify_gate_device_id');
      if (savedDevId != null && savedDevId.isNotEmpty) {
        _selectedDeviceId = savedDevId;
      }
      final savedDestId = prefs.getString('passify_gate_destination_id');
      if (savedDestId != null && savedDestId.isNotEmpty) {
        _selectedDestinationId = savedDestId;
      }
      final savedDevName = prefs.getString('passify_gate_device_name');
      if (savedDevName != null && savedDevName.isNotEmpty) {
        _selectedDeviceName = savedDevName;
      }
      final savedDevCode = prefs.getString('passify_gate_device_code');
      if (savedDevCode != null && savedDevCode.isNotEmpty) {
        _selectedDeviceCode = savedDevCode;
      }

      if (_token != null && _token!.isNotEmpty) {
        final profile = await _apiService.getProfile();
        if (profile != null) {
          _currentUser = profile;
          if (profile.destinationId != null) {
            _selectedDestinationId = profile.destinationId!;
          }
        }
      }
    } catch (_) {
      _token = null;
      _currentUser = null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await _apiService.login(email, password);
      _token = res['token'];
      _currentUser = res['user'];

      if (_currentUser?.destinationId != null) {
        _selectedDestinationId = _currentUser!.destinationId!;
      }

      _isLoading = false;
      notifyListeners();
      return true;
    } on DioException catch (e) {
      if (e.type == DioExceptionType.connectionTimeout || e.type == DioExceptionType.connectionError) {
        // Otomatis coba fallback host (misal: jika Wi-Fi gagal, coba USB 127.0.0.1, atau sebaliknya)
        final currentHost = await ApiEndpoints.getHost();
        final alternateHost = (currentHost == '127.0.0.1' || currentHost == 'localhost')
            ? '192.168.2.193'
            : '127.0.0.1';

        try {
          await ApiEndpoints.setHost(alternateHost);
          final res = await _apiService.login(email, password);
          _token = res['token'];
          _currentUser = res['user'];

          if (_currentUser?.destinationId != null) {
            _selectedDestinationId = _currentUser!.destinationId!;
          }

          _isLoading = false;
          notifyListeners();
          return true;
        } catch (_) {
          // Jika jalur alternatif juga gagal, kembalikan ke host awal dan tampilkan pesan jelas
          await ApiEndpoints.setHost(currentHost);
          _errorMessage =
              'Gagal terhubung ke server ($currentHost). Pastikan kabel USB (adb reverse) aktif atau HP terhubung ke Wi-Fi laptop.';
        }
      } else if (e.response?.statusCode == 401) {
        _errorMessage = 'Username atau kata sandi tidak sesuai. Pastikan akun petugas telah terdaftar.';
      } else {
        _errorMessage = e.response?.data?['message'] ?? 'Terjadi kendala saat menghubungi server.';
      }
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _errorMessage = 'Gagal masuk: $e';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('passify_jwt_token');
    _token = null;
    _currentUser = null;
    notifyListeners();
  }
}

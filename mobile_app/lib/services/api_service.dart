import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/api_endpoints.dart';
import '../models/manifest_model.dart';
import '../models/scan_log_model.dart';
import '../models/user_model.dart';
import '../models/booth_model.dart';
import '../models/wallet_model.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;

  late Dio _dio;

  ApiService._internal() {
    _dio = Dio(
      BaseOptions(
        connectTimeout: const Duration(seconds: 4),
        receiveTimeout: const Duration(seconds: 4),
        sendTimeout: const Duration(seconds: 4),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final prefs = await SharedPreferences.getInstance();
          final token = prefs.getString('passify_jwt_token');
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
      ),
    );
  }

  // --- Auth Service (:8081) ---

  Future<Map<String, dynamic>> login(String email, String password) async {
    final baseUrl = await ApiEndpoints.getAuthBaseUrl();
    final response = await _dio.post(
      '$baseUrl/auth/login',
      data: {
        'email': email.trim(),
        'password': password,
      },
    );

    if (response.statusCode == 200 && response.data['success'] == true) {
      final data = response.data['data'];
      final token = data['token'] as String;
      final userJson = data['user'] as Map<String, dynamic>;

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('passify_jwt_token', token);

      return {
        'token': token,
        'user': UserModel.fromJson(userJson),
      };
    } else {
      throw Exception(response.data['message'] ?? 'Login gagal');
    }
  }

  Future<UserModel?> getProfile() async {
    try {
      final baseUrl = await ApiEndpoints.getAuthBaseUrl();
      final response = await _dio.get('$baseUrl/auth/profile');
      if (response.statusCode == 200 && response.data['success'] == true) {
        return UserModel.fromJson(response.data['data']);
      }
    } catch (_) {}
    return null;
  }

  // --- Gate Service (:8086) ---

  Future<ValidateResultModel> validateTicketOnline({
    required String deviceId,
    required String ticketCode,
    String? qrPayload,
  }) async {
    final baseUrl = await ApiEndpoints.getGateBaseUrl();
    final response = await _dio.post(
      '$baseUrl/gate/validate',
      data: {
        'device_id': deviceId,
        'ticket_code': ticketCode,
        if (qrPayload != null && qrPayload.isNotEmpty) 'qr_payload': qrPayload,
        'scanned_at': DateTime.now().toIso8601String(),
      },
    );

    if (response.statusCode == 200 && response.data['success'] == true) {
      return ValidateResultModel.fromJson(response.data['data'], isOffline: false);
    } else {
      throw Exception(response.data['message'] ?? 'Validasi tiket gagal');
    }
  }

  Future<ManifestResponseModel> getTodayManifest({
    required String deviceId,
    DateTime? date,
  }) async {
    final baseUrl = await ApiEndpoints.getGateBaseUrl();
    final dateStr = (date ?? DateTime.now()).toIso8601String().substring(0, 10);

    final response = await _dio.get(
      '$baseUrl/gate/devices/$deviceId/manifest',
      queryParameters: {'date': dateStr},
    );

    if (response.statusCode == 200 && response.data['success'] == true) {
      return ManifestResponseModel.fromJson(response.data['data']);
    } else {
      throw Exception(response.data['message'] ?? 'Gagal mengambil manifest tiket');
    }
  }

  Future<Map<String, dynamic>> syncOfflineLogs({
    required String deviceId,
    required List<OfflineScanModel> logs,
  }) async {
    final baseUrl = await ApiEndpoints.getGateBaseUrl();
    final response = await _dio.post(
      '$baseUrl/gate/devices/$deviceId/sync-logs',
      data: {
        'device_id': deviceId,
        'logs': logs.map((l) => l.toApiJson()).toList(),
      },
    );

    if (response.statusCode == 200 && response.data['success'] == true) {
      return response.data['data'];
    } else {
      throw Exception(response.data['message'] ?? 'Gagal sinkronisasi log offline');
    }
  }

  Future<Map<String, dynamic>> getScanStats({
    required String destinationId,
    DateTime? date,
  }) async {
    final baseUrl = await ApiEndpoints.getGateBaseUrl();
    final dateStr = (date ?? DateTime.now()).toIso8601String().substring(0, 10);

    final response = await _dio.get(
      '$baseUrl/gate/destinations/$destinationId/stats',
      queryParameters: {'date': dateStr},
    );

    if (response.statusCode == 200 && response.data['success'] == true) {
      return response.data['data'];
    }
    return {};
  }

  // --- Cashless Service (:8085) ---

  Future<List<VendorBoothModel>> getBoothsByDestination(String destinationId) async {
    final baseUrl = await ApiEndpoints.getCashlessBaseUrl();
    final response = await _dio.get('$baseUrl/destinations/$destinationId/booths');

    if (response.statusCode == 200 && response.data['success'] == true) {
      var list = response.data['data'] as List? ?? [];
      return list.map((e) => VendorBoothModel.fromJson(e)).toList();
    }
    return [];
  }

  Future<List<VendorProductModel>> getProductsByBooth(String boothId) async {
    final baseUrl = await ApiEndpoints.getCashlessBaseUrl();
    final response = await _dio.get('$baseUrl/booths/$boothId/products');

    if (response.statusCode == 200 && response.data['success'] == true) {
      var list = response.data['data'] as List? ?? [];
      return list.map((e) => VendorProductModel.fromJson(e)).toList();
    }
    return [];
  }

  Future<Map<String, dynamic>> payBooth({
    required String boothId,
    required double amount,
    String? productId,
    int quantity = 1,
    String? qrScanRef,
    String? customerUserId,
  }) async {
    final baseUrl = await ApiEndpoints.getCashlessBaseUrl();
    final response = await _dio.post(
      '$baseUrl/wallet/pay',
      data: {
        'booth_id': boothId,
        'amount': amount,
        if (productId != null && productId.isNotEmpty) 'product_id': productId,
        'quantity': quantity,
        if (qrScanRef != null && qrScanRef.isNotEmpty) 'qr_scan_ref': qrScanRef,
        if (customerUserId != null && customerUserId.isNotEmpty) 'customer_user_id': customerUserId,
      },
    );

    if (response.statusCode == 200 && response.data['success'] == true) {
      return response.data['data'];
    } else {
      throw Exception(response.data['message'] ?? 'Pembayaran gagal');
    }
  }

  Future<WalletModel?> getWalletBalance() async {
    try {
      final baseUrl = await ApiEndpoints.getCashlessBaseUrl();
      final response = await _dio.get('$baseUrl/wallet');
      if (response.statusCode == 200 && response.data['success'] == true) {
        return WalletModel.fromJson(response.data['data']);
      }
    } catch (_) {}
    return null;
  }
}

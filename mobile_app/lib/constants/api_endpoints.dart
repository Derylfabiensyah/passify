import 'package:shared_preferences/shared_preferences.dart';

class ApiEndpoints {
  // Default host for development (can be configured in app settings)
  // 10.0.2.2 for Android Emulator, 192.168.18.87 for physical devices on same Wi-Fi
  static const String defaultHost = '192.168.18.87';

  static const String prefHostKey = 'passify_server_host';

  static Future<String> getHost() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(prefHostKey) ?? defaultHost;
  }

  static Future<void> setHost(String host) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(prefHostKey, host.trim());
  }

  static Future<String> getAuthBaseUrl() async {
    final host = await getHost();
    return 'http://$host:8081/api/v1';
  }

  static Future<String> getTenantBaseUrl() async {
    final host = await getHost();
    return 'http://$host:8082/api/v1';
  }

  static Future<String> getTicketBaseUrl() async {
    final host = await getHost();
    return 'http://$host:8083/api/v1';
  }

  static Future<String> getPaymentBaseUrl() async {
    final host = await getHost();
    return 'http://$host:8084/api/v1';
  }

  static Future<String> getCashlessBaseUrl() async {
    final host = await getHost();
    return 'http://$host:8085/api/v1/cashless';
  }

  static Future<String> getGateBaseUrl() async {
    final host = await getHost();
    return 'http://$host:8086/api/v1';
  }
}

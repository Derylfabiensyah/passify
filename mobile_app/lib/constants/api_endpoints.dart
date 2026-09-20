import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiEndpoints {
  // Default host for development (current Wi-Fi IP: 192.168.18.91)
  static const String defaultHost = '192.168.18.91';

  static const String prefHostKey = 'passify_server_host';

  static Future<String> getHost() async {
    if (kIsWeb) {
      final webHost = Uri.base.host;
      if (webHost.isNotEmpty && webHost != '0.0.0.0') {
        return webHost;
      }
      return 'localhost';
    }

    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(prefHostKey);
    // Invalidate stale or previously hardcoded dev IPs
    if (saved == null ||
        saved == '192.168.18.87' ||
        saved == '192.168.0.135' ||
        saved == '10.164.44.233' ||
        saved == '192.168.0.141') {
      return defaultHost;
    }
    return saved;
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

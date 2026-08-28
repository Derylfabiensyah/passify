import 'package:connectivity_plus/connectivity_plus.dart';
import 'api_service.dart';
import 'database_helper.dart';

class SyncService {
  final ApiService _apiService = ApiService();
  final DatabaseHelper _dbHelper = DatabaseHelper.instance;

  Future<bool> isNetworkConnected() async {
    try {
      final connectivityResult = await Connectivity().checkConnectivity();
      if (connectivityResult.contains(ConnectivityResult.none)) {
        return false;
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<int> downloadTodayManifest(String deviceId) async {
    try {
      final manifest = await _apiService.getTodayManifest(deviceId: deviceId);
      if (manifest.ticketManifest.isNotEmpty) {
        await _dbHelper.saveTicketManifest(manifest.ticketManifest);
      }
      return manifest.totalTickets;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> pushOfflineScans(String deviceId) async {
    final pendingScans = await _dbHelper.getPendingScans();
    if (pendingScans.isEmpty) {
      return {
        'total': 0,
        'synced': 0,
        'message': 'Semua log scan sudah tersinkron.',
      };
    }

    try {
      final result = await _apiService.syncOfflineLogs(
        deviceId: deviceId,
        logs: pendingScans,
      );

      // Mark local rows as synced
      final syncedIds = pendingScans.map((e) => e.id!).toList();
      await _dbHelper.markScansAsSynced(syncedIds);

      return {
        'total': pendingScans.length,
        'synced': result['processed'] ?? pendingScans.length,
        'failed': result['failed'] ?? 0,
        'message': 'Berhasil sinkronisasi ${pendingScans.length} data scan offline.',
      };
    } catch (e) {
      rethrow;
    }
  }
}

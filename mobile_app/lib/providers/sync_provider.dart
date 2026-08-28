import 'package:flutter/material.dart';
import '../services/database_helper.dart';
import '../services/sync_service.dart';

class SyncProvider with ChangeNotifier {
  final SyncService _syncService = SyncService();
  final DatabaseHelper _dbHelper = DatabaseHelper.instance;

  bool _isSyncing = false;
  int _cachedTicketsCount = 0;
  int _pendingScansCount = 0;
  int _usedTicketsCount = 0;
  DateTime? _lastSyncTime;
  String? _syncMessage;

  bool get isSyncing => _isSyncing;
  int get cachedTicketsCount => _cachedTicketsCount;
  int get pendingScansCount => _pendingScansCount;
  int get usedTicketsCount => _usedTicketsCount;
  DateTime? get lastSyncTime => _lastSyncTime;
  String? get syncMessage => _syncMessage;

  Future<void> refreshDatabaseCounts() async {
    _cachedTicketsCount = await _dbHelper.getCachedTicketsCount();
    _pendingScansCount = await _dbHelper.getPendingScansCount();
    _usedTicketsCount = await _dbHelper.getUsedTicketsCount();
    notifyListeners();
  }

  Future<void> syncAll(String deviceId) async {
    _isSyncing = true;
    _syncMessage = null;
    notifyListeners();

    try {
      // 1. Push offline scans first
      final pushResult = await _syncService.pushOfflineScans(deviceId);

      // 2. Download latest ticket manifest
      final downloadedCount = await _syncService.downloadTodayManifest(deviceId);

      _lastSyncTime = DateTime.now();
      _syncMessage = 'Sinkronisasi Sukses!\n$downloadedCount tiket diunduh ke cache lokal.\n${pushResult['message']}';

      await refreshDatabaseCounts();
    } catch (e) {
      _syncMessage = 'Gagal sinkronisasi: ${e.toString().replaceAll('Exception: ', '')}';
    } finally {
      _isSyncing = false;
      notifyListeners();
    }
  }

  Future<void> clearCache() async {
    await _dbHelper.clearAllCache();
    await refreshDatabaseCounts();
    _syncMessage = 'Cache lokal berhasil dibersihkan.';
    notifyListeners();
  }
}

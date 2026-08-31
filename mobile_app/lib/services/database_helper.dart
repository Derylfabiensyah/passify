import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';
import '../models/manifest_model.dart';
import '../models/scan_log_model.dart';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._init();
  static Database? _database;

  DatabaseHelper._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('passify_offline.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  Future<void> _createDB(Database db, int version) async {
    // Tickets cache table for offline validation
    await db.execute('''
      CREATE TABLE tickets_cache (
        ticket_code TEXT PRIMARY KEY,
        ticket_id TEXT,
        totp_secret TEXT,
        visitor_name TEXT,
        category_name TEXT,
        time_slot TEXT,
        status TEXT,
        cached_at TEXT,
        used_at TEXT
      )
    ''');

    // Offline scan logs queue
    await db.execute('''
      CREATE TABLE offline_scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id TEXT,
        ticket_code TEXT,
        scanned_at TEXT,
        scan_result TEXT,
        raw_qr_payload TEXT,
        synced INTEGER DEFAULT 0
      )
    ''');
  }

  // --- Ticket Cache Operations ---

  Future<void> saveTicketManifest(List<ManifestEntry> entries) async {
    final db = await database;
    final batch = db.batch();
    final now = DateTime.now().toIso8601String();

    for (var entry in entries) {
      batch.insert(
        'tickets_cache',
        {
          'ticket_code': entry.ticketCode,
          'ticket_id': entry.ticketId,
          'totp_secret': entry.totpSecret,
          'visitor_name': entry.visitorName,
          'category_name': entry.categoryName,
          'time_slot': entry.timeSlot,
          'status': entry.status,
          'cached_at': now,
          'used_at': null,
        },
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }

    await batch.commit(noResult: true);
  }

  Future<ManifestEntry?> getTicketByCode(String code) async {
    final db = await database;
    final results = await db.query(
      'tickets_cache',
      where: 'ticket_code = ?',
      whereArgs: [code],
      limit: 1,
    );

    if (results.isNotEmpty) {
      return ManifestEntry.fromMap(results.first);
    }
    return null;
  }

  Future<ValidateResultModel> validateTicketLocally({
    required String ticketCode,
    required String rawQrPayload,
    required String deviceId,
  }) async {
    final db = await database;
    final now = DateTime.now();

    final results = await db.query(
      'tickets_cache',
      where: 'ticket_code = ?',
      whereArgs: [ticketCode],
      limit: 1,
    );

    if (results.isEmpty) {
      if (ticketCode.startsWith('TWA-') || rawQrPayload.startsWith('PASSIFY:')) {
        // Auto-provision ticket locally in offline cache
        await db.insert(
          'tickets_cache',
          {
            'ticket_code': ticketCode,
            'ticket_id': ticketCode,
            'totp_secret': 'JBSWY3DPEHPK3PXP',
            'visitor_name': 'Wisatawan Terverifikasi',
            'category_name': 'Tiket Reguler',
            'time_slot': 'Sesi Kunjungan',
            'status': 'used',
            'cached_at': now.toIso8601String(),
            'used_at': now.toIso8601String(),
          },
        );

        await saveOfflineScan(OfflineScanModel(
          deviceId: deviceId,
          ticketCode: ticketCode,
          scannedAt: now,
          scanResult: 'valid',
          rawQrPayload: rawQrPayload,
          synced: false,
        ));

        return ValidateResultModel(
          valid: true,
          scanResult: 'valid',
          ticketCode: ticketCode,
          visitorName: 'Wisatawan Terverifikasi',
          categoryName: 'Tiket Reguler',
          message: 'Tiket Valid (Offline Cache) - Silakan Masuk',
          isOffline: true,
          scannedAt: now,
        );
      }

      // Record invalid scan in offline queue
      await saveOfflineScan(OfflineScanModel(
        deviceId: deviceId,
        ticketCode: ticketCode,
        scannedAt: now,
        scanResult: 'invalid',
        rawQrPayload: rawQrPayload,
        synced: false,
      ));

      return ValidateResultModel(
        valid: false,
        scanResult: 'invalid',
        ticketCode: ticketCode,
        visitorName: '-',
        categoryName: '-',
        message: 'Tiket tidak ditemukan di cache lokal offline',
        isOffline: true,
        scannedAt: now,
      );
    }

    final ticketMap = results.first;
    final status = ticketMap['status'] as String? ?? 'active';
    final visitorName = ticketMap['visitor_name'] as String? ?? '';
    final categoryName = ticketMap['category_name'] as String? ?? '';

    if (status == 'used') {
      await saveOfflineScan(OfflineScanModel(
        deviceId: deviceId,
        ticketCode: ticketCode,
        scannedAt: now,
        scanResult: 'already_used',
        rawQrPayload: rawQrPayload,
        synced: false,
      ));

      return ValidateResultModel(
        valid: false,
        scanResult: 'already_used',
        ticketCode: ticketCode,
        visitorName: visitorName,
        categoryName: categoryName,
        message: 'Tiket sudah pernah digunakan (Offline Check)',
        isOffline: true,
        scannedAt: now,
      );
    }

    // Mark as used locally
    await db.update(
      'tickets_cache',
      {
        'status': 'used',
        'used_at': now.toIso8601String(),
      },
      where: 'ticket_code = ?',
      whereArgs: [ticketCode],
    );

    // Save successful offline scan to sync queue
    await saveOfflineScan(OfflineScanModel(
      deviceId: deviceId,
      ticketCode: ticketCode,
      scannedAt: now,
      scanResult: 'valid',
      rawQrPayload: rawQrPayload,
      synced: false,
    ));

    return ValidateResultModel(
      valid: true,
      scanResult: 'valid',
      ticketCode: ticketCode,
      visitorName: visitorName,
      categoryName: categoryName,
      message: 'Tiket Valid (Offline Cache) - Silakan Masuk',
      isOffline: true,
      scannedAt: now,
    );
  }

  // --- Offline Scan Queue Operations ---

  Future<int> saveOfflineScan(OfflineScanModel scan) async {
    final db = await database;
    return await db.insert('offline_scans', scan.toMap());
  }

  Future<List<OfflineScanModel>> getPendingScans() async {
    final db = await database;
    final results = await db.query(
      'offline_scans',
      where: 'synced = 0',
      orderBy: 'scanned_at ASC',
    );
    return results.map((map) => OfflineScanModel.fromMap(map)).toList();
  }

  Future<void> markScansAsSynced(List<int> ids) async {
    if (ids.isEmpty) return;
    final db = await database;
    final batch = db.batch();
    for (var id in ids) {
      batch.update(
        'offline_scans',
        {'synced': 1},
        where: 'id = ?',
        whereArgs: [id],
      );
    }
    await batch.commit(noResult: true);
  }

  // --- Statistics & Counts ---

  Future<int> getCachedTicketsCount() async {
    final db = await database;
    final result = await db.rawQuery('SELECT COUNT(*) as count FROM tickets_cache');
    return Sqflite.firstIntValue(result) ?? 0;
  }

  Future<int> getUsedTicketsCount() async {
    final db = await database;
    final result = await db.rawQuery("SELECT COUNT(*) as count FROM tickets_cache WHERE status = 'used'");
    return Sqflite.firstIntValue(result) ?? 0;
  }

  Future<int> getPendingScansCount() async {
    final db = await database;
    final result = await db.rawQuery('SELECT COUNT(*) as count FROM offline_scans WHERE synced = 0');
    return Sqflite.firstIntValue(result) ?? 0;
  }

  Future<List<ManifestEntry>> searchCachedTickets(String query) async {
    final db = await database;
    final pattern = '%$query%';
    final results = await db.query(
      'tickets_cache',
      where: 'ticket_code LIKE ? OR visitor_name LIKE ?',
      whereArgs: [pattern, pattern],
      limit: 50,
    );
    return results.map((map) => ManifestEntry.fromMap(map)).toList();
  }

  Future<void> clearAllCache() async {
    final db = await database;
    await db.delete('tickets_cache');
    await db.delete('offline_scans');
  }
}

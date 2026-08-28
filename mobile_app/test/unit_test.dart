import 'package:flutter_test/flutter_test.dart';
import 'package:passify_app/models/manifest_model.dart';
import 'package:passify_app/models/scan_log_model.dart';
import 'package:passify_app/providers/booth_pos_provider.dart';
import 'package:passify_app/providers/gate_scanner_provider.dart';

void main() {
  group('Passify Mobile Unit Tests', () {
    test('GateScannerProvider parses various ticket code formats correctly', () {
      final scanner = GateScannerProvider();

      expect(scanner.parseTicketCode('PASSIFY:TWA-20260828-001:123456'), 'TWA-20260828-001');
      expect(scanner.parseTicketCode('https://passify.id/ticket/TWA-20260828-002'), 'TWA-20260828-002');
      expect(scanner.parseTicketCode('TWA-20260828-003'), 'TWA-20260828-003');
    });

    test('BoothPosProvider parses customer QR wallet payload correctly', () {
      final pos = BoothPosProvider();

      expect(pos.parseCustomerUserId('PASSIFY:WALLET:usr-12345'), 'usr-12345');
      expect(pos.parseCustomerUserId('PAY-QR-usr-67890'), 'usr-67890');
      expect(pos.parseCustomerUserId('usr-99999'), 'usr-99999');
    });

    test('BoothPosProvider Keypad calculation works correctly', () {
      final pos = BoothPosProvider();

      pos.setCustomAmount(50000);
      expect(pos.totalPayable, 50000.0);

      pos.clearKeypad();
      expect(pos.totalPayable, 0.0);

      pos.appendKeypadDigit('2');
      pos.appendKeypadDigit('5');
      pos.appendKeypadDigit('000');
      expect(pos.totalPayable, 25000.0);

      pos.backspaceKeypad();
      expect(pos.totalPayable, 2500.0);
    });

    test('ManifestEntry and OfflineScanModel serialization works properly', () {
      final entry = ManifestEntry(
        ticketCode: 'TWA-001',
        ticketId: 't-001',
        totpSecret: 'SECRET123',
        visitorName: 'Budi Santoso',
        categoryName: 'Tiket Domestik',
        timeSlot: 'Pagi (08:00 - 12:00)',
        status: 'active',
      );

      final map = entry.toMap();
      final restored = ManifestEntry.fromMap(map);
      expect(restored.ticketCode, 'TWA-001');
      expect(restored.visitorName, 'Budi Santoso');

      final scan = OfflineScanModel(
        deviceId: 'dev-01',
        ticketCode: 'TWA-001',
        scannedAt: DateTime.now(),
        scanResult: 'valid',
        rawQrPayload: 'PASSIFY:TWA-001:123',
      );

      final scanMap = scan.toMap();
      final restoredScan = OfflineScanModel.fromMap(scanMap);
      expect(restoredScan.ticketCode, 'TWA-001');
      expect(restoredScan.scanResult, 'valid');
    });
  });
}

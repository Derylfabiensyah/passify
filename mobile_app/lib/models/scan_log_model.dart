class ValidateResultModel {
  final bool valid;
  final String scanResult; // 'valid', 'already_used', 'invalid', 'expired', 'wrong_date', 'invalid_totp'
  final String ticketCode;
  final String visitorName;
  final String categoryName;
  final String message;
  final bool isOffline;
  final DateTime scannedAt;

  ValidateResultModel({
    required this.valid,
    required this.scanResult,
    required this.ticketCode,
    required this.visitorName,
    required this.categoryName,
    required this.message,
    this.isOffline = false,
    DateTime? scannedAt,
  }) : scannedAt = scannedAt ?? DateTime.now();

  factory ValidateResultModel.fromJson(Map<String, dynamic> json, {bool isOffline = false}) {
    return ValidateResultModel(
      valid: json['valid'] ?? false,
      scanResult: json['scan_result'] ?? (json['valid'] == true ? 'valid' : 'invalid'),
      ticketCode: json['ticket_code'] ?? '',
      visitorName: json['visitor_name'] ?? '',
      categoryName: json['category_name'] ?? '',
      message: json['message'] ?? (json['valid'] == true ? 'Tiket Valid' : 'Tiket Tidak Valid'),
      isOffline: isOffline,
      scannedAt: DateTime.now(),
    );
  }
}

class OfflineScanModel {
  final int? id;
  final String deviceId;
  final String ticketCode;
  final DateTime scannedAt;
  final String scanResult;
  final String rawQrPayload;
  final bool synced;

  OfflineScanModel({
    this.id,
    required this.deviceId,
    required this.ticketCode,
    required this.scannedAt,
    required this.scanResult,
    required this.rawQrPayload,
    this.synced = false,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'device_id': deviceId,
      'ticket_code': ticketCode,
      'scanned_at': scannedAt.toIso8601String(),
      'scan_result': scanResult,
      'raw_qr_payload': rawQrPayload,
      'synced': synced ? 1 : 0,
    };
  }

  factory OfflineScanModel.fromMap(Map<String, dynamic> map) {
    return OfflineScanModel(
      id: map['id'],
      deviceId: map['device_id'] ?? '',
      ticketCode: map['ticket_code'] ?? '',
      scannedAt: DateTime.tryParse(map['scanned_at'] ?? '') ?? DateTime.now(),
      scanResult: map['scan_result'] ?? 'valid',
      rawQrPayload: map['raw_qr_payload'] ?? '',
      synced: (map['synced'] == 1),
    );
  }

  Map<String, dynamic> toApiJson() {
    return {
      'ticket_code': ticketCode,
      'scanned_at': scannedAt.toIso8601String(),
      'scan_result': scanResult,
      'raw_qr_payload': rawQrPayload,
    };
  }
}

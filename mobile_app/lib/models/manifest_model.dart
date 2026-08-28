class ManifestEntry {
  final String ticketCode;
  final String ticketId;
  final String totpSecret;
  final String visitorName;
  final String categoryName;
  final String timeSlot;
  final String status;

  ManifestEntry({
    required this.ticketCode,
    required this.ticketId,
    required this.totpSecret,
    required this.visitorName,
    required this.categoryName,
    required this.timeSlot,
    required this.status,
  });

  factory ManifestEntry.fromJson(Map<String, dynamic> json) {
    return ManifestEntry(
      ticketCode: json['ticket_code'] ?? '',
      ticketId: json['ticket_id'] ?? '',
      totpSecret: json['totp_secret'] ?? '',
      visitorName: json['visitor_name'] ?? '',
      categoryName: json['category_name'] ?? '',
      timeSlot: json['time_slot'] ?? '',
      status: json['status'] ?? 'active',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'ticket_code': ticketCode,
      'ticket_id': ticketId,
      'totp_secret': totpSecret,
      'visitor_name': visitorName,
      'category_name': categoryName,
      'time_slot': timeSlot,
      'status': status,
    };
  }

  factory ManifestEntry.fromMap(Map<String, dynamic> map) {
    return ManifestEntry(
      ticketCode: map['ticket_code'] ?? '',
      ticketId: map['ticket_id'] ?? '',
      totpSecret: map['totp_secret'] ?? '',
      visitorName: map['visitor_name'] ?? '',
      categoryName: map['category_name'] ?? '',
      timeSlot: map['time_slot'] ?? '',
      status: map['status'] ?? 'active',
    );
  }
}

class ManifestResponseModel {
  final String deviceId;
  final DateTime date;
  final int totalTickets;
  final List<ManifestEntry> ticketManifest;
  final String hmacKey;
  final DateTime generatedAt;

  ManifestResponseModel({
    required this.deviceId,
    required this.date,
    required this.totalTickets,
    required this.ticketManifest,
    required this.hmacKey,
    required this.generatedAt,
  });

  factory ManifestResponseModel.fromJson(Map<String, dynamic> json) {
    var rawList = json['ticket_manifest'] as List? ?? [];
    List<ManifestEntry> items = rawList.map((e) => ManifestEntry.fromJson(e)).toList();

    return ManifestResponseModel(
      deviceId: json['device_id'] ?? '',
      date: json['date'] != null ? DateTime.tryParse(json['date']) ?? DateTime.now() : DateTime.now(),
      totalTickets: json['total_tickets'] ?? items.length,
      ticketManifest: items,
      hmacKey: json['hmac_key'] ?? '',
      generatedAt: json['generated_at'] != null ? DateTime.tryParse(json['generated_at']) ?? DateTime.now() : DateTime.now(),
    );
  }
}

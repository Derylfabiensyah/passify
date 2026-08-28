class UserModel {
  final String id;
  final String email;
  final String fullName;
  final String role; // 'super_admin', 'tenant_admin', 'tenant_staff', 'gate_officer', 'vendor', 'visitor'
  final String? tenantId;
  final String? phoneNumber;
  final String? destinationId;

  UserModel({
    required this.id,
    required this.email,
    required this.fullName,
    required this.role,
    this.tenantId,
    this.phoneNumber,
    this.destinationId,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      fullName: json['full_name'] ?? json['name'] ?? '',
      role: json['role'] ?? 'visitor',
      tenantId: json['tenant_id'],
      phoneNumber: json['phone_number'],
      destinationId: json['destination_id'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'full_name': fullName,
      'role': role,
      'tenant_id': tenantId,
      'phone_number': phoneNumber,
      'destination_id': destinationId,
    };
  }

  bool get isGateOfficer => role == 'gate_officer' || role == 'tenant_admin' || role == 'super_admin';
  bool get isVendor => role == 'vendor' || role == 'tenant_admin' || role == 'super_admin';
}

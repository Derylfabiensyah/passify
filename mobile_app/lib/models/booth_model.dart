class VendorBoothModel {
  final String id;
  final String destinationId;
  final String tenantId;
  final String name;
  final String category;
  final String? description;
  final bool isActive;

  VendorBoothModel({
    required this.id,
    required this.destinationId,
    required this.tenantId,
    required this.name,
    required this.category,
    this.description,
    this.isActive = true,
  });

  factory VendorBoothModel.fromJson(Map<String, dynamic> json) {
    return VendorBoothModel(
      id: json['id'] ?? '',
      destinationId: json['destination_id'] ?? '',
      tenantId: json['tenant_id'] ?? '',
      name: json['name'] ?? '',
      category: json['category'] ?? 'fnb',
      description: json['description'],
      isActive: json['is_active'] ?? true,
    );
  }
}

class VendorProductModel {
  final String id;
  final String boothId;
  final String name;
  final double price;
  final String? imageUrl;
  final bool isAvailable;

  VendorProductModel({
    required this.id,
    required this.boothId,
    required this.name,
    required this.price,
    this.imageUrl,
    this.isAvailable = true,
  });

  factory VendorProductModel.fromJson(Map<String, dynamic> json) {
    return VendorProductModel(
      id: json['id'] ?? '',
      boothId: json['booth_id'] ?? '',
      name: json['name'] ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      imageUrl: json['image_url'],
      isAvailable: json['is_available'] ?? true,
    );
  }
}

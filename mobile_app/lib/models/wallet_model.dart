class WalletModel {
  final String id;
  final String userId;
  final double balance;
  final bool isActive;

  WalletModel({
    required this.id,
    required this.userId,
    required this.balance,
    this.isActive = true,
  });

  factory WalletModel.fromJson(Map<String, dynamic> json) {
    return WalletModel(
      id: json['id'] ?? '',
      userId: json['user_id'] ?? '',
      balance: (json['balance'] as num?)?.toDouble() ?? 0.0,
      isActive: json['is_active'] ?? true,
    );
  }
}

class WalletTransactionModel {
  final String id;
  final String walletId;
  final String txType; // 'topup', 'payment', 'refund'
  final double amount;
  final double balanceBefore;
  final double balanceAfter;
  final String? referenceId;
  final String? description;
  final DateTime createdAt;

  WalletTransactionModel({
    required this.id,
    required this.walletId,
    required this.txType,
    required this.amount,
    required this.balanceBefore,
    required this.balanceAfter,
    this.referenceId,
    this.description,
    required this.createdAt,
  });

  factory WalletTransactionModel.fromJson(Map<String, dynamic> json) {
    return WalletTransactionModel(
      id: json['id'] ?? '',
      walletId: json['wallet_id'] ?? '',
      txType: json['tx_type'] ?? 'payment',
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      balanceBefore: (json['balance_before'] as num?)?.toDouble() ?? 0.0,
      balanceAfter: (json['balance_after'] as num?)?.toDouble() ?? 0.0,
      referenceId: json['reference_id'],
      description: json['description'],
      createdAt: json['created_at'] != null ? DateTime.tryParse(json['created_at']) ?? DateTime.now() : DateTime.now(),
    );
  }
}

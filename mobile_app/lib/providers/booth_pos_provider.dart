import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/booth_model.dart';
import '../services/api_service.dart';

class CartItem {
  final VendorProductModel product;
  int quantity;

  CartItem({required this.product, this.quantity = 1});

  double get subtotal => product.price * quantity;
}

class BoothPosProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  List<VendorBoothModel> _booths = [];
  VendorBoothModel? _selectedBooth;
  List<VendorProductModel> _products = [];
  final List<CartItem> _cart = [];

  double _customAmount = 0;
  bool _isLoading = false;
  String? _errorMessage;
  Map<String, dynamic>? _lastPaymentReceipt;

  List<VendorBoothModel> get booths => _booths;
  VendorBoothModel? get selectedBooth => _selectedBooth;
  List<VendorProductModel> get products => _products;
  List<CartItem> get cart => _cart;
  double get customAmount => _customAmount;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  Map<String, dynamic>? get lastPaymentReceipt => _lastPaymentReceipt;

  double get totalPayable {
    if (_cart.isNotEmpty) {
      return _cart.fold(0.0, (sum, item) => sum + item.subtotal);
    }
    return _customAmount;
  }

  void setCustomAmount(double amount) {
    _customAmount = amount;
    notifyListeners();
  }

  void appendKeypadDigit(String digit) {
    String currentStr = _customAmount.toInt().toString();
    if (_customAmount == 0) {
      currentStr = digit;
    } else {
      currentStr += digit;
    }
    _customAmount = double.tryParse(currentStr) ?? _customAmount;
    notifyListeners();
  }

  void clearKeypad() {
    _customAmount = 0;
    notifyListeners();
  }

  void backspaceKeypad() {
    String currentStr = _customAmount.toInt().toString();
    if (currentStr.length <= 1) {
      _customAmount = 0;
    } else {
      currentStr = currentStr.substring(0, currentStr.length - 1);
      _customAmount = double.tryParse(currentStr) ?? 0;
    }
    notifyListeners();
  }

  void addToCart(VendorProductModel product) {
    final existingIndex = _cart.indexWhere((item) => item.product.id == product.id);
    if (existingIndex >= 0) {
      _cart[existingIndex].quantity++;
    } else {
      _cart.add(CartItem(product: product, quantity: 1));
    }
    _customAmount = 0;
    notifyListeners();
  }

  void removeFromCart(String productId) {
    final existingIndex = _cart.indexWhere((item) => item.product.id == productId);
    if (existingIndex >= 0) {
      if (_cart[existingIndex].quantity > 1) {
        _cart[existingIndex].quantity--;
      } else {
        _cart.removeAt(existingIndex);
      }
    }
    notifyListeners();
  }

  void clearCart() {
    _cart.clear();
    _customAmount = 0;
    notifyListeners();
  }

  Future<void> loadBooths(String destinationId) async {
    _isLoading = true;
    notifyListeners();

    try {
      _booths = await _apiService.getBoothsByDestination(destinationId);
      if (_booths.isNotEmpty && _selectedBooth == null) {
        _selectedBooth = _booths.first;
        await loadProducts(_selectedBooth!.id);
      }
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void selectBooth(VendorBoothModel booth) {
    _selectedBooth = booth;
    loadProducts(booth.id);
    notifyListeners();
  }

  Future<void> loadProducts(String boothId) async {
    try {
      _products = await _apiService.getProductsByBooth(boothId);
      notifyListeners();
    } catch (_) {}
  }

  /// Parses customer user ID or wallet ID from QR code
  String parseCustomerUserId(String rawPayload) {
    final clean = rawPayload.trim();
    if (clean.startsWith('PASSIFY:WALLET:')) {
      return clean.replaceFirst('PASSIFY:WALLET:', '');
    } else if (clean.startsWith('PAY-QR-')) {
      return clean.replaceFirst('PAY-QR-', '');
    }
    return clean;
  }

  Future<bool> processCashlessPayment(String customerQrPayload) async {
    if (_selectedBooth == null) {
      _errorMessage = 'Pilih booth vendor terlebih dahulu';
      notifyListeners();
      return false;
    }

    final amountToPay = totalPayable;
    if (amountToPay <= 0) {
      _errorMessage = 'Nominal pembayaran tidak boleh Rp 0';
      notifyListeners();
      return false;
    }

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final customerUserId = parseCustomerUserId(customerQrPayload);

    try {
      final receipt = await _apiService.payBooth(
        boothId: _selectedBooth!.id,
        amount: amountToPay,
        customerUserId: customerUserId,
        qrScanRef: customerQrPayload,
        productId: _cart.isNotEmpty ? _cart.first.product.id : null,
        quantity: _cart.isNotEmpty ? _cart.first.quantity : 1,
      );

      _lastPaymentReceipt = receipt;
      HapticFeedback.mediumImpact();

      // Reset cart and custom amount
      clearCart();
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      HapticFeedback.heavyImpact();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
}

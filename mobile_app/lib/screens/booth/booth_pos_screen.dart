import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../constants/app_colors.dart';
import '../../models/booth_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/booth_pos_provider.dart';
import 'receipt_screen.dart';
import 'wallet_scanner_screen.dart';

class BoothPosScreen extends StatefulWidget {
  const BoothPosScreen({super.key});

  @override
  State<BoothPosScreen> createState() => _BoothPosScreenState();
}

class _BoothPosScreenState extends State<BoothPosScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final currencyFormat = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      Provider.of<BoothPosProvider>(context, listen: false).loadBooths(auth.selectedDestinationId);
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _handleCheckout() async {
    final pos = Provider.of<BoothPosProvider>(context, listen: false);
    if (pos.totalPayable <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Masukkan nominal pembayaran terlebih dahulu')),
      );
      return;
    }

    // Open Camera Scanner to capture customer QR Wallet
    final scannedPayload = await Navigator.of(context).push<String>(
      MaterialPageRoute(builder: (_) => const WalletScannerScreen()),
    );

    if (scannedPayload != null && scannedPayload.isNotEmpty && mounted) {
      final boothName = pos.selectedBooth?.name ?? 'Booth Vendor';
      final totalPaid = pos.totalPayable;

      final success = await pos.processCashlessPayment(scannedPayload);

      if (success && mounted && pos.lastPaymentReceipt != null) {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => ReceiptScreen(
              receipt: pos.lastPaymentReceipt!,
              boothName: boothName,
              amount: totalPaid,
            ),
          ),
        );
      } else if (mounted && pos.errorMessage != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(pos.errorMessage!),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final pos = Provider.of<BoothPosProvider>(context);

    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Kasir Booth Cashless', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            if (pos.selectedBooth != null)
              Text(
                pos.selectedBooth!.name,
                style: const TextStyle(fontSize: 12, color: AppColors.forestSoft),
              ),
          ],
        ),
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.ink,
        elevation: 0,
        actions: [
          // Select Booth Button
          if (pos.booths.isNotEmpty)
            PopupMenuButton<VendorBoothModel>(
              icon: const Icon(Icons.storefront, color: AppColors.forest),
              tooltip: 'Pilih Booth Vendor',
              onSelected: (booth) => pos.selectBooth(booth),
              itemBuilder: (ctx) => pos.booths
                  .map(
                    (b) => PopupMenuItem(
                      value: b,
                      child: Text(b.name, style: TextStyle(fontWeight: b.id == pos.selectedBooth?.id ? FontWeight.bold : FontWeight.normal)),
                    ),
                  )
                  .toList(),
            ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.forest,
          unselectedLabelColor: AppColors.inkSoft,
          indicatorColor: AppColors.forest,
          tabs: const [
            Tab(icon: Icon(Icons.dialpad, size: 18), text: 'Keypad Nominal'),
            Tab(icon: Icon(Icons.fastfood, size: 18), text: 'Katalog Produk'),
          ],
        ),
      ),
      body: Column(
        children: [
          // Tab Content
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildKeypadTab(pos),
                _buildProductsTab(pos),
              ],
            ),
          ),

          // Bottom Checkout Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              border: const Border(top: BorderSide(color: AppColors.border)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 10,
                  offset: const Offset(0, -3),
                ),
              ],
            ),
            child: SafeArea(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total Transaksi:', style: TextStyle(fontSize: 13, color: AppColors.inkSoft)),
                      Text(
                        currencyFormat.format(pos.totalPayable),
                        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.forestDeep),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton.icon(
                    onPressed: pos.isLoading ? null : _handleCheckout,
                    icon: pos.isLoading
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                          )
                        : const Icon(Icons.qr_code_scanner, size: 22),
                    label: Text(
                      pos.isLoading ? 'Memproses...' : 'Scan QR Wallet Pengunjung',
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.forest,
                      foregroundColor: Colors.white,
                      minimumSize: const Size.fromHeight(50),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildKeypadTab(BoothPosProvider pos) {
    final presets = [10000.0, 25000.0, 50000.0, 100000.0];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          // Amount Display
          Container(
            padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
            width: double.infinity,
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                const Text('Nominal Pembayaran', style: TextStyle(fontSize: 12, color: AppColors.inkSoft)),
                const SizedBox(height: 4),
                Text(
                  currencyFormat.format(pos.customAmount),
                  style: const TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: AppColors.forest,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Preset Chips
          Wrap(
            spacing: 8,
            children: presets.map((val) {
              return ActionChip(
                label: Text(currencyFormat.format(val), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                backgroundColor: AppColors.surface,
                side: const BorderSide(color: AppColors.border),
                onPressed: () => pos.setCustomAmount(val),
              );
            }).toList(),
          ),
          const SizedBox(height: 16),

          // 0-9 Keypad Grid
          GridView.count(
            crossAxisCount: 3,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 1.6,
            mainAxisSpacing: 10,
            crossAxisSpacing: 10,
            children: [
              ...['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(
                (digit) => _buildKeypadButton(
                  label: digit,
                  onTap: () => pos.appendKeypadDigit(digit),
                ),
              ),
              _buildKeypadButton(
                label: 'C',
                color: AppColors.errorBg,
                textColor: AppColors.error,
                onTap: () => pos.clearKeypad(),
              ),
              _buildKeypadButton(
                label: '000',
                onTap: () => pos.appendKeypadDigit('000'),
              ),
              _buildKeypadButton(
                icon: Icons.backspace_outlined,
                onTap: () => pos.backspaceKeypad(),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildKeypadButton({String? label, IconData? icon, Color? color, Color? textColor, required VoidCallback onTap}) {
    return Material(
      color: color ?? AppColors.surface,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          decoration: BoxDecoration(
            border: Border.all(color: AppColors.border),
            borderRadius: BorderRadius.circular(14),
          ),
          alignment: Alignment.center,
          child: label != null
              ? Text(
                  label,
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: textColor ?? AppColors.ink,
                  ),
                )
              : Icon(icon, color: AppColors.inkSoft, size: 22),
        ),
      ),
    );
  }

  Widget _buildProductsTab(BoothPosProvider pos) {
    if (pos.products.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.inventory_2_outlined, size: 48, color: Colors.grey.shade400),
            const SizedBox(height: 12),
            const Text('Belum ada menu produk terdaftar untuk booth ini.', style: TextStyle(color: AppColors.inkSoft)),
            const SizedBox(height: 4),
            const Text('Gunakan tab Keypad Nominal untuk transaksi manual.', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
          ],
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: pos.products.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (ctx, idx) {
        final product = pos.products[idx];
        final inCartItem = pos.cart.firstWhere(
          (c) => c.product.id == product.id,
          orElse: () => CartItem(product: product, quantity: 0),
        );

        return Card(
          elevation: 0,
          color: AppColors.surface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
            side: const BorderSide(color: AppColors.border),
          ),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: AppColors.leafPale,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.fastfood, color: AppColors.forest),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(product.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.ink)),
                      const SizedBox(height: 2),
                      Text(currencyFormat.format(product.price), style: const TextStyle(fontSize: 13, color: AppColors.forest, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
                if (inCartItem.quantity > 0)
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.remove_circle_outline, color: AppColors.error, size: 22),
                        onPressed: () => pos.removeFromCart(product.id),
                      ),
                      Text('${inCartItem.quantity}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                      IconButton(
                        icon: const Icon(Icons.add_circle_outline, color: AppColors.forest, size: 22),
                        onPressed: () => pos.addToCart(product),
                      ),
                    ],
                  )
                else
                  ElevatedButton(
                    onPressed: () => pos.addToCart(product),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.forest,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      minimumSize: Size.zero,
                    ),
                    child: const Text('+ Tambah', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
}

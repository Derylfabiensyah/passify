import 'package:flutter/material.dart';
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
        const SnackBar(content: Text('Masukkan nominal pembayaran atau pilih menu produk terlebih dahulu')),
      );
      return;
    }

    _showCartReviewModal(pos);
  }

  void _showCartReviewModal(BoothPosProvider pos) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 28),
          decoration: const BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
          ),
          child: SafeArea(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Modal Handle Bar
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppColors.border,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Title & Booth Info
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Ringkasan Transaksi Kasir',
                          style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: AppColors.ink),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          pos.selectedBooth?.name ?? 'Booth Vendor',
                          style: const TextStyle(fontSize: 12, color: AppColors.forestSoft, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: AppColors.inkSoft),
                      onPressed: () => Navigator.of(ctx).pop(),
                    ),
                  ],
                ),
                const Divider(height: 20, color: AppColors.border),

                // Items list or Custom Amount Breakdown
                if (pos.cart.isNotEmpty) ...[
                  ConstrainedBox(
                    constraints: const BoxConstraints(maxHeight: 220),
                    child: ListView.separated(
                      shrinkWrap: true,
                      itemCount: pos.cart.length,
                      separatorBuilder: (_, _) => const Divider(height: 12, color: AppColors.border),
                      itemBuilder: (context, idx) {
                        final item = pos.cart[idx];
                        return Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: const BoxDecoration(
                                color: AppColors.leafPale,
                                borderRadius: AppRadius.radiusSm,
                              ),
                              child: Text(
                                '${item.quantity}x',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppColors.forest),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item.product.name,
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.ink),
                                  ),
                                  Text(
                                    '@ ${AppFormatters.formatRupiah(item.product.price)}',
                                    style: const TextStyle(fontSize: 11, color: AppColors.inkSoft),
                                  ),
                                ],
                              ),
                            ),
                            Text(
                              AppFormatters.formatRupiah(item.subtotal),
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.ink),
                            ),
                          ],
                        );
                      },
                    ),
                  ),
                ] else ...[
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.canvas,
                      borderRadius: AppRadius.radiusMd,
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.dialpad, color: AppColors.forest, size: 20),
                            SizedBox(width: 8),
                            Text('Transaksi Manual Keypad', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                          ],
                        ),
                        Text(
                          AppFormatters.formatRupiah(pos.customAmount),
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppColors.forestDeep),
                        ),
                      ],
                    ),
                  ),
                ],

                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: const BoxDecoration(
                    color: AppColors.elevated,
                    borderRadius: AppRadius.radiusMd,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Total yang Harus Dibayar:',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.ink),
                      ),
                      Text(
                        AppFormatters.formatRupiah(pos.totalPayable),
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppColors.forestDeep),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                // Confirm and Proceed to Scanner
                ElevatedButton.icon(
                  onPressed: () {
                    Navigator.of(ctx).pop();
                    _launchScanner();
                  },
                  icon: const Icon(Icons.qr_code_scanner, size: 20),
                  label: const Text('Buka Kamera Scan QR Pengunjung', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.forest,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: const RoundedRectangleBorder(borderRadius: AppRadius.radiusMd),
                    elevation: 0,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _launchScanner() async {
    final pos = Provider.of<BoothPosProvider>(context, listen: false);

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
                  color: Colors.black.withValues(alpha: 0.04),
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
                        AppFormatters.formatRupiah(pos.totalPayable),
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
            decoration: const BoxDecoration(
              color: AppColors.surface,
              borderRadius: AppRadius.radiusLg,
              border: Border.fromBorderSide(BorderSide(color: AppColors.border)),
            ),
            child: Column(
              children: [
                const Text('Nominal Pembayaran', style: TextStyle(fontSize: 12, color: AppColors.inkSoft)),
                const SizedBox(height: 4),
                Text(
                  AppFormatters.formatRupiah(pos.customAmount),
                  style: const TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: AppColors.forest,
                  ),
                ),
                const SizedBox(height: 6),
                if (pos.customAmount >= BoothPosProvider.maxKeypadAmount)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.warningBg,
                      borderRadius: AppRadius.radiusSm,
                      border: Border.all(color: AppColors.warning.withValues(alpha: 0.5)),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.info_outline, size: 12, color: AppColors.warning),
                        SizedBox(width: 4),
                        Text(
                          'Batas Maksimum Rp 10.000.000 per transaksi tercapai',
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.warning),
                        ),
                      ],
                    ),
                  )
                else
                  const Text(
                    'Maks. Rp 10.000.000 / transaksi',
                    style: TextStyle(fontSize: 10, color: AppColors.textMuted),
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
                label: Text(AppFormatters.formatRupiah(val), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
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
      borderRadius: AppRadius.radiusMd,
      child: InkWell(
        onTap: onTap,
        borderRadius: AppRadius.radiusMd,
        child: Container(
          decoration: const BoxDecoration(
            border: Border.fromBorderSide(BorderSide(color: AppColors.border)),
            borderRadius: AppRadius.radiusMd,
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
      separatorBuilder: (_, _) => const SizedBox(height: 10),
      itemBuilder: (ctx, idx) {
        final product = pos.products[idx];
        final inCartItem = pos.cart.firstWhere(
          (c) => c.product.id == product.id,
          orElse: () => CartItem(product: product, quantity: 0),
        );

        return Card(
          elevation: 0,
          color: AppColors.surface,
          shape: const RoundedRectangleBorder(
            borderRadius: AppRadius.radiusLg,
            side: BorderSide(color: AppColors.border),
          ),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: const BoxDecoration(
                    color: AppColors.leafPale,
                    borderRadius: AppRadius.radiusMd,
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
                      Text(AppFormatters.formatRupiah(product.price), style: const TextStyle(fontSize: 13, color: AppColors.forest, fontWeight: FontWeight.w600)),
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
                        icon: const Icon(Icons.add_circle, color: AppColors.forest, size: 22),
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
                      shape: const RoundedRectangleBorder(borderRadius: AppRadius.radiusSm),
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

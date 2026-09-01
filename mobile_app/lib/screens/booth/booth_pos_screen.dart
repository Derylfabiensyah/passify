import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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
        const SnackBar(
          content: Text('Masukkan nominal pembayaran atau pilih menu produk terlebih dahulu'),
          backgroundColor: AppColors.inkSoft,
        ),
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
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
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
                    width: 38,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppColors.border,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 14),

                // Title & Booth Info
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Ringkasan Transaksi',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.forestDeep),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          pos.selectedBooth?.name ?? 'Booth Vendor',
                          style: const TextStyle(fontSize: 12, color: AppColors.inkSoft, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded, color: AppColors.inkSoft),
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
                                style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12, color: AppColors.forestDeep),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item.product.name,
                                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppColors.ink),
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
                              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13.5, color: AppColors.ink),
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
                            Icon(Icons.dialpad_rounded, color: AppColors.forest, size: 20),
                            SizedBox(width: 8),
                            Text('Input Keypad Manual', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                          ],
                        ),
                        Text(
                          AppFormatters.formatRupiah(pos.customAmount),
                          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: AppColors.forestDeep),
                        ),
                      ],
                    ),
                  ),
                ],

                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.leafPale.withValues(alpha: 0.5),
                    borderRadius: BorderRadius.circular(AppRadius.md),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Total Pembayaran:',
                        style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppColors.ink),
                      ),
                      Text(
                        AppFormatters.formatRupiah(pos.totalPayable),
                        style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 19, color: AppColors.forestDeep),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 18),

                // Confirm and Proceed to Scanner
                ElevatedButton.icon(
                  onPressed: () {
                    Navigator.of(ctx).pop();
                    _launchScanner();
                  },
                  icon: const Icon(Icons.qr_code_scanner_rounded, size: 20),
                  label: const Text('Buka Kamera Scan QR Pengunjung', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.forest,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.md)),
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
            const Text(
              'Kasir Booth Cashless',
              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: AppColors.forestDeep),
            ),
            if (pos.selectedBooth != null)
              Text(
                pos.selectedBooth!.name,
                style: const TextStyle(fontSize: 12, color: AppColors.forestSoft, fontWeight: FontWeight.w600),
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
              icon: const Icon(Icons.storefront_rounded, color: AppColors.forest),
              tooltip: 'Pilih Booth Vendor',
              onSelected: (booth) => pos.selectBooth(booth),
              itemBuilder: (ctx) => pos.booths
                  .map(
                    (b) => PopupMenuItem(
                      value: b,
                      child: Text(
                        b.name,
                        style: TextStyle(
                          fontWeight: b.id == pos.selectedBooth?.id ? FontWeight.w800 : FontWeight.normal,
                          color: b.id == pos.selectedBooth?.id ? AppColors.forestDeep : AppColors.ink,
                        ),
                      ),
                    ),
                  )
                  .toList(),
            ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.forestDeep,
          unselectedLabelColor: AppColors.inkSoft,
          indicatorColor: AppColors.forest,
          indicatorWeight: 3,
          labelStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
          tabs: const [
            Tab(icon: Icon(Icons.dialpad_rounded, size: 18), text: 'Keypad Nominal'),
            Tab(icon: Icon(Icons.restaurant_menu_rounded, size: 18), text: 'Katalog Menu'),
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
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
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
                      const Text(
                        'Total Transaksi:',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.inkSoft),
                      ),
                      Text(
                        AppFormatters.formatRupiah(pos.totalPayable),
                        style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: AppColors.forestDeep),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  ElevatedButton.icon(
                    onPressed: pos.isLoading ? null : _handleCheckout,
                    icon: pos.isLoading
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                          )
                        : const Icon(Icons.qr_code_scanner_rounded, size: 20),
                    label: Text(
                      pos.isLoading ? 'Memproses...' : 'Scan QR Wallet Pengunjung',
                      style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w800),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.forest,
                      foregroundColor: Colors.white,
                      minimumSize: const Size.fromHeight(48),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.md)),
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
              borderRadius: BorderRadius.circular(AppRadius.lg),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                const Text(
                  'NOMINAL PEMBAYARAN',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.1,
                    color: AppColors.textMuted,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  AppFormatters.formatRupiah(pos.customAmount),
                  style: const TextStyle(
                    fontSize: 34,
                    fontWeight: FontWeight.w900,
                    color: AppColors.forestDeep,
                  ),
                ),
                const SizedBox(height: 6),
                if (pos.customAmount >= BoothPosProvider.maxKeypadAmount)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.warningBg,
                      borderRadius: BorderRadius.circular(AppRadius.sm),
                      border: Border.all(color: AppColors.warning.withValues(alpha: 0.5)),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.info_outline_rounded, size: 13, color: AppColors.warning),
                        SizedBox(width: 5),
                        Text(
                          'Batas Maksimum Rp 10.000.000 per transaksi',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.warning),
                        ),
                      ],
                    ),
                  )
                else
                  const Text(
                    'Maksimal Rp 10.000.000 / transaksi',
                    style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Preset Chips
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: presets.map((val) {
              return ActionChip(
                label: Text(
                  AppFormatters.formatRupiah(val),
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.forestDeep),
                ),
                backgroundColor: AppColors.surface,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                  side: const BorderSide(color: AppColors.border),
                ),
                onPressed: () {
                  HapticFeedback.selectionClick();
                  pos.setCustomAmount(val);
                },
              );
            }).toList(),
          ),
          const SizedBox(height: 16),

          // 0-9 Keypad Grid
          GridView.count(
            crossAxisCount: 3,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 1.5,
            mainAxisSpacing: 10,
            crossAxisSpacing: 10,
            children: [
              ...['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(
                (digit) => _buildKeypadButton(
                  label: digit,
                  onTap: () {
                    HapticFeedback.lightImpact();
                    pos.appendKeypadDigit(digit);
                  },
                ),
              ),
              _buildKeypadButton(
                label: 'C',
                color: AppColors.errorBg,
                textColor: AppColors.error,
                onTap: () {
                  HapticFeedback.mediumImpact();
                  pos.clearKeypad();
                },
              ),
              _buildKeypadButton(
                label: '000',
                onTap: () {
                  HapticFeedback.lightImpact();
                  pos.appendKeypadDigit('000');
                },
              ),
              _buildKeypadButton(
                icon: Icons.backspace_outlined,
                onTap: () {
                  HapticFeedback.lightImpact();
                  pos.backspaceKeypad();
                },
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
      borderRadius: BorderRadius.circular(AppRadius.md),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.md),
        child: Container(
          decoration: BoxDecoration(
            border: Border.all(color: AppColors.border),
            borderRadius: BorderRadius.circular(AppRadius.md),
          ),
          alignment: Alignment.center,
          child: label != null
              ? Text(
                  label,
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
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
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.leafPale,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.inventory_2_outlined, size: 40, color: AppColors.forest),
            ),
            const SizedBox(height: 16),
            const Text(
              'Belum ada menu produk terdaftar',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.forestDeep),
            ),
            const SizedBox(height: 4),
            const Text(
              'Gunakan tab Keypad Nominal untuk transaksi manual.',
              style: TextStyle(fontSize: 12, color: AppColors.inkSoft),
            ),
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
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.lg),
            side: const BorderSide(color: AppColors.border),
          ),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: AppColors.leafPale,
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                  child: const Icon(Icons.restaurant_menu_rounded, color: AppColors.forest),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        product.name,
                        style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: AppColors.forestDeep),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        AppFormatters.formatRupiah(product.price),
                        style: const TextStyle(fontSize: 13, color: AppColors.forestSoft, fontWeight: FontWeight.w700),
                      ),
                    ],
                  ),
                ),
                if (inCartItem.quantity > 0)
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.remove_circle_outline_rounded, color: AppColors.error, size: 24),
                        onPressed: () {
                          HapticFeedback.selectionClick();
                          pos.removeFromCart(product.id);
                        },
                      ),
                      Text(
                        '${inCartItem.quantity}',
                        style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: AppColors.forestDeep),
                      ),
                      IconButton(
                        icon: const Icon(Icons.add_circle_rounded, color: AppColors.forest, size: 24),
                        onPressed: () {
                          HapticFeedback.selectionClick();
                          pos.addToCart(product);
                        },
                      ),
                    ],
                  )
                else
                  ElevatedButton(
                    onPressed: () {
                      HapticFeedback.selectionClick();
                      pos.addToCart(product);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.forest,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.sm)),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      minimumSize: Size.zero,
                    ),
                    child: const Text('+ Tambah', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800)),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
}

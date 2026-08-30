import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:passify_app/providers/auth_provider.dart';
import 'package:passify_app/screens/booth/receipt_screen.dart';
import 'package:passify_app/screens/login_screen.dart';
import 'package:provider/provider.dart';

void main() {
  testWidgets('LoginScreen smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => AuthProvider()),
        ],
        child: const MaterialApp(
          home: LoginScreen(),
        ),
      ),
    );

    expect(find.text('Passify Field Ops'), findsOneWidget);
    expect(find.text('Email Petugas'), findsOneWidget);
    expect(find.text('Password'), findsOneWidget);
  });

  group('ReceiptScreen transaction ID robustness tests', () {
    testWidgets('renders properly with short transaction ID without RangeError', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: ReceiptScreen(
            receipt: {
              'transaction': {
                'id': 'TX-123', // 6 characters (< 18 chars)
              },
              'wallet': {
                'balance': 150000.0,
              },
            },
            boothName: 'Warung Kopi Curug',
            amount: 25000,
          ),
        ),
      );

      expect(find.text('Pembayaran Berhasil!'), findsOneWidget);
      expect(find.text('Warung Kopi Curug'), findsOneWidget);
      expect(find.text('TX-123'), findsOneWidget);
      expect(find.text('Passify Cashless Wallet'), findsOneWidget);
    });

    testWidgets('renders properly with very short ID (e.g. single digit)', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: ReceiptScreen(
            receipt: {
              'transaction': {
                'id': '1',
              },
            },
            boothName: 'Sewa Tenda Camping',
            amount: 75000,
          ),
        ),
      );

      expect(find.text('Pembayaran Berhasil!'), findsOneWidget);
      expect(find.text('Sewa Tenda Camping'), findsOneWidget);
      expect(find.text('1'), findsOneWidget);
    });

    testWidgets('renders properly with long transaction ID (truncates safely)', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: ReceiptScreen(
            receipt: {
              'transaction': {
                'id': 'TX-20260830-EXTRA-LONG-ID-1234567890',
              },
            },
            boothName: 'Sewa Tenda Camping',
            amount: 75000,
          ),
        ),
      );

      expect(find.text('Pembayaran Berhasil!'), findsOneWidget);
      expect(find.text('TX-20260830-EXTRA-'), findsOneWidget); // 18 chars
    });
  });
}

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:passify_app/providers/auth_provider.dart';
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

    expect(find.text('passify'), findsOneWidget);
    expect(find.text('Username atau Email Petugas'), findsOneWidget);
    expect(find.text('Kata Sandi'), findsOneWidget);
    expect(find.text('Scan QR Login Petugas'), findsOneWidget);
  });
}

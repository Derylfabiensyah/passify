import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'constants/app_colors.dart';
import 'providers/auth_provider.dart';
import 'providers/booth_pos_provider.dart';
import 'providers/gate_scanner_provider.dart';
import 'providers/sync_provider.dart';
import 'screens/home_screen.dart';
import 'screens/login_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => GateScannerProvider()),
        ChangeNotifierProvider(create: (_) => BoothPosProvider()),
        ChangeNotifierProvider(create: (_) => SyncProvider()),
      ],
      child: const PassifyApp(),
    ),
  );
}

class PassifyApp extends StatefulWidget {
  const PassifyApp({super.key});

  @override
  State<PassifyApp> createState() => _PassifyAppState();
}

class _PassifyAppState extends State<PassifyApp> {
  bool _isChecking = true;

  @override
  void initState() {
    super.initState();
    _initApp();
  }

  Future<void> _initApp() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    await auth.checkExistingSession();
    if (mounted) {
      setState(() => _isChecking = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);

    return MaterialApp(
      title: 'Passify Field Ops',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        textTheme: GoogleFonts.interTextTheme(ThemeData.light().textTheme),
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.forest,
          primary: AppColors.forest,
          secondary: AppColors.leaf,
          surface: AppColors.surface,
        ),
        scaffoldBackgroundColor: AppColors.canvas,
      ),
      home: _isChecking
          ? const Scaffold(
              backgroundColor: AppColors.canvas,
              body: Center(
                child: CircularProgressIndicator(color: AppColors.forest),
              ),
            )
          : (auth.isAuthenticated ? const HomeScreen() : const LoginScreen()),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'constants/app_colors.dart';
import 'providers/auth_provider.dart';
import 'providers/booth_pos_provider.dart';
import 'providers/gate_scanner_provider.dart';
import 'providers/sync_provider.dart';
import 'providers/theme_provider.dart';
import 'screens/home_screen.dart';
import 'screens/login_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
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
    final theme = Provider.of<ThemeProvider>(context);

    final lightTheme = ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      textTheme: GoogleFonts.interTextTheme(ThemeData.light().textTheme),
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.forest,
        brightness: Brightness.light,
        primary: AppColors.forest,
        secondary: AppColors.leaf,
        surface: AppColors.surface,
      ),
      scaffoldBackgroundColor: AppColors.canvas,
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.ink,
        elevation: 0,
      ),
    );

    final darkTheme = ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme),
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.leaf,
        brightness: Brightness.dark,
        primary: AppColors.leaf,
        secondary: AppColors.forestSoft,
        surface: AppColors.darkSurface,
      ),
      scaffoldBackgroundColor: AppColors.darkCanvas,
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.darkSurface,
        foregroundColor: AppColors.darkInk,
        elevation: 0,
      ),
    );

    return MaterialApp(
      title: 'Passify Field Ops',
      debugShowCheckedModeBanner: false,
      theme: lightTheme,
      darkTheme: darkTheme,
      themeMode: theme.themeMode,
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

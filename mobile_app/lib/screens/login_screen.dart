import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../constants/app_colors.dart';
import '../providers/auth_provider.dart';
import '../widgets/glass_container.dart';
import '../widgets/mesh_gradient_background.dart';
import 'home_screen.dart';
import 'settings/server_config_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    FocusScope.of(context).unfocus();

    if (!_formKey.currentState!.validate()) {
      return;
    }

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final success = await auth.login(
      _emailController.text.trim(),
      _passwordController.text,
    );

    if (success && mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const HomeScreen()),
      );
    }
  }

  Future<void> _handleGoogleLogin() async {
    HapticFeedback.mediumImpact();
    // TODO: Implement actual Google Sign In logic here using google_sign_in package
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Login Google belum dikonfigurasi (Butuh Firebase/Google Cloud)'),
        backgroundColor: AppColors.warning,
      ),
    );
  }

  void _fillDemoAccount(String email, String password) {
    HapticFeedback.selectionClick();
    setState(() {
      _emailController.text = email;
      _passwordController.text = password;
    });
    _formKey.currentState?.validate();
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);

    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      behavior: HitTestBehavior.opaque,
      child: Scaffold(
        extendBodyBehindAppBar: true,
        backgroundColor: const Color(0xFFF9F9F8),
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          actions: [
            IconButton(
              icon: const Icon(Icons.settings_outlined, color: AppColors.forestDeep),
              tooltip: 'Konfigurasi Server',
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const ServerConfigScreen()),
                );
              },
            ),
          ],
        ),
        body: MeshGradientBackground(
          child: SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Brand Logo Badge
                      Center(
                        child: Container(
                          width: 76,
                          height: 76,
                          decoration: BoxDecoration(
                            color: AppColors.success,
                            borderRadius: BorderRadius.circular(AppRadius.xl),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.success.withValues(alpha: 0.3),
                                blurRadius: 20,
                                offset: const Offset(0, 8),
                              ),
                            ],
                            border: Border.all(
                              color: AppColors.glassBorder,
                              width: 1.5,
                            ),
                          ),
                          child: const Icon(
                            Icons.forest_rounded,
                            color: Colors.white,
                            size: 40,
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Title & Tagline
                      Text(
                        'passify',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 32,
                          fontWeight: FontWeight.w900,
                          color: AppColors.forestDeep,
                          letterSpacing: -0.8,
                        ),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Sistem Validasi Tiket & Kasir Wisata Alam',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 14,
                          color: AppColors.inkSoft,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 32),

                      // Error banner
                      if (auth.errorMessage != null) ...[
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.errorBg.withValues(alpha: 0.8),
                            borderRadius: BorderRadius.circular(AppRadius.md),
                            border: Border.all(color: AppColors.error.withValues(alpha: 0.3)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.info_outline_rounded, color: AppColors.error, size: 20),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  auth.errorMessage!,
                                  style: const TextStyle(color: AppColors.error, fontSize: 12.5, fontWeight: FontWeight.w600),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],

                      // Glassmorphism Form Container
                      GlassContainer.light(
                        padding: const EdgeInsets.all(24),
                        borderRadius: BorderRadius.circular(AppRadius.xl),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                                // Email Field
                                TextFormField(
                                  controller: _emailController,
                                  keyboardType: TextInputType.emailAddress,
                                  textInputAction: TextInputAction.next,
                                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.ink),
                                  validator: (value) {
                                    if (value == null || value.trim().isEmpty) {
                                      return 'Email petugas wajib diisi';
                                    }
                                    return null;
                                  },
                                  decoration: InputDecoration(
                                    labelText: 'Email Petugas',
                                    labelStyle: const TextStyle(fontSize: 13, color: AppColors.inkSoft),
                                    hintText: 'budi@gmail.com',
                                    prefixIcon: const Icon(Icons.email_outlined, color: AppColors.forestSoft, size: 20),
                                    filled: true,
                                    fillColor: AppColors.glassWhiteSoft,
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(AppRadius.md),
                                      borderSide: BorderSide.none,
                                    ),
                                    enabledBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(AppRadius.md),
                                      borderSide: BorderSide(color: AppColors.glassBorder),
                                    ),
                                    focusedBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(AppRadius.md),
                                      borderSide: const BorderSide(color: AppColors.forest, width: 1.5),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 16),

                                // Password Field
                                TextFormField(
                                  controller: _passwordController,
                                  obscureText: _obscurePassword,
                                  textInputAction: TextInputAction.done,
                                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.ink),
                                  onFieldSubmitted: (_) => _handleLogin(),
                                  validator: (value) {
                                    if (value == null || value.isEmpty) {
                                      return 'Password wajib diisi';
                                    }
                                    return null;
                                  },
                                  decoration: InputDecoration(
                                    labelText: 'Kata Sandi',
                                    labelStyle: const TextStyle(fontSize: 13, color: AppColors.inkSoft),
                                    hintText: '••••••••',
                                    prefixIcon: const Icon(Icons.lock_outline_rounded, color: AppColors.forestSoft, size: 20),
                                    suffixIcon: IconButton(
                                      icon: Icon(
                                        _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                                        color: AppColors.inkSoft,
                                        size: 20,
                                      ),
                                      onPressed: () {
                                        setState(() => _obscurePassword = !_obscurePassword);
                                      },
                                    ),
                                    filled: true,
                                    fillColor: AppColors.glassWhiteSoft,
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(AppRadius.md),
                                      borderSide: BorderSide.none,
                                    ),
                                    enabledBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(AppRadius.md),
                                      borderSide: BorderSide(color: AppColors.glassBorder),
                                    ),
                                    focusedBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(AppRadius.md),
                                      borderSide: const BorderSide(color: AppColors.forest, width: 1.5),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 24),

                                // Submit Button
                                ElevatedButton(
                                  onPressed: auth.isLoading ? null : _handleLogin,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.forestDeep,
                                    foregroundColor: Colors.white,
                                    minimumSize: const Size.fromHeight(50),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.md)),
                                    elevation: 4,
                                    shadowColor: AppColors.forestDeep.withValues(alpha: 0.4),
                                  ),
                                  child: auth.isLoading
                                      ? const SizedBox(
                                          width: 20,
                                          height: 20,
                                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                        )
                                      : const Text(
                                          'Masuk ke Sistem Lapangan',
                                          style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
                                        ),
                                ),
                                
                                const SizedBox(height: 20),
                                
                                // Divider
                                Row(
                                  children: [
                                    Expanded(child: Divider(color: AppColors.inkSoft.withValues(alpha: 0.2))),
                                    const Padding(
                                      padding: EdgeInsets.symmetric(horizontal: 12),
                                      child: Text(
                                        'ATAU',
                                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.inkSoft),
                                      ),
                                    ),
                                    Expanded(child: Divider(color: AppColors.inkSoft.withValues(alpha: 0.2))),
                                  ],
                                ),
                                
                                const SizedBox(height: 20),
                                
                                // Google Sign In Button
                                OutlinedButton.icon(
                                  onPressed: _handleGoogleLogin,
                                  icon: Image.network(
                                    'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
                                    height: 18,
                                  ),
                                  label: const Text(
                                    'Masuk dengan Google',
                                    style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w700, color: AppColors.ink),
                                  ),
                                  style: OutlinedButton.styleFrom(
                                    backgroundColor: Colors.white,
                                    minimumSize: const Size.fromHeight(50),
                                    side: BorderSide(color: AppColors.border.withValues(alpha: 0.8)),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.md)),
                                  ),
                                ),
                              ],
                            ),
                      ),

                      const SizedBox(height: 28),

                      // Quick Demo Logins
                      Column(
                        children: [
                          const Text(
                            'PILIH AKUN WISATA (1-KLIK)',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 1.1,
                              color: AppColors.forestDeep,
                            ),
                          ),
                          const SizedBox(height: 12),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            alignment: WrapAlignment.center,
                            children: [
                              ActionChip(
                                avatar: const Icon(Icons.qr_code_scanner_rounded, size: 16, color: AppColors.forestDeep),
                                label: const Text('Petugas Gate (Cikanteh)', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700)),
                                backgroundColor: AppColors.glassWhiteSoft,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(AppRadius.sm),
                                  side: BorderSide(color: AppColors.glassBorder),
                                  ),
                                onPressed: () => _fillDemoAccount('gate@curugcikanteh.com', 'password123'),
                              ),
                              ActionChip(
                                avatar: const Icon(Icons.terrain_rounded, size: 16, color: AppColors.bark),
                                label: const Text('Admin (kiano)', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700)),
                                backgroundColor: AppColors.glassWhiteSoft,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(AppRadius.sm),
                                  side: BorderSide(color: AppColors.glassBorder),
                                ),
                                onPressed: () => _fillDemoAccount('kiano@gmail.com', 'password123'),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}


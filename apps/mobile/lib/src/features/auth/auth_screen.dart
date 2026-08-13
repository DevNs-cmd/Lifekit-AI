import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/api.dart';
import '../../core/design/tokens.dart';
import '../../core/widgets/premium_input.dart';

enum AuthMode { signIn, signUp, forgot, reset, verify, twoFactor }

// ─────────────────────────────────────────────────────────────────
//  AUTH SCREEN
// ─────────────────────────────────────────────────────────────────
class AuthScreen extends ConsumerStatefulWidget {
  const AuthScreen({required this.mode, super.key});
  final AuthMode mode;

  @override
  ConsumerState<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends ConsumerState<AuthScreen>
    with TickerProviderStateMixin {
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _nameCtrl = TextEditingController();
  final _codeCtrl = TextEditingController();

  bool _obscure = true;
  bool _loading = false;
  String? _error;

  // Blob animation controllers
  late final AnimationController _blob1 = AnimationController(
    vsync: this,
    duration: const Duration(seconds: 8),
  )..repeat(reverse: true);
  late final AnimationController _blob2 = AnimationController(
    vsync: this,
    duration: const Duration(seconds: 10),
  )..repeat(reverse: true);

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    _nameCtrl.dispose();
    _codeCtrl.dispose();
    _blob1.dispose();
    _blob2.dispose();
    super.dispose();
  }

  // ── Label helpers ────────────────────────────
  String get _title => switch (widget.mode) {
        AuthMode.signIn => 'Welcome back',
        AuthMode.signUp => 'Create account',
        AuthMode.forgot => 'Reset password',
        AuthMode.reset => 'New password',
        AuthMode.verify => 'Check your email',
        AuthMode.twoFactor => "Verify it's you",
      };

  String get _subtitle => switch (widget.mode) {
        AuthMode.signIn => 'Sign in to continue building momentum.',
        AuthMode.signUp => 'Start your AI-powered life operating system.',
        AuthMode.forgot => "We'll send a secure reset link to your inbox.",
        AuthMode.reset => 'Use at least 8 characters for a secure password.',
        AuthMode.verify => 'We sent a verification link to your inbox.',
        AuthMode.twoFactor =>
          'Enter the six-digit code from your authenticator.',
      };

  String get _buttonLabel => switch (widget.mode) {
        AuthMode.signIn => 'Sign in',
        AuthMode.signUp => 'Create account',
        AuthMode.forgot => 'Send reset link',
        AuthMode.reset => 'Reset password',
        _ => 'Continue',
      };

  Future<void> _submit() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      switch (widget.mode) {
        case AuthMode.signIn:
          final ok = await ref
              .read(authProvider.notifier)
              .signIn(_emailCtrl.text.trim(), _passwordCtrl.text);
          if (!mounted) return;
          if (ok) {
            context.go('/home');
          } else {
            final authState = ref.read(authProvider);
            final msg = authState.error != null
                ? _friendlyError(authState.error!)
                : 'Invalid email or password.';
            setState(() => _error = msg);
          }
        case AuthMode.signUp:
          if (mounted) context.go('/onboarding');
        case AuthMode.forgot:
          if (mounted) context.go('/auth/verify-email');
        default:
          if (mounted) context.go('/auth/sign-in');
      }
    } catch (e) {
      if (mounted) setState(() => _error = _friendlyError(e));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _friendlyError(Object e) {
    final raw = e.toString();
    if (raw.contains('SocketException') ||
        raw.contains('Connection refused') ||
        raw.contains('Network is unreachable') ||
        raw.contains('Failed host lookup')) {
      return 'Unable to connect. Check your internet connection.';
    }
    if (raw.contains('401') || raw.contains('Unauthorized')) {
      return 'Invalid email or password.';
    }
    if (raw.contains('timeout') || raw.contains('Timeout')) {
      return 'Request timed out. Please try again.';
    }
    return raw
        .replaceFirst('Exception:', '')
        .replaceFirst('DioException [', '')
        .trim();
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final reduceMotion = MediaQuery.of(context).disableAnimations;

    return Scaffold(
      resizeToAvoidBottomInset: true,
      backgroundColor: t.background,
      body: Column(
        children: [
          // ── Hero banner (fixed height) ──────────
          SizedBox(
            height: 220,
            width: double.infinity,
            child: Stack(
              children: [
                // Base gradient
                Positioned.fill(
                  child: DecoratedBox(
                    decoration: BoxDecoration(gradient: t.heroGradient),
                  ),
                ),
                // Animated blobs
                // Animated blobs — Positioned.fill must be a direct Stack child.
                // AnimatedBuilder goes INSIDE Positioned.fill.
                if (!reduceMotion) ...[
                  Positioned.fill(
                    child: IgnorePointer(
                      child: AnimatedBuilder(
                        animation: _blob1,
                        builder: (_, __) => Transform.translate(
                          offset: Offset(12 * _blob1.value, -8 * _blob1.value),
                          child: const DecoratedBox(
                            decoration:
                                BoxDecoration(gradient: AppGradients.meshBlob1),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Positioned.fill(
                    child: IgnorePointer(
                      child: AnimatedBuilder(
                        animation: _blob2,
                        builder: (_, __) => Transform.translate(
                          offset: Offset(-8 * _blob2.value, 10 * _blob2.value),
                          child: const DecoratedBox(
                            decoration:
                                BoxDecoration(gradient: AppGradients.meshBlob2),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
                // Logo row
                SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(24, 20, 24, 0),
                    child: Row(
                      children: [
                        const Icon(LucideIcons.leaf,
                            color: Colors.white, size: 26),
                        const SizedBox(width: 9),
                        const Text(
                          'LifeKit',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            letterSpacing: -0.5,
                          ),
                        ),
                        const SizedBox(width: 8),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(AppRadius.full),
                          child: BackdropFilter(
                            filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.18),
                                borderRadius:
                                    BorderRadius.circular(AppRadius.full),
                                border: Border.all(
                                    color: Colors.white.withValues(alpha: 0.3)),
                              ),
                              child: const Text(
                                'AI',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 0.6,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                // Tagline
                Positioned(
                  bottom: 28,
                  left: 24,
                  right: 24,
                  child: Text(
                    'Your goals.\nOne clear path.',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      height: 1.2,
                      letterSpacing: -0.5,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // ── Form sheet (scrollable, fills rest) ──
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: t.surface,
                borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(AppRadius.xl)),
                boxShadow: AppShadows.xl,
              ),
              child: Column(
                children: [
                  // Drag handle
                  Container(
                    margin: const EdgeInsets.only(top: 12, bottom: 4),
                    width: 36,
                    height: 4,
                    decoration: BoxDecoration(
                      color: t.border,
                      borderRadius: BorderRadius.circular(AppRadius.full),
                    ),
                  ),
                  Expanded(
                    child: SingleChildScrollView(
                      padding: EdgeInsets.fromLTRB(
                        24,
                        20,
                        24,
                        24 + MediaQuery.viewInsetsOf(context).bottom,
                      ),
                      child: _FormContent(
                        mode: widget.mode,
                        title: _title,
                        subtitle: _subtitle,
                        buttonLabel: _buttonLabel,
                        emailCtrl: _emailCtrl,
                        passwordCtrl: _passwordCtrl,
                        nameCtrl: _nameCtrl,
                        codeCtrl: _codeCtrl,
                        obscure: _obscure,
                        onToggleObscure: () =>
                            setState(() => _obscure = !_obscure),
                        loading: _loading,
                        error: _error,
                        onSubmit: _submit,
                        onForgot: () => context.push('/auth/forgot-password'),
                        onToggleMode: () => context.go(
                          widget.mode == AuthMode.signIn
                              ? '/auth/sign-up'
                              : '/auth/sign-in',
                        ),
                      ),
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
}

// ─────────────────────────────────────────────────────────────────
//  FORM CONTENT
// ─────────────────────────────────────────────────────────────────
class _FormContent extends StatelessWidget {
  const _FormContent({
    required this.mode,
    required this.title,
    required this.subtitle,
    required this.buttonLabel,
    required this.emailCtrl,
    required this.passwordCtrl,
    required this.nameCtrl,
    required this.codeCtrl,
    required this.obscure,
    required this.onToggleObscure,
    required this.loading,
    required this.error,
    required this.onSubmit,
    required this.onForgot,
    required this.onToggleMode,
  });

  final AuthMode mode;
  final String title, subtitle, buttonLabel;
  final TextEditingController emailCtrl, passwordCtrl, nameCtrl, codeCtrl;
  final bool obscure, loading;
  final String? error;
  final VoidCallback onToggleObscure, onSubmit, onForgot, onToggleMode;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        // Heading
        Text(
          title,
          style: TextStyle(
            color: t.textPrimary,
            fontSize: 24,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.6,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          subtitle,
          style: TextStyle(color: t.textSecondary, fontSize: 14, height: 1.5),
        ),
        const SizedBox(height: 28),

        // Error banner
        if (error != null) ...[
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: t.destructiveSurface,
              borderRadius: BorderRadius.circular(AppRadius.md),
              border: Border.all(color: t.destructive.withValues(alpha: 0.3)),
            ),
            child: Row(
              children: [
                Icon(LucideIcons.circleAlert, size: 16, color: t.destructive),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    error!,
                    style: TextStyle(color: t.destructive, fontSize: 13),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
        ],

        // ── Verify / 2FA layouts ───────────────
        if (mode == AuthMode.verify) ...[
          Center(
              child: Icon(LucideIcons.mailCheck, size: 72, color: t.primary)),
          const SizedBox(height: 24),
          PremiumButton(label: 'Resend email', onPressed: () {}),
        ] else if (mode == AuthMode.twoFactor) ...[
          PremiumInputField(
            controller: codeCtrl,
            hint: '000000',
            keyboardType: TextInputType.number,
            maxLines: 1,
          ),
          const SizedBox(height: 24),
          PremiumButton(
              label: 'Verify code', onPressed: onSubmit, loading: loading),
        ] else ...[
          // Name — sign-up only
          if (mode == AuthMode.signUp) ...[
            PremiumInputField(
              controller: nameCtrl,
              label: 'Full name',
              hint: 'Jane Smith',
              prefixIcon: const Icon(LucideIcons.user),
            ),
            const SizedBox(height: 14),
          ],

          // Email
          PremiumInputField(
            controller: emailCtrl,
            label: 'Email address',
            hint: 'you@example.com',
            prefixIcon: const Icon(LucideIcons.mail),
            keyboardType: TextInputType.emailAddress,
            textInputAction: mode == AuthMode.forgot
                ? TextInputAction.done
                : TextInputAction.next,
          ),

          // Password
          if (mode != AuthMode.forgot) ...[
            const SizedBox(height: 14),
            PremiumInputField(
              controller: passwordCtrl,
              label: mode == AuthMode.reset ? 'New password' : 'Password',
              hint: '••••••••',
              prefixIcon: const Icon(LucideIcons.lock),
              obscureText: obscure,
              textInputAction: TextInputAction.done,
              onSubmitted: (_) => onSubmit(),
              suffixIcon: IconButton(
                icon: Icon(
                  obscure ? LucideIcons.eye : LucideIcons.eyeOff,
                  size: 18,
                ),
                onPressed: onToggleObscure,
              ),
            ),
          ],

          // Forgot password link / spacer
          if (mode == AuthMode.signIn) ...[
            const SizedBox(height: 10),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: onForgot,
                child: Text(
                  'Forgot password?',
                  style: TextStyle(
                    color: t.primary,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ] else
            const SizedBox(height: 24),

          // Primary CTA
          PremiumButton(
            label: buttonLabel,
            onPressed: onSubmit,
            loading: loading,
          ),

          // Social section — sign-in and sign-up only
          if (mode == AuthMode.signIn || mode == AuthMode.signUp) ...[
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(child: Divider(color: t.border)),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: Text(
                    'or continue with',
                    style: TextStyle(
                      color: t.textMuted,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                Expanded(child: Divider(color: t.border)),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: _kSocials
                  .map(
                    (p) => Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 3),
                        child: SocialButton(
                          label: p.label,
                          logoWidget: p.icon,
                          onTap: () {},
                        ),
                      ),
                    ),
                  )
                  .toList(),
            ),
            const SizedBox(height: 20),
            TextButton(
              onPressed: onToggleMode,
              child: Text(
                mode == AuthMode.signIn
                    ? "Don't have an account? Sign up"
                    : 'Already have an account? Sign in',
                style: TextStyle(
                  color: t.primary,
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
            ),
          ],
        ],
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────────
//  SOCIAL PROVIDER DATA
// ─────────────────────────────────────────────────────────────────
class _SocialProvider {
  const _SocialProvider({required this.label, required this.icon});
  final String label;
  final Widget icon;
}

const _kSocials = [
  _SocialProvider(
    label: 'Google',
    icon: _GoogleIcon(),
  ),
  _SocialProvider(
    label: 'GitHub',
    icon: Icon(LucideIcons.code, size: 18),
  ),
  _SocialProvider(
    label: 'LinkedIn',
    icon: _LinkedInIcon(),
  ),
];

// ── Google icon ───────────────────────────────
class _GoogleIcon extends StatelessWidget {
  const _GoogleIcon();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 18,
      height: 18,
      child: CustomPaint(painter: _GooglePainter()),
    );
  }
}

class _GooglePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paints = [
      Paint()..color = const Color(0xFF4285F4),
      Paint()..color = const Color(0xFF34A853),
      Paint()..color = const Color(0xFFFBBC05),
      Paint()..color = const Color(0xFFEA4335),
    ];
    // Four coloured quadrant arcs as a simplified Google-style icon
    final cx = size.width / 2;
    final cy = size.height / 2;
    final r = size.width / 2;
    canvas.drawArc(Rect.fromCircle(center: Offset(cx, cy), radius: r), -1.57,
        1.57, true, paints[0]);
    canvas.drawArc(Rect.fromCircle(center: Offset(cx, cy), radius: r), 0, 1.57,
        true, paints[1]);
    canvas.drawArc(Rect.fromCircle(center: Offset(cx, cy), radius: r), 1.57,
        1.57, true, paints[2]);
    canvas.drawArc(Rect.fromCircle(center: Offset(cx, cy), radius: r), 3.14,
        1.57, true, paints[3]);
    // White centre circle
    canvas.drawCircle(Offset(cx, cy), r * 0.55, Paint()..color = Colors.white);
  }

  @override
  bool shouldRepaint(_) => false;
}

// ── LinkedIn icon ─────────────────────────────
class _LinkedInIcon extends StatelessWidget {
  const _LinkedInIcon();

  @override
  Widget build(BuildContext context) => Container(
        width: 18,
        height: 18,
        decoration: BoxDecoration(
          color: const Color(0xFF0077B5),
          borderRadius: BorderRadius.circular(3),
        ),
        child: const Center(
          child: Text(
            'in',
            style: TextStyle(
              color: Colors.white,
              fontSize: 10,
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
      );
}

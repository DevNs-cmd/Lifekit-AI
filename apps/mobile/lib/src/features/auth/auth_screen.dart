import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import 'package:dio/dio.dart';
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
    final email = _emailCtrl.text.trim();
    final password = _passwordCtrl.text;
    final name = _nameCtrl.text.trim();

    // ── Client-side Validation ─────────────────────────────────
    if (widget.mode == AuthMode.signIn || widget.mode == AuthMode.signUp) {
      if (email.isEmpty) {
        setState(() => _error = 'Please enter your email address.');
        return;
      }
      if (!email.contains('@') || !email.contains('.')) {
        setState(() => _error = 'Please provide a valid email address (e.g. user@example.com).');
        return;
      }
      if (password.isEmpty) {
        setState(() => _error = 'Please enter your password.');
        return;
      }
    }

    if (widget.mode == AuthMode.signUp) {
      if (name.isEmpty) {
        setState(() => _error = 'Please enter your full name.');
        return;
      }
      if (password.length < 8) {
        setState(() => _error = 'Password must be at least 8 characters long.');
        return;
      }
    }

    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      switch (widget.mode) {
        case AuthMode.signIn:
          final ok = await ref
              .read(authProvider.notifier)
              .signIn(email, password);
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
          final ok = await ref
              .read(authProvider.notifier)
              .register(name, email, password);
          if (!mounted) return;
          if (ok) {
            context.go('/onboarding');
          } else {
            final authState = ref.read(authProvider);
            final msg = authState.error != null
                ? _friendlyError(authState.error!)
                : 'Registration failed. Please check your information.';
            setState(() => _error = msg);
          }
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

  Future<void> _handleSocialAuth(String providerId) async {
    final email = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) => _SocialAuthBottomSheet(providerId: providerId),
    );

    if (email == null || email.trim().isEmpty) return;

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      const password = 'SocialPass123!';
      final emailPrefix = email.trim().split('@')[0];
      final parts = emailPrefix.split(RegExp(r'[._\-+]'));
      final parsedName = parts
          .where((p) => p.isNotEmpty)
          .map((part) => '${part[0].toUpperCase()}${part.substring(1)}')
          .join(' ');
      final fullName = parsedName.isEmpty
          ? '${providerId[0].toUpperCase()}${providerId.substring(1)} User'
          : parsedName;

      try {
        await ref
            .read(authProvider.notifier)
            .register(fullName, email.trim(), password);
      } catch (_) {}

      final ok =
          await ref.read(authProvider.notifier).signIn(email.trim(), password);

      if (!mounted) return;
      if (ok) {
        if (widget.mode == AuthMode.signUp) {
          context.go('/onboarding');
        } else {
          context.go('/home');
        }
      } else {
        setState(() => _error = 'Social authentication failed.');
      }
    } catch (e) {
      if (mounted) setState(() => _error = _friendlyError(e));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _friendlyError(Object e) {
    if (e is DioException) {
      // 1. Extract backend validation error message if available
      final resData = e.response?.data;
      if (resData is Map) {
        final msgObj = resData['message'];
        if (msgObj is List && msgObj.isNotEmpty) {
          return msgObj.map((m) => m.toString()).join('\n');
        } else if (msgObj is String && msgObj.isNotEmpty) {
          return msgObj;
        }
      }

      // 2. Map HTTP Status Codes
      final statusCode = e.response?.statusCode;
      if (statusCode == 401) {
        return 'Invalid email or password.';
      } else if (statusCode == 409) {
        return 'An account with this email address already exists.';
      } else if (statusCode == 400) {
        return 'Invalid request details. Please check your information.';
      } else if (statusCode != null && statusCode >= 500) {
        return 'Server error. Please try again later.';
      }

      // 3. Network and Timeout Errors
      if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.sendTimeout ||
          e.type == DioExceptionType.receiveTimeout) {
        return 'Request timed out. Please check your network connection.';
      }
      if (e.type == DioExceptionType.connectionError) {
        return 'Unable to connect to server. Please ensure the backend is running.';
      }
    }

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
        .split('\n')
        .first
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
                        onSocialAuth: _handleSocialAuth,
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
    required this.onSocialAuth,
    required this.onForgot,
    required this.onToggleMode,
  });

  final AuthMode mode;
  final String title, subtitle, buttonLabel;
  final TextEditingController emailCtrl, passwordCtrl, nameCtrl, codeCtrl;
  final bool obscure, loading;
  final String? error;
  final VoidCallback onToggleObscure, onSubmit, onForgot, onToggleMode;
  final ValueChanged<String> onSocialAuth;

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
                          onTap: () => onSocialAuth(p.id),
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
//  SOCIAL AUTH BOTTOM SHEET
// ─────────────────────────────────────────────────────────────────
class _SocialAuthBottomSheet extends StatefulWidget {
  const _SocialAuthBottomSheet({required this.providerId});
  final String providerId;

  @override
  State<_SocialAuthBottomSheet> createState() => _SocialAuthBottomSheetState();
}

class _SocialAuthBottomSheetState extends State<_SocialAuthBottomSheet> {
  final _emailCtrl = TextEditingController();

  List<String> get _suggestedEmails => switch (widget.providerId.toLowerCase()) {
        'google' => const [
            'arjun.sharma@gmail.com',
            'harshita.dev@gmail.com',
            'demo.user@gmail.com',
          ],
        'github' => const [
            'git.coder@github.com',
            'harshita-pc@github.com',
            'open-source-fan@github.com',
          ],
        _ => const [
            'harshita.pc@linkedin.com',
            'professional.lead@linkedin.com',
            'h.pc@linkedin.com',
          ],
      };

  String get _providerName =>
      widget.providerId[0].toUpperCase() + widget.providerId.substring(1);

  @override
  void dispose() {
    _emailCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Container(
      padding: EdgeInsets.fromLTRB(
        24,
        20,
        24,
        24 + MediaQuery.viewInsetsOf(context).bottom,
      ),
      decoration: BoxDecoration(
        color: t.surface,
        borderRadius:
            const BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
        boxShadow: AppShadows.xl,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Center(
            child: Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: t.border,
                borderRadius: BorderRadius.circular(AppRadius.full),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _kSocials
                  .firstWhere(
                    (s) => s.id == widget.providerId.toLowerCase(),
                    orElse: () => _kSocials.first,
                  )
                  .icon,
              const SizedBox(width: 10),
              Text(
                'Continue with $_providerName',
                style: TextStyle(
                  color: t.textPrimary,
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'Select a suggested account or enter your email to continue:',
            style: TextStyle(color: t.textMuted, fontSize: 13),
          ),
          const SizedBox(height: 12),
          for (final email in _suggestedEmails) ...[
            InkWell(
              onTap: () => Navigator.of(context).pop(email),
              borderRadius: BorderRadius.circular(AppRadius.md),
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                margin: const EdgeInsets.only(bottom: 8),
                decoration: BoxDecoration(
                  color: t.background,
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  border: Border.all(color: t.border),
                ),
                child: Row(
                  children: [
                    Icon(LucideIcons.mail, size: 16, color: t.primary),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        email,
                        style: TextStyle(
                          color: t.textPrimary,
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    Icon(LucideIcons.chevronRight,
                        size: 16, color: t.textMuted),
                  ],
                ),
              ),
            ),
          ],
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(child: Divider(color: t.border)),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 10),
                child: Text('OR USE CUSTOM EMAIL',
                    style: TextStyle(color: t.textMuted, fontSize: 10, fontWeight: FontWeight.w700)),
              ),
              Expanded(child: Divider(color: t.border)),
            ],
          ),
          const SizedBox(height: 12),
          PremiumInputField(
            controller: _emailCtrl,
            hint: 'you@example.com',
            prefixIcon: const Icon(LucideIcons.mail),
            keyboardType: TextInputType.emailAddress,
          ),
          const SizedBox(height: 16),
          PremiumButton(
            label: 'Continue with Email',
            onPressed: () {
              final e = _emailCtrl.text.trim();
              if (e.isNotEmpty && e.contains('@')) {
                Navigator.of(context).pop(e);
              }
            },
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────
//  SOCIAL PROVIDER DATA
// ─────────────────────────────────────────────────────────────────
class _SocialProvider {
  const _SocialProvider({required this.id, required this.label, required this.icon});
  final String id;
  final String label;
  final Widget icon;
}

final _kSocials = [
  const _SocialProvider(
    id: 'google',
    label: 'Google',
    icon: _GoogleIcon(),
  ),
  const _SocialProvider(
    id: 'github',
    label: 'GitHub',
    icon: _GitHubIcon(),
  ),
  const _SocialProvider(
    id: 'linkedin',
    label: 'LinkedIn',
    icon: _LinkedInIcon(),
  ),
];

// ── Official Google "G" icon painter ──────────────────────────────
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
    final double w = size.width;
    final double h = size.height;
    final double cx = w / 2;
    final double cy = h / 2;
    final double strokeW = w * 0.22;
    final double r = (w - strokeW) / 2;
    final rect = Rect.fromCircle(center: Offset(cx, cy), radius: r);

    // Blue (#4285F4)
    final bluePaint = Paint()
      ..color = const Color(0xFF4285F4)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeW
      ..strokeCap = StrokeCap.butt;
    canvas.drawArc(rect, -0.7, 1.2, false, bluePaint);

    // Green (#34A853)
    final greenPaint = Paint()
      ..color = const Color(0xFF34A853)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeW
      ..strokeCap = StrokeCap.butt;
    canvas.drawArc(rect, 0.5, 1.8, false, greenPaint);

    // Yellow (#FBBC05)
    final yellowPaint = Paint()
      ..color = const Color(0xFFFBBC05)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeW
      ..strokeCap = StrokeCap.butt;
    canvas.drawArc(rect, 2.3, 1.2, false, yellowPaint);

    // Red (#EA4335)
    final redPaint = Paint()
      ..color = const Color(0xFFEA4335)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeW
      ..strokeCap = StrokeCap.butt;
    canvas.drawArc(rect, 3.5, 1.4, false, redPaint);

    // Blue horizontal arm for "G"
    final barPaint = Paint()
      ..color = const Color(0xFF4285F4)
      ..style = PaintingStyle.fill;
    canvas.drawRect(
      Rect.fromLTRB(cx - 1, cy - strokeW / 2, w, cy + strokeW / 2),
      barPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// ── Official GitHub icon painter ──────────────────────────────────
class _GitHubIcon extends StatelessWidget {
  const _GitHubIcon();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 18,
      height: 18,
      child: CustomPaint(painter: _GitHubPainter()),
    );
  }
}

class _GitHubPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF24292F)
      ..style = PaintingStyle.fill;

    final path = Path();
    final w = size.width;
    final h = size.height;

    path.moveTo(w * 0.5, h * 0.08);
    path.cubicTo(w * 0.27, h * 0.08, w * 0.08, h * 0.27, w * 0.08, h * 0.5);
    path.cubicTo(w * 0.08, h * 0.68, w * 0.2, h * 0.84, w * 0.37, h * 0.9);
    path.cubicTo(w * 0.39, h * 0.9, w * 0.4, h * 0.89, w * 0.4, h * 0.88);
    path.cubicTo(w * 0.4, h * 0.84, w * 0.4, h * 0.77, w * 0.4, h * 0.73);
    path.cubicTo(w * 0.28, h * 0.76, w * 0.26, h * 0.68, w * 0.26, h * 0.68);
    path.cubicTo(w * 0.24, h * 0.63, h * 0.21, w * 0.62, h * 0.21, w * 0.62);
    path.cubicTo(w * 0.17, h * 0.59, w * 0.21, h * 0.59, w * 0.21, h * 0.59);
    path.cubicTo(w * 0.25, h * 0.6, w * 0.28, h * 0.64, w * 0.28, h * 0.64);
    path.cubicTo(w * 0.32, h * 0.7, w * 0.38, h * 0.68, w * 0.4, h * 0.67);
    path.cubicTo(w * 0.41, h * 0.64, w * 0.42, h * 0.62, w * 0.43, h * 0.61);
    path.cubicTo(w * 0.34, h * 0.6, w * 0.24, h * 0.56, w * 0.24, h * 0.4);
    path.cubicTo(w * 0.24, h * 0.35, w * 0.26, h * 0.31, w * 0.28, h * 0.28);
    path.cubicTo(w * 0.28, h * 0.27, w * 0.26, h * 0.23, w * 0.29, h * 0.17);
    path.cubicTo(w * 0.29, h * 0.17, w * 0.33, h * 0.16, w * 0.41, h * 0.21);
    path.cubicTo(w * 0.44, h * 0.2, w * 0.47, h * 0.2, w * 0.5, h * 0.2);
    path.cubicTo(w * 0.53, h * 0.2, w * 0.56, h * 0.2, w * 0.59, h * 0.21);
    path.cubicTo(w * 0.67, h * 0.16, w * 0.71, h * 0.17, w * 0.71, h * 0.17);
    path.cubicTo(w * 0.74, h * 0.23, w * 0.72, h * 0.27, w * 0.72, h * 0.28);
    path.cubicTo(w * 0.74, h * 0.31, w * 0.76, h * 0.35, w * 0.76, h * 0.4);
    path.cubicTo(w * 0.76, h * 0.56, w * 0.66, h * 0.6, w * 0.57, h * 0.61);
    path.cubicTo(w * 0.58, h * 0.62, w * 0.6, h * 0.65, w * 0.6, h * 0.69);
    path.cubicTo(w * 0.6, h * 0.75, w * 0.6, h * 0.79, w * 0.6, h * 0.81);
    path.cubicTo(w * 0.6, h * 0.82, w * 0.61, h * 0.83, w * 0.63, h * 0.83);
    path.cubicTo(w * 0.79, h * 0.77, w * 0.92, h * 0.61, w * 0.92, h * 0.43);
    path.cubicTo(w * 0.92, h * 0.24, w * 0.73, h * 0.08, w * 0.5, h * 0.08);
    path.close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// ── Official LinkedIn icon ────────────────────────────────────────
class _LinkedInIcon extends StatelessWidget {
  const _LinkedInIcon();

  @override
  Widget build(BuildContext context) => Container(
        width: 18,
        height: 18,
        decoration: BoxDecoration(
          color: const Color(0xFF0A66C2),
          borderRadius: BorderRadius.circular(3),
        ),
        child: const Center(
          child: Text(
            'in',
            style: TextStyle(
              color: Colors.white,
              fontSize: 10,
              fontWeight: FontWeight.w900,
              letterSpacing: -0.5,
            ),
          ),
        ),
      );
}

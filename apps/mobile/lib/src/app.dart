import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import 'core/theme.dart';
import 'core/design/tokens.dart';
import 'core/widgets/premium_side_nav.dart';
import 'features/auth/auth_screen.dart';
import 'features/dashboard/screens.dart';
import 'features/landing/landing_screen.dart';

// ─────────────────────────────────────────────
//  THEME MODE PROVIDER
// ─────────────────────────────────────────────
final themeModeProvider = StateProvider<ThemeMode>((ref) => ThemeMode.system);

// ─────────────────────────────────────────────
//  PAGE TRANSITION BUILDERS
// ─────────────────────────────────────────────

/// Default push: fade + subtle slide-up. 280 ms, easeOut.
CustomTransitionPage<T> _fadeSlide<T>(
  BuildContext context,
  GoRouterState state,
  Widget child,
) =>
    CustomTransitionPage<T>(
      key: state.pageKey,
      child: child,
      transitionDuration: const Duration(milliseconds: 280),
      reverseTransitionDuration: const Duration(milliseconds: 200),
      transitionsBuilder: (_, animation, __, child) {
        final fade = CurvedAnimation(
          parent: animation, curve: Curves.easeOut,
        );
        final slide = Tween<Offset>(
          begin: const Offset(0, 0.03),
          end:   Offset.zero,
        ).animate(CurvedAnimation(parent: animation, curve: Curves.easeOut));
        return FadeTransition(
          opacity: fade,
          child:   SlideTransition(position: slide, child: child),
        );
      },
    );

/// Modal / sheet: slide up from bottom. 320 ms, easeOutCubic.
CustomTransitionPage<T> _modalSlide<T>(
  BuildContext context,
  GoRouterState state,
  Widget child,
) =>
    CustomTransitionPage<T>(
      key: state.pageKey,
      child: child,
      transitionDuration: const Duration(milliseconds: 320),
      reverseTransitionDuration: const Duration(milliseconds: 260),
      transitionsBuilder: (_, animation, __, child) {
        final slide = Tween<Offset>(
          begin: const Offset(0, 1),
          end:   Offset.zero,
        ).animate(
            CurvedAnimation(parent: animation, curve: Curves.easeOutCubic));
        return SlideTransition(position: slide, child: child);
      },
    );

// ─────────────────────────────────────────────
//  ROUTER
// ─────────────────────────────────────────────
final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/welcome',
    debugLogDiagnostics: true,
    routes: [
      // ── Public ──────────────────────────────
      GoRoute(
        path: '/',
        redirect: (_, __) => '/welcome',
      ),
      GoRoute(
        path: '/welcome',
        pageBuilder: (ctx, state) =>
            _fadeSlide(ctx, state, const LandingScreen()),
      ),

      // ── Auth ────────────────────────────────
      GoRoute(
        path: '/auth/sign-in',
        pageBuilder: (ctx, state) => _fadeSlide(
            ctx, state, const AuthScreen(mode: AuthMode.signIn)),
      ),
      GoRoute(
        path: '/auth/sign-up',
        pageBuilder: (ctx, state) => _fadeSlide(
            ctx, state, const AuthScreen(mode: AuthMode.signUp)),
      ),
      GoRoute(
        path: '/auth/forgot-password',
        pageBuilder: (ctx, state) => _modalSlide(
            ctx, state, const AuthScreen(mode: AuthMode.forgot)),
      ),
      GoRoute(
        path: '/auth/reset-password',
        pageBuilder: (ctx, state) => _modalSlide(
            ctx, state, const AuthScreen(mode: AuthMode.reset)),
      ),
      GoRoute(
        path: '/auth/verify-email',
        pageBuilder: (ctx, state) => _fadeSlide(
            ctx, state, const AuthScreen(mode: AuthMode.verify)),
      ),
      GoRoute(
        path: '/auth/two-factor',
        pageBuilder: (ctx, state) => _fadeSlide(
            ctx, state, const AuthScreen(mode: AuthMode.twoFactor)),
      ),

      // ── Onboarding ──────────────────────────
      GoRoute(
        path: '/onboarding',
        pageBuilder: (ctx, state) =>
            _fadeSlide(ctx, state, const OnboardingScreen()),
      ),

      // ── Main shell with custom nav ──────────
      StatefulShellRoute.indexedStack(
        builder: (_, __, shell) => AppShell(shell: shell),
        branches: [
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/home',
              pageBuilder: (ctx, state) =>
                  _fadeSlide(ctx, state, const HomeScreen()),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/missions',
              pageBuilder: (ctx, state) =>
                  _fadeSlide(ctx, state, const MissionsScreen()),
              routes: [
                GoRoute(
                  path: ':id',
                  pageBuilder: (ctx, state) => _fadeSlide(
                    ctx, state,
                    MissionDetailScreen(
                        id: state.pathParameters['id']!),
                  ),
                ),
              ],
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/ai-coach',
              pageBuilder: (ctx, state) =>
                  _fadeSlide(ctx, state, const AiCoachScreen()),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/tasks',
              pageBuilder: (ctx, state) =>
                  _fadeSlide(ctx, state, const TasksScreen()),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/profile',
              pageBuilder: (ctx, state) =>
                  _fadeSlide(ctx, state, const ProfileScreen()),
            ),
          ]),
        ],
      ),

      // ── Feature / secondary screens ─────────
      for (final path in const [
        '/planner', '/agents', '/memory', '/opportunities',
        '/marketplace', '/notifications', '/analytics',
        '/settings', '/settings/profile', '/settings/appearance',
        '/settings/ai', '/settings/privacy', '/settings/security',
        '/settings/integrations', '/settings/subscription',
        '/settings/billing', '/support',
      ])
        GoRoute(
          path: path,
          pageBuilder: (ctx, state) => _modalSlide(
              ctx, state, FeatureScreen(path: state.uri.path)),
        ),

      GoRoute(
        path: '/marketplace/:id',
        pageBuilder: (ctx, state) => _modalSlide(
            ctx, state, FeatureScreen(path: state.uri.path)),
      ),
    ],
  );
});

// ─────────────────────────────────────────────
//  ROOT APP WIDGET
// ─────────────────────────────────────────────
class LifeKitApp extends ConsumerWidget {
  const LifeKitApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Pre-warm flutter_animate
    Animate.restartOnHotReload = true;

    return MaterialApp.router(
      title:                   'LifeKit',
      debugShowCheckedModeBanner: false,
      theme:     lifeKitTheme(Brightness.light),
      darkTheme: lifeKitTheme(Brightness.dark),
      themeMode: ref.watch(themeModeProvider),
      routerConfig: ref.watch(routerProvider),
    );
  }
}

// ─────────────────────────────────────────────
//  APP SHELL — wraps tabbed screens with
//  PremiumSideNav drawer on the left
// ─────────────────────────────────────────────
class AppShell extends ConsumerStatefulWidget {
  const AppShell({required this.shell, super.key});
  final StatefulNavigationShell shell;

  @override
  ConsumerState<AppShell> createState() => _AppShellState();
}

class _AppShellState extends ConsumerState<AppShell> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  String get _userInitials {
    final profile = ref.read(profileProvider);
    final name = (profile['fullName'] ?? profile['full_name'] ?? '')
        .toString()
        .trim();
    if (name.isEmpty) return 'U';
    final parts = name.split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.substring(0, name.length.clamp(1, 2)).toUpperCase();
  }

  String get _userName {
    final profile = ref.read(profileProvider);
    return (profile['fullName'] ?? profile['full_name'] ?? '').toString();
  }

  @override
  Widget build(BuildContext context) {
    final t          = context.tokens;
    final currentIdx = widget.shell.currentIndex;
    // Watch profile so initials update when profile loads
    ref.watch(profileProvider);

    return Scaffold(
      key:             _scaffoldKey,
      backgroundColor: t.background,

      // Hamburger button shown in screens that need it — we expose
      // the scaffold key via a provider so any screen can open the drawer.
      drawer: PremiumSideNav(
        currentIndex:  currentIdx,
        userInitials:  _userInitials,
        userName:      _userName,
        onTabTap: (index) {
          _scaffoldKey.currentState?.closeDrawer();
          widget.shell.goBranch(
            index,
            initialLocation: index == currentIdx,
          );
        },
        onSecondaryTap: (route) {
          _scaffoldKey.currentState?.closeDrawer();
          context.push(route);
        },
      ),

      body: Stack(
        children: [
          // Tab content
          widget.shell,

          // Persistent hamburger FAB — top-left, above SafeArea
          Positioned(
            top:  MediaQuery.of(context).padding.top + 8,
            left: 12,
            child: _NavToggleButton(
              onTap: () => _scaffoldKey.currentState?.openDrawer(),
              tokens: t,
            ),
          ),
        ],
      ),
    );
  }
}

// Small frosted-glass hamburger button overlaid on every shell screen
class _NavToggleButton extends StatelessWidget {
  const _NavToggleButton({required this.onTap, required this.tokens});
  final VoidCallback onTap;
  final AppTokens tokens;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(AppRadius.md),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
          child: Container(
            width: 36, height: 36,
            decoration: BoxDecoration(
              color:        tokens.surface.withValues(alpha: 0.88),
              borderRadius: BorderRadius.circular(AppRadius.md),
              border:       Border.all(color: tokens.border),
              boxShadow:    AppShadows.xs,
            ),
            child: Icon(LucideIcons.menu,
                size: 18, color: tokens.textPrimary),
          ),
        ),
      ),
    );
  }
}

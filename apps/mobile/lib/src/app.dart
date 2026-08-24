import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import 'core/api.dart';
import 'core/theme.dart';
import 'core/design/tokens.dart';
import 'core/widgets/premium_side_nav.dart';
import 'core/widgets/premium_bottom_nav.dart';
import 'features/agents/agent_chat_screen.dart';
import 'features/agents/agents_screen.dart';
import 'features/ai_coach/planner_screen.dart';
import 'features/analytics/analytics_screen.dart';
import 'features/auth/auth_screen.dart';
import 'features/dashboard/screens.dart'
    hide
        OnboardingScreen,
        PlannerScreen,
        AgentsScreen,
        OpportunitiesScreen,
        MemoryScreen,
        NotificationsScreen;
import 'features/landing/landing_screen.dart';
import 'features/marketing/public_info_screen.dart';
import 'features/marketplace/marketplace_detail_screen.dart';
import 'features/marketplace/marketplace_screen.dart';
import 'features/memory/memory_screen.dart';
import 'features/missions/create_mission_wizard_screen.dart';
import 'features/notifications/notifications_screen.dart';
import 'features/onboarding/onboarding_screen.dart';
import 'features/opportunities/opportunities_screen.dart';
import 'features/opportunities/opportunity_detail_screen.dart';
import 'features/settings/settings_hub_screen.dart';
import 'features/settings/settings_sub_screens.dart';
import 'features/subscription/subscription_screen.dart';
import 'features/support/support_screen.dart';

// ─────────────────────────────────────────────
//  THEME MODE PROVIDER
// ─────────────────────────────────────────────
final themeModeProvider = StateProvider<ThemeMode>((ref) => ThemeMode.system);

// ─────────────────────────────────────────────
//  PAGE TRANSITION BUILDERS
// ─────────────────────────────────────────────

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
          parent: animation,
          curve: Curves.easeOut,
        );
        final slide = Tween<Offset>(
          begin: const Offset(0, 0.03),
          end: Offset.zero,
        ).animate(CurvedAnimation(parent: animation, curve: Curves.easeOut));
        return FadeTransition(
          opacity: fade,
          child: SlideTransition(position: slide, child: child),
        );
      },
    );

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
          end: Offset.zero,
        ).animate(
            CurvedAnimation(parent: animation, curve: Curves.easeOutCubic));
        return SlideTransition(position: slide, child: child);
      },
    );

// ─────────────────────────────────────────────
//  ROUTER NOTIFIER & CONFIGURATION
// ─────────────────────────────────────────────
class RouterNotifier extends ChangeNotifier {
  final Ref _ref;

  RouterNotifier(this._ref) {
    _ref.listen<AsyncValue<bool>>(
      authProvider,
      (_, __) => notifyListeners(),
    );
  }

  String? redirect(BuildContext context, GoRouterState state) {
    final authAsync = _ref.read(authProvider);

    // Keep current route while checking initial auth status from secure storage
    if (authAsync.isLoading) return null;

    final isAuthenticated = authAsync.value ?? false;
    final loc = state.matchedLocation;

    final isAuthOrWelcomeRoute = loc == '/' ||
        loc == '/welcome' ||
        loc.startsWith('/auth');

    if (isAuthenticated) {
      // If signed in and accessing landing/auth screens, navigate to /home
      if (isAuthOrWelcomeRoute) {
        return '/home';
      }
    } else {
      // If signed out and trying to access protected routes, redirect to sign in
      final isPublicRoute = isAuthOrWelcomeRoute ||
          const [
            '/product',
            '/solutions',
            '/pricing',
            '/enterprise',
            '/about',
            '/contact',
            '/marketplace-info',
          ].contains(loc);

      if (!isPublicRoute) {
        return '/auth/sign-in';
      }
    }

    return null;
  }
}

final routerNotifierProvider = Provider<RouterNotifier>((ref) {
  return RouterNotifier(ref);
});

final routerProvider = Provider<GoRouter>((ref) {
  final notifier = ref.watch(routerNotifierProvider);

  return GoRouter(
    initialLocation: '/welcome',
    refreshListenable: notifier,
    redirect: notifier.redirect,
    debugLogDiagnostics: false,
    routes: [
      // ── Public / Marketing ──────────────────
      GoRoute(
        path: '/',
        redirect: (_, __) => '/welcome',
      ),
      GoRoute(
        path: '/welcome',
        pageBuilder: (ctx, state) =>
            _fadeSlide(ctx, state, const LandingScreen()),
      ),
      for (final path in const [
        '/product',
        '/solutions',
        '/pricing',
        '/enterprise',
        '/about',
        '/contact',
        '/marketplace-info',
      ])
        GoRoute(
          path: path,
          pageBuilder: (ctx, state) => _fadeSlide(
            ctx,
            state,
            PublicInfoScreen(path: state.uri.path),
          ),
        ),

      // ── Auth ────────────────────────────────
      GoRoute(
        path: '/auth/sign-in',
        pageBuilder: (ctx, state) =>
            _fadeSlide(ctx, state, const AuthScreen(mode: AuthMode.signIn)),
      ),
      GoRoute(
        path: '/auth/sign-up',
        pageBuilder: (ctx, state) =>
            _fadeSlide(ctx, state, const AuthScreen(mode: AuthMode.signUp)),
      ),
      GoRoute(
        path: '/auth/forgot-password',
        pageBuilder: (ctx, state) =>
            _modalSlide(ctx, state, const AuthScreen(mode: AuthMode.forgot)),
      ),
      GoRoute(
        path: '/auth/reset-password',
        pageBuilder: (ctx, state) =>
            _modalSlide(ctx, state, const AuthScreen(mode: AuthMode.reset)),
      ),
      GoRoute(
        path: '/auth/verify-email',
        pageBuilder: (ctx, state) =>
            _fadeSlide(ctx, state, const AuthScreen(mode: AuthMode.verify)),
      ),
      GoRoute(
        path: '/auth/two-factor',
        pageBuilder: (ctx, state) =>
            _fadeSlide(ctx, state, const AuthScreen(mode: AuthMode.twoFactor)),
      ),

      // ── Onboarding ──────────────────────────
      GoRoute(
        path: '/onboarding',
        pageBuilder: (ctx, state) =>
            _fadeSlide(ctx, state, const OnboardingScreen()),
      ),

      // ── Main Shell with Navigation Drawer ───
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
                  path: 'new',
                  pageBuilder: (ctx, state) => _modalSlide(
                    ctx,
                    state,
                    const CreateMissionWizardScreen(),
                  ),
                ),
                GoRoute(
                  path: ':id',
                  pageBuilder: (ctx, state) => _fadeSlide(
                    ctx,
                    state,
                    MissionDetailScreen(id: state.pathParameters['id']!),
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

      // ── Standalone Feature Pages ─────────────
      GoRoute(
        path: '/planner',
        pageBuilder: (ctx, state) =>
            _modalSlide(ctx, state, const PlannerScreen()),
      ),
      GoRoute(
        path: '/agents',
        pageBuilder: (ctx, state) =>
            _modalSlide(ctx, state, const AgentsScreen()),
        routes: [
          GoRoute(
            path: ':id',
            pageBuilder: (ctx, state) {
              final extra = state.extra as Map<String, dynamic>?;
              return _modalSlide(
                ctx,
                state,
                AgentChatScreen(
                  agentId: state.pathParameters['id']!,
                  agentData: extra,
                ),
              );
            },
          ),
        ],
      ),
      GoRoute(
        path: '/marketplace',
        pageBuilder: (ctx, state) =>
            _modalSlide(ctx, state, const MarketplaceScreen()),
        routes: [
          GoRoute(
            path: ':id',
            pageBuilder: (ctx, state) {
              final extra = state.extra as Map<String, dynamic>?;
              return _modalSlide(
                ctx,
                state,
                MarketplaceDetailScreen(
                  id: state.pathParameters['id']!,
                  itemData: extra,
                ),
              );
            },
          ),
        ],
      ),
      GoRoute(
        path: '/opportunities',
        pageBuilder: (ctx, state) =>
            _modalSlide(ctx, state, const OpportunitiesScreen()),
        routes: [
          GoRoute(
            path: ':id',
            pageBuilder: (ctx, state) {
              final extra = state.extra as Map<String, dynamic>?;
              return _modalSlide(
                ctx,
                state,
                OpportunityDetailScreen(
                  id: state.pathParameters['id']!,
                  itemData: extra,
                ),
              );
            },
          ),
        ],
      ),
      GoRoute(
        path: '/memory',
        pageBuilder: (ctx, state) =>
            _modalSlide(ctx, state, const MemoryScreen()),
      ),
      GoRoute(
        path: '/analytics',
        pageBuilder: (ctx, state) =>
            _modalSlide(ctx, state, const AnalyticsScreen()),
      ),
      GoRoute(
        path: '/notifications',
        pageBuilder: (ctx, state) =>
            _modalSlide(ctx, state, const NotificationsScreen()),
      ),
      GoRoute(
        path: '/settings',
        pageBuilder: (ctx, state) =>
            _modalSlide(ctx, state, const SettingsHubScreen()),
        routes: [
          GoRoute(
            path: 'general',
            pageBuilder: (ctx, state) =>
                _modalSlide(ctx, state, const GeneralSettingsScreen()),
          ),
          GoRoute(
            path: 'appearance',
            pageBuilder: (ctx, state) =>
                _modalSlide(ctx, state, const AppearanceSettingsScreen()),
          ),
          GoRoute(
            path: 'ai',
            pageBuilder: (ctx, state) =>
                _modalSlide(ctx, state, const AiSettingsScreen()),
          ),
          GoRoute(
            path: 'privacy',
            pageBuilder: (ctx, state) =>
                _modalSlide(ctx, state, const PrivacySettingsScreen()),
          ),
          GoRoute(
            path: 'security',
            pageBuilder: (ctx, state) =>
                _modalSlide(ctx, state, const SecuritySettingsScreen()),
          ),
          GoRoute(
            path: 'integrations',
            pageBuilder: (ctx, state) =>
                _modalSlide(ctx, state, const IntegrationsSettingsScreen()),
          ),
          GoRoute(
            path: 'subscription',
            pageBuilder: (ctx, state) =>
                _modalSlide(ctx, state, const SubscriptionScreen()),
          ),
          GoRoute(
            path: 'billing',
            pageBuilder: (ctx, state) =>
                _modalSlide(ctx, state, const BillingSettingsScreen()),
          ),
        ],
      ),
      GoRoute(
        path: '/support',
        pageBuilder: (ctx, state) =>
            _modalSlide(ctx, state, const SupportScreen()),
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
    Animate.restartOnHotReload = true;

    return MaterialApp.router(
      title: 'LifeKit',
      debugShowCheckedModeBanner: false,
      theme: lifeKitTheme(Brightness.light),
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
    final name =
        (profile['fullName'] ?? profile['full_name'] ?? '').toString().trim();
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
    final t = context.tokens;
    final currentIdx = widget.shell.currentIndex;
    ref.watch(profileProvider);

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: t.background,
      drawer: PremiumSideNav(
        currentIndex: currentIdx,
        userInitials: _userInitials,
        userName: _userName,
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
      bottomNavigationBar: PremiumBottomNav(
        currentIndex: currentIdx,
        onTap: (index) {
          widget.shell.goBranch(
            index,
            initialLocation: index == currentIdx,
          );
        },
      ),
      body: Stack(
        children: [
          widget.shell,
          Positioned(
            top: MediaQuery.of(context).padding.top + 8,
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
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: tokens.surface.withValues(alpha: 0.88),
              borderRadius: BorderRadius.circular(AppRadius.md),
              border: Border.all(color: tokens.border),
              boxShadow: AppShadows.xs,
            ),
            child: Icon(LucideIcons.menu, size: 18, color: tokens.textPrimary),
          ),
        ),
      ),
    );
  }
}

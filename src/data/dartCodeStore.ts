import { CodeFile } from '../types';

export const flutterFiles: CodeFile[] = [
  {
    path: 'pubspec.yaml',
    filename: 'pubspec.yaml',
    language: 'yaml',
    code: `name: lifekit
description: "LifeKit - AI Execution Marketplace for Human Goals"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  flutter_riverpod: ^2.5.1
  go_router: ^14.0.0
  google_fonts: ^6.2.1
  lucide_icons: ^0.257.0
  percent_indicator: ^4.2.3
  shared_preferences: ^2.2.3

flutter:
  uses-material-design: true`
  },
  {
    path: 'lib/main.dart',
    filename: 'main.dart',
    language: 'dart',
    code: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/app_theme.dart';
import 'core/router.dart';

void main() {
  runApp(
    const ProviderScope(
      child: LifeKitApp(),
    ),
  );
}

class LifeKitApp extends StatelessWidget {
  const LifeKitApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'LifeKit - AI Execution Marketplace',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.dark,
      routerConfig: appRouter,
    );
  }
}`
  },
  {
    path: 'lib/core/theme/app_colors.dart',
    filename: 'app_colors.dart',
    language: 'dart',
    code: `import 'package:flutter/material.dart';

class BadgeColors {
  final Color backgroundColor;
  final Color textColor;

  const BadgeColors({required this.backgroundColor, required this.textColor});
}

class MatchScoreColors {
  final Color borderColor;
  final Color textColor;
  final Color backgroundColor;

  const MatchScoreColors({
    required this.borderColor,
    required this.textColor,
    required this.backgroundColor,
  });
}

class AppColors {
  AppColors._();

  // Core Brand
  static const Color brandPrimaryLight = Color(0xFF4C0FBD);
  static const Color brandPrimaryDark = Color(0xFF7C3AED);
  static const Color brandAccentLight = Color(0xFF7C3AED);
  static const Color brandAccentDark = Color(0xFF9D6EFF);

  // Backgrounds & Surfaces
  static const Color pageBackgroundLight = Color(0xFFFFFFFF);
  static const Color pageBackgroundDark = Color(0xFF0D0B1A);
  static const Color subtleBackgroundLight = Color(0xFFF5F3FF);
  static const Color subtleBackgroundDark = Color(0xFF141122);
  static const Color cardSurfaceLight = Color(0xFFFFFFFF);
  static const Color cardSurfaceDark = Color(0xFF131027);

  // Borders & Text
  static const Color borderLight = Color(0xFFC9C0F0);
  static const Color borderDark = Color(0xFF2C2845);
  static const Color bodyTextLight = Color(0xFF120D2B);
  static const Color bodyTextDark = Color(0xFFEDE9FF);
  static const Color mutedTextLight = Color(0xFF6B60A0);
  static const Color mutedTextDark = Color(0xFF8A82B8);

  // Status & Priority Tokens
  static const Color successGreen = Color(0xFF22C55E);
  static const Color warningAmber = Color(0xFFF59E0B);
  static const Color errorRedLight = Color(0xFFEF3333);
  static const Color errorRedDark = Color(0xFFDC2626);
  static const Color infoBlue = Color(0xFF3B82F6);

  // Brand Gradient
  static const LinearGradient lifekitGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF4C0FBD), Color(0xFF7C3AED)],
  );

  // Category Badge Helper
  static BadgeColors getCategoryColors(String category) {
    switch (category.trim().toLowerCase()) {
      case 'career': return const BadgeColors(backgroundColor: Color(0xFFE0F2FE), textColor: Color(0xFF1D4ED8));
      case 'finance': return const BadgeColors(backgroundColor: Color(0xFFDCFCE7), textColor: Color(0xFF15803D));
      case 'health': return const BadgeColors(backgroundColor: Color(0xFFFEE2E2), textColor: Color(0xFFB91C1C));
      case 'travel': return const BadgeColors(backgroundColor: Color(0xFFCFFAFE), textColor: Color(0xFF0E7490));
      case 'business': return const BadgeColors(backgroundColor: Color(0xFFFFEDD5), textColor: Color(0xFFC2410C));
      case 'education': return const BadgeColors(backgroundColor: Color(0xFFEDE9FE), textColor: Color(0xFF6D28D9));
      case 'productivity': return const BadgeColors(backgroundColor: Color(0xFFFEF9C3), textColor: Color(0xFFA16207));
      case 'personal growth': return const BadgeColors(backgroundColor: Color(0xFFF3E8FF), textColor: Color(0xFF7E22CE));
      case 'lifestyle': return const BadgeColors(backgroundColor: Color(0xFFFCE7F3), textColor: Color(0xFFBE185D));
      case 'family': return const BadgeColors(backgroundColor: Color(0xFFCCFBF1), textColor: Color(0xFF0F766E));
      default: return const BadgeColors(backgroundColor: Color(0xFFEDE9FE), textColor: Color(0xFF6D28D9));
    }
  }

  // Status Badge Helper
  static BadgeColors getStatusColors(String status, {bool isDark = true}) {
    switch (status.trim().toLowerCase()) {
      case 'active': return const BadgeColors(backgroundColor: Color(0x2622C55E), textColor: Color(0xFF16A34A));
      case 'paused': case 'at risk': return const BadgeColors(backgroundColor: Color(0x26F59E0B), textColor: Color(0xFFB45309));
      case 'completed': return const BadgeColors(backgroundColor: Color(0xFFF3E8FF), textColor: Color(0xFF7E22CE));
      case 'cancelled': case 'blocked': return const BadgeColors(backgroundColor: Color(0x26EF3333), textColor: Color(0xFFDC2626));
      case 'in progress': return const BadgeColors(backgroundColor: Color(0x263B82F6), textColor: Color(0xFF2563EB));
      default: return BadgeColors(backgroundColor: isDark ? borderDark : borderLight, textColor: isDark ? mutedTextDark : mutedTextLight);
    }
  }

  // Priority Badge Helper
  static BadgeColors getPriorityColors(String priority) {
    switch (priority.trim().toLowerCase()) {
      case 'low': return const BadgeColors(backgroundColor: Color(0xFFF3F4F6), textColor: Color(0xFF4B5563));
      case 'medium': return const BadgeColors(backgroundColor: Color(0xFFDBEAFE), textColor: Color(0xFF2563EB));
      case 'high': return const BadgeColors(backgroundColor: Color(0xFFFEF3C7), textColor: Color(0xFFB45309));
      case 'urgent': return const BadgeColors(backgroundColor: Color(0xFFFEE2E2), textColor: Color(0xFFB91C1C));
      default: return const BadgeColors(backgroundColor: Color(0xFFDBEAFE), textColor: Color(0xFF2563EB));
    }
  }

  // Opportunity Match Score Helper
  static MatchScoreColors getMatchScoreColors(double percentage, {bool isDark = true}) {
    if (percentage >= 85) {
      return const MatchScoreColors(borderColor: Color(0xFF4ADE80), textColor: Color(0xFF16A34A), backgroundColor: Color(0xFFF0FDF4));
    } else if (percentage >= 70) {
      return const MatchScoreColors(borderColor: Color(0xFF60A5FA), textColor: Color(0xFF2563EB), backgroundColor: Color(0xFFEFF6FF));
    } else {
      return MatchScoreColors(borderColor: isDark ? borderDark : borderLight, textColor: isDark ? mutedTextDark : mutedTextLight, backgroundColor: isDark ? cardSurfaceDark : cardSurfaceLight);
    }
  }
}`
  },
  {
    path: 'lib/core/theme/app_theme.dart',
    filename: 'app_theme.dart',
    language: 'dart',
    code: `import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

class AppTheme {
  AppTheme._();

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: AppColors.pageBackgroundLight,
      colorScheme: const ColorScheme.light(
        primary: AppColors.brandPrimaryLight,
        secondary: AppColors.brandAccentLight,
        surface: AppColors.cardSurfaceLight,
        onSurface: AppColors.bodyTextLight,
      ),
      textTheme: GoogleFonts.plusJakartaSansTextTheme(ThemeData.light().textTheme),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.pageBackgroundDark,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.brandPrimaryDark,
        secondary: AppColors.brandAccentDark,
        surface: AppColors.cardSurfaceDark,
        onSurface: AppColors.bodyTextDark,
      ),
      textTheme: GoogleFonts.plusJakartaSansTextTheme(ThemeData.dark().textTheme),
    );
  }
}`
  },
  {
    path: 'lib/core/constants.dart',
    filename: 'constants.dart',
    language: 'dart',
    code: `import 'package:flutter/material.dart';

class AppColors {
  static const Color primaryBg = Color(0xFF0F0A1C);
  static const Color cardBg = Color(0xFF1B132D);
  static const Color surfaceLight = Color(0xFF281C42);
  static const Color accentPurple = Color(0xFF6C5CE7);
  static const Color accentGlow = Color(0xFF8A4FFF);
  static const Color borderSubtle = Color(0xFF2E224B);
  
  static const Color textHigh = Colors.white;
  static const Color textMedium = Color(0xFFA098B9);
  static const Color textMuted = Color(0xFF6E6589);
  
  static const Color successGreen = Color(0xFF00E676);
  static const Color warningOrange = Color(0xFFFF9100);
}

class AppConstants {
  static const List<String> categories = [
    'All', 'Career', 'Finance', 'Health', 'Travel', 'Business', 'Education'
  ];

  static const List<String> subscriptionTiers = [
    'Free Tier', 'LifeKit Plus', 'LifeKit Pro'
  ];
}`
  },
  {
    path: 'lib/core/theme.dart',
    filename: 'theme.dart',
    language: 'dart',
    code: `import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'constants.dart';

class AppTheme {
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.primaryBg,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.accentPurple,
        secondary: AppColors.accentGlow,
        surface: AppColors.cardBg,
        background: AppColors.primaryBg,
        onSurface: AppColors.textHigh,
      ),
      textTheme: GoogleFonts.plusJakartaSansTextTheme(ThemeData.dark().textTheme),
      cardTheme: CardTheme(
        color: AppColors.cardBg,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.borderSubtle),
        ),
      ),
    );
  }
}`
  },
  {
    path: 'lib/core/router.dart',
    filename: 'router.dart',
    language: 'dart',
    code: `import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../features/home/home_screen.dart';
import '../features/mission/mission_detail_screen.dart';
import '../features/marketplace/marketplace_screen.dart';
import '../features/profile/profile_screen.dart';
import '../features/auth/login_screen.dart';
import '../features/auth/signup_screen.dart';
import '../features/auth/forgot_password_screen.dart';
import 'constants.dart';

final appRouter = GoRouter(
  initialLocation: '/home',
  routes: [
    GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
    GoRoute(path: '/signup', builder: (context, state) => const SignupScreen()),
    GoRoute(path: '/forgot-password', builder: (context, state) => const ForgotPasswordScreen()),
    ShellRoute(
      builder: (context, state, child) => ScaffoldWithBottomNavBar(child: child),
      routes: [
        GoRoute(path: '/home', builder: (context, state) => const HomeScreen()),
        GoRoute(
          path: '/mission/:id',
          builder: (context, state) => MissionDetailScreen(
            missionId: state.pathParameters['id'] ?? 'm1',
          ),
        ),
        GoRoute(path: '/marketplace', builder: (context, state) => const MarketplaceScreen()),
        GoRoute(path: '/profile', builder: (context, state) => const ProfileScreen()),
      ],
    ),
  ],
);`
  },
  {
    path: 'lib/features/auth/login_screen.dart',
    filename: 'login_screen.dart',
    language: 'dart',
    code: `import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  void _handleLogin() {
    if (_emailController.text.trim().isEmpty || _passwordController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your email and password.')),
      );
      return;
    }
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Welcome back to LifeKit!'), backgroundColor: AppColors.accentPurple),
    );
    context.go('/home');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primaryBg,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Center(
                child: Text('LifeKit AI', style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(height: 30),
              const Text('Welcome Back', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
              const SizedBox(height: 20),
              TextField(
                controller: _emailController,
                decoration: const InputDecoration(labelText: 'Email Address', prefixIcon: Icon(Icons.email)),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _passwordController,
                obscureText: _obscurePassword,
                decoration: InputDecoration(
                  labelText: 'Password',
                  prefixIcon: const Icon(Icons.lock),
                  suffixIcon: IconButton(
                    icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility),
                    onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () => context.go('/forgot-password'),
                  child: const Text('Forgot Password?', style: TextStyle(color: AppColors.accentGlow)),
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _handleLogin,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.accentPurple,
                  minimumSize: const Size(double.infinity, 50),
                ),
                child: const Text('Sign In'),
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('Don\'t have an account? '),
                  GestureDetector(
                    onTap: () => context.go('/signup'),
                    child: const Text('Sign Up', style: TextStyle(color: AppColors.accentGlow, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}`
  },
  {
    path: 'lib/features/auth/signup_screen.dart',
    filename: 'signup_screen.dart',
    language: 'dart',
    code: `import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants.dart';

class SignupScreen extends StatelessWidget {
  const SignupScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primaryBg,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              IconButton(onPressed: () => context.go('/login'), icon: const Icon(Icons.arrow_back)),
              const Text('Create LifeKit Account', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
              const SizedBox(height: 20),
              const TextField(decoration: InputDecoration(labelText: 'Full Name')),
              const SizedBox(height: 16),
              const TextField(decoration: InputDecoration(labelText: 'Email Address')),
              const SizedBox(height: 16),
              const TextField(obscureText: true, decoration: InputDecoration(labelText: 'Password')),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => context.go('/home'),
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.accentPurple, minimumSize: const Size(double.infinity, 50)),
                child: const Text('Sign Up Free'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}`
  },
  {
    path: 'lib/features/auth/forgot_password_screen.dart',
    filename: 'forgot_password_screen.dart',
    language: 'dart',
    code: `import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants.dart';

class ForgotPasswordScreen extends StatelessWidget {
  const ForgotPasswordScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primaryBg,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              IconButton(onPressed: () => context.go('/login'), icon: const Icon(Icons.arrow_back)),
              const Text('Reset Password', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              const Text('Enter your email to receive recovery instructions.', style: TextStyle(color: AppColors.textMedium)),
              const SizedBox(height: 24),
              const TextField(decoration: InputDecoration(labelText: 'Email Address')),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => context.go('/login'),
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.accentPurple, minimumSize: const Size(double.infinity, 50)),
                child: const Text('Send Reset Link'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}`
  },
  {
    path: 'lib/features/models/mission_model.dart',
    filename: 'mission_model.dart',
    language: 'dart',
    code: `class TaskModel {
  final String id;
  final String title;
  final bool isCompleted;
  final String? difficulty;

  TaskModel({
    required this.id,
    required this.title,
    this.isCompleted = false,
    this.difficulty,
  });

  TaskModel copyWith({bool? isCompleted}) => TaskModel(
    id: id,
    title: title,
    isCompleted: isCompleted ?? this.isCompleted,
    difficulty: difficulty,
  );
}

class MissionModel {
  final String id;
  final String title;
  final String category;
  final String duration;
  final List<TaskModel> tasks;

  MissionModel({
    required this.id,
    required this.title,
    required this.category,
    required this.duration,
    required this.tasks,
  });

  int get completedTaskCount => tasks.where((t) => t.isCompleted).length;
  double get progressPercentage => tasks.isEmpty ? 0.0 : completedTaskCount / tasks.length;
  int get progressPercentInt => (progressPercentage * 100).round();
}`
  },
  {
    path: 'lib/features/mission/mission_provider.dart',
    filename: 'mission_provider.dart',
    language: 'dart',
    code: `import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/mission_model.dart';

class MissionNotifier extends StateNotifier<List<MissionModel>> {
  MissionNotifier() : super(_initialMissions);

  static final List<MissionModel> _initialMissions = [
    MissionModel(
      id: 'm1',
      title: 'Build Startup',
      category: 'Business',
      duration: '3 months',
      tasks: [
        TaskModel(id: 't1_1', title: 'Validate MVP Problem Statement', isCompleted: true),
        TaskModel(id: 't1_2', title: 'Design Figma Interactive Wireframes', isCompleted: true),
        TaskModel(id: 't1_3', title: 'Setup Flutter + Riverpod Architecture', isCompleted: true),
        TaskModel(id: 't1_4', title: 'Deploy Backend Server & API Routes', isCompleted: false),
        TaskModel(id: 't1_5', title: 'Launch Beta to 50 Early Adopters', isCompleted: false),
      ],
    ),
    MissionModel(
      id: 'm2',
      title: 'Become Software Engineer',
      category: 'Career',
      duration: '6 months',
      tasks: [
        TaskModel(id: 't2_1', title: 'Master Data Structures & Algorithms', isCompleted: true),
        TaskModel(id: 't2_2', title: 'Build 3 Full-Stack Production Projects', isCompleted: true),
        TaskModel(id: 't2_3', title: 'Optimize GitHub Profile & Technical Blog', isCompleted: true),
        TaskModel(id: 't2_4', title: 'Conduct 10 Mock System Design Interviews', isCompleted: false),
        TaskModel(id: 't2_5', title: 'Apply to Top Tier Tech Companies', isCompleted: false),
      ],
    ),
  ];

  void toggleTask(String missionId, String taskId) {
    state = [
      for (final m in state)
        if (m.id == missionId)
          MissionModel(
            id: m.id,
            title: m.title,
            category: m.category,
            duration: m.duration,
            tasks: [
              for (final t in m.tasks)
                if (t.id == taskId) t.copyWith(isCompleted: !t.isCompleted) else t
            ],
          )
        else m
    ];
  }
}

final missionProvider = StateNotifierProvider<MissionNotifier, List<MissionModel>>((ref) {
  return MissionNotifier();
});`
  },
  {
    path: 'lib/features/home/home_screen.dart',
    filename: 'home_screen.dart',
    language: 'dart',
    code: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants.dart';
import '../mission/mission_provider.dart';
import 'widgets/active_mission_card.dart';
import 'widgets/ai_suggestion_card.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final missions = ref.watch(missionProvider);

    return Scaffold(
      backgroundColor: AppColors.primaryBg,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Greeting
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Good Morning, Aditya 👋', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                      Text('LifeKit Goal Execution Command Center', style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
                    ],
                  ),
                  CircleAvatar(radius: 22, backgroundColor: AppColors.surfaceLight, child: const Text('AK')),
                ],
              ),
              const SizedBox(height: 24),
              const AISuggestionCard(),
              const SizedBox(height: 28),
              const Text('Active Missions', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              ...missions.map((m) => ActiveMissionCard(mission: m)),
            ],
          ),
        ),
      ),
    );
  }
}`
  },
  {
    path: 'lib/features/mission/mission_detail_screen.dart',
    filename: 'mission_detail_screen.dart',
    language: 'dart',
    code: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants.dart';
import 'mission_provider.dart';
import 'widgets/task_checklist_item.dart';
import 'widgets/ai_coach_bottom_sheet.dart';

class MissionDetailScreen extends ConsumerWidget {
  final String missionId;

  const MissionDetailScreen({Key? key, required this.missionId}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final missions = ref.watch(missionProvider);
    final mission = missions.firstWhere((m) => m.id == missionId, orElse: () => missions.first);

    return Scaffold(
      backgroundColor: AppColors.primaryBg,
      appBar: AppBar(
        title: Text(mission.title),
        backgroundColor: AppColors.primaryBg,
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          showModalBottomSheet(
            context: context,
            builder: (_) => AICoachBottomSheet(mission: mission),
          );
        },
        backgroundColor: AppColors.accentPurple,
        icon: const Icon(Icons.psychology),
        label: const Text('AI Coach'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Header Stats Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(color: AppColors.cardBg, borderRadius: BorderRadius.circular(16)),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Category: \${mission.category}', style: const TextStyle(color: AppColors.accentGlow)),
                    Text('\${mission.progressPercentInt}% Complete', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          const Text('Checklist Tasks', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),
          ...mission.tasks.map((task) => TaskChecklistItem(
            task: task,
            onToggle: (_) => ref.read(missionProvider.notifier).toggleTask(mission.id, task.id),
          )),
        ],
      ),
    );
  }
}`
  },
  {
    path: 'lib/features/marketplace/marketplace_screen.dart',
    filename: 'marketplace_screen.dart',
    language: 'dart',
    code: `import 'package:flutter/material.dart';
import '../../core/constants.dart';

class MarketplaceScreen extends StatelessWidget {
  const MarketplaceScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primaryBg,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Execution Marketplace', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              TextField(
                decoration: InputDecoration(
                  hintText: 'Search experts, strategies, or pitch reviews...',
                  filled: true,
                  fillColor: AppColors.cardBg,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                ),
              ),
              const SizedBox(height: 16),
              // Filter chips & service grid...
            ],
          ),
        ),
      ),
    );
  }
}`
  },
  {
    path: 'lib/features/profile/profile_screen.dart',
    filename: 'profile_screen.dart',
    language: 'dart',
    code: `import 'package:flutter/material.dart';
import '../../core/constants.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primaryBg,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            const Text('User Account & AI Settings', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            // Subscriptions Tiers (Free, LifeKit Plus, LifeKit Pro)
            // AI Memory Preferences
          ],
        ),
      ),
    );
  }
}`
  }
];

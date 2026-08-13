import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/design/tokens.dart';
import '../../core/repository.dart';

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  int _currentStep = 0;

  // Form selections
  String _selectedCategory = 'Career';
  int _hoursPerWeek = 15;
  String _coachPersona = 'Strategic Architect';
  final List<String> _connectedTools = ['Google Calendar'];

  final _goalCtrl =
      TextEditingController(text: 'Become an AI & System Architect');

  @override
  void dispose() {
    _goalCtrl.dispose();
    super.dispose();
  }

  void _nextStep() {
    if (_currentStep < 6) {
      setState(() => _currentStep++);
    } else {
      _completeOnboarding();
    }
  }

  void _prevStep() {
    if (_currentStep > 0) {
      setState(() => _currentStep--);
    }
  }

  Future<void> _completeOnboarding() async {
    try {
      await ref.read(repositoryProvider).updateProfile({
        'onboardingCompleted': true,
        'focusAreas': [_selectedCategory.toLowerCase()],
        'personalGoals': [_goalCtrl.text],
        'preferences': {
          'weeklyAvailableHours': _hoursPerWeek,
          'aiResponseStyle': _coachPersona.toLowerCase(),
        },
      });
    } catch (_) {}
    if (!mounted) return;
    context.go('/home');
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(
        title: Text('Setup Wizard (${_currentStep + 1}/7)'),
        leading: _currentStep > 0
            ? IconButton(
                icon: const Icon(LucideIcons.arrowLeft),
                onPressed: _prevStep,
              )
            : null,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(4),
          child: LinearProgressIndicator(
            value: (_currentStep + 1) / 7.0,
            backgroundColor: t.border,
            color: t.primary,
          ),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  child: AnimatedSwitcher(
                    duration: 300.ms,
                    child: _buildStepContent(t),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  if (_currentStep > 0)
                    Expanded(
                      child: OutlinedButton(
                        onPressed: _prevStep,
                        child: const Text('Back'),
                      ),
                    ),
                  if (_currentStep > 0) const SizedBox(width: 12),
                  Expanded(
                    child: FilledButton(
                      onPressed: _nextStep,
                      child: Text(
                          _currentStep == 6 ? 'Launch LifeKit' : 'Continue'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStepContent(AppTokens t) {
    return switch (_currentStep) {
      0 => _stepWelcome(t),
      1 => _stepCategory(t),
      2 => _stepGoal(t),
      3 => _stepTimeCommitment(t),
      4 => _stepCoachPersona(t),
      5 => _stepToolIntegrations(t),
      6 => _stepSummary(t),
      _ => const SizedBox.shrink(),
    };
  }

  Widget _stepWelcome(AppTokens t) {
    return Column(
      key: const ValueKey(0),
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const SizedBox(height: 30),
        Container(
          width: 90,
          height: 90,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: t.primarySurface,
          ),
          child: Icon(LucideIcons.sparkles, size: 44, color: t.primary),
        ).animate().scale(duration: 400.ms, curve: Curves.elasticOut),
        const SizedBox(height: 24),
        Text(
          'Welcome to LifeKit AI',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.w900,
                color: t.textPrimary,
              ),
        ),
        const SizedBox(height: 12),
        Text(
          'Your intelligent execution platform. Let\'s set up your personalized goal blueprint in 7 quick steps.',
          textAlign: TextAlign.center,
          style: TextStyle(color: t.textMuted, fontSize: 15, height: 1.5),
        ),
      ],
    );
  }

  Widget _stepCategory(AppTokens t) {
    final categories = [
      ('Career', LucideIcons.briefcase, 'Software, Product, Business growth'),
      ('Finance', LucideIcons.wallet, 'Savings, Investments, Wealth'),
      ('Health', LucideIcons.heartPulse, 'Marathon, Fitness, Nutrition'),
      (
        'Skill & Mindset',
        LucideIcons.graduationCap,
        'AI Engineering, Languages'
      ),
    ];

    return Column(
      key: const ValueKey(1),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Step 1: Choose Focus Category',
          style: Theme.of(context)
              .textTheme
              .titleLarge
              ?.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Text('What primary dimension of your life are we transforming first?',
            style: TextStyle(color: t.textMuted)),
        const SizedBox(height: 20),
        ...categories.map((c) {
          final selected = _selectedCategory == c.$1;
          return GestureDetector(
            onTap: () => setState(() => _selectedCategory = c.$1),
            child: AnimatedContainer(
              duration: 200.ms,
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: selected ? t.primarySurface : t.surface,
                borderRadius: BorderRadius.circular(AppRadius.lg),
                border: Border.all(
                    color: selected ? t.primary : t.border,
                    width: selected ? 2 : 1),
              ),
              child: Row(
                children: [
                  Icon(c.$2, color: selected ? t.primary : t.textSecondary),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(c.$1,
                            style: TextStyle(
                                fontWeight: FontWeight.w700,
                                color: t.textPrimary)),
                        Text(c.$3,
                            style: TextStyle(fontSize: 12, color: t.textMuted)),
                      ],
                    ),
                  ),
                  if (selected)
                    Icon(LucideIcons.checkCircle2, color: t.primary, size: 20),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _stepGoal(AppTokens t) {
    return Column(
      key: const ValueKey(2),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Step 2: Define Main Mission Goal',
          style: Theme.of(context)
              .textTheme
              .titleLarge
              ?.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Text('Be specific about what success looks like.',
            style: TextStyle(color: t.textMuted)),
        const SizedBox(height: 20),
        TextField(
          controller: _goalCtrl,
          decoration: const InputDecoration(
            labelText: 'Primary Mission Title',
            hintText: 'e.g. Save ₹5 Lakh or Become Sr. Engineer',
          ),
        ),
      ],
    );
  }

  Widget _stepTimeCommitment(AppTokens t) {
    final options = [5, 10, 15, 20, 30];

    return Column(
      key: const ValueKey(3),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Step 3: Weekly Time Commitment',
          style: Theme.of(context)
              .textTheme
              .titleLarge
              ?.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Text('How many hours per week can you dedicate to your goals?',
            style: TextStyle(color: t.textMuted)),
        const SizedBox(height: 24),
        ...options.map((h) {
          final selected = _hoursPerWeek == h;
          return Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: ChoiceChip(
              label: Text('$h Hours / week'),
              selected: selected,
              onSelected: (_) => setState(() => _hoursPerWeek = h),
            ),
          );
        }),
      ],
    );
  }

  Widget _stepCoachPersona(AppTokens t) {
    final personas = [
      'Strategic Architect',
      'Supportive Mentor',
      'Direct Accountability Coach'
    ];

    return Column(
      key: const ValueKey(4),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Step 4: AI Coach Persona',
          style: Theme.of(context)
              .textTheme
              .titleLarge
              ?.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Text('Choose how your AI assistant communicates and pushes you.',
            style: TextStyle(color: t.textMuted)),
        const SizedBox(height: 20),
        ...personas.map((p) {
          final selected = _coachPersona == p;
          return ListTile(
            title: Text(p,
                style: TextStyle(
                    fontWeight: FontWeight.bold, color: t.textPrimary)),
            trailing:
                selected ? Icon(LucideIcons.check, color: t.primary) : null,
            onTap: () => setState(() => _coachPersona = p),
          );
        }),
      ],
    );
  }

  Widget _stepToolIntegrations(AppTokens t) {
    final tools = ['Google Calendar', 'GitHub', 'Notion', 'Slack'];

    return Column(
      key: const ValueKey(5),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Step 5: Connect Ecosystem',
          style: Theme.of(context)
              .textTheme
              .titleLarge
              ?.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Text('Select apps you want LifeKit to sync tasks with.',
            style: TextStyle(color: t.textMuted)),
        const SizedBox(height: 20),
        ...tools.map((tool) {
          final checked = _connectedTools.contains(tool);
          return CheckboxListTile(
            title: Text(tool),
            value: checked,
            onChanged: (val) {
              setState(() {
                if (val == true) {
                  _connectedTools.add(tool);
                } else {
                  _connectedTools.remove(tool);
                }
              });
            },
          );
        }),
      ],
    );
  }

  Widget _stepSummary(AppTokens t) {
    return Column(
      key: const ValueKey(6),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Step 6: Blueprint Summary',
          style: Theme.of(context)
              .textTheme
              .titleLarge
              ?.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: t.surface,
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(color: t.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Focus: $_selectedCategory',
                  style: const TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              Text('Goal: ${_goalCtrl.text}'),
              const SizedBox(height: 6),
              Text('Commitment: $_hoursPerWeek Hours/week'),
              const SizedBox(height: 6),
              Text('AI Persona: $_coachPersona'),
            ],
          ),
        ),
      ],
    );
  }
}

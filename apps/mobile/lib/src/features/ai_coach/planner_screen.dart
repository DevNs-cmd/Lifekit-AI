// ignore_for_file: use_build_context_synchronously
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/design/animations.dart';
import '../../core/design/tokens.dart';
import '../../core/repository.dart';
import '../../core/widgets/premium_card.dart';
import '../../core/widgets/premium_input.dart';
import '../dashboard/screens.dart';

// ─────────────────────────────────────────────
//  AI PLANNER SCREEN
//  Full breathing UI with mesh background,
//  multi-step animated generation flow, and
//  a rich plan review card.
// ─────────────────────────────────────────────
class PlannerScreen extends ConsumerStatefulWidget {
  const PlannerScreen({super.key});

  @override
  ConsumerState<PlannerScreen> createState() => _PlannerScreenState();
}

class _PlannerScreenState extends ConsumerState<PlannerScreen> {
  final _goalCtrl = TextEditingController();
  bool _generating = false;
  Map<String, dynamic>? _plan;
  String? _error;

  // Generation animation steps (mirrors website)
  int _genStep = 0;
  static const _genMessages = [
    'Analysing your goal…',
    'Identifying key milestones…',
    'Calculating optimal timeline…',
    'Designing daily focus blocks…',
    'Finalising your execution plan…',
  ];

  @override
  void dispose() {
    _goalCtrl.dispose();
    super.dispose();
  }

  Future<void> _generate() async {
    final goal = _goalCtrl.text.trim();
    if (goal.isEmpty) return;
    setState(() {
      _generating = true;
      _error      = null;
      _plan       = null;
      _genStep    = 0;
    });
    _tickGenAnim();

    try {
      final repo = ref.read(repositoryProvider);
      final res  = await repo.runAgent(
        agentType: 'agent-coach',
        userInput: 'Create a 4-week step-by-step execution plan for: $goal',
      );
      if (!mounted) return;

      // Build structured plan from response
      final raw = (res['message'] ?? res['output'] ?? '').toString();
      final steps = _extractSteps(raw, goal);

      setState(() {
        _plan = {
          'title': goal,
          'raw':   raw,
          'steps': steps,
        };
        _generating = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error      = e.toString().replaceFirst('Exception:', '').trim();
        _generating = false;
      });
    }
  }

  void _tickGenAnim() {
    if (!mounted || !_generating) return;
    if (_genStep < _genMessages.length - 1) {
      Future.delayed(const Duration(milliseconds: 1600), () {
        if (!mounted || !_generating) return;
        setState(() => _genStep++);
        _tickGenAnim();
      });
    }
  }

  List<String> _extractSteps(String raw, String fallbackGoal) {
    const weeks = [
      'Week 1: Foundations & Core Setup',
      'Week 2: Intensive Practice & Deep Work',
      'Week 3: Milestone Review & Refinement',
      'Week 4: Final Launch & Assessment',
    ];
    if (raw.trim().isEmpty) return weeks;

    final extracted = <String>[];
    for (final line in raw.split('\n')) {
      final t = line.trim();
      if (RegExp(r'^(\d+[\.\):]|[-•*]|\bWeek\b)').hasMatch(t) && t.length > 5) {
        extracted.add(t.replaceFirst(RegExp(r'^(\d+[\.\):\s]+|[-•*]\s*)'), ''));
      }
    }
    return extracted.isEmpty ? weeks : extracted.take(8).toList();
  }

  Future<void> _convertToMission() async {
    if (_plan == null) return;
    try {
      final repo = ref.read(repositoryProvider);
      await repo.createMission(
        title:       _plan!['title'].toString(),
        description: _plan!['raw'].toString(),
        category:    'Career',
      );
      final updated = await repo.missions();
      ref.read(missionsProvider.notifier).state =
          updated.map((m) => MissionData.fromJson(m)).toList();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Plan converted to an active mission 🎯'),
          behavior: SnackBarBehavior.floating,
          backgroundColor: const Color(0xFF217C45),
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppRadius.md)),
        ),
      );
      context.go('/missions');
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return MeshBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: SafeArea(
          child: Column(children: [
            _PlannerAppBar(),
            Expanded(
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 280),
                transitionBuilder: (child, anim) => FadeTransition(
                  opacity: anim,
                  child: SlideTransition(
                    position: Tween<Offset>(
                      begin: const Offset(0, 0.04),
                      end:   Offset.zero,
                    ).animate(anim),
                    child: child,
                  ),
                ),
                child: KeyedSubtree(
                  key: ValueKey(_generating ? 'gen' : (_plan != null ? 'plan' : 'form')),
                  child: _generating
                      ? _GeneratingView(step: _genStep, messages: _genMessages)
                      : _plan != null
                          ? _PlanReviewView(
                              plan:       _plan!,
                              onConvert:  _convertToMission,
                              onRegenerate: _generate,
                              onReset: () => setState(() {
                                _plan = null;
                                _goalCtrl.clear();
                              }),
                            )
                          : _GoalInputView(
                              controller: _goalCtrl,
                              error:      _error,
                              onGenerate: _generate,
                            ),
                ),
              ),
            ),
          ]),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  APP BAR
// ─────────────────────────────────────────────
class _PlannerAppBar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return ClipRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
        child: Container(
          padding: const EdgeInsets.fromLTRB(8, 12, 16, 12),
          decoration: BoxDecoration(
            color:  t.surface.withValues(alpha: 0.85),
            border: Border(bottom: BorderSide(color: t.border)),
          ),
          child: Row(children: [
            IconButton(
              onPressed: () => Navigator.of(context).maybePop(),
              icon: Icon(LucideIcons.arrowLeft, color: t.textPrimary, size: 20),
            ),
            const SizedBox(width: 4),
            // Pulsing AI badge
            PulseGlow(
              child: Container(
                width:  32,
                height: 32,
                decoration: BoxDecoration(
                  gradient:     AppGradients.lifekit,
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                  boxShadow:    AppShadows.greenSm,
                ),
                child: const Icon(LucideIcons.sparkles,
                    size: 15, color: Colors.white),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                Text('AI Planner',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.3,
                        )),
                Text(
                  'Autonomous goal decomposition',
                  style: TextStyle(color: t.textMuted, fontSize: 11),
                ),
              ]),
            ),
          ]),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  GOAL INPUT VIEW
// ─────────────────────────────────────────────
class _GoalInputView extends StatelessWidget {
  const _GoalInputView({
    required this.controller,
    required this.error,
    required this.onGenerate,
  });
  final TextEditingController controller;
  final String? error;
  final VoidCallback onGenerate;

  static const _examples = [
    'Save ₹5 Lakh in 6 months',
    'Learn Flutter & launch an app',
    'Get promoted to senior engineer',
    'Run a 10K in 12 weeks',
  ];

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // ── Hero header ──────────────────────────────────
          GradientCard(
            radius:  AppRadius.x3l,
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color:        Colors.white.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      border: Border.all(
                          color: Colors.white.withValues(alpha: 0.3)),
                    ),
                    child: const Icon(LucideIcons.cpu,
                        color: Colors.white, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                      Text(
                        'Autonomous Planner',
                        style: TextStyle(
                          color:      Colors.white,
                          fontSize:   16,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      Text(
                        'Powered by LifeKit AI',
                        style: TextStyle(color: Colors.white70, fontSize: 12),
                      ),
                    ]),
                  ),
                ]),
                const SizedBox(height: 16),
                const Text(
                  'Describe any goal and AI will decompose it into weekly milestones, daily focus blocks, and measurable outcomes.',
                  style: TextStyle(
                      color: Colors.white70, height: 1.6, fontSize: 13),
                ),
              ],
            ),
          ).heroEntrance(),

          const SizedBox(height: 24),

          // ── Error banner ─────────────────────────────────
          if (error != null)
            Container(
              margin:  const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color:        t.destructiveSurface,
                borderRadius: BorderRadius.circular(AppRadius.md),
                border: Border.all(
                    color: t.destructive.withValues(alpha: 0.35)),
              ),
              child: Row(children: [
                Icon(LucideIcons.alertCircle,
                    size: 16, color: t.destructive),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    error!.length > 120
                        ? '${error!.substring(0, 120)}…'
                        : error!,
                    style: TextStyle(color: t.destructive, fontSize: 12),
                  ),
                ),
              ]),
            ).animate().fadeIn(duration: 200.ms),

          // ── Goal field ────────────────────────────────────
          Text(
            'YOUR GOAL',
            style: TextStyle(
              color:         t.textMuted,
              fontSize:      10,
              fontWeight:    FontWeight.w800,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 8),
          PremiumInputField(
            controller:      controller,
            hint:            'e.g. Save ₹5 Lakh in 6 months…',
            maxLines:        4,
            minLines:        3,
            textInputAction: TextInputAction.done,
          ).staggered(1),

          const SizedBox(height: 20),

          // ── Generate button ───────────────────────────────
          PremiumButton(
            label:     'Decompose Goal with AI',
            icon:      const Icon(LucideIcons.wandSparkles, size: 18),
            onPressed: onGenerate,
          ).staggered(2),

          const SizedBox(height: 28),

          // ── Example prompts ───────────────────────────────
          Text(
            'TRY THESE',
            style: TextStyle(
              color:         t.textMuted,
              fontSize:      10,
              fontWeight:    FontWeight.w800,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 10),
          ..._examples.indexed.map((item) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: GestureDetector(
                onTap: () {
                  controller.text = item.$2;
                  controller.selection = TextSelection.fromPosition(
                    TextPosition(offset: controller.text.length),
                  );
                },
                child: PremiumCard(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Row(children: [
                    Icon(LucideIcons.sparkles, size: 14, color: t.primary),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        item.$2,
                        style: TextStyle(
                          color:      t.textPrimary,
                          fontWeight: FontWeight.w500,
                          fontSize:   13,
                        ),
                      ),
                    ),
                    Icon(LucideIcons.arrowRight,
                        size: 14, color: t.textMuted),
                  ]),
                ),
              ).staggered(3 + item.$1),
            );
          }),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  GENERATING VIEW  (animated step reveal)
// ─────────────────────────────────────────────
class _GeneratingView extends StatelessWidget {
  const _GeneratingView({
    required this.step,
    required this.messages,
  });
  final int step;
  final List<String> messages;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(32),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          // Pulsing orb
          PulseGlow(
            child: Container(
              width:  80,
              height: 80,
              decoration: BoxDecoration(
                gradient:     AppGradients.lifekit,
                borderRadius: BorderRadius.circular(AppRadius.x2l),
                boxShadow:    AppShadows.green,
              ),
              child: const _SpinningIcon(),
            ),
          ),
          const SizedBox(height: 28),
          Text(
            'Building your plan…',
            style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.5,
                ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 28),

          // Step-by-step reveal
          ...messages.take(step + 1).indexed.map((item) {
            final isLast = item.$1 == step;
            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                padding: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  color:        isLast ? t.primarySurface : t.backgroundSubtle,
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  border: Border.all(
                    color: isLast
                        ? t.primary.withValues(alpha: 0.4)
                        : t.border,
                  ),
                ),
                child: Row(children: [
                  isLast
                      ? SizedBox(
                          width:  16,
                          height: 16,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: t.primary),
                        )
                      : Icon(LucideIcons.check,
                          size: 16, color: t.success),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      item.$2,
                      style: TextStyle(
                        color:      isLast ? t.primary : t.textSecondary,
                        fontSize:   13,
                        fontWeight: isLast
                            ? FontWeight.w600
                            : FontWeight.w400,
                      ),
                    ),
                  ),
                ]),
              ).animate().fadeIn(duration: 280.ms).slideY(
                    begin: 0.06,
                    end:   0,
                    duration: 280.ms,
                  ),
            );
          }),
        ]),
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  PLAN REVIEW VIEW
// ─────────────────────────────────────────────
class _PlanReviewView extends StatelessWidget {
  const _PlanReviewView({
    required this.plan,
    required this.onConvert,
    required this.onRegenerate,
    required this.onReset,
  });
  final Map<String, dynamic> plan;
  final VoidCallback onConvert;
  final VoidCallback onRegenerate;
  final VoidCallback onReset;

  @override
  Widget build(BuildContext context) {
    final t      = context.tokens;
    final title  = plan['title'].toString();
    final steps  = (plan['steps'] as List<String>? ?? []);

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 48),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // ── Success header ───────────────────────────────
          Row(children: [
            Container(
              width:  28,
              height: 28,
              decoration: BoxDecoration(
                gradient:  const LinearGradient(
                  colors: [Color(0xFF217C45), Color(0xFF4CAF50)],
                ),
                shape:      BoxShape.circle,
                boxShadow: AppShadows.greenSm,
              ),
              child: const Icon(LucideIcons.check,
                  size: 14, color: Colors.white),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                'Your plan is ready',
                style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                      fontWeight:    FontWeight.w800,
                      letterSpacing: -0.5,
                    ),
              ),
            ),
            GestureDetector(
              onTap: onReset,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color:        t.backgroundSubtle,
                  borderRadius: BorderRadius.circular(AppRadius.full),
                  border:       Border.all(color: t.border),
                ),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  Icon(LucideIcons.x, size: 12, color: t.textMuted),
                  const SizedBox(width: 4),
                  Text('Reset',
                      style: TextStyle(
                          color: t.textMuted,
                          fontSize: 11,
                          fontWeight: FontWeight.w600)),
                ]),
              ),
            ),
          ]).heroEntrance(),
          const SizedBox(height: 20),

          // ── Plan card ─────────────────────────────────────
          PremiumCard(
            topAccentColor: const Color(0xFF217C45),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title + regenerate
                Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'MISSION TITLE',
                          style: TextStyle(
                            color:         context.tokens.primary,
                            fontSize:      10,
                            fontWeight:    FontWeight.w800,
                            letterSpacing: 1.0,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          title,
                          style:
                              Theme.of(context).textTheme.headlineMedium?.copyWith(
                                    fontWeight:    FontWeight.w800,
                                    letterSpacing: -0.4,
                                  ),
                        ),
                      ],
                    ),
                  ),
                  GestureDetector(
                    onTap: onRegenerate,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color:        t.backgroundSubtle,
                        borderRadius: BorderRadius.circular(AppRadius.full),
                        border:       Border.all(color: t.border),
                      ),
                      child: Row(mainAxisSize: MainAxisSize.min, children: [
                        Icon(LucideIcons.refreshCw,
                            size: 12, color: t.textSecondary),
                        const SizedBox(width: 4),
                        Text(
                          'Regenerate',
                          style: TextStyle(
                            color:      t.textSecondary,
                            fontSize:   11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ]),
                    ),
                  ),
                ]),

                const SizedBox(height: 20),

                // Roadmap timeline
                Text(
                  'ROADMAP — ${steps.length} PHASES',
                  style: TextStyle(
                    color:         t.textSecondary,
                    fontSize:      10,
                    fontWeight:    FontWeight.w800,
                    letterSpacing: 1.0,
                  ),
                ),
                const SizedBox(height: 14),

                ...steps.indexed.map((item) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Node + connector
                          SizedBox(
                            width: 28,
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  width:  28,
                                  height: 28,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                        color: t.primary, width: 2),
                                    gradient: item.$1 == 0
                                        ? const LinearGradient(
                                            colors: [
                                              Color(0xFF217C45),
                                              Color(0xFF4CAF50),
                                            ],
                                          )
                                        : null,
                                    color: item.$1 == 0
                                        ? null
                                        : t.background,
                                  ),
                                  child: Center(
                                    child: Text(
                                      '${item.$1 + 1}',
                                      style: TextStyle(
                                        color: item.$1 == 0
                                            ? Colors.white
                                            : t.primary,
                                        fontSize:   11,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ),
                                ),
                                if (item.$1 < steps.length - 1)
                                  Container(
                                    width:  2,
                                    height: 20,
                                    color:  t.border,
                                  ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color:        t.backgroundSubtle,
                                borderRadius: BorderRadius.circular(AppRadius.lg),
                                border:       Border.all(color: t.border),
                              ),
                              child: Text(
                                item.$2,
                                style: TextStyle(
                                  color:      t.textPrimary,
                                  fontSize:   13,
                                  fontWeight: FontWeight.w600,
                                  height:     1.4,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ).animate(delay: Duration(milliseconds: item.$1 * 60))
                          .fadeIn(duration: 250.ms)
                          .slideX(begin: 0.04, end: 0, duration: 250.ms),
                    )),
              ],
            ),
          ).staggered(0),

          const SizedBox(height: 20),

          // ── Convert CTA ───────────────────────────────────
          PremiumButton(
            label:     'Activate as Mission',
            icon:      const Icon(LucideIcons.target, size: 18),
            onPressed: onConvert,
          ).staggered(1),

          const SizedBox(height: 12),

          // AI insight strip
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin:  Alignment.centerLeft,
                end:    Alignment.centerRight,
                colors: [
                  context.tokens.primarySurface,
                  context.tokens.surface,
                ],
              ),
              borderRadius: BorderRadius.circular(AppRadius.xl),
              border:       Border.all(color: t.cardBorder),
            ),
            child: Row(children: [
              Container(
                width:  36,
                height: 36,
                decoration: BoxDecoration(
                  gradient:     AppGradients.lifekit,
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                  boxShadow:    AppShadows.greenSm,
                ),
                child: const Icon(LucideIcons.wandSparkles,
                    color: Colors.white, size: 16),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                  Text(
                    'AI READY',
                    style: TextStyle(
                      color:         t.primary,
                      fontSize:      10,
                      fontWeight:    FontWeight.w800,
                      letterSpacing: 1.0,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Your AI Coach will track this mission and surface daily insights.',
                    style: TextStyle(
                        color: t.textSecondary, fontSize: 12, height: 1.5),
                  ),
                ]),
              ),
            ]),
          ).staggered(2),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  SPINNING LOADER ICON
// ─────────────────────────────────────────────
class _SpinningIcon extends StatefulWidget {
  const _SpinningIcon();
  @override
  State<_SpinningIcon> createState() => _SpinningIconState();
}

class _SpinningIconState extends State<_SpinningIcon>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl = AnimationController(
    vsync:    this,
    duration: const Duration(milliseconds: 900),
  )..repeat();

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => RotationTransition(
        turns: _ctrl,
        child: const Icon(LucideIcons.loader, size: 32, color: Colors.white),
      );
}

// ignore_for_file: use_build_context_synchronously
import 'dart:ui';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../app.dart';
import '../../core/api.dart';
import '../../core/repository.dart';
import '../../core/design/tokens.dart';
import '../../core/design/animations.dart';
import '../../core/widgets/premium_card.dart';
import '../../core/widgets/premium_input.dart';

// ════════════════════════════════════════════════════════════
// DATA MODELS
// ════════════════════════════════════════════════════════════

class MissionData {
  const MissionData({
    required this.id, required this.title, required this.goal,
    required this.category, required this.status, required this.priority,
    required this.progress, required this.deadline,
  });
  final int id;
  final String title, goal, category, status, priority, deadline;
  final double progress;

  factory MissionData.fromJson(Map<String, dynamic> j) {
    final raw = (j['progress'] as num?)?.toDouble() ?? 0;
    final progress = raw > 1 ? raw / 100 : raw;
    final target = DateTime.tryParse(
        (j['targetDate'] ?? j['target_date'] ?? '').toString());
    return MissionData(
      id: (j['id'] ?? 0) is String
          ? int.tryParse(j['id'].toString()) ?? 0
          : (j['id'] ?? 0) as int,
      title:    (j['title'] ?? '').toString(),
      goal:     (j['description'] ?? j['goal'] ?? '').toString(),
      category: (j['category'] ?? 'Lifestyle').toString(),
      status:   _normalizeStatus(j['status']?.toString()),
      priority: (j['priority'] ?? 'medium').toString().toLowerCase(),
      progress: progress.clamp(0.0, 1.0),
      deadline: target == null
          ? 'No deadline'
          : '${target.day}/${target.month}/${target.year}',
    );
  }

  static String _normalizeStatus(String? s) {
    if (s == null) return 'Active';
    return switch (s.toUpperCase()) {
      'ACTIVE' || 'IN_PROGRESS' => 'Active',
      'PAUSED'    => 'Paused',
      'COMPLETED' || 'DONE' => 'Completed',
      'DRAFT'     => 'Draft',
      'AT_RISK'   => 'At Risk',
      'ARCHIVED'  => 'Archived',
      _ => s,
    };
  }
}

class TaskData {
  TaskData({
    required this.id, required this.missionId, required this.title,
    required this.missionTitle, required this.priority,
    required this.minutes, required this.status, this.done = false,
  });
  final int id, missionId;
  final String title, missionTitle, priority;
  final int minutes;
  String status;
  bool done;

  factory TaskData.fromJson(Map<String, dynamic> j, String missionTitle) {
    final rawStatus = (j['status'] ?? 'PENDING').toString().toUpperCase();
    return TaskData(
      id:           _parseInt(j['id'] ?? j['task_id']),
      missionId:    _parseInt(j['mission_id'] ?? j['missionId']),
      title:        (j['title'] ?? '').toString(),
      missionTitle: missionTitle,
      priority:     (j['priority'] ?? 'medium').toString().toLowerCase(),
      minutes:      ((j['estimated_time'] ?? j['estimatedDurationMinutes'])
                      as num?)?.toInt() ?? 30,
      status: switch (rawStatus) {
        'IN_PROGRESS' => 'In Progress',
        'COMPLETED'   => 'Done',
        'REVIEW'      => 'Review',
        _             => 'To Do',
      },
      done: rawStatus == 'COMPLETED',
    );
  }

  static int _parseInt(dynamic v) {
    if (v is int) return v;
    return int.tryParse(v?.toString() ?? '') ?? 0;
  }
}

// ════════════════════════════════════════════════════════════
// STATE PROVIDERS
// ════════════════════════════════════════════════════════════

final missionsProvider   = StateProvider<List<MissionData>>((ref) => const []);
final tasksProvider      = StateProvider<List<TaskData>>((ref) => const []);
final profileProvider    = StateProvider<Map<String, dynamic>>((ref) => const {});
final notifCountProvider = StateProvider<int>((ref) => 0);

final dashboardProvider = FutureProvider<void>((ref) async {
  final repo = ref.watch(repositoryProvider);
  final results = await Future.wait([
    repo.missions().catchError((_) => <Map<String, dynamic>>[]),
    repo.profile().catchError((_) => <String, dynamic>{}),
    repo.unreadNotificationCount().catchError((_) => 0),
  ]);
  final rawMissions = results[0] as List<Map<String, dynamic>>;
  ref.read(profileProvider.notifier).state =
      results[1] as Map<String, dynamic>;
  ref.read(notifCountProvider.notifier).state = results[2] as int;
  final missions = rawMissions.map(MissionData.fromJson).toList();
  ref.read(missionsProvider.notifier).state = missions;
  if (missions.isNotEmpty) {
    final taskResults = await Future.wait(
      missions.take(3).map((m) =>
          repo.tasks(missionId: m.id)
              .catchError((_) => <Map<String, dynamic>>[])),
    );
    final allTasks = taskResults.indexed
        .expand((item) =>
            item.$2.map((t) => TaskData.fromJson(t, missions[item.$1].title)))
        .toList();
    ref.read(tasksProvider.notifier).state = allTasks;
  }
});

// ════════════════════════════════════════════════════════════
// SHARED WIDGETS
// ════════════════════════════════════════════════════════════

class _PageHeading extends StatelessWidget {
  const _PageHeading(this.title, {this.subtitle, this.actions = const []});
  final String title;
  final String? subtitle;
  final List<Widget> actions;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Padding(
      padding: const EdgeInsets.fromLTRB(56, 18, 12, 12),
      child: Row(children: [
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(title,
                style: Theme.of(context)
                    .textTheme
                    .displaySmall
                    ?.copyWith(color: t.textPrimary)),
            if (subtitle != null) ...[
              const SizedBox(height: 4),
              Text(subtitle!,
                  style: TextStyle(color: t.textMuted, fontSize: 13)),
            ],
          ]),
        ),
        ...actions,
      ]),
    );
  }
}

class _ApiErrorBanner extends StatelessWidget {
  const _ApiErrorBanner({required this.error, required this.onRetry});
  final Object error;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final msg = error.toString().replaceFirst('Exception:', '').trim();
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color:        t.destructiveSurface,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border:       Border.all(color: t.destructive.withValues(alpha: 0.3)),
      ),
      child: Row(children: [
        Icon(LucideIcons.wifiOff, color: t.destructive, size: 18),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            msg.length > 120 ? '${msg.substring(0, 120)}…' : msg,
            style: TextStyle(color: t.destructive, fontSize: 12),
          ),
        ),
        TextButton(onPressed: onRetry, child: const Text('Retry')),
      ]),
    );
  }
}

// Small bold label used above form fields inside bottom sheets
class _SheetLabel extends StatelessWidget {
  const _SheetLabel(this.text);
  final String text;
  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Text(text,
        style: TextStyle(
          fontSize:    12,
          fontWeight:  FontWeight.w700,
          color:       t.textSecondary,
          letterSpacing: 0.1,
        ));
  }
}

class _PremiumTaskRow extends StatelessWidget {
  const _PremiumTaskRow({
    required this.task, required this.index, required this.onToggle,
  });
  final TaskData task;
  final int index;
  final VoidCallback onToggle;

  Color _priorityColor(AppTokens t) => switch (task.priority) {
    'urgent' => t.priorityUrgentFg,
    'high'   => t.priorityHighFg,
    'medium' => t.priorityMedFg,
    _        => t.textMuted,
  };

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return GestureDetector(
      onTap: onToggle,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color:        t.surface,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border:       Border.all(color: t.border),
          boxShadow:    AppShadows.xs,
        ),
        child: Row(children: [
          Container(width: 3, height: 36,
              decoration: BoxDecoration(
                color:        _priorityColor(t),
                borderRadius: BorderRadius.circular(AppRadius.full),
              )),
          const SizedBox(width: 12),
          GestureDetector(
            onTap: onToggle,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 20, height: 20,
              decoration: BoxDecoration(
                color:        task.done ? t.primary : Colors.transparent,
                borderRadius: BorderRadius.circular(6),
                border:       Border.all(
                    color: task.done ? t.primary : t.border, width: 1.5),
              ),
              child: task.done
                  ? const Icon(LucideIcons.check,
                      size: 12, color: Colors.white)
                  : null,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              AnimatedDefaultTextStyle(
                duration: const Duration(milliseconds: 300),
                style: TextStyle(
                  fontWeight:  FontWeight.w600,
                  fontSize:    14,
                  color:       task.done ? t.textMuted : t.textPrimary,
                  decoration:  task.done
                      ? TextDecoration.lineThrough : TextDecoration.none,
                  decorationColor: t.textMuted,
                ),
                child: Text(task.title, maxLines: 1,
                    overflow: TextOverflow.ellipsis),
              ),
              Text(task.missionTitle,
                  style: TextStyle(color: t.textMuted, fontSize: 11)),
            ]),
          ),
          const SizedBox(width: 8),
          Row(mainAxisSize: MainAxisSize.min, children: [
            Icon(LucideIcons.clock3, size: 12, color: t.textMuted),
            const SizedBox(width: 3),
            Text('${task.minutes}m',
                style: TextStyle(color: t.textMuted, fontSize: 11)),
          ]),
        ]),
      ),
    );
  }
}

// ════════════════════════════════════════════════════════════
// HOME SCREEN
// ════════════════════════════════════════════════════════════

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  String _greeting() {
    final h = DateTime.now().hour;
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final boot        = ref.watch(dashboardProvider);
    final tasks       = ref.watch(tasksProvider);
    final missions    = ref.watch(missionsProvider);
    final profile     = ref.watch(profileProvider);
    final notifCount  = ref.watch(notifCountProvider);
    final t           = context.tokens;

    final firstName = (profile['fullName'] ?? profile['full_name'] ?? 'there')
        .toString().split(' ').first;

    return MeshBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: SafeArea(
          child: CustomScrollView(slivers: [
            // ── App bar ───────────────────────────
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(60, 8, 12, 4),
                child: Row(children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      gradient:     AppGradients.lifekit,
                      borderRadius: BorderRadius.circular(AppRadius.sm),
                    ),
                    child: const Icon(LucideIcons.leaf,
                        size: 16, color: Colors.white),
                  ),
                  const SizedBox(width: 9),
                  Text('LifeKit',
                      style: TextStyle(
                          fontSize: 18, fontWeight: FontWeight.w900,
                          color: t.textPrimary, letterSpacing: -0.5)),
                  const Spacer(),
                  if (boot.isLoading)
                    SizedBox(
                      width: 16, height: 16,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: t.primary),
                    ),
                  IconButton(
                    onPressed: () => context.push('/notifications'),
                    icon: notifCount > 0
                        ? Badge(
                            label: Text('$notifCount'),
                            child: Icon(LucideIcons.bell,
                                size: 20, color: t.textSecondary))
                        : Icon(LucideIcons.bell,
                            size: 20, color: t.textSecondary),
                  ),
                ]).pageEntrance(),
              ),
            ),

            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
              sliver: SliverList.list(children: [
                if (boot.hasError)
                  _ApiErrorBanner(
                    error:   boot.error!,
                    onRetry: () => ref.invalidate(dashboardProvider),
                  ).pageEntrance(),

                // ── Hero card ───────────────────
                _HomeHeroCard(
                  greeting:  _greeting(),
                  firstName: firstName,
                  tasks:     tasks,
                ).heroEntrance(),
                const SizedBox(height: 16),

                // ── Metric grid ─────────────────
                GridView.count(
                  shrinkWrap: true,
                  physics:    const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  mainAxisSpacing:  10,
                  crossAxisSpacing: 10,
                  childAspectRatio: 1.05,
                  children: [
                    _MetricCard(
                      value: tasks.isEmpty ? 0 :
                          (tasks.where((t) => t.done).length * 100 /
                           tasks.length),
                      suffix:  '%',
                      label:   'Productivity',
                      detail:  'Task completion',
                      icon:    LucideIcons.chartNoAxesCombined,
                      index:   0,
                    ),
                    _MetricCard(
                      value: tasks.where((t) => !t.done).length.toDouble(),
                      label:  'Remaining',
                      detail: 'tasks today',
                      icon:   LucideIcons.listChecks,
                      index:  1,
                    ),
                    _MetricCard(
                      value: missions.where((m) => m.status == 'Active')
                          .length.toDouble(),
                      label:  'Missions',
                      detail: 'active now',
                      icon:   LucideIcons.target,
                      index:  2,
                    ),
                    _MetricCard(
                      value: tasks.length.toDouble(),
                      label:  'Total tasks',
                      detail: 'across missions',
                      icon:   LucideIcons.squareCheck,
                      index:  3,
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // ── Today's plan ────────────────
                if (tasks.isNotEmpty) ...[
                  _TodaysPlan(tasks: tasks).staggered(4),
                  const SizedBox(height: 16),
                ],

                // ── AI Insight card ─────────────
                _AiInsightCard(tasks: tasks, missions: missions).staggered(5),
                const SizedBox(height: 16),

                // ── Primary mission ─────────────
                if (missions.isNotEmpty)
                  _PrimaryMissionCard(mission: missions.first).staggered(6),
              ]),
            ),
          ]),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  HOME HERO CARD
// ─────────────────────────────────────────────
class _HomeHeroCard extends StatelessWidget {
  const _HomeHeroCard({
    required this.greeting,
    required this.firstName,
    required this.tasks,
  });
  final String greeting, firstName;
  final List<TaskData> tasks;

  @override
  Widget build(BuildContext context) {
    final t      = context.tokens;
    final nextTask = tasks.firstWhere((t) => !t.done, orElse: () =>
        tasks.isNotEmpty ? tasks.first : TaskData(
          id: 0, missionId: 0, title: 'Create your first mission',
          missionTitle: '', priority: 'medium', minutes: 5, status: 'To Do'));

    return GradientCard(
      radius: AppRadius.x3l,
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        // Date chip + greeting row
        Row(children: [
          Text('$greeting,',
              style: const TextStyle(color: Colors.white70, fontSize: 14)),
          const Spacer(),
          ClipRRect(
            borderRadius: BorderRadius.circular(AppRadius.full),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
              child: Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color:        Colors.white.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(AppRadius.full),
                  border:       Border.all(
                      color: Colors.white.withValues(alpha: 0.25)),
                ),
                child: Text(
                  _todayLabel(),
                  style: const TextStyle(
                    color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ),
        ]),
        const SizedBox(height: 6),
        Text('$firstName.',
            style: const TextStyle(
              color: Colors.white, fontSize: 28,
              fontWeight: FontWeight.w900, letterSpacing: -1.0,
            )),
        const SizedBox(height: 8),
        Text(
          tasks.isEmpty
              ? 'Set up your first mission to get started.'
              : '${tasks.where((t) => !t.done).length} tasks remaining. AI has prioritised your best next move.',
          style: const TextStyle(
              color: Colors.white70, height: 1.5, fontSize: 14),
        ),
        const SizedBox(height: 18),

        // Action buttons
        Row(children: [
          _HeroOutlineButton(
            icon: LucideIcons.wandSparkles,
            label: 'Plan with AI',
            onTap: () => context.go('/ai-coach'),
          ),
          const SizedBox(width: 10),
          _HeroOutlineButton(
            icon: LucideIcons.plus,
            label: 'Add task',
            onTap: () => context.go('/tasks'),
          ),
        ]),

        if (tasks.isNotEmpty) ...[
          const SizedBox(height: 20),
          // Next best action card
          ClipRRect(
            borderRadius: BorderRadius.circular(AppRadius.x2l),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color:        Colors.white.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(AppRadius.x2l),
                  border:       Border.all(
                      color: Colors.white.withValues(alpha: 0.2)),
                ),
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    Icon(LucideIcons.sparkles,
                        size: 14, color: Colors.amber.shade300),
                    const SizedBox(width: 6),
                    Text('NEXT BEST ACTION',
                        style: TextStyle(
                          color: Colors.amber.shade300, fontSize: 10,
                          fontWeight: FontWeight.w700, letterSpacing: 0.8,
                        )),
                  ]),
                  const SizedBox(height: 10),
                  Text(nextTask.title,
                      style: const TextStyle(
                        color: Colors.white, fontWeight: FontWeight.w700,
                        fontSize: 16, height: 1.3,
                      )),
                  const SizedBox(height: 4),
                  Text(nextTask.missionTitle,
                      style: const TextStyle(
                          color: Colors.white60, fontSize: 12)),
                  const SizedBox(height: 12),
                  Row(children: [
                    Icon(LucideIcons.clock3,
                        size: 12, color: Colors.white60),
                    const SizedBox(width: 4),
                    Text('${nextTask.minutes} min',
                        style: const TextStyle(
                            color: Colors.white60, fontSize: 12)),
                    const SizedBox(width: 10),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(AppRadius.full),
                      ),
                      child: const Text('Highest impact',
                          style: TextStyle(
                            color: Colors.white, fontSize: 10,
                            fontWeight: FontWeight.w600,
                          )),
                    ),
                    const Spacer(),
                    GestureDetector(
                      onTap: () => context.go('/tasks'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 6),
                        decoration: BoxDecoration(
                          color:        Colors.white,
                          borderRadius: BorderRadius.circular(AppRadius.full),
                          boxShadow:    AppShadows.greenSm,
                        ),
                        child: Text('Start →',
                            style: TextStyle(
                              color: t.primary, fontWeight: FontWeight.w700,
                              fontSize: 12,
                            )),
                      ),
                    ),
                  ]),
                ]),
              ),
            ),
          ),
        ],

        const SizedBox(height: 16),
        Divider(color: Colors.white.withValues(alpha: 0.15)),
        const SizedBox(height: 12),

        // Goal input
        ClipRRect(
          borderRadius: BorderRadius.circular(AppRadius.full),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
            child: Container(
              height: 46,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color:        Colors.white.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(AppRadius.full),
                border:       Border.all(
                    color: Colors.white.withValues(alpha: 0.2)),
              ),
              child: Row(children: [
                Icon(LucideIcons.sparkles,
                    size: 16, color: t.primary),
                const SizedBox(width: 10),
                Text('What do you want to achieve today?',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.5),
                      fontSize: 13,
                    )),
              ]),
            ),
          ),
        ),
      ]),
    );
  }

  String _todayLabel() {
    final now = DateTime.now();
    const months = ['Jan','Feb','Mar','Apr','May','Jun',
                    'Jul','Aug','Sep','Oct','Nov','Dec'];
    return '${months[now.month - 1]} ${now.day}';
  }
}

class _HeroOutlineButton extends StatelessWidget {
  const _HeroOutlineButton({
    required this.icon, required this.label, required this.onTap,
  });
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
          decoration: BoxDecoration(
            color:        Colors.white.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(AppRadius.full),
            border:       Border.all(
                color: Colors.white.withValues(alpha: 0.4)),
          ),
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            Icon(icon, size: 15, color: Colors.white),
            const SizedBox(width: 6),
            Text(label,
                style: const TextStyle(
                  color: Colors.white, fontSize: 13,
                  fontWeight: FontWeight.w600,
                )),
          ]),
        ),
      );
}

// ─────────────────────────────────────────────
//  METRIC CARD
// ─────────────────────────────────────────────
class _MetricCard extends StatelessWidget {
  const _MetricCard({
    required this.value, required this.label, required this.detail,
    required this.icon, required this.index,
    this.suffix = '',
  });
  final double value;
  final String label, detail, suffix;
  final IconData icon;
  final int index;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return PremiumCard(
      radius:  AppRadius.lg,
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(
          width: 44, height: 44,
          decoration: BoxDecoration(
            color:        t.primarySurface,
            borderRadius: BorderRadius.circular(AppRadius.md),
          ),
          child: Icon(icon, color: t.primary, size: 20),
        ),
        const SizedBox(height: 12),
        AnimatedMetric(
          value:          value,
          suffix:         suffix,
          fractionDigits: 0,
          style: TextStyle(
            fontSize:    22,
            fontWeight:  FontWeight.w800,
            color:       t.textPrimary,
            letterSpacing: -0.8,
          ),
        ),
        const SizedBox(height: 2),
        Text(label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontWeight:  FontWeight.w700,
              fontSize:    11,
              color:       t.textPrimary,
            )),
        Text(detail,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(color: t.textMuted, fontSize: 10)),
      ]),
    ).staggered(index);
  }
}

// ─────────────────────────────────────────────
//  TODAY'S PLAN CARD
// ─────────────────────────────────────────────
class _TodaysPlan extends ConsumerWidget {
  const _TodaysPlan({required this.tasks});
  final List<TaskData> tasks;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.tokens;
    return PremiumCard(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start,
                children: [
              Text("Today's execution plan",
                  style: Theme.of(context).textTheme.headlineSmall),
              Text('AI-prioritized to protect your momentum',
                  style: TextStyle(color: t.textMuted, fontSize: 12)),
            ]),
          ),
          TextButton(
            onPressed: () => context.go('/tasks'),
            child: Text('See all',
                style: TextStyle(color: t.primary, fontSize: 12,
                    fontWeight: FontWeight.w600)),
          ),
        ]),
        const SizedBox(height: 12),
        ...tasks.take(4).indexed.map((item) => _PremiumTaskRow(
              task:     item.$2,
              index:    item.$1,
              onToggle: () {
                final copy = [...tasks];
                copy[item.$1].done = !copy[item.$1].done;
                ref.read(tasksProvider.notifier).state = copy;
                ref.read(repositoryProvider)
                    .setTaskStatus(
                      item.$2.id,
                      copy[item.$1].done ? 'COMPLETED' : 'PENDING',
                    )
                    .ignore();
              },
            )),
      ]),
    );
  }
}

// ─────────────────────────────────────────────
//  AI INSIGHT CARD
// ─────────────────────────────────────────────
class _AiInsightCard extends StatelessWidget {
  const _AiInsightCard({required this.tasks, required this.missions});
  final List<TaskData> tasks;
  final List<MissionData> missions;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.centerLeft,
          end:   Alignment.centerRight,
          colors: [t.primarySurface, t.surface],
        ),
        borderRadius: BorderRadius.circular(AppRadius.xl),
        border: Border.all(color: t.cardBorder),
        boxShadow: AppShadows.card,
      ),
      child: IntrinsicHeight(
        child: Row(children: [
          // Left accent bar
          Container(
            width: 3,
            decoration: BoxDecoration(
              color:        t.primary,
              borderRadius: const BorderRadius.horizontal(
                  left: Radius.circular(AppRadius.xl)),
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Row(crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                // Pulsing AI icon
                PulseGlow(
                  child: Container(
                    width: 40, height: 40,
                    decoration: BoxDecoration(
                      gradient:     AppGradients.lifekit,
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      boxShadow:    AppShadows.greenSm,
                    ),
                    child: const Icon(LucideIcons.wandSparkles,
                        color: Colors.white, size: 18),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                    Row(children: [
                      Text('AI INSIGHT',
                          style: TextStyle(
                            color: t.primary, fontSize: 10,
                            fontWeight: FontWeight.w800, letterSpacing: 1.0,
                          )),
                      const SizedBox(width: 8),
                      // Green pulse dot
                      _PulseDot(color: t.primary),
                    ]),
                    const SizedBox(height: 7),
                    Text(
                      tasks.isNotEmpty
                          ? 'Your most impactful task is "${tasks.first.title}".'
                          : 'Start by creating your first mission.',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 5),
                    Text(
                      missions.isEmpty
                          ? 'LifeKit turns goals into structured missions with AI guidance.'
                          : 'You have ${missions.where((m) => m.status == 'Active').length} active mission${missions.length == 1 ? '' : 's'} in progress.',
                      style: TextStyle(
                          color: t.textMuted, height: 1.5, fontSize: 13),
                    ),
                    TextButton(
                      onPressed: () => context.go('/ai-coach'),
                      style: TextButton.styleFrom(
                          padding: EdgeInsets.zero,
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap),
                      child: Text('Explore with AI →',
                          style: TextStyle(
                              color: t.primary, fontSize: 13,
                              fontWeight: FontWeight.w600)),
                    ),
                  ]),
                ),
              ]),
            ),
          ),
        ]),
      ),
    );
  }
}

class _PulseDot extends StatefulWidget {
  const _PulseDot({required this.color});
  final Color color;
  @override
  State<_PulseDot> createState() => _PulseDotState();
}

class _PulseDotState extends State<_PulseDot>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1500),
  )..repeat(reverse: true);

  late final Animation<double> _scale =
      Tween<double>(begin: 1.0, end: 1.5).animate(
    CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut),
  );
  late final Animation<double> _opacity =
      Tween<double>(begin: 1.0, end: 0.0).animate(
    CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut),
  );

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => AnimatedBuilder(
        animation: _ctrl,
        builder: (_, __) => Opacity(
          opacity: _opacity.value,
          child: Transform.scale(
            scale: _scale.value,
            child: Container(
              width: 8, height: 8,
              decoration: BoxDecoration(
                color: widget.color,
                shape: BoxShape.circle,
              ),
            ),
          ),
        ),
      );
}

// ─────────────────────────────────────────────
//  PRIMARY MISSION CARD
// ─────────────────────────────────────────────
class _PrimaryMissionCard extends StatelessWidget {
  const _PrimaryMissionCard({required this.mission});
  final MissionData mission;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return PremiumCard(
      onTap: () => context.push('/missions/${mission.id}'),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          const SectionLabel('PRIMARY MISSION'),
          const Spacer(),
          StatusBadge(mission.status),
        ]),
        const SizedBox(height: 12),
        Text(mission.title, style: Theme.of(context).textTheme.headlineMedium),
        const SizedBox(height: 6),
        Text(mission.goal,
            maxLines: 2, overflow: TextOverflow.ellipsis,
            style: TextStyle(color: t.textMuted, height: 1.5, fontSize: 13)),
        const SizedBox(height: 16),
        Row(children: [
          Text('${(mission.progress * 100).round()}%',
              style: TextStyle(
                fontSize:    24,
                fontWeight:  FontWeight.w800,
                color:       t.primary,
                letterSpacing: -0.8,
              )),
          const SizedBox(width: 8),
          Text('mission progress',
              style: TextStyle(color: t.textMuted, fontSize: 12)),
        ]),
        const SizedBox(height: 8),
        PremiumProgressBar(value: mission.progress),
        const SizedBox(height: 14),
        Row(children: [
          Icon(LucideIcons.arrowRight, size: 16, color: t.primary),
          const SizedBox(width: 6),
          Text('View mission details',
              style: TextStyle(color: t.primary, fontWeight: FontWeight.w600,
                  fontSize: 13)),
        ]),
      ]),
    );
  }
}

// ════════════════════════════════════════════════════════════
// MISSIONS SCREEN
// ════════════════════════════════════════════════════════════

class MissionsScreen extends ConsumerStatefulWidget {
  const MissionsScreen({super.key});
  @override
  ConsumerState<MissionsScreen> createState() => _MissionsScreenState();
}

class _MissionsScreenState extends ConsumerState<MissionsScreen> {
  String _filter = 'All';
  bool _loading  = false;
  bool _scrolled = false;
  final _scrollCtrl = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollCtrl.addListener(() =>
        setState(() => _scrolled = _scrollCtrl.offset > 40));
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  @override
  void dispose() {
    _scrollCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final repo = ref.read(repositoryProvider);
      final raw  = await repo.missions();
      ref.read(missionsProvider.notifier).state =
          raw.map(MissionData.fromJson).toList();
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    final all   = ref.watch(missionsProvider);
    final shown = _filter == 'All'
        ? all
        : all.where((m) => m.status == _filter).toList();
    final t = context.tokens;

    return Scaffold(
      backgroundColor: t.background,
      floatingActionButton: AnimatedSize(
        duration: const Duration(milliseconds: 300),
        child: _scrolled
            ? FloatingActionButton(
                onPressed: () => _createSheet(context),
                backgroundColor: t.primary,
                child: const Icon(Icons.add, color: Colors.white),
              )
            : FloatingActionButton.extended(
                onPressed:   () => _createSheet(context),
                icon:        const Icon(LucideIcons.target, size: 18),
                label:       const Text('New Mission'),
                backgroundColor: t.primary,
                foregroundColor: Colors.white,
              ),
      ),
      body: SafeArea(
        child: Column(children: [
          _PageHeading(
            'Missions',
            subtitle: '${all.where((m) => m.status == 'Active').length} active',
            actions: [
              IconButton(
                onPressed: _load,
                icon: Icon(LucideIcons.refreshCw, size: 18,
                    color: t.textSecondary),
              ),
            ],
          ).pageEntrance(),

          // Filter chips
          SizedBox(
            height: 44,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                for (final f in ['All','Active','Paused','Draft',
                                  'Completed','At Risk'])
                  Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: _PremiumFilterChip(
                      label:    f,
                      selected: _filter == f,
                      onTap:    () => setState(() => _filter = f),
                    ),
                  ),
              ],
            ),
          ).animate(delay: 80.ms).fadeIn(duration: 250.ms),
          const SizedBox(height: 8),

          if (_loading)
            LinearProgressIndicator(
                color: t.primary, minHeight: 2,
                backgroundColor: t.backgroundSubtle),

          Expanded(
            child: shown.isEmpty
                ? _MissionsEmptyState(onCreateTap: () => _createSheet(context))
                : RefreshIndicator(
                    onRefresh: _load,
                    color:     t.primary,
                    child: ListView.separated(
                      controller:  _scrollCtrl,
                      padding: const EdgeInsets.fromLTRB(16, 6, 16, 24),
                      itemCount:   shown.length,
                      separatorBuilder: (_, __) =>
                          const SizedBox(height: 12),
                      itemBuilder: (_, i) => _MissionCard(
                        shown[i],
                        index:    i,
                        onDelete: () async {
                          await ref.read(repositoryProvider)
                              .deleteMission(shown[i].id)
                              .catchError((_) {});
                          _load();
                        },
                      ),
                    ),
                  ),
          ),
        ]),
      ),
    );
  }

  void _createSheet(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        fullscreenDialog: true,
        builder: (_) => _MissionCreateFlow(
          onCreated: _load,
          repositoryReader: () => ref.read(repositoryProvider),
        ),
      ),
    );
  }
}

// ════════════════════════════════════════════════════════════
// 4-STEP MISSION CREATION FLOW  (matches web app)
// ════════════════════════════════════════════════════════════

class _MissionCreateFlow extends StatefulWidget {
  const _MissionCreateFlow({
    required this.onCreated,
    required this.repositoryReader,
  });
  final VoidCallback onCreated;
  final LifeKitRepository Function() repositoryReader;

  @override
  State<_MissionCreateFlow> createState() => _MissionCreateFlowState();
}

class _MissionCreateFlowState extends State<_MissionCreateFlow> {
  // ── step 1 form state ───────────────────────
  final _goalCtrl        = TextEditingController();
  final _weeklyHrsCtrl   = TextEditingController();
  final _budgetCtrl      = TextEditingController();
  final _constraintsCtrl = TextEditingController();
  String? _category;
  String  _budgetCurrency = 'INR';
  DateTime? _targetDate;

  // ── step / plan state ───────────────────────
  int _step = 1; // 1 = form, 2 = generating, 3 = review, 4 = done
  String? _genError;
  Map<String, dynamic> _plan = {};  // result from AI

  // ── generation animation ────────────────────
  int _genAnimStep = 0;
  static const _genMessages = [
    'Understanding goal…',
    'Identifying milestones…',
    'Calculating timeline…',
    'Finding resources…',
    'Preparing execution plan…',
  ];

  @override
  void dispose() {
    _goalCtrl.dispose();
    _weeklyHrsCtrl.dispose();
    _budgetCtrl.dispose();
    _constraintsCtrl.dispose();
    super.dispose();
  }

  // ── generate plan via AI agent ──────────────
  Future<void> _generate() async {
    if (_goalCtrl.text.trim().isEmpty || _category == null) return;
    setState(() {
      _step = 2;
      _genAnimStep = 0;
      _genError = null;
    });

    // Tick through the animation steps
    _tickGenAnim();

    try {
      final repo  = widget.repositoryReader();
      final goal  = _goalCtrl.text.trim();
      final extra = [
        if (_weeklyHrsCtrl.text.trim().isNotEmpty)
          'Weekly hours: ${_weeklyHrsCtrl.text.trim()}',
        if (_budgetCtrl.text.trim().isNotEmpty)
          'Budget: $_budgetCurrency ${_budgetCtrl.text.trim()}',
        if (_constraintsCtrl.text.trim().isNotEmpty)
          'Constraints: ${_constraintsCtrl.text.trim()}',
        if (_targetDate != null)
          'Target date: ${_targetDate!.day}/${_targetDate!.month}/${_targetDate!.year}',
      ].join('\n');

      final result = await repo.runAgent(
        agentType: 'PLANNER',
        userInput: extra.isEmpty ? goal : '$goal\n$extra',
        contextData: {'category': _category, 'goal': goal},
      );

      // Parse whatever the agent returns
      final raw = result['output']?.toString() ?? '';
      final title = result['title']?.toString() ??
          (goal.length > 50 ? '${goal.substring(0, 50)}…' : goal);

      // Extract milestone lines from the output (lines starting with numbered bullets)
      final milestones = <String>[];
      for (final line in raw.split('\n')) {
        final trimmed = line.trim();
        if (RegExp(r'^(\d+[\.\):]|[-•*])').hasMatch(trimmed) &&
            trimmed.length > 5) {
          milestones.add(trimmed.replaceFirst(
              RegExp(r'^(\d+[\.\):\s]+|[-•*]\s*)'), ''));
        }
      }
      if (milestones.isEmpty && raw.isNotEmpty) {
        // Fallback: split by newline, take non-empty lines
        milestones.addAll(raw
            .split('\n')
            .map((l) => l.trim())
            .where((l) => l.isNotEmpty)
            .take(7));
      }

      setState(() {
        _plan = {
          'title':      title,
          'category':   _category,
          'goal':       goal,
          'milestones': milestones,
          'raw':        raw,
        };
        _step = 3;
      });
    } catch (e) {
      setState(() {
        _genError = e.toString().replaceFirst('Exception:', '').trim();
        _step = 1;
      });
    }
  }

  void _tickGenAnim() {
    if (!mounted || _step != 2) return;
    if (_genAnimStep < _genMessages.length - 1) {
      Future.delayed(const Duration(milliseconds: 1800), () {
        if (!mounted || _step != 2) return;
        setState(() => _genAnimStep++);
        _tickGenAnim();
      });
    }
  }

  // ── activate / save draft ───────────────────
  Future<void> _activate({bool draft = false}) async {
    setState(() => _step = 4);
    try {
      final repo  = widget.repositoryReader();
      final goal  = _goalCtrl.text.trim();
      final title = (_plan['title'] as String?) ?? goal;
      final desc  = [
        goal,
        if (_constraintsCtrl.text.trim().isNotEmpty)
          'Constraints: ${_constraintsCtrl.text.trim()}',
        if (_budgetCtrl.text.trim().isNotEmpty)
          'Budget: $_budgetCurrency ${_budgetCtrl.text.trim()}',
        if (_weeklyHrsCtrl.text.trim().isNotEmpty)
          'Weekly hours: ${_weeklyHrsCtrl.text.trim()}',
      ].join('\n');

      await repo.createMission(
        title:       title,
        description: desc,
        targetDate:  _targetDate?.toIso8601String(),
      );
      widget.onCreated();
      if (mounted) Navigator.of(context).pop();
    } catch (_) {
      if (mounted) setState(() => _step = 3);
    }
  }

  static const _categories = [
    ('career',               'Career'),
    ('finance',              'Finance'),
    ('health',               'Health'),
    ('travel',               'Travel'),
    ('business',             'Business'),
    ('education',            'Education'),
    ('productivity',         'Productivity'),
    ('personal-development', 'Personal Growth'),
    ('lifestyle',            'Lifestyle'),
    ('family',               'Family'),
  ];

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(
        backgroundColor: t.surface,
        elevation: 0,
        leading: _step == 1 || _step == 3
            ? IconButton(
                icon: Icon(LucideIcons.arrowLeft,
                    color: t.textPrimary),
                onPressed: () {
                  if (_step == 3) {
                    setState(() { _step = 1; _plan = {}; });
                  } else {
                    Navigator.of(context).pop();
                  }
                },
              )
            : const SizedBox.shrink(),
        title: const Text('Create New Mission'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(28),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
            child: Row(children: [
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(AppRadius.full),
                  child: LinearProgressIndicator(
                    value: _step / 4,
                    minHeight: 5,
                    backgroundColor: t.backgroundSubtle,
                    valueColor: AlwaysStoppedAnimation(t.primary),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Text('Step $_step of 4',
                  style: TextStyle(
                    color: t.textMuted, fontSize: 12,
                    fontWeight: FontWeight.w600,
                  )),
            ]),
          ),
        ),
      ),
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 250),
        child: KeyedSubtree(
          key: ValueKey(_step),
          child: switch (_step) {
            1 => _buildStep1(t),
            2 => _buildStep2(t),
            3 => _buildStep3(t),
            _ => _buildStep4(t),
          },
        ),
      ),
    );
  }

  // ── STEP 1: Goal form ─────────────────────────
  Widget _buildStep1(AppTokens t) {
    return SizedBox.expand(
      child: SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        if (_genError != null) ...[
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color:        t.destructiveSurface,
              borderRadius: BorderRadius.circular(AppRadius.md),
              border:       Border.all(
                  color: t.destructive.withValues(alpha: 0.4)),
            ),
            child: Row(children: [
              Icon(LucideIcons.alertCircle,
                  size: 16, color: t.destructive),
              const SizedBox(width: 8),
              Expanded(
                child: Text(_genError!,
                    style: TextStyle(
                        color: t.destructive, fontSize: 12)),
              ),
            ]),
          ),
          const SizedBox(height: 16),
        ],

        // Header
        Row(children: [
          Container(
            width: 36, height: 36,
            decoration: BoxDecoration(
              gradient:     AppGradients.lifekit,
              borderRadius: BorderRadius.circular(AppRadius.sm),
            ),
            child: const Icon(LucideIcons.sparkles,
                size: 18, color: Colors.white),
          ),
          const SizedBox(width: 12),
          Text('Describe your goal',
              style: Theme.of(context).textTheme.headlineLarge),
        ]),
        const SizedBox(height: 4),
        Text(
          'Be specific — include your desired outcome, timeframe and any constraints.',
          style: TextStyle(color: t.textMuted, fontSize: 13, height: 1.5),
        ),
        const SizedBox(height: 20),

        _SheetLabel('What do you want to achieve? *'),
        const SizedBox(height: 6),
        PremiumInputField(
          controller: _goalCtrl,
          hint: 'e.g. I want to become a machine learning engineer '
              'within 6 months and land a job…',
          maxLines: 4, minLines: 3,
        ),
        const SizedBox(height: 16),

        _SheetLabel('Category *'),
        const SizedBox(height: 6),
        DropdownButtonFormField<String>(
          initialValue: _category,
          decoration: _dropDecoration(t, hint: 'Select a category'),
          items: _categories.map((c) => DropdownMenuItem(
            value: c.$1, child: Text(c.$2),
          )).toList(),
          onChanged: (v) => setState(() => _category = v),
        ),
        const SizedBox(height: 16),

        Row(children: [
          Expanded(child: Column(
              crossAxisAlignment: CrossAxisAlignment.start, children: [
            _SheetLabel('Target date'),
            const SizedBox(height: 6),
            _DateButton(
              date: _targetDate,
              onTap: () async {
                final p = await showDatePicker(
                  context: context,
                  initialDate: _targetDate ??
                      DateTime.now().add(const Duration(days: 30)),
                  firstDate: DateTime.now(),
                  lastDate:  DateTime.now()
                      .add(const Duration(days: 3650)),
                );
                if (p != null) setState(() => _targetDate = p);
              },
              tokens: t,
            ),
          ])),
          const SizedBox(width: 12),
          Expanded(child: Column(
              crossAxisAlignment: CrossAxisAlignment.start, children: [
            _SheetLabel('Weekly hours'),
            const SizedBox(height: 6),
            PremiumInputField(
              controller:   _weeklyHrsCtrl,
              hint:         'e.g. 10',
              keyboardType: TextInputType.number,
            ),
          ])),
        ]),
        const SizedBox(height: 16),

        _SheetLabel('Budget (optional)'),
        const SizedBox(height: 6),
        Row(children: [
          SizedBox(
            width: 110,
            child: DropdownButtonFormField<String>(
              initialValue: _budgetCurrency,
              isDense: true,
              decoration: _dropDecoration(t),
              items: const [
                DropdownMenuItem(value: 'INR', child: Text('₹ INR')),
                DropdownMenuItem(value: 'USD', child: Text('\$ USD')),
                DropdownMenuItem(value: 'EUR', child: Text('€ EUR')),
              ],
              onChanged: (v) =>
                  setState(() => _budgetCurrency = v ?? 'INR'),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(child: PremiumInputField(
            controller:   _budgetCtrl,
            hint:         'Amount',
            keyboardType: TextInputType.number,
          )),
        ]),
        const SizedBox(height: 16),

        _SheetLabel('Constraints (optional)'),
        const SizedBox(height: 6),
        PremiumInputField(
          controller: _constraintsCtrl,
          hint:     'e.g. Can only work on this on weekends…',
          maxLines: 2, minLines: 2,
        ),
        const SizedBox(height: 28),

        // Generate button — only enabled when required fields filled
        ListenableBuilder(
          listenable: _goalCtrl,
          builder: (_, __) {
            final ready = _goalCtrl.text.trim().isNotEmpty
                && _category != null;
            return PremiumButton(
              label: 'Generate AI Mission Plan',
              onPressed: ready ? _generate : null,
            );
          },
        ),
        const SizedBox(height: 20),
      ]),
    ),
  );
  }

  // ── STEP 2: Building animation ────────────────
  Widget _buildStep2(AppTokens t) {
    return SizedBox.expand(
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Container(
              width: 72, height: 72,
              decoration: BoxDecoration(
                gradient:     AppGradients.lifekit,
                borderRadius: BorderRadius.circular(AppRadius.x2l),
                boxShadow:    AppShadows.green,
              ),
              child: const _SpinningIcon(),
            ),
            const SizedBox(height: 28),
            Text('Building your mission plan…',
                style: Theme.of(context).textTheme.headlineLarge,
                textAlign: TextAlign.center),
            const SizedBox(height: 24),
            // Step-by-step reveal
            ..._genMessages.take(_genAnimStep + 1).indexed.map((item) {
              final isLast = item.$1 == _genAnimStep;
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  padding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    color: isLast
                        ? t.primarySurface : t.backgroundSubtle,
                    borderRadius:
                        BorderRadius.circular(AppRadius.lg),
                    border: Border.all(
                      color: isLast
                          ? t.primary.withValues(alpha: 0.4)
                          : t.border,
                    ),
                  ),
                  child: Row(children: [
                    isLast
                        ? SizedBox(
                            width: 16, height: 16,
                            child: CircularProgressIndicator(
                              strokeWidth: 2, color: t.primary),
                          )
                        : Icon(LucideIcons.check,
                            size: 16, color: t.success),
                    const SizedBox(width: 10),
                    Text(item.$2,
                        style: TextStyle(
                          color: isLast
                              ? t.primary : t.textSecondary,
                          fontSize: 13,
                          fontWeight: isLast
                              ? FontWeight.w600 : FontWeight.w400,
                        )),
                  ]),
                ),
              );
            }),
          ]),
        ),
      ),
    );
  }

  // ── STEP 3: Review plan ───────────────────────
  Widget _buildStep3(AppTokens t) {
    final milestones =
        (_plan['milestones'] as List<String>?) ?? [];
    final title = (_plan['title'] as String?) ?? '';
    final catLabel = _categories
        .firstWhere((c) => c.$1 == _category,
            orElse: () => (_category ?? '', _category ?? ''))
        .$2;

    return SizedBox.expand(
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
          // "Your mission is ready" header
          Row(children: [
            Container(
              width: 28, height: 28,
              decoration: BoxDecoration(
                color:  t.success.withValues(alpha: 0.15),
                shape:  BoxShape.circle,
              ),
              child: Icon(LucideIcons.check,
                  size: 16, color: t.success),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text('Your mission is ready',
                  style: Theme.of(context).textTheme.headlineLarge),
            ),
          ]),
          const SizedBox(height: 16),

          // Plan card
          PremiumCard(
            child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
              // Title row with Edit button
              Row(crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                Expanded(child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                  Text('MISSION TITLE',
                      style: TextStyle(
                        color: t.primary, fontSize: 10,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.0,
                      )),
                  const SizedBox(height: 4),
                  Text(title,
                      style: Theme.of(context)
                          .textTheme
                          .headlineMedium
                          ?.copyWith(fontWeight: FontWeight.w800)),
                ])),
                TextButton(
                  onPressed: () =>
                      setState(() { _step = 1; _plan = {}; }),
                  child: const Text('Edit Details'),
                ),
              ]),
              const SizedBox(height: 14),

              // Category badge
              Text('CATEGORY',
                  style: TextStyle(
                    color: t.textSecondary, fontSize: 10,
                    fontWeight: FontWeight.w700, letterSpacing: 1.0,
                  )),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color:        t.primarySurface,
                  borderRadius: BorderRadius.circular(AppRadius.full),
                  border: Border.all(
                      color: t.primary.withValues(alpha: 0.3)),
                ),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  Icon(LucideIcons.tag, size: 11, color: t.primary),
                  const SizedBox(width: 5),
                  Text(catLabel,
                      style: TextStyle(
                        color: t.primary, fontSize: 12,
                        fontWeight: FontWeight.w600,
                      )),
                ]),
              ),
              const SizedBox(height: 18),

              // Roadmap
              if (milestones.isNotEmpty) ...[
                Text('ROADMAP (${milestones.length} PHASES)',
                    style: TextStyle(
                      color: t.textSecondary, fontSize: 10,
                      fontWeight: FontWeight.w700, letterSpacing: 1.0,
                    )),
                const SizedBox(height: 12),
                ...milestones.indexed.map((item) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                    // Node circle + connector line
                    SizedBox(
                      width: 26,
                      child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                        Container(
                          width: 26, height: 26,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                                color: t.primary, width: 2),
                            color: t.background,
                          ),
                          child: Center(
                            child: Text('${item.$1 + 1}',
                                style: TextStyle(
                                  color: t.primary, fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                )),
                          ),
                        ),
                        if (item.$1 < milestones.length - 1)
                          Container(
                            width: 2, height: 20,
                            color: t.border,
                          ),
                      ]),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: t.backgroundSubtle,
                              borderRadius:
                                  BorderRadius.circular(AppRadius.lg),
                              border: Border.all(color: t.border),
                            ),
                            child: Text(item.$2,
                                style: TextStyle(
                                  color: t.textPrimary,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  height: 1.4,
                                )),
                          ),
                        ],
                      ),
                    ),
                  ]),
                )),
              ],
            ]),
          ),
          const SizedBox(height: 20),

          // Activate button
          PremiumButton(
            label: 'Activate Mission',
            onPressed: () => _activate(),
          ),
          const SizedBox(height: 10),

          // Save as draft
          OutlinedButton(
            onPressed: () => _activate(draft: true),
            style: OutlinedButton.styleFrom(
              foregroundColor: t.textSecondary,
              side: BorderSide(color: t.border),
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppRadius.full)),
            ),
            child: const Text('Save as Draft'),
          ),
          const SizedBox(height: 10),

          // Regenerate
          TextButton(
            onPressed: _generate,
            child: Text('Regenerate Plan',
                style: TextStyle(color: t.textMuted)),
          ),
        ]),
      ),
    );
  }

  // ── STEP 4: Saving spinner ────────────────────
  Widget _buildStep4(AppTokens t) {
    return Center(
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        PulseGlow(
          child: Container(
            width: 64, height: 64,
            decoration: BoxDecoration(
              gradient:     AppGradients.lifekit,
              shape:        BoxShape.circle,
              boxShadow:    AppShadows.green,
            ),
            child: const Icon(LucideIcons.target,
                size: 28, color: Colors.white),
          ),
        ),
        const SizedBox(height: 20),
        Text('Activating your mission…',
            style: Theme.of(context).textTheme.headlineLarge),
      ]),
    );
  }

  InputDecoration _dropDecoration(AppTokens t, {String? hint}) =>
      InputDecoration(
        hintText:  hint,
        filled:    true,
        fillColor: t.backgroundSubtle,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: BorderSide(color: t.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: BorderSide(color: t.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: BorderSide(color: t.primary, width: 1.5),
        ),
        contentPadding: const EdgeInsets.symmetric(
            horizontal: 14, vertical: 14),
      );
}

// Spinning loader icon for the generation step
class _SpinningIcon extends StatefulWidget {
  const _SpinningIcon();
  @override
  State<_SpinningIcon> createState() => _SpinningIconState();
}

class _SpinningIconState extends State<_SpinningIcon>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 900),
  )..repeat();

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) => RotationTransition(
        turns: _ctrl,
        child: const Icon(LucideIcons.loader,
            size: 30, color: Colors.white),
      );
}

// Date picker button used in the mission form
class _DateButton extends StatelessWidget {
  const _DateButton({
    required this.date,
    required this.onTap,
    required this.tokens,
  });
  final DateTime? date;
  final VoidCallback onTap;
  final AppTokens tokens;

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: onTap,
        child: Container(
          height: 50,
          padding: const EdgeInsets.symmetric(horizontal: 14),
          decoration: BoxDecoration(
            color:        tokens.backgroundSubtle,
            borderRadius: BorderRadius.circular(AppRadius.md),
            border:       Border.all(color: tokens.border),
          ),
          child: Row(children: [
            Icon(LucideIcons.calendarDays,
                size: 16, color: tokens.textMuted),
            const SizedBox(width: 8),
            Text(
              date == null
                  ? 'Pick date'
                  : '${date!.day}/${date!.month}/${date!.year}',
              style: TextStyle(
                color: date == null
                    ? tokens.textMuted : tokens.textPrimary,
                fontSize: 13,
              ),
            ),
          ]),
        ),
      );
}


class _PremiumFilterChip extends StatelessWidget {
  const _PremiumFilterChip({
    required this.label, required this.selected, required this.onTap,
  });
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        height: 34,
        padding: const EdgeInsets.symmetric(horizontal: 14),
        decoration: BoxDecoration(
          color:        selected ? t.primarySurface : t.backgroundSubtle,
          borderRadius: BorderRadius.circular(AppRadius.full),
          border:       Border.all(
            color:  selected ? t.primary : t.border,
            width:  selected ? 1.5 : 1.0,
          ),
          boxShadow:    selected ? AppShadows.greenSm : null,
        ),
        child: Center(
          child: Text(label,
              style: TextStyle(
                color:      selected ? t.primary : t.textSecondary,
                fontSize:   12,
                fontWeight: FontWeight.w600,
              )),
        ),
      ),
    );
  }
}

class _MissionsEmptyState extends StatelessWidget {
  const _MissionsEmptyState({required this.onCreateTap});
  final VoidCallback onCreateTap;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Center(
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Container(
          width: 72, height: 72,
          decoration: BoxDecoration(
            color:        t.primarySurface,
            borderRadius: BorderRadius.circular(AppRadius.x2l),
          ),
          child: Icon(LucideIcons.target, size: 32, color: t.primary),
        ),
        const SizedBox(height: 16),
        Text('No missions yet',
            style: Theme.of(context).textTheme.headlineMedium),
        const SizedBox(height: 8),
        Text('Create your first mission to get started',
            style: TextStyle(color: t.textMuted, fontSize: 13)),
        const SizedBox(height: 24),
        PremiumButton(
          label:     'Create a mission',
          onPressed: onCreateTap,
          minWidth:  200,
        ),
      ]).animate().fadeIn(duration: 300.ms).scale(
            begin: const Offset(0.97, 0.97), duration: 300.ms),
    );
  }
}

class _MissionCard extends StatelessWidget {
  const _MissionCard(this.mission,
      {required this.index, required this.onDelete});
  final MissionData mission;
  final int index;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return PremiumCard(
      radius: AppRadius.x2l,
      onTap:  () => context.push('/missions/${mission.id}'),
      child:  Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          CategoryChip(mission.category),
          const SizedBox(width: 8),
          StatusBadge(mission.status),
          const Spacer(),
          GestureDetector(
            onTap: () => showModalBottomSheet(
              context: context,
              backgroundColor: t.surface,
              shape: const RoundedRectangleBorder(
                borderRadius: BorderRadius.vertical(
                    top: Radius.circular(AppRadius.lg))),
              builder: (_) => SafeArea(
                child: Column(mainAxisSize: MainAxisSize.min, children: [
                  ListTile(
                    leading: Icon(LucideIcons.pencil, color: t.textSecondary),
                    title:   const Text('Edit'),
                    onTap:   () => Navigator.pop(context),
                  ),
                  ListTile(
                    leading: Icon(LucideIcons.trash2, color: t.destructive),
                    title:   Text('Delete',
                        style: TextStyle(color: t.destructive)),
                    onTap: () {
                      Navigator.pop(context);
                      onDelete();
                    },
                  ),
                ]),
              ),
            ),
            child: Icon(LucideIcons.ellipsis,
                size: 18, color: t.textMuted),
          ),
        ]),
        const SizedBox(height: 14),
        Text(mission.title,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context).textTheme.titleLarge
                ?.copyWith(fontWeight: FontWeight.w700)),
        const SizedBox(height: 6),
        Text(mission.goal,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(color: t.textMuted, height: 1.5, fontSize: 13)),
        const SizedBox(height: 16),
        Row(children: [
          SectionLabel('PROGRESS'),
          const Spacer(),
          Text('${(mission.progress * 100).round()}%',
              style: TextStyle(
                color: t.primary, fontWeight: FontWeight.w700,
                fontSize: 14,
              )),
        ]),
        const SizedBox(height: 6),
        PremiumProgressBar(value: mission.progress),
        const SizedBox(height: 12),
        Row(children: [
          Icon(LucideIcons.calendarDays, size: 13, color: t.textMuted),
          const SizedBox(width: 5),
          Text(mission.deadline,
              style: TextStyle(color: t.textMuted, fontSize: 12)),
          const Spacer(),
          Icon(LucideIcons.chevronRight, size: 16, color: t.textMuted),
        ]),
      ]),
    ).staggered(index);
  }
}

// ════════════════════════════════════════════════════════════
// MISSION DETAIL SCREEN
// ════════════════════════════════════════════════════════════

class MissionDetailScreen extends ConsumerStatefulWidget {
  const MissionDetailScreen({required this.id, super.key});
  final String id;
  @override
  ConsumerState<MissionDetailScreen> createState() => _MissionDetailState();
}

class _MissionDetailState extends ConsumerState<MissionDetailScreen> {
  Map<String, dynamic>? _mission;
  List<TaskData> _tasks = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final id   = int.tryParse(widget.id) ?? 0;
      final repo = ref.read(repositoryProvider);
      final res  = await Future.wait([
        repo.mission(id), repo.tasks(missionId: id),
      ]);
      final m = res[0] as Map<String, dynamic>;
      setState(() {
        _mission = m;
        _tasks   = (res[1] as List<Map<String, dynamic>>)
            .map((t) => TaskData.fromJson(t, m['title'] ?? ''))
            .toList();
        _loading = false;
      });
    } catch (e) {
      setState(() { _error = e.toString(); _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    if (_loading) {
      return Scaffold(
        backgroundColor: t.background,
        body: Center(child: CircularProgressIndicator(color: t.primary)),
      );
    }
    if (_error != null) {
      return Scaffold(
        backgroundColor: t.background,
        appBar: AppBar(),
        body: Padding(
          padding: const EdgeInsets.all(20),
          child: _ApiErrorBanner(error: _error!, onRetry: _load),
        ),
      );
    }
    final m        = _mission!;
    final progress = ((m['progress'] as num?)?.toDouble() ?? 0).clamp(0.0, 100.0);
    final mission  = MissionData.fromJson(m);

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        backgroundColor: t.background,
        body: NestedScrollView(
          headerSliverBuilder: (_, __) => [
            SliverAppBar(
              expandedHeight: 200,
              pinned:         true,
              flexibleSpace:  FlexibleSpaceBar(
                background: GradientCard(
                  radius:  0,
                  padding: const EdgeInsets.fromLTRB(20, 60, 20, 20),
                  child:   Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment:  MainAxisAlignment.end,
                    children: [
                      StatusBadge(mission.status),
                      const SizedBox(height: 10),
                      Text(m['title'] ?? '',
                          style: const TextStyle(
                            color: Colors.white, fontSize: 22,
                            fontWeight: FontWeight.w800,
                          )),
                    ],
                  ),
                ),
              ),
              bottom: TabBar(
                tabs: const [
                  Tab(text: 'Overview'),
                  Tab(text: 'Tasks'),
                  Tab(text: 'AI Insights'),
                ],
                labelColor:           t.primary,
                unselectedLabelColor: t.textMuted,
                indicatorColor:       t.primary,
              ),
            ),
          ],
          body: TabBarView(children: [
            // Overview tab
            ListView(
              padding: const EdgeInsets.all(16),
              children: [
                PremiumCard(child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                  Text(m['description'] ?? m['goal'] ?? '',
                      style: TextStyle(
                          color: t.textSecondary, height: 1.6, fontSize: 14)),
                  const SizedBox(height: 16),
                  Row(children: [
                    CategoryChip(mission.category),
                    const SizedBox(width: 8),
                    PriorityBadge(mission.priority),
                  ]),
                  const SizedBox(height: 16),
                  Row(children: [
                    Text('${progress.round()}%',
                        style: TextStyle(
                          color: t.primary, fontSize: 22,
                          fontWeight: FontWeight.w800,
                        )),
                    const SizedBox(width: 8),
                    Text('progress',
                        style: TextStyle(color: t.textMuted, fontSize: 13)),
                  ]),
                  const SizedBox(height: 8),
                  PremiumProgressBar(value: progress / 100),
                ])),
              ],
            ),
            // Tasks tab
            _DetailTasksTab(tasks: _tasks, missionId: widget.id,
                onRefresh: _load),
            // AI Insights tab
            _InsightsTab(missionTitle: m['title'] ?? ''),
          ]),
        ),
      ),
    );
  }
}

class _DetailTasksTab extends ConsumerStatefulWidget {
  const _DetailTasksTab({
    required this.tasks, required this.missionId, required this.onRefresh,
  });
  final List<TaskData> tasks;
  final String missionId;
  final VoidCallback onRefresh;
  @override
  ConsumerState<_DetailTasksTab> createState() => _DetailTasksTabState();
}

class _DetailTasksTabState extends ConsumerState<_DetailTasksTab> {
  @override
  Widget build(BuildContext context) {
    return ListView(padding: const EdgeInsets.all(16), children: [
      ...widget.tasks.indexed.map((item) => _PremiumTaskRow(
            task:     item.$2,
            index:    item.$1,
            onToggle: () async {
              await ref.read(repositoryProvider)
                  .setTaskStatus(item.$2.id,
                      item.$2.done ? 'PENDING' : 'COMPLETED')
                  .catchError((_) {});
              widget.onRefresh();
            },
          )),
      const SizedBox(height: 12),
      OutlinedButton.icon(
        onPressed: () => _addTaskSheet(context),
        icon:  const Icon(LucideIcons.plus),
        label: const Text('Add task'),
      ),
    ]);
  }

  void _addTaskSheet(BuildContext ctx) {
    final titleCtrl    = TextEditingController();
    final durationCtrl = TextEditingController();
    String selectedPriority = 'medium';
    DateTime? dueDate;
    final t = ctx.tokens;

    const priorities = [
      ('low',    'Low'),
      ('medium', 'Medium'),
      ('high',   'High'),
      ('urgent', 'Urgent'),
    ];

    showModalBottomSheet(
      context: ctx,
      isScrollControlled: true,
      backgroundColor: t.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
            top: Radius.circular(AppRadius.lg))),
      builder: (sheetCtx) => StatefulBuilder(
        builder: (context, setModal) {
          final kb = MediaQuery.viewInsetsOf(context).bottom;
          return DraggableScrollableSheet(
            expand: false,
            initialChildSize: 0.75,
            minChildSize:     0.4,
            maxChildSize:     0.92,
            builder: (_, scrollCtrl) => Column(children: [
              Padding(
                padding: const EdgeInsets.only(top: 14, bottom: 8),
                child: Center(
                  child: Container(
                    width: 36, height: 4,
                    decoration: BoxDecoration(
                      color:        t.border,
                      borderRadius: BorderRadius.circular(AppRadius.full),
                    )),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 0, 24, 8),
                child: Text('Add Task',
                    style: Theme.of(context).textTheme.headlineLarge),
              ),
              Expanded(
                child: ListView(
                  controller: scrollCtrl,
                  padding: EdgeInsets.fromLTRB(24, 4, 24, kb + 24),
                  children: [
                    _SheetLabel('Task title *'),
                    const SizedBox(height: 6),
                    PremiumInputField(
                      controller: titleCtrl,
                      hint:      'e.g. Research and outline key concepts',
                    ),
                    const SizedBox(height: 14),

                    // Priority + Due date (side by side)
                    Row(crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                      Expanded(
                        child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                          _SheetLabel('Priority'),
                          const SizedBox(height: 6),
                          DropdownButtonFormField<String>(
                            initialValue: selectedPriority,
                            isDense: true,
                            decoration: InputDecoration(
                              filled:   true,
                              fillColor: t.backgroundSubtle,
                              border: OutlineInputBorder(
                                borderRadius:
                                    BorderRadius.circular(AppRadius.md),
                                borderSide: BorderSide(color: t.border),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius:
                                    BorderRadius.circular(AppRadius.md),
                                borderSide: BorderSide(color: t.border),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius:
                                    BorderRadius.circular(AppRadius.md),
                                borderSide:
                                    BorderSide(color: t.primary, width: 1.5),
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 14),
                            ),
                            items: priorities
                                .map((p) => DropdownMenuItem(
                                      value: p.$1,
                                      child: Text(p.$2),
                                    ))
                                .toList(),
                            onChanged: (v) => setModal(
                                () => selectedPriority = v ?? 'medium'),
                          ),
                        ]),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                          _SheetLabel('Due date'),
                          const SizedBox(height: 6),
                          GestureDetector(
                            onTap: () async {
                              final picked = await showDatePicker(
                                context: context,
                                initialDate: dueDate ?? DateTime.now(),
                                firstDate: DateTime.now()
                                    .subtract(const Duration(days: 1)),
                                lastDate: DateTime.now()
                                    .add(const Duration(days: 3650)),
                              );
                              if (picked != null) {
                                setModal(() => dueDate = picked);
                              }
                            },
                            child: Container(
                              height: 50,
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10),
                              decoration: BoxDecoration(
                                color:        t.backgroundSubtle,
                                borderRadius: BorderRadius.circular(
                                    AppRadius.md),
                                border: Border.all(color: t.border),
                              ),
                              child: Row(children: [
                                Icon(LucideIcons.calendarDays,
                                    size: 15, color: t.textMuted),
                                const SizedBox(width: 6),
                                Flexible(
                                  child: Text(
                                    dueDate == null
                                        ? 'Pick date'
                                        : '${dueDate!.day}/${dueDate!.month}/${dueDate!.year}',
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      color: dueDate == null
                                          ? t.textMuted : t.textPrimary,
                                      fontSize: 13,
                                    ),
                                  ),
                                ),
                              ]),
                            ),
                          ),
                        ]),
                      ),
                    ]),
                    const SizedBox(height: 14),

                    _SheetLabel('Est. duration (minutes)'),
                    const SizedBox(height: 6),
                    PremiumInputField(
                      controller:   durationCtrl,
                      hint:         'e.g. 45',
                      keyboardType: TextInputType.number,
                    ),
                    const SizedBox(height: 24),

                    PremiumButton(
                      label: 'Save Task',
                      onPressed: () async {
                        final title = titleCtrl.text.trim();
                        if (title.isEmpty) return;
                        final mId = int.tryParse(widget.missionId) ?? 0;
                        Navigator.of(sheetCtx).pop();
                        await ref.read(repositoryProvider)
                            .createTask(
                              missionId: mId,
                              title:     title,
                              priority:  selectedPriority,
                              description: dueDate != null
                                  ? 'Due: ${dueDate!.day}/${dueDate!.month}/${dueDate!.year}'
                                  : '',
                            )
                            .catchError((_) => <String, dynamic>{});
                        widget.onRefresh();
                      },
                    ),
                  ],
                ),
              ),
            ]),
          );
        },
      ),
    );
  }
}

class _InsightsTab extends ConsumerStatefulWidget {
  const _InsightsTab({required this.missionTitle});
  final String missionTitle;
  @override
  ConsumerState<_InsightsTab> createState() => _InsightsTabState();
}

class _InsightsTabState extends ConsumerState<_InsightsTab> {
  String? _insight;
  bool    _loading = false;

  Future<void> _fetch() async {
    setState(() { _loading = true; _insight = null; });
    try {
      final result = await ref.read(repositoryProvider).runAgent(
        agentType:   'COACH',
        userInput:   'Give strategic insights for: ${widget.missionTitle}',
        contextData: {'missionTitle': widget.missionTitle},
      );
      setState(() {
        _insight = result['output']?.toString() ??
            'No insights available right now.';
        _loading = false;
      });
    } catch (e) {
      setState(() { _insight = 'Error: $e'; _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return ListView(padding: const EdgeInsets.all(16), children: [
      if (_loading)
        Center(child: CircularProgressIndicator(color: t.primary)),
      if (_insight != null)
        PremiumCard(child: Column(
            crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Icon(LucideIcons.wandSparkles, color: t.primary, size: 18),
            const SizedBox(width: 8),
            Text('AI Insights',
                style: Theme.of(context).textTheme.titleLarge),
          ]),
          const SizedBox(height: 12),
          Text(_insight!,
              style: TextStyle(color: t.textSecondary, height: 1.6)),
        ])),
      if (_insight == null && !_loading)
        Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
          const SizedBox(height: 32),
          Container(
            width: 60, height: 60,
            decoration: BoxDecoration(
              gradient: AppGradients.lifekit,
              borderRadius: BorderRadius.circular(AppRadius.xl),
              boxShadow: AppShadows.greenSm,
            ),
            child: const Icon(LucideIcons.sparkles,
                color: Colors.white, size: 26),
          ),
          const SizedBox(height: 16),
          Text('Get AI insights',
              style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 8),
          Text('Powered by your LifeKit AI Coach',
              style: TextStyle(color: t.textMuted, fontSize: 13)),
          const SizedBox(height: 20),
          PremiumButton(
              label: 'Generate insights',
              onPressed: _fetch,
              minWidth: 200),
        ])),
    ]);
  }
}

// ════════════════════════════════════════════════════════════
// TASKS SCREEN
// ════════════════════════════════════════════════════════════

class TasksScreen extends ConsumerStatefulWidget {
  const TasksScreen({super.key});
  @override
  ConsumerState<TasksScreen> createState() => _TasksScreenState();
}

class _TasksScreenState extends ConsumerState<TasksScreen> {
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (ref.read(tasksProvider).isEmpty) _loadTasks();
    });
  }

  Future<void> _loadTasks() async {
    setState(() => _loading = true);
    try {
      final repo     = ref.read(repositoryProvider);
      var missions   = ref.read(missionsProvider);
      if (missions.isEmpty) {
        final rawM = await repo.missions();
        missions   = rawM.map(MissionData.fromJson).toList();
        ref.read(missionsProvider.notifier).state = missions;
      }
      if (missions.isEmpty) { setState(() => _loading = false); return; }
      final results = await Future.wait(
        missions.take(5).map((m) =>
            repo.tasks(missionId: m.id)
                .catchError((_) => <Map<String, dynamic>>[])),
      );
      ref.read(tasksProvider.notifier).state = results.indexed
          .expand((item) => item.$2
              .map((t) => TaskData.fromJson(t, missions[item.$1].title)))
          .toList();
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    final tasks = ref.watch(tasksProvider);
    final t     = context.tokens;

    final stats = [
      (tasks.length,                                  'Total',       t.primary),
      (tasks.where((t) => t.status == 'In Progress').length, 'In Progress', t.info),
      (tasks.where((t) => t.priority == 'high' ||
                          t.priority == 'urgent').length,    'High Priority', t.warning),
      (tasks.where((t) => t.done).length,             'Done',        t.success),
    ];

    return Scaffold(
      backgroundColor: t.background,
      floatingActionButton: FloatingActionButton(
        onPressed:       () => _addTaskSheet(context, tasks),
        backgroundColor: t.primary,
        child:           const Icon(Icons.add, color: Colors.white),
      ),
      body: SafeArea(
        child: Column(children: [
          _PageHeading('Tasks',
              subtitle: 'Protect your momentum.',
              actions: [
                IconButton(
                  onPressed: _loadTasks,
                  icon: Icon(LucideIcons.refreshCw,
                      size: 18, color: t.textSecondary),
                ),
              ]).pageEntrance(),

          // Stat chips — use IntrinsicHeight so cards size to their content
          SizedBox(
            height: 90,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: stats.indexed.map((item) => SizedBox(
                    width: 115,
                    child: Padding(
                      padding: const EdgeInsets.only(right: 10, bottom: 2),
                      child: PremiumCard(
                        radius:  AppRadius.lg,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 10),
                        child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                          FittedBox(
                            fit: BoxFit.scaleDown,
                            alignment: Alignment.centerLeft,
                            child: Text('${item.$2.$1}',
                                style: TextStyle(
                                  fontSize: 22, fontWeight: FontWeight.w800,
                                  color: item.$2.$3,
                                )),
                          ),
                          const SizedBox(height: 2),
                          Text(item.$2.$2,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 10, fontWeight: FontWeight.w700,
                                color: t.textSecondary,
                              )),
                        ]),
                      ).staggered(item.$1),
                    ),
                  )).toList(),
            ),
          ),
          const SizedBox(height: 8),

          if (_loading)
            LinearProgressIndicator(color: t.primary, minHeight: 2,
                backgroundColor: t.backgroundSubtle),

          Expanded(
            child: tasks.isEmpty
                ? Center(child: Column(
                    mainAxisSize: MainAxisSize.min, children: [
                  Icon(LucideIcons.squareCheck,
                      size: 52, color: t.textMuted),
                  const SizedBox(height: 12),
                  Text('No tasks yet',
                      style: TextStyle(color: t.textMuted)),
                ]))
                : RefreshIndicator(
                    onRefresh: _loadTasks, color: t.primary,
                    child: ListView.builder(
                      padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
                      itemCount: tasks.length,
                      itemBuilder: (_, i) {
                        final task = tasks[i];
                        return Dismissible(
                          key:        ValueKey('${task.id}_$i'),
                          background: Container(
                            color: t.success,
                            alignment: Alignment.centerLeft,
                            padding: const EdgeInsets.only(left: 20),
                            child: const Icon(LucideIcons.check,
                                color: Colors.white),
                          ),
                          secondaryBackground: Container(
                            color: t.destructive,
                            alignment: Alignment.centerRight,
                            padding: const EdgeInsets.only(right: 20),
                            child: const Icon(LucideIcons.trash2,
                                color: Colors.white),
                          ),
                          confirmDismiss: (dir) async {
                            if (dir == DismissDirection.endToStart) {
                              await ref.read(repositoryProvider)
                                  .deleteTask(task.id)
                                  .catchError((_) {});
                              _loadTasks();
                              return true;
                            }
                            await ref.read(repositoryProvider)
                                .setTaskStatus(task.id, 'COMPLETED')
                                .catchError((_) {});
                            _loadTasks();
                            return false;
                          },
                          child: _PremiumTaskRow(
                            task:     task,
                            index:    i,
                            onToggle: () async {
                              await ref.read(repositoryProvider)
                                  .setTaskStatus(task.id,
                                      task.done ? 'PENDING' : 'COMPLETED')
                                  .catchError((_) {});
                              _loadTasks();
                            },
                          ),
                        );
                      },
                    ),
                  ),
          ),
        ]),
      ),
    );
  }

  void _addTaskSheet(BuildContext ctx, List<TaskData> tasks) {
    final titleCtrl    = TextEditingController();
    final durationCtrl = TextEditingController();
    final missions     = ref.read(missionsProvider);
    int?   selectedMissionId = missions.isNotEmpty ? missions.first.id : null;
    String selectedPriority  = 'medium';
    DateTime? dueDate;
    final t = ctx.tokens;

    const priorities = [
      ('low',    'Low'),
      ('medium', 'Medium'),
      ('high',   'High'),
      ('urgent', 'Urgent'),
    ];

    showModalBottomSheet(
      context: ctx,
      isScrollControlled: true,
      backgroundColor: t.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
            top: Radius.circular(AppRadius.lg))),
      builder: (sheetCtx) => StatefulBuilder(
        builder: (context, setModal) {
          final kb = MediaQuery.viewInsetsOf(context).bottom;
          return DraggableScrollableSheet(
            expand: false,
            initialChildSize: 0.85,
            minChildSize:     0.5,
            maxChildSize:     0.95,
            builder: (_, scrollCtrl) => Column(children: [
              Padding(
                padding: const EdgeInsets.only(top: 14, bottom: 8),
                child: Center(
                  child: Container(
                    width: 36, height: 4,
                    decoration: BoxDecoration(
                      color:        t.border,
                      borderRadius: BorderRadius.circular(AppRadius.full),
                    )),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 0, 24, 8),
                child: Row(children: [
                  Container(
                    width: 32, height: 32,
                    decoration: BoxDecoration(
                      gradient:     AppGradients.lifekit,
                      borderRadius: BorderRadius.circular(AppRadius.sm),
                    ),
                    child: const Icon(LucideIcons.squareCheck,
                        size: 16, color: Colors.white),
                  ),
                  const SizedBox(width: 10),
                  Text('New Task',
                      style: Theme.of(context).textTheme.headlineLarge),
                ]),
              ),
              Expanded(
                child: ListView(
                  controller: scrollCtrl,
                  padding: EdgeInsets.fromLTRB(24, 4, 24, kb + 24),
                  children: [
                    // Task title
                    _SheetLabel('Task title *'),
                    const SizedBox(height: 6),
                    PremiumInputField(
                      controller: titleCtrl,
                      hint:      'e.g. Complete React advanced patterns module',
                    ),
                    const SizedBox(height: 14),

                    // Mission selector
                    if (missions.isNotEmpty) ...[
                      _SheetLabel('Mission *'),
                      const SizedBox(height: 6),
                      DropdownButtonFormField<int>(
                        initialValue: selectedMissionId,
                        decoration: InputDecoration(
                          filled:   true,
                          fillColor: t.backgroundSubtle,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppRadius.md),
                            borderSide: BorderSide(color: t.border),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppRadius.md),
                            borderSide: BorderSide(color: t.border),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppRadius.md),
                            borderSide:
                                BorderSide(color: t.primary, width: 1.5),
                          ),
                          contentPadding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 14),
                        ),
                        items: missions
                            .map((m) => DropdownMenuItem(
                                  value: m.id,
                                  child: Text(m.title,
                                      overflow: TextOverflow.ellipsis),
                                ))
                            .toList(),
                        onChanged: (v) =>
                            setModal(() => selectedMissionId = v),
                      ),
                      const SizedBox(height: 14),
                    ],

                    // Priority + Due date (side by side)
                    Row(crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                      Expanded(
                        child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                          _SheetLabel('Priority'),
                          const SizedBox(height: 6),
                          DropdownButtonFormField<String>(
                            initialValue: selectedPriority,
                            isDense: true,
                            decoration: InputDecoration(
                              filled:   true,
                              fillColor: t.backgroundSubtle,
                              border: OutlineInputBorder(
                                borderRadius:
                                    BorderRadius.circular(AppRadius.md),
                                borderSide: BorderSide(color: t.border),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius:
                                    BorderRadius.circular(AppRadius.md),
                                borderSide: BorderSide(color: t.border),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius:
                                    BorderRadius.circular(AppRadius.md),
                                borderSide:
                                    BorderSide(color: t.primary, width: 1.5),
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 14),
                            ),
                            items: priorities
                                .map((p) => DropdownMenuItem(
                                      value: p.$1,
                                      child: Text(p.$2),
                                    ))
                                .toList(),
                            onChanged: (v) => setModal(
                                () => selectedPriority = v ?? 'medium'),
                          ),
                        ]),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                          _SheetLabel('Due date'),
                          const SizedBox(height: 6),
                          GestureDetector(
                            onTap: () async {
                              final picked = await showDatePicker(
                                context: context,
                                initialDate: dueDate ?? DateTime.now(),
                                firstDate: DateTime.now()
                                    .subtract(const Duration(days: 1)),
                                lastDate: DateTime.now()
                                    .add(const Duration(days: 3650)),
                              );
                              if (picked != null) {
                                setModal(() => dueDate = picked);
                              }
                            },
                            child: Container(
                              height: 50,
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10),
                              decoration: BoxDecoration(
                                color:        t.backgroundSubtle,
                                borderRadius: BorderRadius.circular(
                                    AppRadius.md),
                                border: Border.all(color: t.border),
                              ),
                              child: Row(children: [
                                Icon(LucideIcons.calendarDays,
                                    size: 15, color: t.textMuted),
                                const SizedBox(width: 6),
                                Flexible(
                                  child: Text(
                                    dueDate == null
                                        ? 'Pick date'
                                        : '${dueDate!.day}/${dueDate!.month}/${dueDate!.year}',
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      color: dueDate == null
                                          ? t.textMuted : t.textPrimary,
                                      fontSize: 13,
                                    ),
                                  ),
                                ),
                              ]),
                            ),
                          ),
                        ]),
                      ),
                    ]),
                    const SizedBox(height: 14),

                    // Estimated duration
                    _SheetLabel('Est. duration (minutes)'),
                    const SizedBox(height: 6),
                    PremiumInputField(
                      controller:   durationCtrl,
                      hint:         'e.g. 60',
                      keyboardType: TextInputType.number,
                    ),
                    const SizedBox(height: 24),

                    PremiumButton(
                      label: 'Create Task',
                      onPressed: () async {
                        final title = titleCtrl.text.trim();
                        if (title.isEmpty || selectedMissionId == null) return;
                        final mId = selectedMissionId!;
                        final dur = int.tryParse(durationCtrl.text.trim());
                        Navigator.of(sheetCtx).pop();
                        await ref.read(repositoryProvider)
                            .createTask(
                              missionId:   mId,
                              title:       title,
                              priority:    selectedPriority,
                              description: dueDate != null
                                  ? 'Due: ${dueDate!.day}/${dueDate!.month}/${dueDate!.year}'
                                  : '',
                            )
                            .catchError((_) => <String, dynamic>{});
                        // If a duration was provided, patch the task
                        if (dur != null && dur > 0) {
                          // best-effort update — ignore error
                          ref.read(repositoryProvider)
                              .tasks(missionId: mId)
                              .then((list) {
                            if (list.isNotEmpty) {
                              final newId = TaskData._parseInt(
                                  list.last['id'] ?? list.last['task_id']);
                              if (newId > 0) {
                                ref.read(repositoryProvider).updateTask(
                                    newId, {'estimatedDurationMinutes': dur});
                              }
                            }
                          }).catchError((_) {});
                        }
                        _loadTasks();
                      },
                    ),
                  ],
                ),
              ),
            ]),
          );
        },
      ),
    );
  }
}

// ════════════════════════════════════════════════════════════
// AI COACH SCREEN
// ════════════════════════════════════════════════════════════

class ChatMessage {
  ChatMessage(this.text, this.isUser);
  final String text;
  final bool isUser;
}

final chatProvider = StateProvider<List<ChatMessage>>((ref) => const []);

class AiCoachScreen extends ConsumerStatefulWidget {
  const AiCoachScreen({super.key});
  @override
  ConsumerState<AiCoachScreen> createState() => _AiCoachScreenState();
}

class _AiCoachScreenState extends ConsumerState<AiCoachScreen> {
  final _input  = TextEditingController();
  final _scroll = ScrollController();
  bool _sending = false;

  @override
  void dispose() {
    _input.dispose(); _scroll.dispose(); super.dispose();
  }

  Future<void> _send(String text) async {
    final value = text.trim();
    if (value.isEmpty || _sending) return;
    _input.clear();
    ref.read(chatProvider.notifier).state = [
      ...ref.read(chatProvider), ChatMessage(value, true),
    ];
    setState(() => _sending = true);
    _scrollToBottom();

    try {
      final missions = ref.read(missionsProvider);
      final result   = await ref.read(repositoryProvider).runAgent(
        agentType:   'COACH',
        userInput:   value,
        contextData: missions.isEmpty ? {}
            : {'missionTitle': missions.first.title},
      );
      final ok    = result['success'] != false;
      final reply = result['output']?.toString() ??
          'I\'m here to help. Ask me about your missions or goals.';
      if (!ok) throw Exception(reply);
      ref.read(chatProvider.notifier).state = [
        ...ref.read(chatProvider), ChatMessage(reply, false),
      ];
    } catch (_) {
      ref.read(chatProvider.notifier).state = [
        ...ref.read(chatProvider),
        ChatMessage('The AI service is currently unavailable.', false),
      ];
    }
    if (mounted) setState(() => _sending = false);
    _scrollToBottom();
  }

  void _scrollToBottom() => WidgetsBinding.instance.addPostFrameCallback((_) {
    if (_scroll.hasClients) {
      _scroll.animateTo(_scroll.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut);
    }
  });

  @override
  Widget build(BuildContext context) {
    final messages = ref.watch(chatProvider);
    final t        = context.tokens;

    return MeshBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        resizeToAvoidBottomInset: true,
        appBar: PreferredSize(
          preferredSize: const Size.fromHeight(64),
          child: ClipRect(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
              child: AppBar(
                backgroundColor: t.surface.withValues(alpha: 0.85),
                elevation: 0,
                titleSpacing: 0,
                title: Row(children: [
                  // Pulsing bot avatar
                  PulseGlow(
                    child: Container(
                      width: 32, height: 32,
                      decoration: BoxDecoration(
                        gradient:     AppGradients.lifekit,
                        borderRadius: BorderRadius.circular(AppRadius.sm),
                        boxShadow:    AppShadows.greenSm,
                      ),
                      child: const Icon(LucideIcons.bot,
                          size: 16, color: Colors.white),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Column(crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                    Text('AI Coach',
                        style: Theme.of(context).textTheme.titleMedium),
                    // Online chip
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 7, vertical: 1),
                      decoration: BoxDecoration(
                        color:        t.statusActiveBg,
                        borderRadius: BorderRadius.circular(AppRadius.full),
                      ),
                      child: Row(mainAxisSize: MainAxisSize.min, children: [
                        Container(width: 5, height: 5,
                            decoration: BoxDecoration(
                              color: t.statusActiveFg,
                              shape: BoxShape.circle,
                            )),
                        const SizedBox(width: 4),
                        Text('Online',
                            style: TextStyle(
                              color: t.statusActiveFg, fontSize: 9,
                              fontWeight: FontWeight.w700,
                            )),
                      ]),
                    ),
                  ]),
                ]),
                actions: [
                  if (messages.isNotEmpty)
                    IconButton(
                      onPressed: () =>
                          ref.read(chatProvider.notifier).state = const [],
                      icon: Icon(LucideIcons.trash2,
                          size: 18, color: t.textSecondary),
                    ),
                ],
              ),
            ),
          ),
        ),
        body: SafeArea(
          top: false,
          child: Column(children: [
            // Context chips
            Consumer(builder: (ctx, r, _) {
              final m = r.watch(missionsProvider);
              if (m.isEmpty) return const SizedBox.shrink();
              return SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(
                    horizontal: 14, vertical: 8),
                child: Row(children: [
                  GlassCard(
                    radius:  AppRadius.full,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 6),
                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                      Icon(LucideIcons.target, size: 12,
                          color: t.primary),
                      const SizedBox(width: 6),
                      Text(m.first.title,
                          style: TextStyle(
                            color: t.textPrimary, fontSize: 12,
                            fontWeight: FontWeight.w600,
                          )),
                    ]),
                  ),
                  const SizedBox(width: 8),
                  GlassCard(
                    radius: AppRadius.full,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 6),
                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                      Icon(LucideIcons.brain, size: 12, color: t.info),
                      const SizedBox(width: 6),
                      Text('Memory active',
                          style: TextStyle(
                            color: t.textPrimary, fontSize: 12,
                            fontWeight: FontWeight.w600,
                          )),
                    ]),
                  ),
                ]),
              );
            }),

            // Messages list
            Expanded(
              child: messages.isEmpty
                  ? _SuggestedPrompts(onTap: _send)
                  : ListView.builder(
                      controller: _scroll,
                      padding:    const EdgeInsets.all(16),
                      itemCount:  messages.length + (_sending ? 1 : 0),
                      itemBuilder: (_, i) {
                        if (_sending && i == messages.length) {
                          return _TypingBubble(tokens: t);
                        }
                        return _ChatBubble(messages[i], tokens: t);
                      },
                    ),
            ),

            // Input bar — glass style
            ClipRect(
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
                child: Container(
                  padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
                  decoration: BoxDecoration(
                    color:  t.surface.withValues(alpha: 0.9),
                    border: Border(
                        top: BorderSide(color: t.border)),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Expanded(
                        child: Container(
                          constraints:
                              const BoxConstraints(maxHeight: 120),
                          decoration: BoxDecoration(
                            color:        t.backgroundSubtle,
                            borderRadius: BorderRadius.circular(AppRadius.lg),
                            border:       Border.all(color: t.border),
                          ),
                          child: TextField(
                            controller: _input,
                            minLines:   1,
                            maxLines:   5,
                            decoration: InputDecoration(
                              hintText:       'Ask your AI Coach…',
                              border:         InputBorder.none,
                              enabledBorder:  InputBorder.none,
                              focusedBorder:  InputBorder.none,
                              contentPadding: const EdgeInsets.symmetric(
                                  horizontal: 14, vertical: 12),
                              hintStyle: TextStyle(
                                  color: t.textMuted, fontSize: 14),
                            ),
                            onSubmitted: _send,
                            textInputAction: TextInputAction.send,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      // Send button
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        width: 44, height: 44,
                        decoration: BoxDecoration(
                          gradient:     _sending
                              ? null : AppGradients.lifekit,
                          color:        _sending
                              ? t.backgroundSubtle : null,
                          shape:        BoxShape.circle,
                          boxShadow:    _sending
                              ? null : AppShadows.greenSm,
                        ),
                        child: Material(
                          color:  Colors.transparent,
                          shape:  const CircleBorder(),
                          child:  InkWell(
                            customBorder: const CircleBorder(),
                            onTap: _sending
                                ? null
                                : () => _send(_input.text),
                            child: Center(
                              child: _sending
                                  ? SizedBox(
                                      width: 18, height: 18,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: t.primary,
                                      ),
                                    )
                                  : const Icon(LucideIcons.send,
                                      size: 18, color: Colors.white),
                            ),
                          ),
                        ),
                      ),
                    ],
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

class _ChatBubble extends StatelessWidget {
  const _ChatBubble(this.message, {required this.tokens});
  final ChatMessage message;
  final AppTokens tokens;

  @override
  Widget build(BuildContext context) {
    final isUser = message.isUser;
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isUser) ...[
            Container(
              width: 28, height: 28,
              decoration: BoxDecoration(
                gradient: AppGradients.lifekit,
                shape:    BoxShape.circle,
              ),
              child: const Icon(LucideIcons.bot,
                  size: 14, color: Colors.white),
            ),
            const SizedBox(width: 8),
          ],
          Container(
            constraints: BoxConstraints(
              maxWidth: MediaQuery.sizeOf(context).width * 0.72,
            ),
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              gradient:     isUser ? AppGradients.lifekit : null,
              color:        isUser ? null : tokens.surface,
              borderRadius: BorderRadius.only(
                topLeft:     Radius.circular(isUser ? AppRadius.xl : 4),
                topRight:    Radius.circular(isUser ? 4 : AppRadius.xl),
                bottomLeft:  const Radius.circular(AppRadius.xl),
                bottomRight: const Radius.circular(AppRadius.xl),
              ),
              border:     isUser ? null
                  : Border.all(color: tokens.cardBorder),
              boxShadow:  isUser ? AppShadows.greenSm : AppShadows.card,
            ),
            child: Text(
              message.text,
              style: TextStyle(
                color:  isUser ? Colors.white : tokens.textPrimary,
                height: 1.55, fontSize: 14,
              ),
            ),
          ).animate()
              .fadeIn(duration: 250.ms)
              .slideX(
                begin: isUser ? 0.08 : -0.08,
                end:   0,
                duration: 250.ms,
              ),
          if (isUser) const SizedBox(width: 4),
        ],
      ),
    );
  }
}

class _TypingBubble extends StatelessWidget {
  const _TypingBubble({required this.tokens});
  final AppTokens tokens;

  @override
  Widget build(BuildContext context) => Align(
        alignment: Alignment.centerLeft,
        child: Row(mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.end, children: [
          Container(
            width: 28, height: 28,
            decoration: BoxDecoration(
              gradient: AppGradients.lifekit, shape: BoxShape.circle,
            ),
            child: const Icon(LucideIcons.bot,
                size: 14, color: Colors.white),
          ),
          const SizedBox(width: 8),
          Container(
            margin:  const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.symmetric(
                horizontal: 18, vertical: 14),
            decoration: BoxDecoration(
              color:        tokens.surface,
              borderRadius: const BorderRadius.only(
                topLeft:     Radius.circular(4),
                topRight:    Radius.circular(AppRadius.xl),
                bottomLeft:  Radius.circular(AppRadius.xl),
                bottomRight: Radius.circular(AppRadius.xl),
              ),
              border: Border.all(color: tokens.cardBorder),
              boxShadow: AppShadows.card,
            ),
            child: BouncingDots(color: tokens.primary),
          ),
        ]),
      );
}

class _SuggestedPrompts extends StatelessWidget {
  const _SuggestedPrompts({required this.onTap});
  final ValueChanged<String> onTap;

  static const _prompts = [
    'Help me plan my week',
    'Review my mission progress',
    'What should I focus on today?',
    'Suggest tasks for my current mission',
  ];

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient:     AppGradients.lifekit,
              shape:        BoxShape.circle,
              boxShadow:    AppShadows.green,
            ),
            child: const Icon(LucideIcons.bot,
                size: 36, color: Colors.white),
          ).animate().scale(
                begin: const Offset(0.8, 0.8),
                duration: 400.ms,
                curve: Curves.easeOutBack,
              ),
          const SizedBox(height: 20),
          Text('What can we move forward?',
              style: Theme.of(context).textTheme.headlineLarge,
              textAlign: TextAlign.center),
          const SizedBox(height: 6),
          Text(
            'Ask about your missions, tasks, or goals.',
            textAlign: TextAlign.center,
            style: TextStyle(color: t.textMuted, height: 1.5, fontSize: 13),
          ),
          const SizedBox(height: 24),
          ..._prompts.indexed.map((item) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: GlassCard(
                  radius: AppRadius.lg,
                  padding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 12),
                  child: GestureDetector(
                    onTap: () => onTap(item.$2),
                    behavior: HitTestBehavior.opaque,
                    child: Row(children: [
                      Icon(LucideIcons.sparkles,
                          size: 14, color: t.primary),
                      const SizedBox(width: 10),
                      Expanded(child: Text(item.$2,
                          style: TextStyle(
                            color: t.textPrimary,
                            fontWeight: FontWeight.w500,
                            fontSize: 13,
                          ))),
                      Icon(LucideIcons.arrowRight,
                          size: 14, color: t.textMuted),
                    ]),
                  ),
                ).staggered(item.$1),
              )),
        ]),
      ),
    );
  }
}

// ════════════════════════════════════════════════════════════
// PROFILE SCREEN
// ════════════════════════════════════════════════════════════

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});
  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  Map<String, dynamic> _profile = {};
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final p = await ref.read(repositoryProvider).profile();
      setState(() { _profile = p; _loading = false; });
      ref.read(profileProvider.notifier).state = p;
    } catch (_) { setState(() => _loading = false); }
  }

  String get _initials {
    final name = (_profile['fullName'] ?? _profile['full_name'] ?? 'U')
        .toString().trim();
    final parts = name.split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.substring(0, name.length.clamp(1, 2)).toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final t        = context.tokens;
    final missions = ref.watch(missionsProvider);
    final tasks    = ref.watch(tasksProvider);
    final name     = (_profile['fullName'] ??
        _profile['full_name'] ?? 'User').toString();
    final email    = (_profile['email'] ?? '').toString();

    if (_loading) {
      return Scaffold(
        backgroundColor: t.background,
        body: Center(child: CircularProgressIndicator(color: t.primary)),
      );
    }

    return Scaffold(
      backgroundColor: t.background,
      body: SafeArea(
        child: CustomScrollView(slivers: [
          // Header
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 12, 0),
              child: Row(children: [
                Text('Profile',
                    style: Theme.of(context)
                        .textTheme
                        .displaySmall
                        ?.copyWith(color: t.textPrimary)),
                const Spacer(),
                IconButton(
                  onPressed: () => context.push('/settings'),
                  icon: Icon(LucideIcons.settings,
                      size: 20, color: t.textSecondary),
                ),
              ]).pageEntrance(),
            ),
          ),

          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
            sliver: SliverList.list(children: [
              // Avatar card
              PremiumCard(
                child: Column(children: [
                  Container(
                    width: 76, height: 76,
                    decoration: BoxDecoration(
                      gradient:    AppGradients.lifekit,
                      shape:       BoxShape.circle,
                      boxShadow:   AppShadows.greenSm,
                    ),
                    child: Center(
                      child: Text(_initials,
                          style: const TextStyle(
                            color: Colors.white, fontSize: 26,
                            fontWeight: FontWeight.w800,
                          )),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(name,
                      style: Theme.of(context).textTheme.headlineLarge),
                  const SizedBox(height: 4),
                  Text(email,
                      style: TextStyle(
                          color: t.textMuted, fontSize: 13)),
                ]),
              ).pageEntrance(),
              const SizedBox(height: 16),

              // Stat row
              Row(children: [
                Expanded(child: _StatCard(
                    '${missions.length}', 'Missions', LucideIcons.target)),
                const SizedBox(width: 10),
                Expanded(child: _StatCard(
                    '${tasks.length}', 'Tasks', LucideIcons.squareCheck)),
                const SizedBox(width: 10),
                Expanded(child: _StatCard(
                    '${tasks.where((t) => t.done).length}', 'Done',
                    LucideIcons.checkCheck)),
              ]).staggered(1),
              const SizedBox(height: 16),

              // Nav tiles
              PremiumCard(
                padding: EdgeInsets.zero,
                child: Column(children: [
                  _NavTile(LucideIcons.target,     'Missions',
                      () => context.go('/missions')),
                  _NavTile(LucideIcons.bot,         'AI Coach',
                      () => context.go('/ai-coach')),
                  _NavTile(LucideIcons.brain,        'Memory',
                      () => context.push('/memory')),
                  _NavTile(LucideIcons.telescope,    'Opportunities',
                      () => context.push('/opportunities')),
                  _NavTile(LucideIcons.store,        'Marketplace',
                      () => context.push('/marketplace')),
                  _NavTile(LucideIcons.barChart2,    'Analytics',
                      () => context.push('/analytics')),
                  _NavTile(LucideIcons.calendarRange,'Planner',
                      () => context.push('/planner')),
                  _NavTile(LucideIcons.users,        'Agents',
                      () => context.push('/agents')),
                  _NavTile(LucideIcons.settings,     'Settings',
                      () => context.push('/settings')),
                ]),
              ).staggered(2),
              const SizedBox(height: 16),

              // Sign out
              GestureDetector(
                onTap: () async {
                  await ref.read(authProvider.notifier).signOut();
                  if (mounted) context.go('/auth/sign-in');
                },
                child: Container(
                  height: 52,
                  decoration: BoxDecoration(
                    color:        t.destructiveSurface,
                    borderRadius: BorderRadius.circular(AppRadius.full),
                    border: Border.all(
                        color: t.destructive.withValues(alpha: 0.4)),
                  ),
                  child: Center(
                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                      Icon(LucideIcons.logOut,
                          size: 16, color: t.destructive),
                      const SizedBox(width: 8),
                      Text('Sign out',
                          style: TextStyle(
                            color:      t.destructive,
                            fontWeight: FontWeight.w700,
                            fontSize:   14,
                          )),
                    ]),
                  ),
                ),
              ).staggered(3),
            ]),
          ),
        ]),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard(this.value, this.label, this.icon);
  final String value, label;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return PremiumCard(
      radius:  AppRadius.lg,
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
      child: Column(children: [
        Icon(icon, color: t.primary, size: 18),
        const SizedBox(height: 8),
        Text(value,
            style: TextStyle(
              fontSize:    20,
              fontWeight:  FontWeight.w800,
              color:       t.textPrimary,
            )),
        const SizedBox(height: 2),
        Text(label,
            style: TextStyle(
              fontSize:  10,
              color:     t.textMuted,
              fontWeight: FontWeight.w600,
            )),
      ]),
    );
  }
}

class _NavTile extends StatelessWidget {
  const _NavTile(this.icon, this.label, this.onTap);
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return ListTile(
      leading:  Icon(icon, color: t.primary, size: 20),
      title:    Text(label,
          style: TextStyle(
            color: t.textPrimary, fontWeight: FontWeight.w500,
            fontSize: 14,
          )),
      trailing: Icon(LucideIcons.chevronRight,
          size: 16, color: t.textMuted),
      onTap:    onTap,
    );
  }
}

// ════════════════════════════════════════════════════════════
// ONBOARDING SCREEN (kept functional, lightly styled)
// ════════════════════════════════════════════════════════════

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});
  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingState();
}

class _OnboardingState extends ConsumerState<OnboardingScreen> {
  int    _step     = 0;
  String _userType = 'Professional';
  final  _focuses  = <String>{'Career'};
  final  _goalCtrl = TextEditingController();
  double _hours    = 8;
  bool   _saving   = false;

  @override
  void dispose() { _goalCtrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Scaffold(
      backgroundColor: t.background,
      body: SafeArea(
        child: Column(children: [
          // Progress bar
          Padding(
            padding: const EdgeInsets.all(20),
            child: Row(children: [
              for (var i = 0; i < 7; i++)
                Expanded(
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 220),
                    height: 4,
                    margin: const EdgeInsets.all(3),
                    decoration: BoxDecoration(
                      gradient: i <= _step
                          ? AppGradients.lifekit : null,
                      color: i <= _step
                          ? null : t.backgroundSubtle,
                      borderRadius: BorderRadius.circular(AppRadius.full),
                    ),
                  ),
                ),
            ]),
          ),

          Expanded(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 250),
              child: SingleChildScrollView(
                key:     ValueKey(_step),
                padding: const EdgeInsets.all(24),
                child:   _stepWidget(),
              ),
            ),
          ),

          if (_step != 5)
            Padding(
              padding: const EdgeInsets.all(20),
              child: Row(children: [
                if (_step > 0)
                  TextButton(
                    onPressed: () => setState(() => _step--),
                    child: Text('Back',
                        style: TextStyle(color: t.textSecondary)),
                  ),
                const Spacer(),
                PremiumButton(
                  label:     _step == 6 ? 'Launch my mission' : 'Continue',
                  loading:   _saving,
                  onPressed: _next,
                  minWidth:  160,
                ),
              ]),
            ),
        ]),
      ),
    );
  }

  Widget _stepWidget() => switch (_step) {
    0 => _OnboardWelcome(),
    1 => _OnboardUserType(
        selected: _userType,
        onSelect: (v) => setState(() => _userType = v)),
    2 => _OnboardFocus(
        selected: _focuses,
        onToggle: (v, on) =>
            setState(() => on ? _focuses.add(v) : _focuses.remove(v))),
    3 => _OnboardGoal(ctrl: _goalCtrl),
    4 => _OnboardPrefs(
        hours:         _hours,
        onHoursChange: (v) => setState(() => _hours = v)),
    5 => const _OnboardAnalysis(),
    _ => _OnboardPreview(goal: _goalCtrl.text),
  };

  Future<void> _next() async {
    if (_step == 5) return;
    if (_step == 6) {
      setState(() => _saving = true);
      final goal = _goalCtrl.text.trim();
      if (goal.isNotEmpty) {
        await ref.read(repositoryProvider)
            .createMission(title: goal, description: goal)
            .catchError((_) => <String, dynamic>{});
      }
      setState(() => _saving = false);
      if (mounted) context.go('/home');
      return;
    }
    setState(() => _step++);
    if (_step == 5) {
      await Future.delayed(const Duration(seconds: 3));
      if (mounted) setState(() => _step = 6);
    }
  }
}

class _OnboardWelcome extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      GradientCard(
        radius:  AppRadius.x2l,
        padding: const EdgeInsets.all(24),
        child: const Icon(LucideIcons.leaf, color: Colors.white, size: 48),
      ),
      const SizedBox(height: 24),
      Text('Your AI-powered\nlife OS',
          style: Theme.of(context)
              .textTheme
              .displayLarge
              ?.copyWith(color: t.textPrimary, height: 1.1)),
      const SizedBox(height: 12),
      Text(
        'LifeKit turns your goals into structured missions, intelligent plans, and daily actions — powered by specialist AI.',
        style: TextStyle(color: t.textMuted, height: 1.6),
      ),
    ]);
  }
}

class _OnboardUserType extends StatelessWidget {
  const _OnboardUserType({required this.selected, required this.onSelect});
  final String selected;
  final ValueChanged<String> onSelect;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('What describes you?',
          style: Theme.of(context).textTheme.displayMedium),
      const SizedBox(height: 8),
      Text('This shapes your recommendations.',
          style: TextStyle(color: t.textMuted)),
      const SizedBox(height: 24),
      GridView.count(
        shrinkWrap: true,
        physics:    const NeverScrollableScrollPhysics(),
        crossAxisCount: 2,
        childAspectRatio: 1.4,
        mainAxisSpacing:  12,
        crossAxisSpacing: 12,
        children: ['Professional','Student','Founder','Family']
            .map((type) => GestureDetector(
                  onTap: () => onSelect(type),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    decoration: BoxDecoration(
                      color:        selected == type
                          ? t.primarySurface : t.surface,
                      borderRadius: BorderRadius.circular(AppRadius.xl),
                      border: Border.all(
                        color: selected == type ? t.primary : t.border,
                        width: selected == type ? 2.0 : 1.0,
                      ),
                      boxShadow: selected == type
                          ? AppShadows.greenSm : AppShadows.xs,
                    ),
                    child: Center(
                      child: Text(type,
                          style: TextStyle(
                            fontWeight: FontWeight.w700,
                            color: selected == type
                                ? t.primary : t.textPrimary,
                          )),
                    ),
                  ),
                ))
            .toList(),
      ),
    ]);
  }
}

class _OnboardFocus extends StatelessWidget {
  const _OnboardFocus({required this.selected, required this.onToggle});
  final Set<String> selected;
  final void Function(String, bool) onToggle;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Choose your focus areas',
          style: Theme.of(context).textTheme.displayMedium),
      const SizedBox(height: 8),
      Text('Pick as many as matter right now.',
          style: TextStyle(color: t.textMuted)),
      const SizedBox(height: 24),
      Wrap(spacing: 8, runSpacing: 8, children: [
        for (final f in [
          'Career','Education','Business','Finance',
          'Health','Technology','Lifestyle','Relationships'
        ])
          _PremiumFilterChip(
            label:    f,
            selected: selected.contains(f),
            onTap:    () => onToggle(f, !selected.contains(f)),
          ),
      ]),
    ]);
  }
}

class _OnboardGoal extends StatelessWidget {
  const _OnboardGoal({required this.ctrl});
  final TextEditingController ctrl;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('What matters most?',
          style: Theme.of(context).textTheme.displayMedium),
      const SizedBox(height: 8),
      Text('Describe the most important thing you want to achieve.',
          style: TextStyle(color: t.textMuted)),
      const SizedBox(height: 24),
      PremiumInputField(
        controller: ctrl,
        hint:       'I want to…',
        maxLines:   6, minLines: 4,
      ),
    ]);
  }
}

class _OnboardPrefs extends StatelessWidget {
  const _OnboardPrefs({required this.hours, required this.onHoursChange});
  final double hours;
  final ValueChanged<double> onHoursChange;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Shape your plan',
          style: Theme.of(context).textTheme.displayMedium),
      const SizedBox(height: 8),
      Text('Choose a pace that feels sustainable.',
          style: TextStyle(color: t.textMuted)),
      const SizedBox(height: 24),
      Text('${hours.round()} hours per week',
          style: TextStyle(
            fontWeight: FontWeight.w700, color: t.textPrimary)),
      Slider(
        value:     hours,
        min: 1, max: 40, divisions: 39,
        onChanged:   onHoursChange,
      ),
    ]);
  }
}

class _OnboardAnalysis extends StatelessWidget {
  const _OnboardAnalysis();
  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Building your roadmap…',
          style: Theme.of(context).textTheme.displayMedium),
      const SizedBox(height: 8),
      Text('Analyzing your goals, schedule, and preferences.',
          style: TextStyle(color: t.textMuted)),
      const SizedBox(height: 56),
      Center(
        child: PulseGlow(
          child: Container(
            width: 80, height: 80,
            decoration: BoxDecoration(
              gradient:     AppGradients.lifekit,
              shape:        BoxShape.circle,
              boxShadow:    AppShadows.green,
            ),
            child: const Icon(LucideIcons.wandSparkles,
                color: Colors.white, size: 32),
          ),
        ),
      ),
      const SizedBox(height: 24),
      Center(child: Text('This will only take a moment…',
          style: TextStyle(color: t.textMuted))),
    ]);
  }
}

class _OnboardPreview extends StatelessWidget {
  const _OnboardPreview({required this.goal});
  final String goal;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Your first mission is ready',
          style: Theme.of(context).textTheme.displayMedium),
      const SizedBox(height: 8),
      Text('A focused roadmap built around your goals.',
          style: TextStyle(color: t.textMuted)),
      const SizedBox(height: 24),
      GradientCard(
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color:        Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(AppRadius.full),
            ),
            child: const Text('MISSION PREVIEW',
                style: TextStyle(
                  color: Colors.white, fontSize: 10,
                  fontWeight: FontWeight.w700, letterSpacing: 0.8,
                )),
          ),
          const SizedBox(height: 12),
          Text(
            goal.isEmpty ? 'Your first mission'
                : (goal.length > 60 ? '${goal.substring(0, 60)}…' : goal),
            style: const TextStyle(
              color: Colors.white, fontSize: 18,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 14),
          const Text(
            '○  Define your success criteria\n\n'
            '○  Break into weekly milestones\n\n'
            '○  Track daily progress',
            style: TextStyle(color: Colors.white70, height: 1.6),
          ),
          const SizedBox(height: 14),
          const Text('Estimated: 12 weeks',
              style: TextStyle(color: Colors.white60, fontSize: 12)),
        ]),
      ),
    ]);
  }
}

// ════════════════════════════════════════════════════════════
// FEATURE SCREEN (generic live-data screen)
// ════════════════════════════════════════════════════════════

class FeatureScreen extends ConsumerStatefulWidget {
  const FeatureScreen({required this.path, super.key});
  final String path;
  @override
  ConsumerState<FeatureScreen> createState() => _FeatureScreenState();
}

class _FeatureScreenState extends ConsumerState<FeatureScreen> {
  List<Map<String, dynamic>> _items = [];
  bool   _loading = false;
  String? _error;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final repo  = ref.read(repositoryProvider);
      final items = await switch (widget.path) {
        '/memory'          => repo.memories(),
        '/opportunities'   => repo.opportunities(),
        '/marketplace'     => repo.marketplace(),
        '/notifications'   => repo.notifications(),
        '/agents'          => repo.agents(),
        '/planner'         => repo.plans(),
        '/recommendations' => repo.recommendations(),
        _ => Future.value(const <Map<String, dynamic>>[]),
      };
      setState(() { _items = items; _loading = false; });
    } catch (e) {
      setState(() { _error = e.toString(); _loading = false; });
    }
  }

  String get _title => widget.path
      .split('/')
      .where((e) => e.isNotEmpty)
      .map((e) => '${e[0].toUpperCase()}${e.substring(1)}')
      .join(' · ');

  @override
  Widget build(BuildContext context) {
    if (widget.path == '/analytics') return const _AnalyticsScreen();
    if (widget.path == '/settings')  return const _SettingsScreen();

    final t = context.tokens;
    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(title: Text(_title)),
      floatingActionButton: widget.path == '/memory'
          ? FloatingActionButton.extended(
              onPressed:       () => _addMemorySheet(context),
              icon:            const Icon(LucideIcons.plus),
              label:           const Text('Add Memory'),
              backgroundColor: t.primary,
              foregroundColor: Colors.white,
            )
          : null,
      body: _loading
          ? Center(child: CircularProgressIndicator(color: t.primary))
          : _error != null
              ? Padding(
                  padding: const EdgeInsets.all(20),
                  child: _ApiErrorBanner(error: _error!, onRetry: _load))
              : RefreshIndicator(
                  onRefresh: _load,
                  color:     t.primary,
                  child: _items.isEmpty
                      ? Center(child: Column(
                          mainAxisSize: MainAxisSize.min, children: [
                        Icon(LucideIcons.inbox,
                            size: 52, color: t.textMuted),
                        const SizedBox(height: 12),
                        Text('No ${_title.toLowerCase()} yet',
                            style: TextStyle(color: t.textMuted)),
                      ]))
                      : ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: _items.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(height: 10),
                          itemBuilder: (_, i) => _ItemCard(
                            _items[i], widget.path,
                            index:    i,
                            onDelete: () async {
                              final id = _parseInt(
                                  _items[i]['id'] ??
                                  _items[i]['memory_id'] ??
                                  _items[i]['notification_id']);
                              if (id == 0) return;
                              final repo = ref.read(repositoryProvider);
                              if (widget.path == '/memory') {
                                await repo.deleteMemory(id)
                                    .catchError((_) {});
                              } else if (widget.path == '/notifications') {
                                await repo.deleteNotification(id)
                                    .catchError((_) {});
                              }
                              _load();
                            },
                          ),
                        ),
                ),
    );
  }

  void _addMemorySheet(BuildContext ctx) {
    final ctrl = TextEditingController();
    final t    = ctx.tokens;
    showModalBottomSheet(
      context: ctx, isScrollControlled: true,
      backgroundColor: t.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
            top: Radius.circular(AppRadius.lg))),
      builder: (sheetCtx) => Padding(
        padding: EdgeInsets.fromLTRB(24, 20, 24,
            MediaQuery.viewInsetsOf(sheetCtx).bottom + 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Add Memory',
                style: Theme.of(sheetCtx).textTheme.headlineLarge),
            const SizedBox(height: 16),
            PremiumInputField(
              controller: ctrl,
              label:      'What do you want to remember?',
              maxLines:   4, minLines: 3,
              autofocus:  true,
            ),
            const SizedBox(height: 16),
            PremiumButton(
              label:     'Save memory',
              onPressed: () async {
                if (ctrl.text.trim().isEmpty) return;
                final content = ctrl.text.trim();
                Navigator.of(sheetCtx).pop();
                await ref.read(repositoryProvider)
                    .createMemory(content: content)
                    .catchError((_) => <String, dynamic>{});
                _load();
              },
            ),
          ],
        ),
      ),
    );
  }

  static int _parseInt(dynamic v) {
    if (v is int) return v;
    return int.tryParse(v?.toString() ?? '') ?? 0;
  }
}

class _ItemCard extends StatelessWidget {
  const _ItemCard(this.item, this.path,
      {required this.index, required this.onDelete});
  final Map<String, dynamic> item;
  final String path;
  final int index;
  final VoidCallback onDelete;

  String _title() {
    for (final k in ['title','content','name','message']) {
      final v = item[k];
      if (v is String && v.isNotEmpty) return v;
    }
    return 'Item';
  }

  String _subtitle() {
    for (final k in ['description','body','domain','category','type']) {
      final v = item[k];
      if (v is String && v.isNotEmpty) return v;
    }
    return '';
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return PremiumCard(
      child: Row(children: [
        Expanded(child: Column(
            crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(_title(),
              style: TextStyle(
                fontWeight: FontWeight.w600, color: t.textPrimary)),
          if (_subtitle().isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(_subtitle(),
                maxLines: 2, overflow: TextOverflow.ellipsis,
                style: TextStyle(color: t.textMuted, fontSize: 12)),
          ],
        ])),
        if (path == '/memory' || path == '/notifications')
          IconButton(
            onPressed: onDelete,
            icon: Icon(LucideIcons.trash2,
                size: 16, color: t.textMuted),
          )
        else
          Icon(LucideIcons.chevronRight,
              size: 16, color: t.textMuted),
      ]),
    ).staggered(index);
  }
}

// ════════════════════════════════════════════════════════════
// ANALYTICS SCREEN
// ════════════════════════════════════════════════════════════

class _AnalyticsScreen extends ConsumerWidget {
  const _AnalyticsScreen();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final missions = ref.watch(missionsProvider);
    final tasks    = ref.watch(tasksProvider);
    final done     = tasks.where((t) => t.done).length;
    final rate     = tasks.isEmpty ? 0 : (done * 100 ~/ tasks.length);
    final t        = context.tokens;

    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(title: const Text('Analytics')),
      body: ListView(padding: const EdgeInsets.all(16), children: [
        Row(children: [
          Expanded(child: PremiumCard(child: Column(children: [
            Text('$rate%',
                style: Theme.of(context).textTheme.displayMedium
                    ?.copyWith(color: t.primary)),
            Text('Completion', style: TextStyle(color: t.textMuted)),
          ]))),
          const SizedBox(width: 12),
          Expanded(child: PremiumCard(child: Column(children: [
            Text('${tasks.length}',
                style: Theme.of(context).textTheme.displayMedium
                    ?.copyWith(color: t.primary)),
            Text('Total tasks', style: TextStyle(color: t.textMuted)),
          ]))),
        ]),
        const SizedBox(height: 16),
        PremiumCard(child: Column(
            crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Task completion',
              style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 16),
          SizedBox(
            height: 180,
            child: BarChart(BarChartData(
              gridData:    const FlGridData(show: false),
              titlesData:  const FlTitlesData(show: false),
              borderData:  FlBorderData(show: false),
              barGroups: [
                for (var i = 0; i < 7; i++)
                  BarChartGroupData(x: i, barRods: [
                    BarChartRodData(
                      toY: (i < tasks.length
                              ? (tasks[i].done ? 1.0 : 0.5)
                              : 0.2) * 10,
                      gradient: AppGradients.lifekit,
                      width: 16,
                      borderRadius: BorderRadius.circular(6),
                    ),
                  ]),
              ],
            )),
          ),
        ])),
        const SizedBox(height: 16),
        if (missions.isNotEmpty)
          PremiumCard(child: Column(
              crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Mission progress',
                style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 12),
            ...missions.take(5).map((m) => Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                    Row(children: [
                      Expanded(child: Text(m.title,
                          maxLines: 1, overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            color: t.textPrimary,
                          ))),
                      Text('${(m.progress * 100).round()}%',
                          style: TextStyle(
                            color: t.primary, fontWeight: FontWeight.w700,
                          )),
                    ]),
                    const SizedBox(height: 6),
                    PremiumProgressBar(value: m.progress),
                  ]),
                )),
          ])),
      ]),
    );
  }
}

// ════════════════════════════════════════════════════════════
// SETTINGS SCREEN
// ════════════════════════════════════════════════════════════

class _SettingsScreen extends ConsumerWidget {
  const _SettingsScreen();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.tokens;
    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(padding: const EdgeInsets.all(16), children: [
        PremiumCard(padding: EdgeInsets.zero, child: Column(children: [
          ListTile(
            leading: Icon(LucideIcons.languages, color: t.primary, size: 20),
            title:   const Text('Language'),
            trailing: Text('English',
                style: TextStyle(color: t.textMuted, fontSize: 13)),
          ),
          Divider(color: t.border, height: 1),
          ListTile(
            leading: Icon(LucideIcons.indianRupee, color: t.primary, size: 20),
            title:   const Text('Currency'),
            trailing: Text('INR',
                style: TextStyle(color: t.textMuted, fontSize: 13)),
          ),
          Divider(color: t.border, height: 1),
          ListTile(
            leading: Icon(LucideIcons.palette, color: t.primary, size: 20),
            title:   const Text('Appearance'),
            trailing: DropdownButton<ThemeMode>(
              value:     ref.watch(themeModeProvider),
              underline: const SizedBox(),
              items: const [
                DropdownMenuItem(value: ThemeMode.system,
                    child: Text('System')),
                DropdownMenuItem(value: ThemeMode.light,
                    child: Text('Light')),
                DropdownMenuItem(value: ThemeMode.dark,
                    child: Text('Dark')),
              ],
              onChanged: (v) {
                if (v != null) {
                  ref.read(themeModeProvider.notifier).state = v;
                }
              },
            ),
          ),
        ])),
        const SizedBox(height: 12),
        PremiumCard(padding: EdgeInsets.zero, child: Column(children: [
          SwitchListTile(
            value:    true,
            onChanged: null,
            title:    const Text('AI Memory'),
            subtitle: const Text('Use saved context for better coaching'),
            activeThumbColor: t.primary,
          ),
          Divider(color: t.border, height: 1),
          SwitchListTile(
            value:    true,
            onChanged: null,
            title:    const Text('Auto-suggestions'),
            activeThumbColor: t.primary,
          ),
          Divider(color: t.border, height: 1),
          ListTile(
            leading: Icon(LucideIcons.shieldCheck, color: t.primary, size: 20),
            title:   const Text('Privacy & security'),
            trailing: Icon(LucideIcons.chevronRight,
                size: 16, color: t.textMuted),
          ),
        ])),
        const SizedBox(height: 12),
        GestureDetector(
          onTap: () async {
            await ref.read(authProvider.notifier).signOut();
            if (context.mounted) context.go('/auth/sign-in');
          },
          child: Container(
            height: 52,
            decoration: BoxDecoration(
              color:        t.destructiveSurface,
              borderRadius: BorderRadius.circular(AppRadius.full),
              border: Border.all(
                  color: t.destructive.withValues(alpha: 0.4)),
            ),
            child: Center(child: Row(
                mainAxisSize: MainAxisSize.min, children: [
              Icon(LucideIcons.logOut,
                  size: 16, color: t.destructive),
              const SizedBox(width: 8),
              Text('Sign out',
                  style: TextStyle(
                    color: t.destructive, fontWeight: FontWeight.w700,
                    fontSize: 14,
                  )),
            ])),
          ),
        ),
      ]),
    );
  }
}

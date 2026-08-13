// ignore_for_file: use_build_context_synchronously
import 'dart:ui';

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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// DATA MODELS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

class MissionData {
  const MissionData({
    required this.id,
    required this.title,
    required this.goal,
    required this.category,
    required this.status,
    required this.priority,
    required this.progress,
    required this.deadline,
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
      title: (j['title'] ?? '').toString(),
      goal: (j['description'] ?? j['goal'] ?? '').toString(),
      category: (j['category'] ?? j['missionCategory'] ?? '').toString(),
      status: _normalizeStatus(j['status']?.toString()),
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
      'PAUSED' => 'Paused',
      'COMPLETED' || 'DONE' => 'Completed',
      'DRAFT' => 'Draft',
      'AT_RISK' => 'At Risk',
      'ARCHIVED' => 'Archived',
      _ => s,
    };
  }
}

class TaskData {
  TaskData({
    required this.id,
    required this.missionId,
    required this.title,
    required this.missionTitle,
    required this.priority,
    required this.minutes,
    required this.status,
    this.done = false,
  });
  final int id, missionId;
  final String title, missionTitle, priority;
  final int minutes;
  String status;
  bool done;

  factory TaskData.fromJson(Map<String, dynamic> j, String missionTitle) {
    final rawStatus = (j['status'] ?? 'PENDING').toString().toUpperCase();
    return TaskData(
      id: _parseInt(j['id'] ?? j['task_id']),
      missionId: _parseInt(j['mission_id'] ?? j['missionId']),
      title: (j['title'] ?? '').toString(),
      missionTitle: missionTitle,
      priority: (j['priority'] ?? 'medium').toString().toLowerCase(),
      minutes: ((j['estimated_time'] ?? j['estimatedDurationMinutes']) as num?)
              ?.toInt() ??
          30,
      status: switch (rawStatus) {
        'IN_PROGRESS' => 'In Progress',
        'COMPLETED' => 'Done',
        'REVIEW' => 'Review',
        _ => 'To Do',
      },
      done: rawStatus == 'COMPLETED',
    );
  }

  static int _parseInt(dynamic v) {
    if (v is int) return v;
    return int.tryParse(v?.toString() ?? '') ?? 0;
  }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// STATE PROVIDERS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

final missionsProvider = StateProvider<List<MissionData>>((ref) => const []);
final tasksProvider = StateProvider<List<TaskData>>((ref) => const []);
final profileProvider = StateProvider<Map<String, dynamic>>((ref) => const {});
final notifCountProvider = StateProvider<int>((ref) => 0);

// â”€â”€ UX feature providers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
/// Search query string for Missions screen.
final missionsSearchProvider = StateProvider<String>((ref) => '');

/// Search query string for Tasks screen.
final tasksSearchProvider = StateProvider<String>((ref) => '');

/// Whether the completed tasks section is expanded on Tasks screen.
final completedTasksExpandedProvider = StateProvider<bool>((ref) => false);

/// Tracks which one-time feature-discovery tooltips have been shown.
/// Keys: 'mission_menu', 'ai_insights_tab'
final tooltipSeenProvider = StateProvider<Map<String, bool>>((ref) => const {});

final dashboardProvider = FutureProvider<void>((ref) async {
  final repo = ref.watch(repositoryProvider);
  final results = await Future.wait([
    repo.missions().catchError((_) => <Map<String, dynamic>>[]),
    repo.profile().catchError((_) => <String, dynamic>{}),
    repo.unreadNotificationCount().catchError((_) => 0),
  ]);
  final rawMissions = results[0] as List<Map<String, dynamic>>;
  ref.read(profileProvider.notifier).state = results[1] as Map<String, dynamic>;
  ref.read(notifCountProvider.notifier).state = results[2] as int;
  final missions = rawMissions.map(MissionData.fromJson).toList();
  ref.read(missionsProvider.notifier).state = missions;
  if (missions.isNotEmpty) {
    final taskResults = await Future.wait(
      missions.take(3).map((m) => repo
          .tasks(missionId: m.id)
          .catchError((_) => <Map<String, dynamic>>[])),
    );
    final allTasks = taskResults.indexed
        .expand((item) =>
            item.$2.map((t) => TaskData.fromJson(t, missions[item.$1].title)))
        .toList();
    ref.read(tasksProvider.notifier).state = allTasks;
  }
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// SHARED WIDGETS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

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
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(
              title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context).textTheme.displaySmall?.copyWith(
                    color: t.textPrimary,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -1.0,
                  ),
            ),
            if (subtitle != null) ...[
              const SizedBox(height: 3),
              Text(
                subtitle!,
                style: TextStyle(
                  color: t.textMuted,
                  fontSize: 13,
                  height: 1.4,
                ),
              ),
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
        color: t.destructiveSurface,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: t.destructive.withValues(alpha: 0.3)),
      ),
      child: Row(children: [
        Icon(LucideIcons.wifiOff, color: t.destructive, size: 18),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            msg.length > 120 ? '${msg.substring(0, 120)}â€¦' : msg,
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
          fontSize: 12,
          fontWeight: FontWeight.w700,
          color: t.textSecondary,
          letterSpacing: 0.1,
        ));
  }
}

class _PremiumTaskRow extends StatelessWidget {
  const _PremiumTaskRow({
    required this.task,
    required this.index,
    required this.onToggle,
  });
  final TaskData task;
  final int index;
  final VoidCallback onToggle;

  Color _priorityColor(AppTokens t) => switch (task.priority) {
        'urgent' => t.priorityUrgentFg,
        'high' => t.priorityHighFg,
        'medium' => t.priorityMedFg,
        _ => t.textMuted,
      };

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final brightness = Theme.of(context).brightness;

    return GestureDetector(
      onTap: onToggle,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: t.surface,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(color: t.border),
          boxShadow: AppElevation.level1(brightness),
        ),
        child: Row(children: [
          // Priority left strip
          Container(
            width: 3,
            height: 36,
            decoration: BoxDecoration(
              color: _priorityColor(t),
              borderRadius: BorderRadius.circular(AppRadius.full),
            ),
          ),
          const SizedBox(width: 12),
          // Checkbox â€” bounces on completion
          GestureDetector(
            onTap: onToggle,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 20,
              height: 20,
              decoration: BoxDecoration(
                color: task.done ? t.primary : Colors.transparent,
                borderRadius: BorderRadius.circular(6),
                border: Border.all(
                  color: task.done ? t.primary : t.border,
                  width: 1.5,
                ),
              ),
              child: task.done
                  ? const Icon(LucideIcons.check, size: 12, color: Colors.white)
                      .animate()
                      .scale(
                        begin: const Offset(0.8, 0.8),
                        end: const Offset(1.0, 1.0),
                        duration: 200.ms,
                        curve: Curves.elasticOut,
                      )
                  : null,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              AnimatedDefaultTextStyle(
                duration: const Duration(milliseconds: 300),
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                  color: task.done ? t.textMuted : t.textPrimary,
                  decoration: task.done
                      ? TextDecoration.lineThrough
                      : TextDecoration.none,
                  decorationColor: t.textMuted,
                  letterSpacing: -0.2,
                ),
                child: Text(
                  task.title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(height: 1),
              Text(
                task.missionTitle,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(color: t.textMuted, fontSize: 11),
              ),
            ]),
          ),
          const SizedBox(width: 8),
          // Duration chip
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
            decoration: BoxDecoration(
              color: t.backgroundSubtle,
              borderRadius: BorderRadius.circular(AppRadius.full),
            ),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              Icon(LucideIcons.clock3, size: 10, color: t.textMuted),
              const SizedBox(width: 3),
              Text(
                '${task.minutes}m',
                style: TextStyle(
                  color: t.textMuted,
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ]),
          ),
        ]),
      ),
    ).staggered(index);
  }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// UX SHARED WIDGETS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  INLINE ERROR STATE  (replaces full-screen red banner)
//  Icon in muted circle + title + subtitle.
//  Pull-to-refresh is the recovery gesture â€” no button.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class _InlineErrorState extends StatelessWidget {
  const _InlineErrorState({this.title = 'Something went wrong'});
  final String title;
  static const String subtitle =
      'Check your connection and pull down to refresh';

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 48),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: t.backgroundSubtle,
              border: Border.all(color: t.border),
            ),
            child: Icon(LucideIcons.wifiOff, size: 26, color: t.textMuted),
          ),
          const SizedBox(height: 18),
          Text(
            title,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: t.textPrimary,
              fontWeight: FontWeight.w700,
              fontSize: 16,
              letterSpacing: -0.3,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            subtitle,
            textAlign: TextAlign.center,
            style: TextStyle(color: t.textMuted, fontSize: 13, height: 1.6),
          ),
        ]).animate().fadeIn(duration: 300.ms),
      ),
    );
  }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  GROUPED SECTION HEADER
//  UPPERCASE label + count + optional thin divider above.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class _GroupedSectionHeader extends StatelessWidget {
  const _GroupedSectionHeader(this.label, {this.count, this.topPadding = 20});
  final String label;
  final int? count;
  final double topPadding;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Padding(
      padding: EdgeInsets.only(top: topPadding, left: 0, right: 0, bottom: 8),
      child: Row(children: [
        Text(
          count != null
              ? '${label.toUpperCase()} ($count)'
              : label.toUpperCase(),
          style: TextStyle(
            color: t.textSecondary,
            fontSize: 11,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.8,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(child: Divider(color: t.border, height: 1, thickness: 1)),
      ]),
    );
  }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  SEARCH BAR  (animated height 0 â†’ 52)
//  Caller controls visibility with [visible].
//  [onChanged] fires on every keystroke.
//  [onDismiss] is called when the X is tapped.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class _SearchBar extends StatefulWidget {
  const _SearchBar({
    required this.visible,
    required this.onChanged,
    required this.onDismiss,
    this.hint = 'Searchâ€¦',
  });
  final bool visible;
  final ValueChanged<String> onChanged;
  final VoidCallback onDismiss;
  final String hint;

  @override
  State<_SearchBar> createState() => _SearchBarState();
}

class _SearchBarState extends State<_SearchBar> {
  final _ctrl = TextEditingController();

  @override
  void didUpdateWidget(_SearchBar old) {
    super.didUpdateWidget(old);
    // Auto-focus when becoming visible
    if (widget.visible && !old.visible) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) FocusScope.of(context).requestFocus(_focusNode);
      });
    }
    // Clear on hide
    if (!widget.visible && old.visible) {
      _ctrl.clear();
      widget.onChanged('');
    }
  }

  final _focusNode = FocusNode();

  @override
  void dispose() {
    _ctrl.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return AnimatedSize(
      duration: const Duration(milliseconds: 280),
      curve: Curves.easeOutCubic,
      child: widget.visible
          ? Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
              child: Container(
                height: 44,
                decoration: BoxDecoration(
                  color: t.surface,
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  border: Border.all(color: t.primary, width: 1.5),
                  boxShadow: [
                    BoxShadow(
                      color: t.primary.withValues(alpha: 0.15),
                      blurRadius: 8,
                    ),
                  ],
                ),
                child: Row(children: [
                  const SizedBox(width: 12),
                  Icon(LucideIcons.search, size: 16, color: t.textMuted),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: _ctrl,
                      focusNode: _focusNode,
                      onChanged: widget.onChanged,
                      textInputAction: TextInputAction.search,
                      style: TextStyle(fontSize: 14, color: t.textPrimary),
                      decoration: InputDecoration(
                        hintText: widget.hint,
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        contentPadding: EdgeInsets.zero,
                        isDense: true,
                        hintStyle: TextStyle(color: t.textMuted, fontSize: 14),
                      ),
                    ),
                  ),
                  if (_ctrl.text.isNotEmpty)
                    GestureDetector(
                      onTap: () {
                        _ctrl.clear();
                        widget.onChanged('');
                      },
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        child:
                            Icon(LucideIcons.x, size: 16, color: t.textMuted),
                      ),
                    )
                  else
                    GestureDetector(
                      onTap: widget.onDismiss,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        child: Text(
                          'Cancel',
                          style: TextStyle(
                              color: t.primary,
                              fontSize: 12,
                              fontWeight: FontWeight.w600),
                        ),
                      ),
                    ),
                ]),
              ),
            )
          : const SizedBox.shrink(),
    );
  }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  SHIMMER SKELETON WIDGETS
//  Animate a gradient sweep leftâ†’right using
// Skeleton shimmer box — uses an explicit AnimationController so the repeating
// animation is safely stopped in dispose() and never fires on a dead element.
// DO NOT use .animate(onPlay:) here: flutter_animate creates an internal
// GlobalKey for the onPlay callback which causes "Duplicate GlobalKey" crashes
// when the widget rebuilds (e.g. list scroll, parent setState).
class _SkeletonBox extends StatefulWidget {
  const _SkeletonBox({
    this.width,
    this.height = 14,
    this.radius = AppRadius.sm,
  });
  final double? width;
  final double height;
  final double radius;

  @override
  State<_SkeletonBox> createState() => _SkeletonBoxState();
}

class _SkeletonBoxState extends State<_SkeletonBox>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1200),
  )..repeat();

  late final Animation<double> _anim = Tween<double>(
    begin: -1.5,
    end: 1.5,
  ).animate(CurvedAnimation(parent: _ctrl, curve: Curves.linear));

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final base = isDark ? const Color(0xFF252525) : const Color(0xFFEEEEEE);
    final shine = isDark ? const Color(0xFF333333) : const Color(0xFFF8F8F8);

    return AnimatedBuilder(
      animation: _anim,
      builder: (_, __) => Container(
        width: widget.width,
        height: widget.height,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(widget.radius),
          gradient: LinearGradient(
            begin: Alignment(_anim.value - 1, 0),
            end: Alignment(_anim.value, 0),
            colors: [base, shine, base],
          ),
        ),
      ),
    );
  }
}

/// Skeleton for a single mission card
class _SkeletonMissionCard extends StatelessWidget {
  const _SkeletonMissionCard();
  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: t.cardBg,
        borderRadius: BorderRadius.circular(AppRadius.x2l),
        border: Border.all(color: t.cardBorder),
      ),
      child:
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: const [
        Row(children: [
          _SkeletonBox(width: 64, height: 22, radius: AppRadius.full),
          SizedBox(width: 8),
          _SkeletonBox(width: 56, height: 22, radius: AppRadius.full),
        ]),
        SizedBox(height: 14),
        _SkeletonBox(height: 16, radius: AppRadius.sm),
        SizedBox(height: 6),
        _SkeletonBox(width: 200, height: 13),
        SizedBox(height: 16),
        _SkeletonBox(height: 6, radius: AppRadius.full),
        SizedBox(height: 12),
        _SkeletonBox(width: 100, height: 13),
      ]),
    );
  }
}

/// Skeleton for a single task row
class _SkeletonTaskRow extends StatelessWidget {
  const _SkeletonTaskRow();
  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: t.surface,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: t.border),
      ),
      child: Row(children: const [
        _SkeletonBox(width: 3, height: 36, radius: AppRadius.full),
        SizedBox(width: 12),
        _SkeletonBox(width: 20, height: 20, radius: 6),
        SizedBox(width: 12),
        Expanded(
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            _SkeletonBox(height: 14),
            SizedBox(height: 4),
            _SkeletonBox(width: 100, height: 11),
          ]),
        ),
        SizedBox(width: 8),
        _SkeletonBox(width: 36, height: 24, radius: AppRadius.full),
      ]),
    );
  }
}

/// Skeleton for the Home hero card
class _SkeletonHeroCard extends StatelessWidget {
  const _SkeletonHeroCard();
  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: t.primarySurface,
        borderRadius: BorderRadius.circular(AppRadius.x3l),
        border: Border.all(color: t.border),
      ),
      child:
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: const [
        Row(children: [
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            _SkeletonBox(width: 80, height: 14),
            SizedBox(height: 6),
            _SkeletonBox(width: 160, height: 30, radius: AppRadius.sm),
          ]),
          Spacer(),
          _SkeletonBox(width: 48, height: 48, radius: 24),
        ]),
        SizedBox(height: 12),
        _SkeletonBox(height: 14),
        SizedBox(height: 4),
        _SkeletonBox(width: 220, height: 14),
        SizedBox(height: 18),
        Row(children: [
          _SkeletonBox(width: 110, height: 36, radius: AppRadius.full),
          SizedBox(width: 10),
          _SkeletonBox(width: 90, height: 36, radius: AppRadius.full),
        ]),
      ]),
    );
  }
}

/// Skeleton for a metric card
class _SkeletonMetricCard extends StatelessWidget {
  const _SkeletonMetricCard();
  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: t.cardBg,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: t.cardBorder),
      ),
      child:
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: const [
        _SkeletonBox(width: 48, height: 48, radius: 18),
        SizedBox(height: 14),
        _SkeletonBox(width: 56, height: 28, radius: AppRadius.sm),
        SizedBox(height: 4),
        _SkeletonBox(width: 70, height: 10),
        SizedBox(height: 2),
        _SkeletonBox(width: 90, height: 10),
      ]),
    );
  }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  QUICK ACTION BAR
//  Floating pill with 3 shortcut buttons,
//  pinned above the system nav bar.
//  Rendered inside a Stack so it floats over the list.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class _QuickActionBar extends StatelessWidget {
  const _QuickActionBar({
    required this.onAddTask,
    required this.onNewMission,
    required this.onAskAI,
  });
  final VoidCallback onAddTask;
  final VoidCallback onNewMission;
  final VoidCallback onAskAI;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Positioned(
      left: 24,
      right: 24,
      bottom: 16 + MediaQuery.of(context).padding.bottom,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(AppRadius.full),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
          child: Container(
            height: 56,
            decoration: BoxDecoration(
              color: t.surface.withValues(alpha: 0.90),
              borderRadius: BorderRadius.circular(AppRadius.full),
              border: Border.all(color: t.border),
              boxShadow: AppElevation.level2(Theme.of(context).brightness),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _QuickBtn(
                  icon: LucideIcons.plus,
                  label: 'Task',
                  color: t.primary,
                  onTap: onAddTask,
                ),
                Container(width: 1, height: 24, color: t.border),
                _QuickBtn(
                  icon: LucideIcons.target,
                  label: 'Mission',
                  color: t.info,
                  onTap: onNewMission,
                ),
                Container(width: 1, height: 24, color: t.border),
                _QuickBtn(
                  icon: LucideIcons.sparkles,
                  label: 'Ask AI',
                  color: t.warning,
                  onTap: onAskAI,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _QuickBtn extends StatefulWidget {
  const _QuickBtn({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  @override
  State<_QuickBtn> createState() => _QuickBtnState();
}

class _QuickBtnState extends State<_QuickBtn> {
  bool _pressed = false;
  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) {
        setState(() => _pressed = false);
        widget.onTap();
      },
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedScale(
        scale: _pressed ? 0.90 : 1.0,
        duration: const Duration(milliseconds: 100),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Icon(widget.icon, size: 18, color: widget.color),
            const SizedBox(height: 2),
            Text(
              widget.label,
              style: TextStyle(
                color: t.textSecondary,
                fontSize: 9,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.3,
              ),
            ),
          ]),
        ),
      ),
    );
  }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  "HOW LIFEKIT WORKS" 3-STEP GUIDE
//  Shown on Home when there are no missions yet.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class _HowItWorksGuide extends StatelessWidget {
  const _HowItWorksGuide();

  static const _steps = [
    (
      LucideIcons.target,
      'Create a Mission',
      'Define your goal and let AI build the plan.'
    ),
    (
      LucideIcons.wandSparkles,
      'AI Builds Your Plan',
      'Get milestones, tasks, and timelines instantly.'
    ),
    (
      LucideIcons.squareCheck,
      'Execute Daily',
      'Track progress and stay focused every day.'
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: Text(
          'HOW LIFEKIT WORKS',
          style: TextStyle(
            color: t.textMuted,
            fontSize: 10,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.2,
          ),
        ),
      ),
      Row(
          children: _steps.indexed.map((item) {
        final (icon, title, desc) = item.$2;
        return Expanded(
          child: Padding(
            padding: EdgeInsets.only(right: item.$1 < 2 ? 8 : 0),
            child: GestureDetector(
              onTap: () {
                if (item.$1 == 0) context.go('/missions');
                if (item.$1 == 2) context.go('/tasks');
              },
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: t.surface,
                  borderRadius: BorderRadius.circular(AppRadius.xl),
                  border: Border.all(color: t.cardBorder),
                ),
                child: Column(children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: t.primarySurface,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(icon, size: 16, color: t.primary),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    title,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: t.textPrimary,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      height: 1.3,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    desc,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: t.textMuted,
                      fontSize: 10,
                      height: 1.4,
                    ),
                  ),
                ]),
              ),
            ),
          )
              .animate(delay: (item.$1 * 80).ms)
              .fadeIn(duration: 280.ms)
              .slideY(begin: 0.06, end: 0, duration: 280.ms),
        );
      }).toList()),
    ]);
  }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// HOME SCREEN
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

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
    final boot = ref.watch(dashboardProvider);
    final tasks = ref.watch(tasksProvider);
    final missions = ref.watch(missionsProvider);
    final profile = ref.watch(profileProvider);
    final notifCount = ref.watch(notifCountProvider);
    final t = context.tokens;

    final firstName = (profile['fullName'] ?? profile['full_name'] ?? 'there')
        .toString()
        .split(' ')
        .first;

    return MeshBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: SafeArea(
          child: Stack(children: [
            // â”€â”€ Main scrollable content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            CustomScrollView(slivers: [
              // â”€â”€ App bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(60, 8, 12, 4),
                  child: Row(children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        gradient: AppGradients.lifekit,
                        borderRadius: BorderRadius.circular(AppRadius.sm),
                      ),
                      child: const Icon(LucideIcons.leaf,
                          size: 16, color: Colors.white),
                    ),
                    const SizedBox(width: 9),
                    Text('LifeKit',
                        style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                            color: t.textPrimary,
                            letterSpacing: -0.5)),
                    const Spacer(),
                    if (boot.isLoading)
                      SizedBox(
                        width: 16,
                        height: 16,
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
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 120),
                sliver: SliverList.list(children: [
                  if (boot.hasError)
                    _InlineErrorState(title: "Couldn't load dashboard")
                        .pageEntrance(),

                  // â”€â”€ Skeleton while loading â”€â”€â”€â”€â”€â”€â”€
                  if (boot.isLoading && missions.isEmpty) ...[
                    const _SkeletonHeroCard(),
                    const SizedBox(height: 16),
                    GridView.count(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisCount: 2,
                      mainAxisSpacing: 10,
                      crossAxisSpacing: 10,
                      childAspectRatio: 0.9,
                      children: const [
                        _SkeletonMetricCard(),
                        _SkeletonMetricCard(),
                        _SkeletonMetricCard(),
                        _SkeletonMetricCard(),
                      ],
                    ),
                    const SizedBox(height: 16),
                    const _SkeletonTaskRow(),
                    const _SkeletonTaskRow(),
                  ] else ...[
                    // â”€â”€ Hero card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                    _HomeHeroCard(
                      greeting: _greeting(),
                      firstName: firstName,
                      tasks: tasks,
                    ).heroEntrance(),
                    const SizedBox(height: 16),

                    // â”€â”€ How it works (no missions) â”€
                    if (missions.isEmpty && !boot.isLoading) ...[
                      const _HowItWorksGuide().staggered(1),
                      const SizedBox(height: 16),
                    ],

                    // â”€â”€ Metric grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                    GridView.count(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisCount: 2,
                      mainAxisSpacing: 10,
                      crossAxisSpacing: 10,
                      childAspectRatio: 0.9,
                      children: [
                        _MetricCard(
                          value: tasks.isEmpty
                              ? 0
                              : (tasks.where((t) => t.done).length *
                                  100 /
                                  tasks.length),
                          suffix: '%',
                          label: 'Productivity',
                          detail: 'Task completion',
                          icon: LucideIcons.chartNoAxesCombined,
                          index: 0,
                        ),
                        _MetricCard(
                          value: tasks.where((t) => !t.done).length.toDouble(),
                          label: 'Remaining',
                          detail: 'tasks today',
                          icon: LucideIcons.listChecks,
                          index: 1,
                        ),
                        _MetricCard(
                          value: missions
                              .where((m) => m.status == 'Active')
                              .length
                              .toDouble(),
                          label: 'Missions',
                          detail: 'active now',
                          icon: LucideIcons.target,
                          index: 2,
                        ),
                        _MetricCard(
                          value: tasks.length.toDouble(),
                          label: 'Total tasks',
                          detail: 'across missions',
                          icon: LucideIcons.squareCheck,
                          index: 3,
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // â”€â”€ Today's plan â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                    if (tasks.isNotEmpty) ...[
                      _TodaysPlan(tasks: tasks).staggered(4),
                      const SizedBox(height: 16),
                    ],

                    // â”€â”€ AI Insight card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                    _AiInsightCard(tasks: tasks, missions: missions)
                        .staggered(5),
                    const SizedBox(height: 16),

                    // â”€â”€ Primary mission â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                    if (missions.isNotEmpty)
                      _PrimaryMissionCard(mission: missions.first).staggered(6),
                  ],
                ]),
              ),
            ]),

            // â”€â”€ Floating quick-action bar â”€â”€â”€â”€â”€â”€â”€â”€â”€
            _QuickActionBar(
              onAddTask: () {
                final ms = ref.read(missionsProvider);
                if (ms.isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                    content: Text('Create a mission first'),
                    behavior: SnackBarBehavior.floating,
                  ));
                  return;
                }
                context.go('/tasks');
              },
              onNewMission: () => context.go('/missions'),
              onAskAI: () => context.go('/ai-coach'),
            ),
          ]),
        ),
      ),
    );
  }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  HOME HERO CARD
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    final t = context.tokens;
    final nextTask = tasks.firstWhere(
      (tk) => !tk.done,
      orElse: () => tasks.isNotEmpty
          ? tasks.first
          : TaskData(
              id: 0,
              missionId: 0,
              title: 'Create your first mission',
              missionTitle: '',
              priority: 'medium',
              minutes: 5,
              status: 'To Do'),
    );

    final doneTasks = tasks.where((tk) => tk.done).length;
    final totalTasks = tasks.length;
    final completion = totalTasks > 0 ? doneTasks / totalTasks : 0.0;

    return GradientCard(
      radius: AppRadius.x3l,
      // Extra padding â€” 24 all around as spec'd
      padding: const EdgeInsets.all(24),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        // â”€â”€ Top row: greeting + date chip + completion ring â”€â”€
        Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Expanded(
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(
                '$greeting,',
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 4),
              // Display-level name â€” 30px / w900 / tight tracking
              Text(
                '$firstName.',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 30,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -1.0,
                  height: 1.1,
                ),
              ),
            ]),
          ),
          const SizedBox(width: 12),
          // â”€â”€ Completion ring (48 Ã— 48) â”€â”€
          _HeroCompletionRing(value: completion),
        ]),

        const SizedBox(height: 10),
        // Date chip
        Row(children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(AppRadius.full),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(AppRadius.full),
                  border:
                      Border.all(color: Colors.white.withValues(alpha: 0.25)),
                ),
                child: Text(
                  _todayLabel(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ),
        ]),

        const SizedBox(height: 12),
        Text(
          tasks.isEmpty
              ? 'Set up your first mission to get started.'
              : '${tasks.where((tk) => !tk.done).length} tasks remaining. AI has prioritised your best next move.',
          style:
              const TextStyle(color: Colors.white70, height: 1.5, fontSize: 14),
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
          // â”€â”€ Next best action card â”€â”€
          // 2px accent left border + primarySurface tinted background
          ClipRRect(
            borderRadius: BorderRadius.circular(AppRadius.x2l),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
              child: IntrinsicHeight(
                child: Row(children: [
                  // 2px glowing left border in primary/accent green
                  Container(
                    width: 2,
                    decoration: BoxDecoration(
                      color: t.primary,
                      borderRadius: const BorderRadius.horizontal(
                          left: Radius.circular(AppRadius.x2l)),
                      boxShadow: [
                        BoxShadow(
                          color: t.primary.withValues(alpha: 0.6),
                          blurRadius: 6,
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.10),
                        borderRadius: const BorderRadius.horizontal(
                            right: Radius.circular(AppRadius.x2l)),
                        border: Border.all(
                            color: Colors.white.withValues(alpha: 0.18)),
                      ),
                      child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(children: [
                              Icon(LucideIcons.sparkles,
                                  size: 14, color: Colors.amber.shade300),
                              const SizedBox(width: 6),
                              Text(
                                'NEXT BEST ACTION',
                                style: TextStyle(
                                  color: Colors.amber.shade300,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 0.8,
                                ),
                              ),
                            ]),
                            const SizedBox(height: 10),
                            Text(
                              nextTask.title,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                                fontSize: 16,
                                height: 1.3,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              nextTask.missionTitle,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                  color: Colors.white60, fontSize: 12),
                            ),
                            const SizedBox(height: 12),
                            Row(children: [
                              Icon(LucideIcons.clock3,
                                  size: 12, color: Colors.white60),
                              const SizedBox(width: 4),
                              Text(
                                '${nextTask.minutes} min',
                                style: const TextStyle(
                                    color: Colors.white60, fontSize: 12),
                              ),
                              const SizedBox(width: 10),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.15),
                                  borderRadius:
                                      BorderRadius.circular(AppRadius.full),
                                ),
                                child: const Text(
                                  'Highest impact',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 10,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                              const Spacer(),
                              GestureDetector(
                                onTap: () => context.go('/tasks'),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 14, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius:
                                        BorderRadius.circular(AppRadius.full),
                                    boxShadow: AppShadows.greenSm,
                                  ),
                                  child: Text(
                                    'Start â†’',
                                    style: TextStyle(
                                      color: t.primary,
                                      fontWeight: FontWeight.w700,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                              ),
                            ]),
                          ]),
                    ),
                  ),
                ]),
              ),
            ),
          ),
        ],

        const SizedBox(height: 20),
        Divider(color: Colors.white.withValues(alpha: 0.15)),
        const SizedBox(height: 14),

        // Goal input â€” taller 52px, inner glow on focus delegated to
        // the BackdropFilter + border approach (no FocusNode needed here)
        ClipRRect(
          borderRadius: BorderRadius.circular(AppRadius.full),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
            child: Container(
              height: 52,
              padding: const EdgeInsets.symmetric(horizontal: 18),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.10),
                borderRadius: BorderRadius.circular(AppRadius.full),
                border: Border.all(color: Colors.white.withValues(alpha: 0.22)),
              ),
              child: Row(children: [
                Icon(LucideIcons.sparkles, size: 16, color: t.primary),
                const SizedBox(width: 10),
                Text(
                  'What do you want to achieve today?',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.50),
                    fontSize: 13,
                  ),
                ),
              ]),
            ),
          ),
        ),
      ]),
    );
  }

  String _todayLabel() {
    final now = DateTime.now();
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return '${months[now.month - 1]} ${now.day}';
  }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  HERO COMPLETION RING  (48Ã—48)
//  Shows today's task completion % as a circular
//  progress indicator on the hero card.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class _HeroCompletionRing extends StatelessWidget {
  const _HeroCompletionRing({required this.value});
  final double value; // 0.0 â€“ 1.0

  @override
  Widget build(BuildContext context) {
    final pct = (value * 100).round();
    return SizedBox(
      width: 48,
      height: 48,
      child: Stack(alignment: Alignment.center, children: [
        // Track
        SizedBox(
          width: 48,
          height: 48,
          child: CircularProgressIndicator(
            value: 1.0,
            strokeWidth: 3.5,
            color: Colors.white.withValues(alpha: 0.18),
          ),
        ),
        // Fill
        TweenAnimationBuilder<double>(
          tween: Tween(begin: 0, end: value),
          duration: const Duration(milliseconds: 900),
          curve: Curves.easeOutCubic,
          builder: (_, v, __) => SizedBox(
            width: 48,
            height: 48,
            child: CircularProgressIndicator(
              value: v,
              strokeWidth: 3.5,
              color: Colors.white,
              strokeCap: StrokeCap.round,
            ),
          ),
        ),
        // Label
        Text(
          '$pct%',
          style: const TextStyle(
            color: Colors.white,
            fontSize: 11,
            fontWeight: FontWeight.w800,
          ),
        ),
      ]),
    );
  }
}

class _HeroOutlineButton extends StatelessWidget {
  const _HeroOutlineButton({
    required this.icon,
    required this.label,
    required this.onTap,
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
            color: Colors.white.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(AppRadius.full),
            border: Border.all(color: Colors.white.withValues(alpha: 0.4)),
          ),
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            Icon(icon, size: 15, color: Colors.white),
            const SizedBox(width: 6),
            Text(label,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                )),
          ]),
        ),
      );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  METRIC CARD
//  â€¢ Squircle icon container (48Ã—48)
//  â€¢ Large value display (28px / w900)
//  â€¢ UPPERCASE label with tight tracking
//  â€¢ 2px top accent border (opacity varies by index)
//  â€¢ Subtle topâ†’transparent gradient inside card
//  â€¢ Staggered CountUp with 80ms inter-card delay
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class _MetricCard extends StatelessWidget {
  const _MetricCard({
    required this.value,
    required this.label,
    required this.detail,
    required this.icon,
    required this.index,
    this.suffix = '',
  });
  final double value;
  final String label, detail, suffix;
  final IconData icon;
  final int index;

  // Accent opacity decreases for lower-priority cards
  static const _accentOpacities = [1.0, 0.7, 0.5, 0.35];

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final accentAlpha = _accentOpacities[index.clamp(0, 3)];
    final accentColor = t.primary.withValues(alpha: accentAlpha);
    // Stagger delay: 0ms, 80ms, 160ms, 240ms
    final delay = Duration(milliseconds: index * 80);

    return PremiumCard(
      radius: AppRadius.lg,
      padding: const EdgeInsets.all(16),
      topAccentColor: accentColor,
      child: Stack(children: [
        // Subtle inner gradient: primarySurface top â†’ transparent bottom
        Positioned.fill(
          child: DecoratedBox(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppRadius.lg),
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  t.primarySurface.withValues(alpha: 0.55),
                  Colors.transparent,
                ],
                stops: const [0.0, 0.6],
              ),
            ),
          ),
        ),
        // Content
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // Squircle icon container (48Ã—48)
          SquircleIcon(
            icon: icon,
            color: t.primary,
            background: t.primarySurface,
            size: 48,
            iconSize: 22,
          ),
          const SizedBox(height: 14),
          // Large animated metric value (28px / w900)
          AnimatedMetric(
            value: value,
            suffix: suffix,
            fractionDigits: 0,
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w900,
              color: t.textPrimary,
              letterSpacing: -1.0,
            ),
          ),
          const SizedBox(height: 3),
          // UPPERCASE label
          Text(
            label.toUpperCase(),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 10,
              color: t.textPrimary,
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(height: 1),
          Text(
            detail,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(color: t.textMuted, fontSize: 10),
          ),
        ]),
      ]),
    )
        .animate(delay: delay)
        .fadeIn(duration: 280.ms)
        .slideY(begin: 0.06, end: 0, duration: 280.ms);
  }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  TODAY'S PLAN CARD
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class _TodaysPlan extends ConsumerWidget {
  const _TodaysPlan({required this.tasks});
  final List<TaskData> tasks;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.tokens;
    return PremiumCard(
      topAccentColor: t.primary.withValues(alpha: 0.5),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Expanded(
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(
                "Today's execution plan",
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.4,
                    ),
              ),
              const SizedBox(height: 2),
              Text(
                'AI-prioritized to protect your momentum',
                style: TextStyle(color: t.textMuted, fontSize: 12, height: 1.4),
              ),
            ]),
          ),
          TextButton(
            onPressed: () => context.go('/tasks'),
            child: Text(
              'See all',
              style: TextStyle(
                color: t.primary,
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ]),
        const SizedBox(height: 12),
        ...tasks.take(4).indexed.map((item) {
          final taskNum = item.$1 + 1;
          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Circled task number
              Container(
                width: 20,
                height: 20,
                margin: const EdgeInsets.only(top: 11, right: 8, bottom: 8),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: item.$2.done ? t.primarySurface : t.backgroundSubtle,
                  border: Border.all(
                    color: item.$2.done ? t.primary : t.border,
                    width: 1.5,
                  ),
                ),
                child: Center(
                  child: Text(
                    '$taskNum',
                    style: TextStyle(
                      color: item.$2.done ? t.primary : t.textMuted,
                      fontSize: 9,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ),
              Expanded(
                child: _PremiumTaskRow(
                  task: item.$2,
                  index: item.$1,
                  onToggle: () {
                    final copy = [...tasks];
                    copy[item.$1].done = !copy[item.$1].done;
                    ref.read(tasksProvider.notifier).state = copy;
                    ref
                        .read(repositoryProvider)
                        .setTaskStatus(
                          item.$2.id,
                          copy[item.$1].done ? 'COMPLETED' : 'PENDING',
                        )
                        .ignore();
                  },
                ),
              ),
            ],
          );
        }),
      ]),
    );
  }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  AI INSIGHT CARD
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class _AiInsightCard extends StatelessWidget {
  const _AiInsightCard({required this.tasks, required this.missions});
  final List<TaskData> tasks;
  final List<MissionData> missions;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final brightness = Theme.of(context).brightness;
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
          colors: [t.primarySurface, t.surface],
        ),
        borderRadius: BorderRadius.circular(AppRadius.xl),
        border: Border.all(color: t.cardBorder),
        boxShadow: AppElevation.level1(brightness),
      ),
      child: IntrinsicHeight(
        child: Row(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          // Glowing left accent bar
          Container(
            width: 3,
            decoration: BoxDecoration(
              color: t.primary,
              borderRadius: const BorderRadius.horizontal(
                  left: Radius.circular(AppRadius.xl)),
              boxShadow: [
                BoxShadow(
                  color: t.primary.withValues(alpha: 0.45),
                  blurRadius: 8,
                  offset: Offset.zero,
                ),
              ],
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(18),
              child:
                  Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                // Pulsing AI icon
                PulseGlow(
                  child: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      gradient: AppGradients.lifekit,
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      boxShadow: AppShadows.greenSm,
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
                          Text(
                            'AI INSIGHT',
                            style: TextStyle(
                              color: t.primary,
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 1.2,
                            ),
                          ),
                          const SizedBox(width: 8),
                          _PulseDot(color: t.primary),
                        ]),
                        const SizedBox(height: 8),
                        Text(
                          tasks.isNotEmpty
                              ? 'Your most impactful task is "${tasks.first.title}".'
                              : 'Start by creating your first mission.',
                          style:
                              Theme.of(context).textTheme.titleLarge?.copyWith(
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: -0.3,
                                  ),
                        ),
                        const SizedBox(height: 5),
                        Text(
                          missions.isEmpty
                              ? 'LifeKit turns goals into structured missions with AI guidance.'
                              : 'You have ${missions.where((m) => m.status == 'Active').length} active mission${missions.length == 1 ? '' : 's'} in progress.',
                          style: TextStyle(
                            color: t.textMuted,
                            height: 1.6,
                            fontSize: 13,
                          ),
                        ),
                        const SizedBox(height: 6),
                        GestureDetector(
                          onTap: () => context.go('/ai-coach'),
                          child: Row(mainAxisSize: MainAxisSize.min, children: [
                            Text(
                              'Explore with AI',
                              style: TextStyle(
                                color: t.primary,
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(width: 4),
                            Icon(LucideIcons.arrowRight,
                                size: 13, color: t.primary),
                          ]),
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
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: widget.color,
                shape: BoxShape.circle,
              ),
            ),
          ),
        ),
      );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  PRIMARY MISSION CARD
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class _PrimaryMissionCard extends StatelessWidget {
  const _PrimaryMissionCard({required this.mission});
  final MissionData mission;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return PremiumCard(
      topAccentColor: t.primary,
      onTap: () => context.push('/missions/${mission.id}'),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          const SectionLabel('PRIMARY MISSION'),
          const Spacer(),
          StatusBadge(mission.status),
          const SizedBox(width: 6),
          _DaysRemainingChip(deadline: mission.deadline, tokens: t),
        ]),
        const SizedBox(height: 12),
        Text(
          mission.title,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.w800,
                letterSpacing: -0.5,
              ),
        ),
        const SizedBox(height: 6),
        Text(
          mission.goal,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(color: t.textMuted, height: 1.6, fontSize: 13),
        ),
        const SizedBox(height: 16),
        Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
          Text(
            '${(mission.progress * 100).round()}%',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w900,
              color: t.primary,
              letterSpacing: -1.0,
            ),
          ),
          const SizedBox(width: 8),
          Padding(
            padding: const EdgeInsets.only(bottom: 4),
            child: Text(
              'mission progress',
              style: TextStyle(color: t.textMuted, fontSize: 12),
            ),
          ),
        ]),
        const SizedBox(height: 8),
        PremiumProgressBar(value: mission.progress, height: 6),
        const SizedBox(height: 14),
        Row(children: [
          Icon(LucideIcons.arrowRight, size: 16, color: t.primary),
          const SizedBox(width: 6),
          Text(
            'View mission details',
            style: TextStyle(
              color: t.primary,
              fontWeight: FontWeight.w600,
              fontSize: 13,
            ),
          ),
        ]),
      ]),
    );
  }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  DAYS REMAINING CHIP
//  Shows days until deadline with color-coding:
//  >30 days = success, 8-30 = warning, <7 = destructive
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class _DaysRemainingChip extends StatelessWidget {
  const _DaysRemainingChip({required this.deadline, required this.tokens});
  final String deadline;
  final AppTokens tokens;

  @override
  Widget build(BuildContext context) {
    if (deadline == 'No deadline') return const SizedBox.shrink();
    final parts = deadline.split('/');
    if (parts.length != 3) return const SizedBox.shrink();
    final d = int.tryParse(parts[0]);
    final m = int.tryParse(parts[1]);
    final y = int.tryParse(parts[2]);
    if (d == null || m == null || y == null) return const SizedBox.shrink();
    final target = DateTime(y, m, d);
    final days = target.difference(DateTime.now()).inDays;

    final (color, bg) = days > 30
        ? (tokens.success, tokens.successSurface)
        : days >= 7
            ? (tokens.warning, tokens.warningSurface)
            : (tokens.destructive, tokens.destructiveSurface);

    final label = days < 0
        ? 'Overdue'
        : days == 0
            ? 'Due today'
            : '${days}d left';

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(AppRadius.full),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MISSIONS SCREEN
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

class MissionsScreen extends ConsumerStatefulWidget {
  const MissionsScreen({super.key});
  @override
  ConsumerState<MissionsScreen> createState() => _MissionsScreenState();
}

class _MissionsScreenState extends ConsumerState<MissionsScreen> {
  String _filter = 'All';
  bool _loading = false;
  String? _error;
  bool _searchOpen = false;
  final _scrollCtrl = ScrollController();

  // â”€â”€ Undo-delete state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  MissionData? _deletedMission;
  int? _deletedIndex;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  @override
  void dispose() {
    _scrollCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final repo = ref.read(repositoryProvider);
      final raw = await repo.missions();
      ref.read(missionsProvider.notifier).state =
          raw.map(MissionData.fromJson).toList();
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    }
    if (mounted) setState(() => _loading = false);
  }

  // Optimistic delete â€” removes card immediately, shows undo snackbar.
  // Commits the API call after 4 s unless the user taps Undo.
  void _deleteMission(MissionData m) {
    final all = List<MissionData>.from(ref.read(missionsProvider));
    final idx = all.indexWhere((x) => x.id == m.id);
    if (idx < 0) return;

    // Remove from UI immediately
    all.removeAt(idx);
    ref.read(missionsProvider.notifier).state = all;
    setState(() {
      _deletedMission = m;
      _deletedIndex = idx;
    });

    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context)
        .showSnackBar(
          SnackBar(
            content: Text(
              '"${m.title.length > 30 ? '${m.title.substring(0, 30)}â€¦' : m.title}" deleted',
            ),
            duration: const Duration(seconds: 4),
            behavior: SnackBarBehavior.floating,
            action: SnackBarAction(
              label: 'Undo',
              onPressed: () {
                if (_deletedMission == null) return;
                final current =
                    List<MissionData>.from(ref.read(missionsProvider));
                final insertAt =
                    (_deletedIndex ?? current.length).clamp(0, current.length);
                current.insert(insertAt, _deletedMission!);
                ref.read(missionsProvider.notifier).state = current;
                setState(() {
                  _deletedMission = null;
                  _deletedIndex = null;
                });
              },
            ),
          ),
        )
        .closed
        .then((reason) {
      // If closed for any reason other than action (undo), commit delete
      if (reason != SnackBarClosedReason.action && _deletedMission != null) {
        ref
            .read(repositoryProvider)
            .deleteMission(_deletedMission!.id)
            .catchError((_) => _load());
        setState(() {
          _deletedMission = null;
          _deletedIndex = null;
        });
      }
    });
  }

  // Build grouped list for "All" filter
  List<Widget> _buildGroupedList(List<MissionData> all, AppTokens t) {
    final groups = <String, List<MissionData>>{};
    const order = ['Active', 'Paused', 'At Risk', 'Draft', 'Completed'];
    for (final status in order) {
      final items = all.where((m) => m.status == status).toList();
      if (items.isNotEmpty) groups[status] = items;
    }
    // Catch any unlisted status
    for (final m in all) {
      if (!order.contains(m.status)) {
        groups.putIfAbsent('Other', () => []).add(m);
      }
    }

    final widgets = <Widget>[];
    var globalIdx = 0;
    for (final entry in groups.entries) {
      widgets.add(_GroupedSectionHeader(
        entry.key,
        count: entry.value.length,
        topPadding: globalIdx == 0 ? 4 : 20,
      ));
      for (final m in entry.value) {
        widgets.add(_MissionCard(
          m,
          index: globalIdx,
          onDelete: () => _deleteMission(m),
          onEdit: _load,
        ));
        widgets.add(const SizedBox(height: 12));
        globalIdx++;
      }
    }
    return widgets;
  }

  @override
  Widget build(BuildContext context) {
    final all = ref.watch(missionsProvider);
    final query = ref.watch(missionsSearchProvider).toLowerCase().trim();
    final t = context.tokens;

    // Apply search filter first, then status filter
    final searched = query.isEmpty
        ? all
        : all
            .where((m) =>
                m.title.toLowerCase().contains(query) ||
                m.goal.toLowerCase().contains(query) ||
                m.category.toLowerCase().contains(query))
            .toList();

    final shown = _filter == 'All'
        ? searched
        : searched.where((m) => m.status == _filter).toList();

    final useGrouped = _filter == 'All' && query.isEmpty;

    return Scaffold(
      backgroundColor: t.background,
      // Remove FAB â€” QuickActionBar handles creation
      body: SafeArea(
        child: Stack(children: [
          Column(children: [
            _PageHeading(
              'Missions',
              subtitle:
                  '${all.where((m) => m.status == 'Active').length} active',
              actions: [
                // Search toggle
                IconButton(
                  onPressed: () {
                    setState(() => _searchOpen = !_searchOpen);
                    if (!_searchOpen) {
                      ref.read(missionsSearchProvider.notifier).state = '';
                    }
                  },
                  icon: Icon(_searchOpen ? LucideIcons.x : LucideIcons.search,
                      size: 18, color: t.textSecondary),
                ),
                IconButton(
                  onPressed: _load,
                  icon: Icon(LucideIcons.refreshCw,
                      size: 18, color: t.textSecondary),
                ),
              ],
            ).pageEntrance(),

            // Animated search bar
            _SearchBar(
              visible: _searchOpen,
              hint: 'Search missionsâ€¦',
              onChanged: (v) =>
                  ref.read(missionsSearchProvider.notifier).state = v,
              onDismiss: () {
                setState(() => _searchOpen = false);
                ref.read(missionsSearchProvider.notifier).state = '';
              },
            ),

            // Filter chips â€” hidden while searching
            if (!_searchOpen)
              SizedBox(
                height: 44,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  children: [
                    for (final f in [
                      'All',
                      'Active',
                      'Paused',
                      'Draft',
                      'Completed',
                      'At Risk'
                    ])
                      Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: _PremiumFilterChip(
                          label: f,
                          selected: _filter == f,
                          onTap: () => setState(() => _filter = f),
                        ),
                      ),
                  ],
                ),
              ).animate(delay: 80.ms).fadeIn(duration: 250.ms),

            const SizedBox(height: 8),

            if (_loading)
              LinearProgressIndicator(
                  color: t.primary,
                  minHeight: 2,
                  backgroundColor: t.backgroundSubtle),

            Expanded(
              child: _error != null && all.isEmpty
                  ? _InlineErrorState(
                      title: "Couldn't load missions",
                    )
                  : _loading && all.isEmpty
                      // Skeleton loading state â€” 3 cards
                      ? ListView(
                          padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
                          children: const [
                            _SkeletonMissionCard(),
                            _SkeletonMissionCard(),
                            _SkeletonMissionCard(),
                          ],
                        )
                      : shown.isEmpty && query.isNotEmpty
                          // Search no-results
                          ? Center(
                              child: Padding(
                                padding: const EdgeInsets.all(32),
                                child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(LucideIcons.searchX,
                                          size: 32, color: t.textMuted),
                                      const SizedBox(height: 12),
                                      Text(
                                        'No results for "$query"',
                                        textAlign: TextAlign.center,
                                        style: TextStyle(
                                            color: t.textMuted,
                                            fontSize: 14,
                                            fontWeight: FontWeight.w500),
                                      ),
                                    ]),
                              ),
                            )
                          : shown.isEmpty
                              ? _MissionsEmptyState(
                                  onCreateTap: () => _createSheet(context))
                              : RefreshIndicator(
                                  onRefresh: _load,
                                  color: t.primary,
                                  child: ListView(
                                    controller: _scrollCtrl,
                                    padding: const EdgeInsets.fromLTRB(
                                        16, 4, 16, 120),
                                    children: useGrouped
                                        ? _buildGroupedList(shown, t)
                                        : shown.indexed.map((item) {
                                            final m = item.$2;
                                            return Padding(
                                              padding: const EdgeInsets.only(
                                                  bottom: 12),
                                              child: _MissionCard(
                                                m,
                                                index: item.$1,
                                                onDelete: () =>
                                                    _deleteMission(m),
                                                onEdit: _load,
                                              ),
                                            );
                                          }).toList(),
                                  ),
                                ),
            ),
          ]),

          // Floating quick-action bar
          _QuickActionBar(
            onAddTask: () => _showAddTaskSheet(context),
            onNewMission: () => _createSheet(context),
            onAskAI: () => context.go('/ai-coach'),
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

  // Quick add-task sheet (minimal, picks first mission)
  void _showAddTaskSheet(BuildContext ctx) {
    final missions = ref.read(missionsProvider);
    if (missions.isEmpty) {
      ScaffoldMessenger.of(ctx).showSnackBar(
        const SnackBar(
          content: Text('Create a mission first before adding tasks'),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }
    final titleCtrl = TextEditingController();
    final t = ctx.tokens;
    int? selectedMissionId = missions.first.id;

    showModalBottomSheet(
      context: ctx,
      isScrollControlled: true,
      backgroundColor: t.surface,
      shape: const RoundedRectangleBorder(
          borderRadius:
              BorderRadius.vertical(top: Radius.circular(AppRadius.x2l))),
      builder: (sheetCtx) => StatefulBuilder(
        builder: (ctx2, setModal) {
          final kb = MediaQuery.viewInsetsOf(ctx2).bottom;
          return Padding(
            padding: EdgeInsets.fromLTRB(24, 16, 24, kb + 24),
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              const SheetHandle(),
              const SizedBox(height: 16),
              Text('Quick Add Task',
                  style: Theme.of(ctx2)
                      .textTheme
                      .headlineLarge
                      ?.copyWith(fontWeight: FontWeight.w800)),
              const SizedBox(height: 16),
              // Mission selector
              DropdownButtonFormField<int>(
                initialValue: selectedMissionId,
                decoration: InputDecoration(
                  filled: true,
                  fillColor: t.backgroundSubtle,
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      borderSide: BorderSide(color: t.border)),
                  enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      borderSide: BorderSide(color: t.border)),
                  focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      borderSide: BorderSide(color: t.primary, width: 1.5)),
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                ),
                items: missions
                    .map((m) => DropdownMenuItem(
                        value: m.id,
                        child: Text(m.title, overflow: TextOverflow.ellipsis)))
                    .toList(),
                onChanged: (v) => setModal(() => selectedMissionId = v),
              ),
              const SizedBox(height: 12),
              PremiumInputField(
                controller: titleCtrl,
                hint: 'Task titleâ€¦',
                autofocus: true,
                textInputAction: TextInputAction.done,
              ),
              const SizedBox(height: 16),
              PremiumButton(
                label: 'Add Task',
                onPressed: () async {
                  final title = titleCtrl.text.trim();
                  if (title.isEmpty || selectedMissionId == null) return;
                  Navigator.of(sheetCtx).pop();
                  await ref
                      .read(repositoryProvider)
                      .createTask(missionId: selectedMissionId!, title: title)
                      .catchError((_) => <String, dynamic>{});
                },
              ),
            ]),
          );
        },
      ),
    );
  }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 4-STEP MISSION CREATION FLOW  (matches web app)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

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
  // â”€â”€ step 1 form state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  final _goalCtrl = TextEditingController();
  final _weeklyHrsCtrl = TextEditingController();
  final _budgetCtrl = TextEditingController();
  final _constraintsCtrl = TextEditingController();
  String? _category;
  String _budgetCurrency = 'INR';
  DateTime? _targetDate;

  // â”€â”€ progressive disclosure â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  bool _advancedOpen = false;

  // â”€â”€ inline validation state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  bool _goalTouched = false;
  bool _categoryTouched = false;
  bool _pastDateWarning = false;

  // â”€â”€ step / plan state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  int _step = 1; // 1 = form, 2 = generating, 3 = review, 4 = done
  String? _genError;
  Map<String, dynamic> _plan = {}; // result from AI

  // â”€â”€ generation animation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  int _genAnimStep = 0;
  static const _genMessages = [
    'Understanding goalâ€¦',
    'Identifying milestonesâ€¦',
    'Calculating timelineâ€¦',
    'Finding resourcesâ€¦',
    'Preparing execution planâ€¦',
  ];

  @override
  void dispose() {
    _goalCtrl.dispose();
    _weeklyHrsCtrl.dispose();
    _budgetCtrl.dispose();
    _constraintsCtrl.dispose();
    super.dispose();
  }

  // â”€â”€ generate plan via AI agent â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      final repo = widget.repositoryReader();
      final goal = _goalCtrl.text.trim();
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
          (goal.length > 50 ? '${goal.substring(0, 50)}â€¦' : goal);

      // Extract milestone lines from the output (lines starting with numbered bullets)
      final milestones = <String>[];
      for (final line in raw.split('\n')) {
        final trimmed = line.trim();
        if (RegExp(r'^(\d+[\.\):]|[-â€¢*])').hasMatch(trimmed) &&
            trimmed.length > 5) {
          milestones.add(
              trimmed.replaceFirst(RegExp(r'^(\d+[\.\):\s]+|[-â€¢*]\s*)'), ''));
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
          'title': title,
          'category': _category,
          'goal': goal,
          'milestones': milestones,
          'raw': raw,
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

  // â”€â”€ activate / save draft â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  Future<void> _activate({bool draft = false}) async {
    setState(() => _step = 4);
    try {
      final repo = widget.repositoryReader();
      final goal = _goalCtrl.text.trim();
      final title = (_plan['title'] as String?) ?? goal;
      final desc = [
        goal,
        if (_constraintsCtrl.text.trim().isNotEmpty)
          'Constraints: ${_constraintsCtrl.text.trim()}',
        if (_budgetCtrl.text.trim().isNotEmpty)
          'Budget: $_budgetCurrency ${_budgetCtrl.text.trim()}',
        if (_weeklyHrsCtrl.text.trim().isNotEmpty)
          'Weekly hours: ${_weeklyHrsCtrl.text.trim()}',
      ].join('\n');

      await repo.createMission(
        title: title,
        description: desc,
        targetDate: _targetDate?.toIso8601String(),
      );
      widget.onCreated();
      if (mounted) Navigator.of(context).pop();
    } catch (_) {
      if (mounted) setState(() => _step = 3);
    }
  }

  static const _categories = [
    ('career', 'Career'),
    ('finance', 'Finance'),
    ('health', 'Health'),
    ('travel', 'Travel'),
    ('business', 'Business'),
    ('education', 'Education'),
    ('productivity', 'Productivity'),
    ('personal-development', 'Personal Growth'),
    ('lifestyle', 'Lifestyle'),
    ('family', 'Family'),
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
                icon: Icon(LucideIcons.arrowLeft, color: t.textPrimary),
                onPressed: () {
                  if (_step == 3) {
                    setState(() {
                      _step = 1;
                      _plan = {};
                    });
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
                    color: t.textMuted,
                    fontSize: 12,
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

  // â”€â”€ STEP 1: Goal form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  Widget _buildStep1(AppTokens t) {
    final goalLen = _goalCtrl.text.length;
    final goalOver = goalLen >= 180;

    return SizedBox.expand(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child:
            Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          if (_genError != null) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: t.destructiveSurface,
                borderRadius: BorderRadius.circular(AppRadius.md),
                border: Border.all(color: t.destructive.withValues(alpha: 0.4)),
              ),
              child: Row(children: [
                Icon(LucideIcons.alertCircle, size: 16, color: t.destructive),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(_genError!,
                      style: TextStyle(color: t.destructive, fontSize: 12)),
                ),
              ]),
            ),
            const SizedBox(height: 16),
          ],

          // Header
          Row(children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                gradient: AppGradients.lifekit,
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
            'Be specific â€” include your desired outcome, timeframe and any constraints.',
            style: TextStyle(color: t.textMuted, fontSize: 13, height: 1.5),
          ),
          const SizedBox(height: 20),

          // â”€â”€ Goal field with inline char count â”€â”€
          _SheetLabel('What do you want to achieve? *'),
          const SizedBox(height: 6),
          AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppRadius.md),
              border: Border(
                left: BorderSide(
                  color: _goalTouched && goalLen == 0
                      ? t.destructive
                      : Colors.transparent,
                  width: 3,
                ),
              ),
            ),
            child: PremiumInputField(
              controller: _goalCtrl,
              hint: 'e.g. I want to become a machine learning engineer '
                  'within 6 months and land a jobâ€¦',
              maxLines: 4,
              minLines: 3,
              onChanged: (_) => setState(() => _goalTouched = true),
            ),
          ),
          // Char count + error hint
          Padding(
            padding: const EdgeInsets.only(top: 4, left: 4, right: 4),
            child: Row(children: [
              if (_goalTouched && goalLen == 0)
                Text('Goal is required',
                    style: TextStyle(
                        color: t.destructive,
                        fontSize: 11,
                        fontWeight: FontWeight.w500)),
              const Spacer(),
              Text(
                '$goalLen / 200',
                style: TextStyle(
                  color: goalLen >= 200
                      ? t.destructive
                      : goalOver
                          ? t.warning
                          : t.textMuted,
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ]),
          ),
          const SizedBox(height: 14),

          // â”€â”€ Category with touched validation â”€â”€
          _SheetLabel('Category *'),
          const SizedBox(height: 6),
          AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppRadius.md),
              border: Border(
                left: BorderSide(
                  color: _categoryTouched && _category == null
                      ? t.destructive
                      : Colors.transparent,
                  width: 3,
                ),
              ),
            ),
            child: DropdownButtonFormField<String>(
              initialValue: _category,
              decoration: _dropDecoration(t, hint: 'Select a category'),
              items: _categories
                  .map((c) => DropdownMenuItem(
                        value: c.$1,
                        child: Text(c.$2),
                      ))
                  .toList(),
              onChanged: (v) => setState(() {
                _category = v;
                _categoryTouched = true;
              }),
            ),
          ),
          if (_categoryTouched && _category == null)
            Padding(
              padding: const EdgeInsets.only(top: 4, left: 4),
              child: Text('Category is required',
                  style: TextStyle(
                      color: t.destructive,
                      fontSize: 11,
                      fontWeight: FontWeight.w500)),
            ),
          const SizedBox(height: 20),

          // â”€â”€ Advanced options â€” progressive disclosure â”€â”€
          GestureDetector(
            onTap: () => setState(() => _advancedOpen = !_advancedOpen),
            child: Row(children: [
              Text(
                'Advanced options',
                style: TextStyle(
                  color: t.primary,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(width: 4),
              AnimatedRotation(
                turns: _advancedOpen ? 0.5 : 0.0,
                duration: const Duration(milliseconds: 200),
                child:
                    Icon(LucideIcons.chevronDown, size: 16, color: t.primary),
              ),
            ]),
          ),
          AnimatedSize(
            duration: const Duration(milliseconds: 280),
            curve: Curves.easeOutCubic,
            child: _advancedOpen
                ? Padding(
                    padding: const EdgeInsets.only(top: 16),
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Row(children: [
                            Expanded(
                                child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                  _SheetLabel('Target date'),
                                  const SizedBox(height: 6),
                                  _DateButton(
                                    date: _targetDate,
                                    onTap: () async {
                                      final p = await showDatePicker(
                                        context: context,
                                        initialDate: _targetDate ??
                                            DateTime.now()
                                                .add(const Duration(days: 30)),
                                        firstDate: DateTime.now(),
                                        lastDate: DateTime.now()
                                            .add(const Duration(days: 3650)),
                                      );
                                      if (p != null) {
                                        final isPast =
                                            p.isBefore(DateTime.now());
                                        setState(() {
                                          _targetDate = p;
                                          _pastDateWarning = isPast;
                                        });
                                      }
                                    },
                                    tokens: t,
                                  ),
                                  if (_pastDateWarning)
                                    Padding(
                                      padding: const EdgeInsets.only(top: 4),
                                      child: Text(
                                        'That date has already passed',
                                        style: TextStyle(
                                          color: t.warning,
                                          fontSize: 11,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ),
                                ])),
                            const SizedBox(width: 12),
                            Expanded(
                                child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                  _SheetLabel('Weekly hours'),
                                  const SizedBox(height: 6),
                                  PremiumInputField(
                                    controller: _weeklyHrsCtrl,
                                    hint: 'e.g. 10',
                                    keyboardType: TextInputType.number,
                                    textInputAction: TextInputAction.next,
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
                                  DropdownMenuItem(
                                      value: 'INR', child: Text('â‚¹ INR')),
                                  DropdownMenuItem(
                                      value: 'USD', child: Text('\$ USD')),
                                  DropdownMenuItem(
                                      value: 'EUR', child: Text('â‚¬ EUR')),
                                ],
                                onChanged: (v) => setState(
                                    () => _budgetCurrency = v ?? 'INR'),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                                child: PremiumInputField(
                              controller: _budgetCtrl,
                              hint: 'Amount',
                              keyboardType: TextInputType.number,
                              textInputAction: TextInputAction.next,
                            )),
                          ]),
                          const SizedBox(height: 16),
                          _SheetLabel('Constraints (optional)'),
                          const SizedBox(height: 6),
                          PremiumInputField(
                            controller: _constraintsCtrl,
                            hint: 'e.g. Can only work on this on weekendsâ€¦',
                            maxLines: 2,
                            minLines: 2,
                            textInputAction: TextInputAction.done,
                          ),
                        ]),
                  )
                : const SizedBox.shrink(),
          ),
          const SizedBox(height: 28),

          // Generate button â€” shows inline hint when not ready
          ListenableBuilder(
            listenable: _goalCtrl,
            builder: (_, __) {
              final goalFilled = _goalCtrl.text.trim().isNotEmpty;
              final catFilled = _category != null;
              final ready = goalFilled && catFilled;
              final hint = !goalFilled
                  ? 'Enter your goal to continue'
                  : !catFilled
                      ? 'Select a category to continue'
                      : null;
              return Column(children: [
                PremiumButton(
                  label: 'Generate AI Mission Plan',
                  onPressed: ready
                      ? _generate
                      : () {
                          setState(() {
                            _goalTouched = true;
                            _categoryTouched = true;
                          });
                        },
                ),
                if (hint != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(
                      hint,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: t.textMuted,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
              ]);
            },
          ),
          const SizedBox(height: 20),
        ]),
      ),
    );
  }

  // â”€â”€ STEP 2: Building animation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  Widget _buildStep2(AppTokens t) {
    return SizedBox.expand(
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                gradient: AppGradients.lifekit,
                borderRadius: BorderRadius.circular(AppRadius.x2l),
                boxShadow: AppShadows.green,
              ),
              child: const _SpinningIcon(),
            ),
            const SizedBox(height: 28),
            Text('Building your mission planâ€¦',
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
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    color: isLast ? t.primarySurface : t.backgroundSubtle,
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                    border: Border.all(
                      color:
                          isLast ? t.primary.withValues(alpha: 0.4) : t.border,
                    ),
                  ),
                  child: Row(children: [
                    isLast
                        ? SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                                strokeWidth: 2, color: t.primary),
                          )
                        : Icon(LucideIcons.check, size: 16, color: t.success),
                    const SizedBox(width: 10),
                    Text(item.$2,
                        style: TextStyle(
                          color: isLast ? t.primary : t.textSecondary,
                          fontSize: 13,
                          fontWeight:
                              isLast ? FontWeight.w600 : FontWeight.w400,
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

  // â”€â”€ STEP 3: Review plan â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  Widget _buildStep3(AppTokens t) {
    final milestones = (_plan['milestones'] as List<String>?) ?? [];
    final title = (_plan['title'] as String?) ?? '';
    final catLabel = _categories
        .firstWhere((c) => c.$1 == _category,
            orElse: () => (_category ?? '', _category ?? ''))
        .$2;

    return SizedBox.expand(
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
        child:
            Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          // "Your mission is ready" header
          Row(children: [
            Container(
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                color: t.success.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: Icon(LucideIcons.check, size: 16, color: t.success),
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
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              // Title row with Edit button
              Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Expanded(
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                      Text('MISSION TITLE',
                          style: TextStyle(
                            color: t.primary,
                            fontSize: 10,
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
                  onPressed: () => setState(() {
                    _step = 1;
                    _plan = {};
                  }),
                  child: const Text('Edit Details'),
                ),
              ]),
              const SizedBox(height: 14),

              // Category badge
              Text('CATEGORY',
                  style: TextStyle(
                    color: t.textSecondary,
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.0,
                  )),
              const SizedBox(height: 6),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: t.primarySurface,
                  borderRadius: BorderRadius.circular(AppRadius.full),
                  border: Border.all(color: t.primary.withValues(alpha: 0.3)),
                ),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  Icon(LucideIcons.tag, size: 11, color: t.primary),
                  const SizedBox(width: 5),
                  Text(catLabel,
                      style: TextStyle(
                        color: t.primary,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      )),
                ]),
              ),
              const SizedBox(height: 18),

              // Roadmap
              if (milestones.isNotEmpty) ...[
                Text('ROADMAP (${milestones.length} PHASES)',
                    style: TextStyle(
                      color: t.textSecondary,
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1.0,
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
                                      width: 26,
                                      height: 26,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        border: Border.all(
                                            color: t.primary, width: 2),
                                        color: t.background,
                                      ),
                                      child: Center(
                                        child: Text('${item.$1 + 1}',
                                            style: TextStyle(
                                              color: t.primary,
                                              fontSize: 11,
                                              fontWeight: FontWeight.w700,
                                            )),
                                      ),
                                    ),
                                    if (item.$1 < milestones.length - 1)
                                      Container(
                                        width: 2,
                                        height: 20,
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
            child:
                Text('Regenerate Plan', style: TextStyle(color: t.textMuted)),
          ),
        ]),
      ),
    );
  }

  // â”€â”€ STEP 4: Saving spinner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  Widget _buildStep4(AppTokens t) {
    return Center(
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        PulseGlow(
          child: Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              gradient: AppGradients.lifekit,
              shape: BoxShape.circle,
              boxShadow: AppShadows.green,
            ),
            child:
                const Icon(LucideIcons.target, size: 28, color: Colors.white),
          ),
        ),
        const SizedBox(height: 20),
        Text('Activating your missionâ€¦',
            style: Theme.of(context).textTheme.headlineLarge),
      ]),
    );
  }

  InputDecoration _dropDecoration(AppTokens t, {String? hint}) =>
      InputDecoration(
        hintText: hint,
        filled: true,
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
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
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
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => RotationTransition(
        turns: _ctrl,
        child: const Icon(LucideIcons.loader, size: 30, color: Colors.white),
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
            color: tokens.backgroundSubtle,
            borderRadius: BorderRadius.circular(AppRadius.md),
            border: Border.all(color: tokens.border),
          ),
          child: Row(children: [
            Icon(LucideIcons.calendarDays, size: 16, color: tokens.textMuted),
            const SizedBox(width: 8),
            Text(
              date == null
                  ? 'Pick date'
                  : '${date!.day}/${date!.month}/${date!.year}',
              style: TextStyle(
                color: date == null ? tokens.textMuted : tokens.textPrimary,
                fontSize: 13,
              ),
            ),
          ]),
        ),
      );
}

class _PremiumFilterChip extends StatelessWidget {
  const _PremiumFilterChip({
    required this.label,
    required this.selected,
    required this.onTap,
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
          color: selected ? t.primarySurface : t.backgroundSubtle,
          borderRadius: BorderRadius.circular(AppRadius.full),
          border: Border.all(
            color: selected ? t.primary : t.border,
            width: selected ? 1.5 : 1.0,
          ),
          boxShadow: selected ? AppShadows.greenSm : null,
        ),
        child: Center(
          child: Text(label,
              style: TextStyle(
                color: selected ? t.primary : t.textSecondary,
                fontSize: 12,
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
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          // Pulsing orb â€” uses EmptyStateOrb from premium_card.dart
          EmptyStateOrb(icon: LucideIcons.target, size: 72, iconSize: 32),
          const SizedBox(height: 20),
          Text(
            'No missions yet',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  fontSize: 17,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'Create your first mission to get started',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: t.textMuted,
              fontSize: 13,
              height: 1.6,
            ),
          ),
          const SizedBox(height: 28),
          PremiumButton(
            label: 'Create a mission',
            onPressed: onCreateTap,
            minWidth: 200,
          ),
        ])
            .animate()
            .fadeIn(duration: 300.ms)
            .scale(begin: const Offset(0.97, 0.97), duration: 300.ms),
      ),
    );
  }
}

class _MissionCard extends StatefulWidget {
  const _MissionCard(this.mission,
      {required this.index, required this.onDelete, required this.onEdit});
  final MissionData mission;
  final int index;
  final VoidCallback onDelete;
  final VoidCallback onEdit;

  @override
  State<_MissionCard> createState() => _MissionCardState();
}

class _MissionCardState extends State<_MissionCard> {
  void _editSheet(BuildContext context, AppTokens t) {
    final titleCtrl = TextEditingController(text: widget.mission.title);
    final goalCtrl = TextEditingController(text: widget.mission.goal);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: t.surface,
      shape: const RoundedRectangleBorder(
          borderRadius:
              BorderRadius.vertical(top: Radius.circular(AppRadius.x2l))),
      builder: (sheetCtx) {
        final kb = MediaQuery.viewInsetsOf(sheetCtx).bottom;
        return Padding(
          padding: EdgeInsets.fromLTRB(24, 16, 24, kb + 24),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            const SheetHandle(),
            const SizedBox(height: 16),
            Text(
              'Edit Mission',
              style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
            ),
            const SizedBox(height: 20),
            _SheetLabel('Title'),
            const SizedBox(height: 6),
            PremiumInputField(controller: titleCtrl, hint: 'Mission title'),
            const SizedBox(height: 14),
            _SheetLabel('Goal'),
            const SizedBox(height: 6),
            PremiumInputField(
              controller: goalCtrl,
              hint: 'What do you want to achieve?',
              maxLines: 3,
              minLines: 2,
            ),
            const SizedBox(height: 24),
            Builder(builder: (ctx) {
              return PremiumButton(
                label: 'Save changes',
                onPressed: () async {
                  final title = titleCtrl.text.trim();
                  final goal = goalCtrl.text.trim();
                  if (title.isEmpty) return;
                  Navigator.of(sheetCtx).pop();
                  final container = ProviderScope.containerOf(ctx);
                  try {
                    await container.read(repositoryProvider).updateMission(
                      widget.mission.id,
                      {'title': title, 'description': goal},
                    );
                  } catch (_) {}
                  widget.onEdit();
                },
              );
            }),
          ]),
        );
      },
    );
  }

  // Returns a category-matched accent color
  Color _categoryColor(AppTokens t, String category) {
    return switch (category.toLowerCase()) {
      'career' || 'business' || 'productivity' => t.primary,
      'health' => t.success,
      'finance' => t.warning,
      _ => t.primary,
    };
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final mission = widget.mission;
    final catColor = _categoryColor(t, mission.category);

    return _PressScaleCard(
      onTap: () => context.push('/missions/${mission.id}'),
      child: Container(
        decoration: BoxDecoration(
          color: t.cardBg,
          borderRadius: BorderRadius.circular(AppRadius.x2l),
          border: Border.all(color: t.cardBorder),
          boxShadow: AppElevation.level1(Theme.of(context).brightness),
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(AppRadius.x2l),
          child: IntrinsicHeight(
            child:
                Row(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
              // â”€â”€ 3px left colour bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
              Container(
                width: 3,
                decoration: BoxDecoration(
                  color: catColor,
                  borderRadius: const BorderRadius.horizontal(
                      left: Radius.circular(AppRadius.x2l)),
                ),
              ),
              // â”€â”€ Card content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 8, 16),
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Top row: chips + menu
                        Row(children: [
                          CategoryChip(mission.category),
                          const SizedBox(width: 8),
                          StatusBadge(mission.status),
                          const Spacer(),
                          // 40Ã—40 hit-target menu button
                          Consumer(builder: (ctx, menuRef, _) {
                            final seen = menuRef.watch(tooltipSeenProvider);
                            final showTip = !(seen['mission_menu'] ?? false);

                            void openMenu() {
                              if (showTip) {
                                menuRef
                                    .read(tooltipSeenProvider.notifier)
                                    .state = {
                                  ...menuRef.read(tooltipSeenProvider),
                                  'mission_menu': true,
                                };
                              }
                              showModalBottomSheet(
                                context: context,
                                backgroundColor: t.surface,
                                shape: const RoundedRectangleBorder(
                                  borderRadius: BorderRadius.vertical(
                                      top: Radius.circular(AppRadius.x2l)),
                                ),
                                builder: (_) => SafeArea(
                                  child: Column(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        const SizedBox(height: 14),
                                        const SheetHandle(),
                                        const SizedBox(height: 8),
                                        ListTile(
                                          leading: Icon(
                                              LucideIcons.externalLink,
                                              color: t.textSecondary),
                                          title: const Text('Open'),
                                          onTap: () {
                                            Navigator.pop(context);
                                            context.push(
                                                '/missions/${mission.id}');
                                          },
                                        ),
                                        ListTile(
                                          leading: Icon(LucideIcons.pencil,
                                              color: t.textSecondary),
                                          title: const Text('Edit'),
                                          onTap: () {
                                            Navigator.pop(context);
                                            _editSheet(context, t);
                                          },
                                        ),
                                        Divider(height: 1, color: t.border),
                                        ListTile(
                                          leading: Icon(LucideIcons.trash2,
                                              color: t.destructive),
                                          title: Text('Delete',
                                              style: TextStyle(
                                                  color: t.destructive)),
                                          onTap: () {
                                            Navigator.pop(context);
                                            widget.onDelete();
                                          },
                                        ),
                                        const SizedBox(height: 8),
                                      ]),
                                ),
                              );
                            }

                            return Stack(
                              clipBehavior: Clip.none,
                              children: [
                                GestureDetector(
                                  onTap: openMenu,
                                  child: SizedBox(
                                    width: 40,
                                    height: 40,
                                    child: Center(
                                      child: Icon(LucideIcons.ellipsis,
                                          size: 18, color: t.textMuted),
                                    ),
                                  ),
                                ),
                                // One-time tooltip
                                if (showTip)
                                  Positioned(
                                    right: 44,
                                    top: 4,
                                    child: IgnorePointer(
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 8, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: t.surface,
                                          borderRadius: BorderRadius.circular(
                                              AppRadius.md),
                                          border: Border.all(color: t.border),
                                          boxShadow: AppElevation.level1(
                                              Theme.of(ctx).brightness),
                                        ),
                                        child: Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              Icon(LucideIcons.info,
                                                  size: 10, color: t.primary),
                                              const SizedBox(width: 4),
                                              Text(
                                                'Tap for options',
                                                style: TextStyle(
                                                  color: t.textSecondary,
                                                  fontSize: 10,
                                                  fontWeight: FontWeight.w600,
                                                ),
                                              ),
                                            ]),
                                      ),
                                    ),
                                  ),
                              ],
                            );
                          }),
                        ]),
                        const SizedBox(height: 12),

                        // Title â€” w800 / -0.5 tracking
                        Text(
                          mission.title,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style:
                              Theme.of(context).textTheme.titleLarge?.copyWith(
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: -0.5,
                                  ),
                        ),
                        const SizedBox(height: 5),
                        Text(
                          mission.goal,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: t.textMuted,
                            height: 1.6,
                            fontSize: 13,
                          ),
                        ),
                        const SizedBox(height: 14),

                        // Progress row
                        Row(children: [
                          SectionLabel('PROGRESS'),
                          const Spacer(),
                          Text(
                            '${(mission.progress * 100).round()}%',
                            style: TextStyle(
                              color: catColor,
                              fontWeight: FontWeight.w700,
                              fontSize: 13,
                            ),
                          ),
                        ]),
                        const SizedBox(height: 6),
                        // Progress bar with category-tinted gradient
                        PremiumProgressBar(
                          value: mission.progress,
                          height: 6,
                          color: catColor,
                        ),
                        const SizedBox(height: 12),

                        // Deadline row â€” pill chip around the date
                        Row(children: [
                          _DeadlineChip(
                            deadline: mission.deadline,
                            tokens: t,
                          ),
                          const Spacer(),
                          Icon(LucideIcons.chevronRight,
                              size: 16, color: t.textMuted),
                        ]),
                      ]),
                ),
              ),
            ]),
          ),
        ),
      ),
    ).staggered(widget.index);
  }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  PRESS-SCALE CARD WRAPPER
//  Used by _MissionCard to get the scale-on-press
//  behaviour without inheriting PremiumCard's
//  topAccentColor / sheen stack.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class _PressScaleCard extends StatefulWidget {
  const _PressScaleCard({required this.child, required this.onTap});
  final Widget child;
  final VoidCallback onTap;
  @override
  State<_PressScaleCard> createState() => _PressScaleCardState();
}

class _PressScaleCardState extends State<_PressScaleCard> {
  bool _pressed = false;
  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: widget.onTap,
        onTapDown: (_) => setState(() => _pressed = true),
        onTapUp: (_) => setState(() => _pressed = false),
        onTapCancel: () => setState(() => _pressed = false),
        child: AnimatedScale(
          scale: _pressed ? 0.97 : 1.0,
          duration: const Duration(milliseconds: 120),
          curve: Curves.easeOut,
          child: widget.child,
        ),
      );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  DEADLINE CHIP
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class _DeadlineChip extends StatelessWidget {
  const _DeadlineChip({required this.deadline, required this.tokens});
  final String deadline;
  final AppTokens tokens;

  bool get _isOverdue {
    // deadline format: 'd/m/yyyy'
    final parts = deadline.split('/');
    if (parts.length != 3) return false;
    final d = int.tryParse(parts[0]);
    final m = int.tryParse(parts[1]);
    final y = int.tryParse(parts[2]);
    if (d == null || m == null || y == null) return false;
    return DateTime(y, m, d).isBefore(DateTime.now());
  }

  @override
  Widget build(BuildContext context) {
    if (deadline == 'No deadline') {
      return Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(LucideIcons.calendarDays, size: 12, color: tokens.textMuted),
        const SizedBox(width: 4),
        Text(deadline, style: TextStyle(color: tokens.textMuted, fontSize: 11)),
      ]);
    }
    final overdue = _isOverdue;
    final fg = overdue ? tokens.destructive : tokens.textMuted;
    final chipBg = overdue
        ? tokens.destructive.withValues(alpha: 0.10)
        : tokens.backgroundSubtle;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: chipBg,
        borderRadius: BorderRadius.circular(AppRadius.full),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(LucideIcons.calendarDays, size: 11, color: fg),
        const SizedBox(width: 4),
        Text(
          deadline,
          style: TextStyle(
            color: fg,
            fontSize: 11,
            fontWeight: FontWeight.w600,
          ),
        ),
      ]),
    );
  }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MISSION DETAIL SCREEN
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

class MissionDetailScreen extends ConsumerStatefulWidget {
  const MissionDetailScreen({required this.id, super.key});
  final String id;
  @override
  ConsumerState<MissionDetailScreen> createState() => _MissionDetailState();
}

class _MissionDetailState extends ConsumerState<MissionDetailScreen>
    with SingleTickerProviderStateMixin {
  Map<String, dynamic>? _mission;
  List<TaskData> _tasks = [];
  bool _loading = true;
  String? _error;
  late final TabController _tabController =
      TabController(length: 3, vsync: this);

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final id = int.tryParse(widget.id) ?? 0;
      final repo = ref.read(repositoryProvider);
      final res = await Future.wait([
        repo.mission(id),
        repo.tasks(missionId: id),
      ]);
      if (!mounted) return;
      final m = res[0] as Map<String, dynamic>;
      setState(() {
        _mission = m;
        _tasks = (res[1] as List<Map<String, dynamic>>)
            .map((t) => TaskData.fromJson(t, m['title'] ?? ''))
            .toList();
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    if (_loading) {
      return Scaffold(
        backgroundColor: t.background,
        body: SafeArea(
          child: ListView(padding: const EdgeInsets.all(16), children: [
            // Header skeleton
            Container(
              height: 280,
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: t.primarySurface,
                borderRadius: BorderRadius.circular(AppRadius.lg),
              ),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 64, 20, 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: const [
                    _SkeletonBox(width: 80, height: 22, radius: AppRadius.full),
                    SizedBox(height: 10),
                    _SkeletonBox(height: 26),
                    SizedBox(height: 6),
                    _SkeletonBox(width: 200, height: 20),
                  ],
                ),
              ),
            ),
            // Overview card skeleton
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: t.cardBg,
                borderRadius: BorderRadius.circular(AppRadius.xl),
                border: Border.all(color: t.cardBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  _SkeletonBox(height: 14),
                  SizedBox(height: 4),
                  _SkeletonBox(height: 14),
                  SizedBox(height: 4),
                  _SkeletonBox(width: 220, height: 14),
                  SizedBox(height: 16),
                  _SkeletonBox(width: 120, height: 22, radius: AppRadius.full),
                  SizedBox(height: 12),
                  _SkeletonBox(height: 6, radius: AppRadius.full),
                ],
              ),
            ),
            const SizedBox(height: 12),
            const _SkeletonTaskRow(),
            const _SkeletonTaskRow(),
            const _SkeletonTaskRow(),
          ]),
        ),
      );
    }
    if (_error != null) {
      return Scaffold(
        backgroundColor: t.background,
        appBar: AppBar(),
        body: Padding(
          padding: const EdgeInsets.all(20),
          child: _InlineErrorState(title: "Couldn't load mission"),
        ),
      );
    }
    final m = _mission!;
    final progress =
        ((m['progress'] as num?)?.toDouble() ?? 0).clamp(0.0, 100.0);
    final mission = MissionData.fromJson(m);

    return Scaffold(
      backgroundColor: t.background,
      body: NestedScrollView(
        headerSliverBuilder: (_, __) => [
          SliverAppBar(
            expandedHeight: 280,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              collapseMode: CollapseMode.pin,
              background: Stack(children: [
                // Gradient header
                Positioned.fill(
                  child: GradientCard(
                    radius: 0,
                    padding: EdgeInsets.zero,
                    child: const SizedBox.expand(),
                  ),
                ),
                // Bottom fade to transparent so it blends into content
                Positioned(
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: 80,
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          t.background.withValues(alpha: 0.85),
                        ],
                      ),
                    ),
                  ),
                ),
                // Header content
                SafeArea(
                  bottom: false,
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 64, 20, 64),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        StatusBadge(mission.status),
                        const SizedBox(height: 10),
                        // Large glowing progress ring overlaid on header
                        Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                child: Text(
                                  m['title'] ?? '',
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 22,
                                    fontWeight: FontWeight.w800,
                                    height: 1.25,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 16),
                              // 72px progress ring with glow
                              Container(
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  boxShadow: AppElevation.ringGlow(
                                      Theme.of(context).brightness),
                                ),
                                child: SizedBox(
                                  width: 72,
                                  height: 72,
                                  child: Stack(
                                      alignment: Alignment.center,
                                      children: [
                                        // Track
                                        SizedBox(
                                          width: 72,
                                          height: 72,
                                          child: CircularProgressIndicator(
                                            value: 1.0,
                                            strokeWidth: 5,
                                            color: Colors.white
                                                .withValues(alpha: 0.20),
                                          ),
                                        ),
                                        // Fill
                                        TweenAnimationBuilder<double>(
                                          tween: Tween(
                                              begin: 0, end: progress / 100),
                                          duration:
                                              const Duration(milliseconds: 900),
                                          curve: Curves.easeOutCubic,
                                          builder: (_, v, __) => SizedBox(
                                            width: 72,
                                            height: 72,
                                            child: CircularProgressIndicator(
                                              value: v,
                                              strokeWidth: 5,
                                              color: Colors.white,
                                              strokeCap: StrokeCap.round,
                                            ),
                                          ),
                                        ),
                                        // Percentage label
                                        Text(
                                          '${progress.round()}%',
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 13,
                                            fontWeight: FontWeight.w800,
                                          ),
                                        ),
                                      ]),
                                ),
                              ),
                            ]),
                      ],
                    ),
                  ),
                ),
              ]),
            ),
            // Segmented pill tab bar
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(52),
              child: Consumer(builder: (ctx, tabRef, _) {
                final seen = tabRef.watch(tooltipSeenProvider);
                return _SegmentedTabBar(
                  controller: _tabController,
                  tabs: const ['Overview', 'Tasks', 'AI Insights'],
                  newTabIndex: (seen['ai_insights_tab'] ?? false) ? null : 2,
                  onTabTap: (i) {
                    if (i == 2 && !(seen['ai_insights_tab'] ?? false)) {
                      tabRef.read(tooltipSeenProvider.notifier).state = {
                        ...tabRef.read(tooltipSeenProvider),
                        'ai_insights_tab': true,
                      };
                    }
                  },
                );
              }),
            ),
          ),
        ],
        body: TabBarView(
          controller: _tabController,
          children: [
            // Overview tab
            ListView(
              padding: const EdgeInsets.all(16),
              children: [
                PremiumCard(
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                      Text(
                        m['description'] ?? m['goal'] ?? '',
                        style: TextStyle(
                            color: t.textSecondary, height: 1.6, fontSize: 14),
                      ),
                      const SizedBox(height: 16),
                      Row(children: [
                        CategoryChip(mission.category),
                        const SizedBox(width: 8),
                        PriorityBadge(mission.priority),
                      ]),
                      const SizedBox(height: 16),
                      Row(children: [
                        Text(
                          '${progress.round()}%',
                          style: TextStyle(
                            color: t.primary,
                            fontSize: 22,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text('progress',
                            style: TextStyle(color: t.textMuted, fontSize: 13)),
                      ]),
                      const SizedBox(height: 8),
                      PremiumProgressBar(value: progress / 100, height: 6),
                    ])),
              ],
            ),
            // Tasks tab
            _DetailTasksTab(
                tasks: _tasks, missionId: widget.id, onRefresh: _load),
            // AI Insights tab
            _InsightsTab(missionTitle: m['title'] ?? ''),
          ],
        ),
      ),
    );
  }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  SEGMENTED TAB BAR
//  All tabs inside a single rounded container;
//  active tab gets a surface background + shadow.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class _SegmentedTabBar extends StatefulWidget {
  const _SegmentedTabBar({
    required this.controller,
    required this.tabs,
    this.newTabIndex,
    this.onTabTap,
  });
  final TabController controller;
  final List<String> tabs;

  /// When set, shows a pulsing "New" dot on this tab index.
  final int? newTabIndex;
  final void Function(int)? onTabTap;

  @override
  State<_SegmentedTabBar> createState() => _SegmentedTabBarState();
}

class _SegmentedTabBarState extends State<_SegmentedTabBar> {
  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_onTabChange);
  }

  void _onTabChange() => setState(() {});

  @override
  void dispose() {
    widget.controller.removeListener(_onTabChange);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 6, 16, 10),
      child: Container(
        height: 36,
        decoration: BoxDecoration(
          color: t.backgroundSubtle,
          borderRadius: BorderRadius.circular(AppRadius.full),
          border: Border.all(color: t.border),
        ),
        child: Row(
          children: widget.tabs.indexed.map((item) {
            final isActive = widget.controller.index == item.$1;
            return Expanded(
              child: GestureDetector(
                onTap: () {
                  widget.controller.animateTo(item.$1);
                  widget.onTabTap?.call(item.$1);
                },
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  curve: Curves.easeOutCubic,
                  margin: const EdgeInsets.all(3),
                  decoration: BoxDecoration(
                    color: isActive ? t.surface : Colors.transparent,
                    borderRadius: BorderRadius.circular(AppRadius.full),
                    boxShadow: isActive
                        ? AppElevation.level1(Theme.of(context).brightness)
                        : null,
                  ),
                  child: Center(
                    child: Stack(clipBehavior: Clip.none, children: [
                      Text(
                        item.$2,
                        style: TextStyle(
                          color: isActive ? t.primary : t.textMuted,
                          fontSize: 12,
                          fontWeight:
                              isActive ? FontWeight.w700 : FontWeight.w500,
                          letterSpacing: -0.1,
                        ),
                      ),
                      // Pulsing "New" dot for first-time discovery
                      if (widget.newTabIndex == item.$1)
                        Positioned(
                          top: -2,
                          right: -8,
                          child: _PulseDot(color: t.primary),
                        ),
                    ]),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}

class _DetailTasksTab extends ConsumerStatefulWidget {
  const _DetailTasksTab({
    required this.tasks,
    required this.missionId,
    required this.onRefresh,
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
            task: item.$2,
            index: item.$1,
            onToggle: () async {
              await ref
                  .read(repositoryProvider)
                  .setTaskStatus(
                      item.$2.id, item.$2.done ? 'PENDING' : 'COMPLETED')
                  .catchError((_) {});
              widget.onRefresh();
            },
          )),
      const SizedBox(height: 12),
      OutlinedButton.icon(
        onPressed: () => _addTaskSheet(context),
        icon: const Icon(LucideIcons.plus),
        label: const Text('Add task'),
      ),
    ]);
  }

  void _addTaskSheet(BuildContext ctx) {
    final titleCtrl = TextEditingController();
    final durationCtrl = TextEditingController();
    String selectedPriority = 'medium';
    DateTime? dueDate;
    final t = ctx.tokens;

    const priorities = [
      ('low', 'Low'),
      ('medium', 'Medium'),
      ('high', 'High'),
      ('urgent', 'Urgent'),
    ];

    showModalBottomSheet(
      context: ctx,
      isScrollControlled: true,
      backgroundColor: t.surface,
      shape: const RoundedRectangleBorder(
          borderRadius:
              BorderRadius.vertical(top: Radius.circular(AppRadius.x2l))),
      builder: (sheetCtx) => StatefulBuilder(
        builder: (context, setModal) {
          final kb = MediaQuery.viewInsetsOf(context).bottom;
          return DraggableScrollableSheet(
            expand: false,
            initialChildSize: 0.75,
            minChildSize: 0.4,
            maxChildSize: 0.92,
            builder: (_, scrollCtrl) => Column(children: [
              const SizedBox(height: 14),
              const SheetHandle(),
              const SizedBox(height: 8),
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 0, 24, 8),
                child: Text(
                  'Add Task',
                  style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                ),
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
                      hint: 'e.g. Research and outline key concepts',
                    ),
                    const SizedBox(height: 14),

                    // Priority + Due date (side by side)
                    Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
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
                                      filled: true,
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
                                        borderSide: BorderSide(
                                            color: t.primary, width: 1.5),
                                      ),
                                      contentPadding:
                                          const EdgeInsets.symmetric(
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
                                        color: t.backgroundSubtle,
                                        borderRadius:
                                            BorderRadius.circular(AppRadius.md),
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
                                                  ? t.textMuted
                                                  : t.textPrimary,
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
                      controller: durationCtrl,
                      hint: 'e.g. 45',
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
                        await ref
                            .read(repositoryProvider)
                            .createTask(
                              missionId: mId,
                              title: title,
                              priority: selectedPriority,
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
  bool _loading = false;

  Future<void> _fetch() async {
    setState(() {
      _loading = true;
      _insight = null;
    });
    try {
      final result = await ref.read(repositoryProvider).runAgent(
        agentType: 'COACH',
        userInput: 'Give strategic insights for: ${widget.missionTitle}',
        contextData: {'missionTitle': widget.missionTitle},
      );
      if (!mounted) return;
      setState(() {
        _insight =
            result['output']?.toString() ?? 'No insights available right now.';
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _insight = 'Error: $e';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return ListView(padding: const EdgeInsets.all(16), children: [
      if (_loading) Center(child: CircularProgressIndicator(color: t.primary)),
      if (_insight != null)
        PremiumCard(
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Icon(LucideIcons.wandSparkles, color: t.primary, size: 18),
            const SizedBox(width: 8),
            Text('AI Insights', style: Theme.of(context).textTheme.titleLarge),
          ]),
          const SizedBox(height: 12),
          Text(_insight!,
              style: TextStyle(color: t.textSecondary, height: 1.6)),
        ])),
      if (_insight == null && !_loading)
        Center(
            child: Column(mainAxisSize: MainAxisSize.min, children: [
          const SizedBox(height: 32),
          EmptyStateOrb(icon: LucideIcons.sparkles, size: 72, iconSize: 28),
          const SizedBox(height: 20),
          Text(
            'Get AI insights',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  fontSize: 17,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'Powered by your LifeKit AI Coach',
            style: TextStyle(
              color: context.tokens.textMuted,
              fontSize: 13,
              height: 1.6,
            ),
          ),
          const SizedBox(height: 24),
          PremiumButton(
              label: 'Generate insights', onPressed: _fetch, minWidth: 200),
        ])),
    ]);
  }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// TASKS SCREEN
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

class TasksScreen extends ConsumerStatefulWidget {
  const TasksScreen({super.key});
  @override
  ConsumerState<TasksScreen> createState() => _TasksScreenState();
}

class _TasksScreenState extends ConsumerState<TasksScreen> {
  bool _loading = false;
  bool _searchOpen = false;

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
      final repo = ref.read(repositoryProvider);
      var missions = ref.read(missionsProvider);
      if (missions.isEmpty) {
        final rawM = await repo.missions();
        missions = rawM.map(MissionData.fromJson).toList();
        ref.read(missionsProvider.notifier).state = missions;
      }
      if (missions.isEmpty) {
        setState(() => _loading = false);
        return;
      }
      final results = await Future.wait(
        missions.take(5).map((m) => repo
            .tasks(missionId: m.id)
            .catchError((_) => <Map<String, dynamic>>[])),
      );
      ref.read(tasksProvider.notifier).state = results.indexed
          .expand((item) =>
              item.$2.map((t) => TaskData.fromJson(t, missions[item.$1].title)))
          .toList();
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  /// Build the grouped-by-mission list with a collapsible Completed section.
  List<Widget> _buildGroupedItems(
    List<TaskData> active,
    List<TaskData> done,
    AppTokens t,
    bool completedExpanded,
    WidgetRef ref,
  ) {
    final items = <Widget>[];

    // Group active tasks by mission title
    final groups = <String, List<TaskData>>{};
    for (final task in active) {
      groups
          .putIfAbsent(
              task.missionTitle.isEmpty ? 'Uncategorised' : task.missionTitle,
              () => [])
          .add(task);
    }

    var globalIdx = 0;
    for (final entry in groups.entries) {
      items.add(_GroupedSectionHeader(
        entry.key,
        count: entry.value.length,
        topPadding: globalIdx == 0 ? 4 : 20,
      ));
      for (final task in entry.value) {
        items.add(_OptimisticTaskRow(
          key: ValueKey('task_${task.id}'),
          task: task,
          index: globalIdx,
          onToggle: () => _optimisticToggle(task, ref),
          onDelete: () async {
            await ref
                .read(repositoryProvider)
                .deleteTask(task.id)
                .catchError((_) {});
            _loadTasks();
          },
        ));
        globalIdx++;
      }
    }

    // Completed section â€” collapsible
    if (done.isNotEmpty) {
      items.add(
        GestureDetector(
          onTap: () => ref.read(completedTasksExpandedProvider.notifier).state =
              !completedExpanded,
          child: Padding(
            padding: const EdgeInsets.only(top: 20, bottom: 8),
            child: Row(children: [
              Text(
                'COMPLETED (${done.length})',
                style: TextStyle(
                  color: t.textSecondary,
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.8,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(child: Divider(color: t.border, height: 1)),
              const SizedBox(width: 8),
              AnimatedRotation(
                turns: completedExpanded ? 0.5 : 0.0,
                duration: const Duration(milliseconds: 200),
                child:
                    Icon(LucideIcons.chevronDown, size: 14, color: t.textMuted),
              ),
            ]),
          ),
        ),
      );
      if (completedExpanded) {
        for (final task in done) {
          items.add(_OptimisticTaskRow(
            key: ValueKey('done_${task.id}'),
            task: task,
            index: globalIdx,
            onToggle: () => _optimisticToggle(task, ref),
            onDelete: () async {
              await ref
                  .read(repositoryProvider)
                  .deleteTask(task.id)
                  .catchError((_) {});
              _loadTasks();
            },
          ));
          globalIdx++;
        }
      }
    }

    return items;
  }

  /// Optimistic task toggle â€” flips done locally, reverts on API error.
  void _optimisticToggle(TaskData task, WidgetRef ref) {
    final prev = task.done;
    final tasks = List<TaskData>.from(ref.read(tasksProvider));
    final idx = tasks.indexWhere((t) => t.id == task.id);
    if (idx < 0) return;

    // Flip immediately
    tasks[idx].done = !prev;
    ref.read(tasksProvider.notifier).state = List.from(tasks);

    ref
        .read(repositoryProvider)
        .setTaskStatus(task.id, !prev ? 'COMPLETED' : 'PENDING')
        .catchError((_) {
      // Revert on failure
      final current = List<TaskData>.from(ref.read(tasksProvider));
      final i = current.indexWhere((t) => t.id == task.id);
      if (i >= 0) current[i].done = prev;
      ref.read(tasksProvider.notifier).state = List.from(current);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text("Couldn't save â€” tap to retry"),
          behavior: SnackBarBehavior.floating,
          action: SnackBarAction(
            label: 'Retry',
            onPressed: () => _optimisticToggle(task, ref),
          ),
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final allTasks = ref.watch(tasksProvider);
    final query = ref.watch(tasksSearchProvider).toLowerCase().trim();
    final completedExpanded = ref.watch(completedTasksExpandedProvider);
    final t = context.tokens;

    // Apply search
    final searched = query.isEmpty
        ? allTasks
        : allTasks
            .where((task) =>
                task.title.toLowerCase().contains(query) ||
                task.missionTitle.toLowerCase().contains(query))
            .toList();

    final activeTasks = searched.where((t) => !t.done).toList();
    final doneTasks = searched.where((t) => t.done).toList();

    final stats = [
      (
        allTasks.length,
        allTasks.where((t) => t.status == 'In Progress').length,
        allTasks
            .where((t) => t.priority == 'high' || t.priority == 'urgent')
            .length,
        allTasks.where((t) => t.done).length
      ),
    ];
    final statItems = [
      (allTasks.length, 'Total', t.primary),
      (stats[0].$2, 'In Progress', t.info),
      (stats[0].$3, 'High Priority', t.warning),
      (stats[0].$4, 'Done', t.success),
    ];

    return Scaffold(
      backgroundColor: t.background,
      // FAB removed â€” QuickActionBar handles creation
      body: SafeArea(
        child: Stack(children: [
          Column(children: [
            _PageHeading('Tasks',
                subtitle: '${activeTasks.length} remaining',
                actions: [
                  IconButton(
                    onPressed: () {
                      setState(() => _searchOpen = !_searchOpen);
                      if (!_searchOpen) {
                        ref.read(tasksSearchProvider.notifier).state = '';
                      }
                    },
                    icon: Icon(_searchOpen ? LucideIcons.x : LucideIcons.search,
                        size: 18, color: t.textSecondary),
                  ),
                  IconButton(
                    onPressed: _loadTasks,
                    icon: Icon(LucideIcons.refreshCw,
                        size: 18, color: t.textSecondary),
                  ),
                ]).pageEntrance(),

            // Animated search bar
            _SearchBar(
              visible: _searchOpen,
              hint: 'Search tasksâ€¦',
              onChanged: (v) =>
                  ref.read(tasksSearchProvider.notifier).state = v,
              onDismiss: () {
                setState(() => _searchOpen = false);
                ref.read(tasksSearchProvider.notifier).state = '';
              },
            ),

            // Stat chips
            if (!_searchOpen)
              SizedBox(
                height: 90,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  children: statItems.indexed
                      .map((item) => SizedBox(
                            width: 115,
                            child: Padding(
                              padding:
                                  const EdgeInsets.only(right: 10, bottom: 2),
                              child: PremiumCard(
                                radius: AppRadius.lg,
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 12, vertical: 10),
                                child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      FittedBox(
                                        fit: BoxFit.scaleDown,
                                        alignment: Alignment.centerLeft,
                                        child: Text(
                                          '${item.$2.$1}',
                                          style: TextStyle(
                                            fontSize: 22,
                                            fontWeight: FontWeight.w800,
                                            color: item.$2.$3,
                                          ),
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        item.$2.$2,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: TextStyle(
                                          fontSize: 10,
                                          fontWeight: FontWeight.w700,
                                          color: t.textSecondary,
                                        ),
                                      ),
                                    ]),
                              ).staggered(item.$1),
                            ),
                          ))
                      .toList(),
                ),
              ),
            const SizedBox(height: 8),

            if (_loading)
              LinearProgressIndicator(
                  color: t.primary,
                  minHeight: 2,
                  backgroundColor: t.backgroundSubtle),

            Expanded(
              child: allTasks.isEmpty
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 32),
                        child:
                            Column(mainAxisSize: MainAxisSize.min, children: [
                          EmptyStateOrb(
                              icon: LucideIcons.squareCheck,
                              size: 72,
                              iconSize: 32),
                          const SizedBox(height: 20),
                          Text(
                            'Tasks come from your missions',
                            textAlign: TextAlign.center,
                            style: Theme.of(context)
                                .textTheme
                                .headlineMedium
                                ?.copyWith(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 17,
                                ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Create a mission to get started â€” '
                            'tasks will appear here automatically.',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: t.textMuted,
                              fontSize: 13,
                              height: 1.6,
                            ),
                          ),
                          const SizedBox(height: 20),
                          PremiumButton(
                            label: 'Go to Missions',
                            minWidth: 200,
                            onPressed: () => context.go('/missions'),
                          ),
                        ]).animate().fadeIn(duration: 300.ms),
                      ),
                    )
                  : searched.isEmpty && query.isNotEmpty
                      ? Center(
                          child:
                              Column(mainAxisSize: MainAxisSize.min, children: [
                            Icon(LucideIcons.searchX,
                                size: 32, color: t.textMuted),
                            const SizedBox(height: 12),
                            Text(
                              'No results for "$query"',
                              style: TextStyle(
                                  color: t.textMuted,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500),
                            ),
                          ]),
                        )
                      : RefreshIndicator(
                          onRefresh: _loadTasks,
                          color: t.primary,
                          child: ListView(
                            padding: const EdgeInsets.fromLTRB(16, 4, 16, 120),
                            children: _buildGroupedItems(
                              activeTasks,
                              doneTasks,
                              t,
                              completedExpanded,
                              ref,
                            ),
                          ),
                        ),
            ),
          ]),

          // Floating quick-action bar
          _QuickActionBar(
            onAddTask: () => _addTaskSheet(context, allTasks),
            onNewMission: () => context.go('/missions'),
            onAskAI: () => context.go('/ai-coach'),
          ),
        ]),
      ),
    );
  }

  void _addTaskSheet(BuildContext ctx, List<TaskData> tasks) {
    final titleCtrl = TextEditingController();
    final durationCtrl = TextEditingController();
    final missions = ref.read(missionsProvider);
    int? selectedMissionId = missions.isNotEmpty ? missions.first.id : null;
    String selectedPriority = 'medium';
    DateTime? dueDate;
    final t = ctx.tokens;

    const priorities = [
      ('low', 'Low'),
      ('medium', 'Medium'),
      ('high', 'High'),
      ('urgent', 'Urgent'),
    ];

    showModalBottomSheet(
      context: ctx,
      isScrollControlled: true,
      backgroundColor: t.surface,
      shape: const RoundedRectangleBorder(
          borderRadius:
              BorderRadius.vertical(top: Radius.circular(AppRadius.x2l))),
      builder: (sheetCtx) => StatefulBuilder(
        builder: (context, setModal) {
          final kb = MediaQuery.viewInsetsOf(context).bottom;
          return DraggableScrollableSheet(
            expand: false,
            initialChildSize: 0.85,
            minChildSize: 0.5,
            maxChildSize: 0.95,
            builder: (_, scrollCtrl) => Column(children: [
              const SizedBox(height: 14),
              const SheetHandle(),
              const SizedBox(height: 8),
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 0, 24, 8),
                child: Row(children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      gradient: AppGradients.lifekit,
                      borderRadius: BorderRadius.circular(AppRadius.sm),
                    ),
                    child: const Icon(LucideIcons.squareCheck,
                        size: 16, color: Colors.white),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    'New Task',
                    style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                  ),
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
                      hint: 'e.g. Complete React advanced patterns module',
                    ),
                    const SizedBox(height: 14),

                    // Mission selector
                    if (missions.isNotEmpty) ...[
                      _SheetLabel('Mission *'),
                      const SizedBox(height: 6),
                      DropdownButtonFormField<int>(
                        initialValue: selectedMissionId,
                        decoration: InputDecoration(
                          filled: true,
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
                        onChanged: (v) => setModal(() => selectedMissionId = v),
                      ),
                      const SizedBox(height: 14),
                    ],

                    // Priority + Due date (side by side)
                    Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
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
                                      filled: true,
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
                                        borderSide: BorderSide(
                                            color: t.primary, width: 1.5),
                                      ),
                                      contentPadding:
                                          const EdgeInsets.symmetric(
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
                                        color: t.backgroundSubtle,
                                        borderRadius:
                                            BorderRadius.circular(AppRadius.md),
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
                                                  ? t.textMuted
                                                  : t.textPrimary,
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
                      controller: durationCtrl,
                      hint: 'e.g. 60',
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
                        await ref
                            .read(repositoryProvider)
                            .createTask(
                              missionId: mId,
                              title: title,
                              priority: selectedPriority,
                              description: dueDate != null
                                  ? 'Due: ${dueDate!.day}/${dueDate!.month}/${dueDate!.year}'
                                  : '',
                            )
                            .catchError((_) => <String, dynamic>{});
                        // If a duration was provided, patch the task
                        if (dur != null && dur > 0) {
                          // best-effort update â€” ignore error
                          ref
                              .read(repositoryProvider)
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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  OPTIMISTIC TASK ROW
//  Wraps _PremiumTaskRow with a shake animation
//  triggered when the toggle fails, and a
//  swipe-to-delete background.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class _OptimisticTaskRow extends StatefulWidget {
  const _OptimisticTaskRow({
    super.key,
    required this.task,
    required this.index,
    required this.onToggle,
    required this.onDelete,
  });
  final TaskData task;
  final int index;
  final VoidCallback onToggle;
  final VoidCallback onDelete;

  @override
  State<_OptimisticTaskRow> createState() => _OptimisticTaskRowState();
}

class _OptimisticTaskRowState extends State<_OptimisticTaskRow>
    with SingleTickerProviderStateMixin {
  late final AnimationController _shakeCtrl = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 400),
  );

  late final Animation<double> _shakeAnim = TweenSequence<double>([
    TweenSequenceItem(tween: Tween(begin: 0.0, end: -6.0), weight: 1),
    TweenSequenceItem(tween: Tween(begin: -6.0, end: 6.0), weight: 2),
    TweenSequenceItem(tween: Tween(begin: 6.0, end: -4.0), weight: 2),
    TweenSequenceItem(tween: Tween(begin: -4.0, end: 4.0), weight: 2),
    TweenSequenceItem(tween: Tween(begin: 4.0, end: 0.0), weight: 1),
  ]).animate(CurvedAnimation(parent: _shakeCtrl, curve: Curves.easeOut));

  /// Call this to trigger the shake feedback.
  void shake() => _shakeCtrl.forward(from: 0);

  @override
  void dispose() {
    _shakeCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return AnimatedBuilder(
      animation: _shakeAnim,
      builder: (_, child) => Transform.translate(
        offset: Offset(_shakeAnim.value, 0),
        child: child,
      ),
      child: Dismissible(
        key: widget.key ?? ValueKey(widget.task.id),
        direction: DismissDirection.endToStart,
        background: Container(
          alignment: Alignment.centerRight,
          padding: const EdgeInsets.only(right: 20),
          decoration: BoxDecoration(
            color: t.destructive,
            borderRadius: BorderRadius.circular(AppRadius.lg),
          ),
          child: Column(mainAxisSize: MainAxisSize.min, children: const [
            Icon(LucideIcons.trash2, color: Colors.white, size: 18),
            SizedBox(height: 2),
            Text('Delete',
                style: TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.w600)),
          ]),
        ),
        confirmDismiss: (_) async {
          widget.onDelete();
          return false; // We handle removal ourselves
        },
        child: _PremiumTaskRow(
          task: widget.task,
          index: widget.index,
          onToggle: widget.onToggle,
        ),
      ),
    );
  }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// AI COACH SCREEN
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

class ChatMessage {
  ChatMessage(this.text, this.isUser);
  final String text;
  final bool isUser;
}

class ChatSession {
  ChatSession({
    required this.id,
    required this.title,
    required this.preview,
    required this.timestamp,
    required this.messages,
  });

  final String id;
  final String title;
  final String preview;
  final String timestamp;
  final List<ChatMessage> messages;

  ChatSession copyWith({
    String? title,
    String? preview,
    String? timestamp,
    List<ChatMessage>? messages,
  }) {
    return ChatSession(
      id: id,
      title: title ?? this.title,
      preview: preview ?? this.preview,
      timestamp: timestamp ?? this.timestamp,
      messages: messages ?? this.messages,
    );
  }
}

final initialChatSessions = <ChatSession>[
  ChatSession(
    id: 's1',
    title: 'I want to become influencer',
    preview: 'I want to become influencer',
    timestamp: 'Just now',
    messages: [
      ChatMessage('I want to become influencer', true),
      ChatMessage('Awesome goal! I can help you structure a personal brand, define target topics, and schedule weekly video production.', false),
    ],
  ),
  ChatSession(
    id: 's2',
    title: 'Career roadmap',
    preview: 'Help me plan my next 6 months',
    timestamp: 'Yesterday',
    messages: [
      ChatMessage('Help me plan my next 6 months', true),
      ChatMessage('I\'ve broken down your 6-month roadmap into 3 core sprints: Skill Mastery, Portfolio Launch, and Networking.', false),
    ],
  ),
  ChatSession(
    id: 's3',
    title: 'Mission review',
    preview: 'What should I focus on this week?',
    timestamp: '2 days ago',
    messages: [
      ChatMessage('What should I focus on this week?', true),
      ChatMessage('Your top priority is completing the MVP testing and getting feedback from early users.', false),
    ],
  ),
];

final chatSessionsProvider = StateProvider<List<ChatSession>>((ref) => initialChatSessions);
final activeSessionIdProvider = StateProvider<String>((ref) => 's1');
final chatProvider = StateProvider<List<ChatMessage>>((ref) => const []);

class AiCoachScreen extends ConsumerStatefulWidget {
  const AiCoachScreen({super.key});
  @override
  ConsumerState<AiCoachScreen> createState() => _AiCoachScreenState();
}

class _AiCoachScreenState extends ConsumerState<AiCoachScreen> {
  final _input = TextEditingController();
  final _scroll = ScrollController();
  bool _sending = false;

  @override
  void dispose() {
    _input.dispose();
    _scroll.dispose();
    super.dispose();
  }

  void _createNewChat() {
    final newId = 's_${DateTime.now().millisecondsSinceEpoch}';
    final newSession = ChatSession(
      id: newId,
      title: 'New chat',
      preview: 'Ask your AI Coach...',
      timestamp: 'Just now',
      messages: [],
    );

    ref.read(chatSessionsProvider.notifier).state = [
      newSession,
      ...ref.read(chatSessionsProvider),
    ];
    ref.read(activeSessionIdProvider.notifier).state = newId;
    ref.read(chatProvider.notifier).state = const [];
  }

  void _switchSession(String id) {
    ref.read(activeSessionIdProvider.notifier).state = id;
    final sessions = ref.read(chatSessionsProvider);
    final selected = sessions.firstWhere(
      (s) => s.id == id,
      orElse: () => sessions.first,
    );
    ref.read(chatProvider.notifier).state = selected.messages;
  }

  void _deleteSession(String id) {
    final sessions = ref.read(chatSessionsProvider);
    final updated = sessions.where((s) => s.id != id).toList();

    if (updated.isEmpty) {
      final newId = 's_${DateTime.now().millisecondsSinceEpoch}';
      final fresh = ChatSession(
        id: newId,
        title: 'New chat',
        preview: 'Ask your AI Coach...',
        timestamp: 'Just now',
        messages: [],
      );
      ref.read(chatSessionsProvider.notifier).state = [fresh];
      ref.read(activeSessionIdProvider.notifier).state = newId;
      ref.read(chatProvider.notifier).state = const [];
    } else {
      ref.read(chatSessionsProvider.notifier).state = updated;
      final activeId = ref.read(activeSessionIdProvider);
      if (activeId == id) {
        _switchSession(updated.first.id);
      }
    }
  }

  Future<void> _send(String text) async {
    final value = text.trim();
    if (value.isEmpty || _sending) return;
    _input.clear();

    final activeId = ref.read(activeSessionIdProvider);
    final sessions = ref.read(chatSessionsProvider);
    final activeSessionIndex = sessions.indexWhere((s) => s.id == activeId);

    final userMsg = ChatMessage(value, true);
    List<ChatMessage> currentMsgs = [];
    if (activeSessionIndex != -1) {
      currentMsgs = List.from(sessions[activeSessionIndex].messages)..add(userMsg);
    } else {
      currentMsgs = [userMsg];
    }
    ref.read(chatProvider.notifier).state = currentMsgs;

    if (activeSessionIndex != -1) {
      final curSession = sessions[activeSessionIndex];
      final newTitle = (curSession.title == 'New chat' || curSession.title.isEmpty)
          ? (value.length > 28 ? '${value.substring(0, 25)}...' : value)
          : curSession.title;

      final updatedSession = curSession.copyWith(
        title: newTitle,
        preview: value,
        timestamp: 'Just now',
        messages: currentMsgs,
      );

      final updatedList = List<ChatSession>.from(sessions);
      updatedList[activeSessionIndex] = updatedSession;
      ref.read(chatSessionsProvider.notifier).state = updatedList;
    }

    setState(() => _sending = true);
    _scrollToBottom();

    try {
      final missions = ref.read(missionsProvider);
      final result = await ref.read(repositoryProvider).runAgent(
            agentType: 'COACH',
            userInput: value,
            contextData:
                missions.isEmpty ? {} : {'missionTitle': missions.first.title},
          );
      final ok = result['success'] != false;
      final reply = result['output']?.toString() ??
          'I\'m here to help. Ask me about your missions or goals.';
      if (!ok) throw Exception(reply);

      final botMsg = ChatMessage(reply, false);
      final finalMsgs = List<ChatMessage>.from(ref.read(chatProvider))..add(botMsg);
      ref.read(chatProvider.notifier).state = finalMsgs;

      final latestSessions = ref.read(chatSessionsProvider);
      final sIdx = latestSessions.indexWhere((s) => s.id == activeId);
      if (sIdx != -1) {
        final updatedSession = latestSessions[sIdx].copyWith(
          preview: reply.length > 40 ? '${reply.substring(0, 37)}...' : reply,
          messages: finalMsgs,
        );
        final updatedList = List<ChatSession>.from(latestSessions);
        updatedList[sIdx] = updatedSession;
        ref.read(chatSessionsProvider.notifier).state = updatedList;
      }
    } catch (_) {
      final errMsg = ChatMessage('The AI service is currently unavailable.', false);
      final finalMsgs = List<ChatMessage>.from(ref.read(chatProvider))..add(errMsg);
      ref.read(chatProvider.notifier).state = finalMsgs;
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

  void _showRecentChatsSheet(BuildContext ctx, AppTokens t) {
    showModalBottomSheet(
      context: ctx,
      isScrollControlled: true,
      backgroundColor: t.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.x2l)),
      ),
      builder: (sheetCtx) => Consumer(
        builder: (context, ref, _) {
          final sessions = ref.watch(chatSessionsProvider);
          final activeId = ref.watch(activeSessionIdProvider);

          return DraggableScrollableSheet(
            expand: false,
            initialChildSize: 0.65,
            minChildSize: 0.4,
            maxChildSize: 0.9,
            builder: (_, scrollCtrl) => Column(children: [
              const SizedBox(height: 14),
              const SheetHandle(),
              const SizedBox(height: 12),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  children: [
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        gradient: AppGradients.lifekit,
                        borderRadius: BorderRadius.circular(AppRadius.sm),
                      ),
                      child: const Icon(LucideIcons.history, size: 16, color: Colors.white),
                    ),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Recent Chat History',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: t.textPrimary,
                            )),
                        Text('${sessions.length} saved sessions',
                            style: TextStyle(
                              fontSize: 11,
                              color: t.textMuted,
                            )),
                      ],
                    ),
                    const Spacer(),
                    IconButton(
                      onPressed: () {
                        Navigator.pop(sheetCtx);
                        _createNewChat();
                      },
                      icon: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          gradient: AppGradients.lifekit,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(LucideIcons.plus, size: 14, color: Colors.white),
                      ),
                      tooltip: 'New Chat',
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              Divider(color: t.border, height: 1),
              Expanded(
                child: sessions.isEmpty
                    ? Center(
                        child: Text('No recent chat history',
                            style: TextStyle(color: t.textMuted, fontSize: 13)),
                      )
                    : ListView.builder(
                        controller: scrollCtrl,
                        padding: const EdgeInsets.all(16),
                        itemCount: sessions.length,
                        itemBuilder: (_, i) {
                          final s = sessions[i];
                          final isActive = s.id == activeId;

                          return Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: Material(
                              color: Colors.transparent,
                              child: InkWell(
                                onTap: () {
                                  Navigator.pop(sheetCtx);
                                  _switchSession(s.id);
                                },
                                borderRadius: BorderRadius.circular(AppRadius.lg),
                                child: Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: isActive
                                        ? t.primarySurface.withValues(alpha: 0.6)
                                        : t.backgroundSubtle,
                                    borderRadius: BorderRadius.circular(AppRadius.lg),
                                    border: Border.all(
                                      color: isActive
                                          ? t.primary.withValues(alpha: 0.4)
                                          : t.border,
                                    ),
                                  ),
                                  child: Row(
                                    children: [
                                      Container(
                                        width: 36,
                                        height: 36,
                                        decoration: BoxDecoration(
                                          color: isActive ? t.primary : t.surface,
                                          shape: BoxShape.circle,
                                          border: Border.all(
                                            color: isActive ? t.primary : t.border,
                                          ),
                                        ),
                                        child: Icon(
                                          LucideIcons.messageSquare,
                                          size: 16,
                                          color: isActive ? Colors.white : t.textSecondary,
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              children: [
                                                Expanded(
                                                  child: Text(
                                                    s.title,
                                                    maxLines: 1,
                                                    overflow: TextOverflow.ellipsis,
                                                    style: TextStyle(
                                                      fontSize: 13,
                                                      fontWeight: isActive
                                                          ? FontWeight.w700
                                                          : FontWeight.w600,
                                                      color: isActive
                                                          ? t.primary
                                                          : t.textPrimary,
                                                    ),
                                                  ),
                                                ),
                                                Text(
                                                  s.timestamp,
                                                  style: TextStyle(
                                                    fontSize: 10,
                                                    color: t.textMuted,
                                                  ),
                                                ),
                                              ],
                                            ),
                                            const SizedBox(height: 3),
                                            Text(
                                              s.preview,
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                              style: TextStyle(
                                                fontSize: 11,
                                                color: t.textSecondary,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      if (isActive)
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 6, vertical: 2),
                                          margin: const EdgeInsets.only(right: 6),
                                          decoration: BoxDecoration(
                                            color: t.statusActiveBg,
                                            borderRadius:
                                                BorderRadius.circular(AppRadius.full),
                                          ),
                                          child: Text('Active',
                                              style: TextStyle(
                                                fontSize: 9,
                                                fontWeight: FontWeight.w700,
                                                color: t.statusActiveFg,
                                              )),
                                        ),
                                      IconButton(
                                        onPressed: () => _deleteSession(s.id),
                                        icon: Icon(LucideIcons.trash2,
                                            size: 14, color: t.textMuted),
                                        padding: EdgeInsets.zero,
                                        constraints: const BoxConstraints(
                                            minWidth: 28, minHeight: 28),
                                        tooltip: 'Delete Chat History',
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          );
                        },
                      ),
              ),
            ]),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final sessions = ref.watch(chatSessionsProvider);
    final activeId = ref.watch(activeSessionIdProvider);

    final activeSession = sessions.firstWhere(
      (s) => s.id == activeId,
      orElse: () => sessions.isNotEmpty
          ? sessions.first
          : ChatSession(
              id: 'new',
              title: 'New chat',
              preview: '',
              timestamp: 'Just now',
              messages: [],
            ),
    );

    final messages = activeSession.messages;

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
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        gradient: AppGradients.lifekit,
                        borderRadius: BorderRadius.circular(AppRadius.sm),
                        boxShadow: AppShadows.greenSm,
                      ),
                      child: const Icon(LucideIcons.bot,
                          size: 16, color: Colors.white),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('AI Coach',
                            style: Theme.of(context).textTheme.titleMedium),
                        // Online chip
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 7, vertical: 1),
                          decoration: BoxDecoration(
                            color: t.statusActiveBg,
                            borderRadius: BorderRadius.circular(AppRadius.full),
                          ),
                          child: Row(mainAxisSize: MainAxisSize.min, children: [
                            Container(
                                width: 5,
                                height: 5,
                                decoration: BoxDecoration(
                                  color: t.statusActiveFg,
                                  shape: BoxShape.circle,
                                )),
                            const SizedBox(width: 4),
                            Text('Online',
                                style: TextStyle(
                                  color: t.statusActiveFg,
                                  fontSize: 9,
                                  fontWeight: FontWeight.w700,
                                )),
                          ]),
                        ),
                      ]),
                ]),
                actions: [
                  IconButton(
                    onPressed: () => _showRecentChatsSheet(context, t),
                    icon: Icon(LucideIcons.history,
                        size: 18, color: t.textSecondary),
                    tooltip: 'Recent Chat History',
                  ),
                  IconButton(
                    onPressed: _createNewChat,
                    icon: Icon(LucideIcons.plus, size: 18, color: t.primary),
                    tooltip: 'New Chat',
                  ),
                  if (messages.isNotEmpty)
                    IconButton(
                      onPressed: () {
                        final updatedSessions = sessions.map((s) {
                          if (s.id == activeId) {
                            return s.copyWith(messages: [], preview: 'No messages');
                          }
                          return s;
                        }).toList();
                        ref.read(chatSessionsProvider.notifier).state = updatedSessions;
                        ref.read(chatProvider.notifier).state = const [];
                      },
                      icon: Icon(LucideIcons.trash2,
                          size: 18, color: t.textSecondary),
                      tooltip: 'Clear Chat',
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
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                child: Row(children: [
                  GlassCard(
                    radius: AppRadius.full,
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                      Icon(LucideIcons.target, size: 12, color: t.primary),
                      const SizedBox(width: 6),
                      Text(m.first.title,
                          style: TextStyle(
                            color: t.textPrimary,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          )),
                    ]),
                  ),
                  const SizedBox(width: 8),
                  GlassCard(
                    radius: AppRadius.full,
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                      Icon(LucideIcons.brain, size: 12, color: t.info),
                      const SizedBox(width: 6),
                      Text('Memory active',
                          style: TextStyle(
                            color: t.textPrimary,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          )),
                    ]),
                  ),
                ]),
              );
            }),

            // Recent Chat History horizontal quick-selector bar
            Container(
              height: 38,
              margin: const EdgeInsets.only(bottom: 6),
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 14),
                children: [
                  // New Chat pill
                  GestureDetector(
                    onTap: _createNewChat,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      margin: const EdgeInsets.only(right: 6),
                      decoration: BoxDecoration(
                        gradient: AppGradients.lifekit,
                        borderRadius: BorderRadius.circular(AppRadius.full),
                        boxShadow: AppShadows.greenSm,
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(LucideIcons.plus, size: 12, color: Colors.white),
                          SizedBox(width: 4),
                          Text('New Chat',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              )),
                        ],
                      ),
                    ),
                  ),

                  // Session pills
                  ...sessions.map((s) {
                    final isActive = s.id == activeId;
                    return GestureDetector(
                      onTap: () => _switchSession(s.id),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 6),
                        margin: const EdgeInsets.only(right: 6),
                        decoration: BoxDecoration(
                          color: isActive
                              ? t.primarySurface
                              : t.surface.withValues(alpha: 0.7),
                          borderRadius: BorderRadius.circular(AppRadius.full),
                          border: Border.all(
                            color: isActive
                                ? t.primary
                                : t.border,
                            width: isActive ? 1.5 : 1,
                          ),
                          boxShadow: isActive ? AppShadows.greenSm : null,
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              LucideIcons.messageSquare,
                              size: 11,
                              color: isActive ? t.primary : t.textMuted,
                            ),
                            const SizedBox(width: 5),
                            Text(
                              s.title,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: isActive
                                    ? FontWeight.w700
                                    : FontWeight.w500,
                                color: isActive
                                    ? t.primary
                                    : t.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }),

                  // View All History pill button
                  GestureDetector(
                    onTap: () => _showRecentChatsSheet(context, t),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: t.backgroundSubtle,
                        borderRadius: BorderRadius.circular(AppRadius.full),
                        border: Border.all(color: t.border),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(LucideIcons.history, size: 11, color: t.textMuted),
                          const SizedBox(width: 4),
                          Text('History',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: t.textMuted,
                              )),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Messages list
            Expanded(
              child: messages.isEmpty
                  ? _SuggestedPrompts(onTap: _send)
                  : ListView.builder(
                      controller: _scroll,
                      padding: const EdgeInsets.all(16),
                      itemCount: messages.length + (_sending ? 1 : 0),
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
                    color: t.surface.withValues(alpha: 0.9),
                    border: Border(top: BorderSide(color: t.border)),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Expanded(
                        child: Container(
                          constraints: const BoxConstraints(maxHeight: 120),
                          decoration: BoxDecoration(
                            color: t.backgroundSubtle,
                            borderRadius: BorderRadius.circular(AppRadius.lg),
                            border: Border.all(color: t.border),
                          ),
                          child: TextField(
                            controller: _input,
                            minLines: 1,
                            maxLines: 5,
                            decoration: InputDecoration(
                              hintText: 'Ask your AI Coach...',
                              border: InputBorder.none,
                              enabledBorder: InputBorder.none,
                              focusedBorder: InputBorder.none,
                              contentPadding: const EdgeInsets.symmetric(
                                  horizontal: 14, vertical: 12),
                              hintStyle:
                                  TextStyle(color: t.textMuted, fontSize: 14),
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
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          gradient: _sending ? null : AppGradients.lifekit,
                          color: _sending ? t.backgroundSubtle : null,
                          shape: BoxShape.circle,
                          boxShadow: _sending ? null : AppShadows.greenSm,
                        ),
                        child: Material(
                          color: Colors.transparent,
                          shape: const CircleBorder(),
                          child: InkWell(
                            customBorder: const CircleBorder(),
                            onTap: _sending ? null : () => _send(_input.text),
                            child: Center(
                              child: _sending
                                  ? SizedBox(
                                      width: 18,
                                      height: 18,
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
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                gradient: AppGradients.lifekit,
                shape: BoxShape.circle,
              ),
              child: const Icon(LucideIcons.bot, size: 14, color: Colors.white),
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
              gradient: isUser ? AppGradients.lifekit : null,
              color: isUser ? null : tokens.surface,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(isUser ? AppRadius.xl : 4),
                topRight: Radius.circular(isUser ? 4 : AppRadius.xl),
                bottomLeft: const Radius.circular(AppRadius.xl),
                bottomRight: const Radius.circular(AppRadius.xl),
              ),
              border: isUser ? null : Border.all(color: tokens.cardBorder),
              boxShadow: isUser ? AppShadows.greenSm : AppShadows.card,
            ),
            child: Text(
              message.text,
              style: TextStyle(
                color: isUser ? Colors.white : tokens.textPrimary,
                height: 1.55,
                fontSize: 14,
              ),
            ),
          ).animate().fadeIn(duration: 250.ms).slideX(
                begin: isUser ? 0.08 : -0.08,
                end: 0,
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
        child: Row(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  gradient: AppGradients.lifekit,
                  shape: BoxShape.circle,
                ),
                child:
                    const Icon(LucideIcons.bot, size: 14, color: Colors.white),
              ),
              const SizedBox(width: 8),
              Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding:
                    const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                decoration: BoxDecoration(
                  color: tokens.surface,
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(4),
                    topRight: Radius.circular(AppRadius.xl),
                    bottomLeft: Radius.circular(AppRadius.xl),
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
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(24, 32, 24, 24),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: AppGradients.lifekit,
              shape: BoxShape.circle,
              boxShadow: AppShadows.green,
            ),
            child: const Icon(LucideIcons.bot, size: 36, color: Colors.white),
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
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: GestureDetector(
                    onTap: () => onTap(item.$2),
                    behavior: HitTestBehavior.opaque,
                    child: Row(children: [
                      Icon(LucideIcons.sparkles, size: 14, color: t.primary),
                      const SizedBox(width: 10),
                      Expanded(
                          child: Text(item.$2,
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
    );
  }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// PROFILE SCREEN
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});
  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  Map<String, dynamic> _profile = {};
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final p = await ref.read(repositoryProvider).profile();
      if (!mounted) return;
      setState(() {
        _profile = p;
        _loading = false;
      });
      ref.read(profileProvider.notifier).state = p;
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  String get _initials {
    final name = (_profile['fullName'] ?? _profile['full_name'] ?? 'U')
        .toString()
        .trim();
    final parts = name.split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.substring(0, name.length.clamp(1, 2)).toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final missions = ref.watch(missionsProvider);
    final tasks = ref.watch(tasksProvider);
    final name =
        (_profile['fullName'] ?? _profile['full_name'] ?? 'User').toString();
    final email = (_profile['email'] ?? '').toString();

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
                    width: 76,
                    height: 76,
                    decoration: BoxDecoration(
                      gradient: AppGradients.lifekit,
                      shape: BoxShape.circle,
                      boxShadow: AppShadows.greenSm,
                    ),
                    child: Center(
                      child: Text(_initials,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 26,
                            fontWeight: FontWeight.w800,
                          )),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(name, style: Theme.of(context).textTheme.headlineLarge),
                  const SizedBox(height: 4),
                  Text(email,
                      style: TextStyle(color: t.textMuted, fontSize: 13)),
                ]),
              ).pageEntrance(),
              const SizedBox(height: 16),

              // Stat row
              Row(children: [
                Expanded(
                    child: _StatCard(
                        '${missions.length}', 'Missions', LucideIcons.target)),
                const SizedBox(width: 10),
                Expanded(
                    child: _StatCard(
                        '${tasks.length}', 'Tasks', LucideIcons.squareCheck)),
                const SizedBox(width: 10),
                Expanded(
                    child: _StatCard('${tasks.where((t) => t.done).length}',
                        'Done', LucideIcons.checkCheck)),
              ]).staggered(1),
              const SizedBox(height: 16),

              // Nav tiles
              PremiumCard(
                padding: EdgeInsets.zero,
                child: Column(children: [
                  _NavTile(LucideIcons.target, 'Missions',
                      () => context.go('/missions')),
                  _NavTile(LucideIcons.bot, 'AI Coach',
                      () => context.go('/ai-coach')),
                  _NavTile(LucideIcons.brain, 'Memory',
                      () => context.push('/memory')),
                  _NavTile(LucideIcons.telescope, 'Opportunities',
                      () => context.push('/opportunities')),
                  _NavTile(LucideIcons.store, 'Marketplace',
                      () => context.push('/marketplace')),
                  _NavTile(LucideIcons.barChart2, 'Analytics',
                      () => context.push('/analytics')),
                  _NavTile(LucideIcons.calendarRange, 'Planner',
                      () => context.push('/planner')),
                  _NavTile(LucideIcons.users, 'Agents',
                      () => context.push('/agents')),
                  _NavTile(LucideIcons.settings, 'Settings',
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
                    color: t.destructiveSurface,
                    borderRadius: BorderRadius.circular(AppRadius.full),
                    border:
                        Border.all(color: t.destructive.withValues(alpha: 0.4)),
                  ),
                  child: Center(
                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                      Icon(LucideIcons.logOut, size: 16, color: t.destructive),
                      const SizedBox(width: 8),
                      Text('Sign out',
                          style: TextStyle(
                            color: t.destructive,
                            fontWeight: FontWeight.w700,
                            fontSize: 14,
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
      radius: AppRadius.lg,
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
      child: Column(children: [
        Icon(icon, color: t.primary, size: 18),
        const SizedBox(height: 8),
        Text(value,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: t.textPrimary,
            )),
        const SizedBox(height: 2),
        Text(label,
            style: TextStyle(
              fontSize: 10,
              color: t.textMuted,
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
      leading: Icon(icon, color: t.primary, size: 20),
      title: Text(label,
          style: TextStyle(
            color: t.textPrimary,
            fontWeight: FontWeight.w500,
            fontSize: 14,
          )),
      trailing: Icon(LucideIcons.chevronRight, size: 16, color: t.textMuted),
      onTap: onTap,
    );
  }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ONBOARDING SCREEN (kept functional, lightly styled)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});
  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingState();
}

class _OnboardingState extends ConsumerState<OnboardingScreen> {
  int _step = 0;
  String _userType = 'Professional';
  final _focuses = <String>{'Career'};
  final _goalCtrl = TextEditingController();
  double _hours = 8;
  bool _saving = false;

  @override
  void dispose() {
    _goalCtrl.dispose();
    super.dispose();
  }

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
                      gradient: i <= _step ? AppGradients.lifekit : null,
                      color: i <= _step ? null : t.backgroundSubtle,
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
                key: ValueKey(_step),
                padding: const EdgeInsets.all(24),
                child: _stepWidget(),
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
                    child:
                        Text('Back', style: TextStyle(color: t.textSecondary)),
                  ),
                const Spacer(),
                PremiumButton(
                  label: _step == 6 ? 'Launch my mission' : 'Continue',
                  loading: _saving,
                  onPressed: _next,
                  minWidth: 160,
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
            hours: _hours, onHoursChange: (v) => setState(() => _hours = v)),
        5 => const _OnboardAnalysis(),
        _ => _OnboardPreview(goal: _goalCtrl.text),
      };

  Future<void> _next() async {
    if (_step == 5) return;
    if (_step == 6) {
      setState(() => _saving = true);
      final goal = _goalCtrl.text.trim();
      if (goal.isNotEmpty) {
        await ref
            .read(repositoryProvider)
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
        radius: AppRadius.x2l,
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
        'LifeKit turns your goals into structured missions, intelligent plans, and daily actions â€” powered by specialist AI.',
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
        physics: const NeverScrollableScrollPhysics(),
        crossAxisCount: 2,
        childAspectRatio: 1.4,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        children: ['Professional', 'Student', 'Founder', 'Family']
            .map((type) => GestureDetector(
                  onTap: () => onSelect(type),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    decoration: BoxDecoration(
                      color: selected == type ? t.primarySurface : t.surface,
                      borderRadius: BorderRadius.circular(AppRadius.xl),
                      border: Border.all(
                        color: selected == type ? t.primary : t.border,
                        width: selected == type ? 2.0 : 1.0,
                      ),
                      boxShadow:
                          selected == type ? AppShadows.greenSm : AppShadows.xs,
                    ),
                    child: Center(
                      child: Text(type,
                          style: TextStyle(
                            fontWeight: FontWeight.w700,
                            color: selected == type ? t.primary : t.textPrimary,
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
          'Career',
          'Education',
          'Business',
          'Finance',
          'Health',
          'Technology',
          'Lifestyle',
          'Relationships'
        ])
          _PremiumFilterChip(
            label: f,
            selected: selected.contains(f),
            onTap: () => onToggle(f, !selected.contains(f)),
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
        hint: 'I want toâ€¦',
        maxLines: 6,
        minLines: 4,
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
      Text('Shape your plan', style: Theme.of(context).textTheme.displayMedium),
      const SizedBox(height: 8),
      Text('Choose a pace that feels sustainable.',
          style: TextStyle(color: t.textMuted)),
      const SizedBox(height: 24),
      Text('${hours.round()} hours per week',
          style: TextStyle(fontWeight: FontWeight.w700, color: t.textPrimary)),
      Slider(
        value: hours,
        min: 1,
        max: 40,
        divisions: 39,
        onChanged: onHoursChange,
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
      Text('Building your roadmapâ€¦',
          style: Theme.of(context).textTheme.displayMedium),
      const SizedBox(height: 8),
      Text('Analyzing your goals, schedule, and preferences.',
          style: TextStyle(color: t.textMuted)),
      const SizedBox(height: 56),
      Center(
        child: PulseGlow(
          child: Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              gradient: AppGradients.lifekit,
              shape: BoxShape.circle,
              boxShadow: AppShadows.green,
            ),
            child: const Icon(LucideIcons.wandSparkles,
                color: Colors.white, size: 32),
          ),
        ),
      ),
      const SizedBox(height: 24),
      Center(
          child: Text('This will only take a momentâ€¦',
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
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(AppRadius.full),
            ),
            child: const Text('MISSION PREVIEW',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.8,
                )),
          ),
          const SizedBox(height: 12),
          Text(
            goal.isEmpty
                ? 'Your first mission'
                : (goal.length > 60 ? '${goal.substring(0, 60)}â€¦' : goal),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 14),
          const Text(
            'â—‹  Define your success criteria\n\n'
            'â—‹  Break into weekly milestones\n\n'
            'â—‹  Track daily progress',
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// FEATURE SCREEN (generic live-data screen)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

class FeatureScreen extends ConsumerStatefulWidget {
  const FeatureScreen({required this.path, super.key});
  final String path;
  @override
  ConsumerState<FeatureScreen> createState() => _FeatureScreenState();
}

class _FeatureScreenState extends ConsumerState<FeatureScreen> {
  List<Map<String, dynamic>> _items = [];
  bool _loading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final repo = ref.read(repositoryProvider);
      final items = await switch (widget.path) {
        '/memory' => repo.memories(),
        '/opportunities' => repo.opportunities(),
        '/marketplace' => repo.marketplace(),
        '/notifications' => repo.notifications(),
        '/agents' => repo.agents(),
        '/planner' => repo.plans(),
        '/recommendations' => repo.recommendations(),
        _ => Future.value(const <Map<String, dynamic>>[]),
      };
      if (!mounted) return;
      setState(() {
        _items = items;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  String get _title => widget.path
      .split('/')
      .where((e) => e.isNotEmpty)
      .map((e) => '${e[0].toUpperCase()}${e.substring(1)}')
      .join(' Â· ');

  @override
  Widget build(BuildContext context) {
    if (widget.path == '/analytics') return const _AnalyticsScreen();
    if (widget.path == '/settings') return const _SettingsScreen();
    if (widget.path == '/memory') return const MemoryScreen();
    if (widget.path == '/notifications') return const NotificationsScreen();
    if (widget.path == '/opportunities') return const OpportunitiesScreen();
    if (widget.path == '/agents') return const AgentsScreen();
    if (widget.path == '/planner') return const PlannerScreen();

    final t = context.tokens;
    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(title: Text(_title)),
      floatingActionButton: widget.path == '/memory'
          ? FloatingActionButton.extended(
              onPressed: () => _addMemorySheet(context),
              icon: const Icon(LucideIcons.plus),
              label: const Text('Add Memory'),
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
                  color: t.primary,
                  child: _items.isEmpty
                      ? Center(
                          child:
                              Column(mainAxisSize: MainAxisSize.min, children: [
                            EmptyStateOrb(
                                icon: LucideIcons.inbox,
                                size: 72,
                                iconSize: 30),
                            const SizedBox(height: 20),
                            Text(
                              'No ${_title.toLowerCase()} yet',
                              style: Theme.of(context)
                                  .textTheme
                                  .headlineMedium
                                  ?.copyWith(
                                    fontWeight: FontWeight.w700,
                                    fontSize: 17,
                                  ),
                            ),
                          ]).animate().fadeIn(duration: 300.ms),
                        )
                      : ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: _items.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(height: 10),
                          itemBuilder: (_, i) => _ItemCard(
                            _items[i],
                            widget.path,
                            index: i,
                            onDelete: () async {
                              final id = _parseInt(_items[i]['id'] ??
                                  _items[i]['memory_id'] ??
                                  _items[i]['notification_id']);
                              if (id == 0) return;
                              final repo = ref.read(repositoryProvider);
                              if (widget.path == '/memory') {
                                await repo.deleteMemory(id).catchError((_) {});
                              } else if (widget.path == '/notifications') {
                                await repo
                                    .deleteNotification(id)
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
    final t = ctx.tokens;
    showModalBottomSheet(
      context: ctx,
      isScrollControlled: true,
      backgroundColor: t.surface,
      shape: const RoundedRectangleBorder(
          borderRadius:
              BorderRadius.vertical(top: Radius.circular(AppRadius.x2l))),
      builder: (sheetCtx) => Padding(
        padding: EdgeInsets.fromLTRB(
            24, 16, 24, MediaQuery.viewInsetsOf(sheetCtx).bottom + 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SheetHandle(),
            const SizedBox(height: 16),
            Text(
              'Add Memory',
              style: Theme.of(sheetCtx).textTheme.headlineLarge?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
            ),
            const SizedBox(height: 16),
            PremiumInputField(
              controller: ctrl,
              label: 'What do you want to remember?',
              maxLines: 4,
              minLines: 3,
              autofocus: true,
            ),
            const SizedBox(height: 16),
            PremiumButton(
              label: 'Save memory',
              onPressed: () async {
                if (ctrl.text.trim().isEmpty) return;
                final content = ctrl.text.trim();
                Navigator.of(sheetCtx).pop();
                await ref
                    .read(repositoryProvider)
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
    for (final k in ['title', 'content', 'name', 'message']) {
      final v = item[k];
      if (v is String && v.isNotEmpty) return v;
    }
    return 'Item';
  }

  String _subtitle() {
    for (final k in ['description', 'body', 'domain', 'category', 'type']) {
      final v = item[k];
      if (v is String && v.isNotEmpty) return v;
    }
    return '';
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return PremiumCard(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(children: [
        Expanded(
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(
              _title(),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 14,
                color: t.textPrimary,
                letterSpacing: -0.2,
              ),
            ),
            if (_subtitle().isNotEmpty) ...[
              const SizedBox(height: 3),
              Text(
                _subtitle(),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: t.textMuted,
                  fontSize: 12,
                  height: 1.5,
                ),
              ),
            ],
          ]),
        ),
        if (path == '/memory' || path == '/notifications')
          IconButton(
            onPressed: onDelete,
            icon: Icon(LucideIcons.trash2, size: 16, color: t.textMuted),
          )
        else
          Icon(LucideIcons.chevronRight, size: 16, color: t.textMuted),
      ]),
    ).staggered(index);
  }
}

// ══════════════════════════════════════════════════════════════
// ANALYTICS SCREEN  — real data from providers
// ══════════════════════════════════════════════════════════════

class _AnalyticsScreen extends ConsumerWidget {
  const _AnalyticsScreen();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final missions = ref.watch(missionsProvider);
    final tasks = ref.watch(tasksProvider);
    final t = context.tokens;

    final total = tasks.length;
    final done = tasks.where((tk) => tk.done).length;
    final pending = total - done;
    final rate = total == 0 ? 0 : (done * 100 ~/ total);

    final activeMissions = missions.where((m) => m.status == 'Active').length;
    final completedMissions =
        missions.where((m) => m.status == 'Completed').length;

    // Priority breakdown
    final urgent = tasks.where((tk) => tk.priority == 'urgent').length;
    final high = tasks.where((tk) => tk.priority == 'high').length;
    final medium = tasks.where((tk) => tk.priority == 'medium').length;
    final low = tasks
        .where((tk) => !['urgent', 'high', 'medium'].contains(tk.priority))
        .length;

    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(title: const Text('Analytics')),
      body: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
          children: [
            // ── Summary stat grid ────────────────────────────────
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              childAspectRatio: 1.5,
              children: [
                _AnalyticsTile(
                    label: 'Completion',
                    value: '$rate%',
                    icon: LucideIcons.chartNoAxesCombined,
                    color: t.primary),
                _AnalyticsTile(
                    label: 'Total tasks',
                    value: '$total',
                    icon: LucideIcons.squareCheck,
                    color: t.info),
                _AnalyticsTile(
                    label: 'Done',
                    value: '$done',
                    icon: LucideIcons.checkCheck,
                    color: t.success),
                _AnalyticsTile(
                    label: 'Pending',
                    value: '$pending',
                    icon: LucideIcons.clock3,
                    color: t.warning),
              ],
            ),

            const SizedBox(height: 16),

            // ── Missions summary ─────────────────────────────────
            PremiumCard(
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                  Text('Missions',
                      style: Theme.of(context)
                          .textTheme
                          .titleLarge
                          ?.copyWith(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 12),
                  Row(children: [
                    _MiniStat('Active', '$activeMissions', t.primary, t),
                    const SizedBox(width: 8),
                    _MiniStat('Total', '${missions.length}', t.info, t),
                    const SizedBox(width: 8),
                    _MiniStat('Completed', '$completedMissions', t.success, t),
                  ]),
                ])),

            const SizedBox(height: 16),

            // ── Task priority breakdown ──────────────────────────
            if (total > 0)
              PremiumCard(
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                    Text('Tasks by priority',
                        style: Theme.of(context)
                            .textTheme
                            .titleLarge
                            ?.copyWith(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 12),
                    _PriorityBar(
                        label: 'Urgent',
                        count: urgent,
                        total: total,
                        color: t.priorityUrgentFg),
                    _PriorityBar(
                        label: 'High',
                        count: high,
                        total: total,
                        color: t.priorityHighFg),
                    _PriorityBar(
                        label: 'Medium',
                        count: medium,
                        total: total,
                        color: t.priorityMedFg),
                    _PriorityBar(
                        label: 'Low',
                        count: low,
                        total: total,
                        color: t.textMuted),
                  ])),

            if (total > 0) const SizedBox(height: 16),

            // ── Mission progress bars ────────────────────────────
            if (missions.isNotEmpty)
              PremiumCard(
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                    Text('Mission progress',
                        style: Theme.of(context)
                            .textTheme
                            .titleLarge
                            ?.copyWith(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 12),
                    ...missions.take(6).map((m) => Padding(
                          padding: const EdgeInsets.only(bottom: 14),
                          child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(children: [
                                  Expanded(
                                      child: Text(m.title,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: TextStyle(
                                              fontWeight: FontWeight.w600,
                                              color: t.textPrimary))),
                                  const SizedBox(width: 8),
                                  Text('${(m.progress * 100).round()}%',
                                      style: TextStyle(
                                          color: t.primary,
                                          fontWeight: FontWeight.w700,
                                          fontSize: 13)),
                                ]),
                                const SizedBox(height: 6),
                                PremiumProgressBar(value: m.progress),
                              ]),
                        )),
                  ])),

            if (missions.isEmpty && total == 0)
              Center(
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 48),
                  child: Column(mainAxisSize: MainAxisSize.min, children: [
                    EmptyStateOrb(icon: LucideIcons.chartNoAxesCombined),
                    const SizedBox(height: 16),
                    Text('No data yet',
                        style: TextStyle(
                            color: t.textMuted, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 6),
                    Text('Create missions and tasks to see your analytics.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: t.textMuted, fontSize: 13)),
                  ]),
                ),
              ),
          ]),
    );
  }
}

class _AnalyticsTile extends StatelessWidget {
  const _AnalyticsTile(
      {required this.label,
      required this.value,
      required this.icon,
      required this.color});
  final String label, value;
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return PremiumCard(
      radius: AppRadius.lg,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Icon(icon, color: color, size: 18),
        const Spacer(),
        Text(value,
            style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: t.textPrimary)),
        const SizedBox(height: 2),
        Text(label,
            style: TextStyle(
                fontSize: 11, color: t.textMuted, fontWeight: FontWeight.w500)),
      ]),
    );
  }
}

class _MiniStat extends StatelessWidget {
  const _MiniStat(this.label, this.value, this.color, this.t);
  final String label, value;
  final Color color;
  final AppTokens t;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(color: color.withValues(alpha: 0.2)),
        ),
        child: Column(children: [
          Text(value,
              style: TextStyle(
                  fontSize: 18, fontWeight: FontWeight.w800, color: color)),
          const SizedBox(height: 2),
          Text(label,
              style: TextStyle(
                  fontSize: 10,
                  color: t.textMuted,
                  fontWeight: FontWeight.w600)),
        ]),
      ),
    );
  }
}

class _PriorityBar extends StatelessWidget {
  const _PriorityBar(
      {required this.label,
      required this.count,
      required this.total,
      required this.color});
  final String label;
  final int count, total;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final frac = total == 0 ? 0.0 : count / total;
    final t = context.tokens;
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          SizedBox(
            width: 52,
            child: Text(label,
                style: TextStyle(
                    fontSize: 12,
                    color: t.textSecondary,
                    fontWeight: FontWeight.w600)),
          ),
          Expanded(
              child: ClipRRect(
            borderRadius: BorderRadius.circular(AppRadius.full),
            child: LinearProgressIndicator(
              value: frac,
              backgroundColor: t.backgroundSubtle,
              valueColor: AlwaysStoppedAnimation<Color>(color),
              minHeight: 8,
            ),
          )),
          const SizedBox(width: 8),
          SizedBox(
            width: 24,
            child: Text('$count',
                textAlign: TextAlign.right,
                style: TextStyle(
                    fontSize: 12,
                    color: t.textMuted,
                    fontWeight: FontWeight.w600)),
          ),
        ]),
      ]),
    );
  }
}

// ══════════════════════════════════════════════════════════════
// SETTINGS SCREEN  — functional switches + navigation tiles
// ══════════════════════════════════════════════════════════════

final _aiMemoryEnabledProvider = StateProvider<bool>((ref) => true);
final _autoSuggestEnabledProvider = StateProvider<bool>((ref) => true);

class _SettingsScreen extends ConsumerWidget {
  const _SettingsScreen();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.tokens;
    final themeMode = ref.watch(themeModeProvider);
    final aiMemory = ref.watch(_aiMemoryEnabledProvider);
    final autoSuggest = ref.watch(_autoSuggestEnabledProvider);

    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
          children: [
            // ── Preferences ──────────────────────────────────────
            _SettingsSectionLabel('Preferences'),
            PremiumCard(
                padding: EdgeInsets.zero,
                child: Column(children: [
                  ListTile(
                    leading:
                        Icon(LucideIcons.palette, color: t.primary, size: 20),
                    title: const Text('Appearance'),
                    trailing: DropdownButton<ThemeMode>(
                      value: themeMode,
                      underline: const SizedBox(),
                      style: TextStyle(color: t.textPrimary, fontSize: 13),
                      items: const [
                        DropdownMenuItem(
                            value: ThemeMode.system, child: Text('System')),
                        DropdownMenuItem(
                            value: ThemeMode.light, child: Text('Light')),
                        DropdownMenuItem(
                            value: ThemeMode.dark, child: Text('Dark')),
                      ],
                      onChanged: (v) {
                        if (v != null)
                          ref.read(themeModeProvider.notifier).state = v;
                      },
                    ),
                  ),
                  Divider(color: t.border, height: 1),
                  ListTile(
                    leading:
                        Icon(LucideIcons.languages, color: t.primary, size: 20),
                    title: const Text('Language'),
                    trailing: Text('English',
                        style: TextStyle(color: t.textMuted, fontSize: 13)),
                  ),
                  Divider(color: t.border, height: 1),
                  ListTile(
                    leading: Icon(LucideIcons.indianRupee,
                        color: t.primary, size: 20),
                    title: const Text('Currency'),
                    trailing: Text('INR',
                        style: TextStyle(color: t.textMuted, fontSize: 13)),
                  ),
                ])),

            const SizedBox(height: 12),

            // ── AI ───────────────────────────────────────────────
            _SettingsSectionLabel('AI & Personalisation'),
            PremiumCard(
                padding: EdgeInsets.zero,
                child: Column(children: [
                  SwitchListTile(
                    value: aiMemory,
                    onChanged: (v) =>
                        ref.read(_aiMemoryEnabledProvider.notifier).state = v,
                    activeThumbColor: t.primary,
                    title: const Text('AI Memory'),
                    subtitle:
                        const Text('Use saved context for better coaching'),
                  ),
                  Divider(color: t.border, height: 1),
                  SwitchListTile(
                    value: autoSuggest,
                    onChanged: (v) => ref
                        .read(_autoSuggestEnabledProvider.notifier)
                        .state = v,
                    activeThumbColor: t.primary,
                    title: const Text('Auto-suggestions'),
                    subtitle:
                        const Text('Proactively surface relevant insights'),
                  ),
                ])),

            const SizedBox(height: 12),

            // ── Account ──────────────────────────────────────────
            _SettingsSectionLabel('Account'),
            PremiumCard(
                padding: EdgeInsets.zero,
                child: Column(children: [
                  ListTile(
                    leading: Icon(LucideIcons.user, color: t.primary, size: 20),
                    title: const Text('Edit profile'),
                    trailing: Icon(LucideIcons.chevronRight,
                        size: 16, color: t.textMuted),
                    onTap: () => context.push('/settings/profile'),
                  ),
                  Divider(color: t.border, height: 1),
                  ListTile(
                    leading: Icon(LucideIcons.shieldCheck,
                        color: t.primary, size: 20),
                    title: const Text('Privacy & security'),
                    trailing: Icon(LucideIcons.chevronRight,
                        size: 16, color: t.textMuted),
                    onTap: () => context.push('/settings/security'),
                  ),
                  Divider(color: t.border, height: 1),
                  ListTile(
                    leading: Icon(LucideIcons.creditCard,
                        color: t.primary, size: 20),
                    title: const Text('Subscription & billing'),
                    trailing: Icon(LucideIcons.chevronRight,
                        size: 16, color: t.textMuted),
                    onTap: () => context.push('/settings/subscription'),
                  ),
                  Divider(color: t.border, height: 1),
                  ListTile(
                    leading: Icon(LucideIcons.bell, color: t.primary, size: 20),
                    title: const Text('Notifications'),
                    trailing: Icon(LucideIcons.chevronRight,
                        size: 16, color: t.textMuted),
                    onTap: () => context.push('/notifications'),
                  ),
                ])),

            const SizedBox(height: 12),

            // ── Support ──────────────────────────────────────────
            _SettingsSectionLabel('Support'),
            PremiumCard(
                padding: EdgeInsets.zero,
                child: Column(children: [
                  ListTile(
                    leading: Icon(LucideIcons.messageCircle,
                        color: t.primary, size: 20),
                    title: const Text('Help & support'),
                    trailing: Icon(LucideIcons.chevronRight,
                        size: 16, color: t.textMuted),
                    onTap: () => context.push('/support'),
                  ),
                ])),

            const SizedBox(height: 16),

            // ── Sign out ─────────────────────────────────────────
            GestureDetector(
              onTap: () async {
                await ref.read(authProvider.notifier).signOut();
                if (context.mounted) context.go('/auth/sign-in');
              },
              child: Container(
                height: 52,
                decoration: BoxDecoration(
                  color: t.destructiveSurface,
                  borderRadius: BorderRadius.circular(AppRadius.full),
                  border:
                      Border.all(color: t.destructive.withValues(alpha: 0.4)),
                ),
                child: Center(
                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                  Icon(LucideIcons.logOut, size: 16, color: t.destructive),
                  const SizedBox(width: 8),
                  Text('Sign out',
                      style: TextStyle(
                          color: t.destructive,
                          fontWeight: FontWeight.w700,
                          fontSize: 14)),
                ])),
              ),
            ),
          ]),
    );
  }
}

class _SettingsSectionLabel extends StatelessWidget {
  const _SettingsSectionLabel(this.text);
  final String text;
  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 6, top: 4),
      child: Text(text.toUpperCase(),
          style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: t.textMuted,
              letterSpacing: 1.2)),
    );
  }
}

// ══════════════════════════════════════════════════════════════
// MEMORY SCREEN
// Full parity with web /memory page:
//   - search by content/tags
//   - filter by category chip row
//   - add memory bottom sheet (content + type)
//   - swipe-to-delete + icon button delete
//   - category colour badges
// ══════════════════════════════════════════════════════════════

class MemoryScreen extends ConsumerStatefulWidget {
  const MemoryScreen({super.key});
  @override
  ConsumerState<MemoryScreen> createState() => _MemoryScreenState();
}

class _MemoryScreenState extends ConsumerState<MemoryScreen> {
  List<Map<String, dynamic>> _all = [];
  bool _loading = false;
  String? _error;
  String _search = '';
  String _category = 'all';
  bool _searchOpen = false;

  static const _categories = [
    'all',
    'goal',
    'preference',
    'decision',
    'feedback',
    'achievement',
    'constraint',
    'context',
  ];

  static Color _catColor(String cat, AppTokens t) => switch (cat) {
        'goal' => const Color(0xFF7C3AED),
        'preference' => const Color(0xFF2563EB),
        'decision' => const Color(0xFFD97706),
        'feedback' => const Color(0xFF0D9488),
        'achievement' => const Color(0xFF16A34A),
        'constraint' => const Color(0xFFDC2626),
        _ => const Color(0xFF6B7280),
      };

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (!mounted) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final items = await ref.read(repositoryProvider).memories(
            query: _search.isEmpty ? null : _search,
          );
      if (!mounted) return;
      setState(() {
        _all = items;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  List<Map<String, dynamic>> get _filtered {
    return _all.where((m) {
      final content = (m['content'] ?? '').toString().toLowerCase();
      final tags = (m['tags'] as List?)
              ?.map((t) => t.toString().toLowerCase())
              .join(' ') ??
          '';
      final cat = (m['category'] ?? m['type'] ?? '').toString().toLowerCase();
      final matchQ = _search.isEmpty ||
          content.contains(_search.toLowerCase()) ||
          tags.contains(_search.toLowerCase());
      final matchCat = _category == 'all' || cat == _category;
      return matchQ && matchCat;
    }).toList();
  }

  Future<void> _delete(int id) async {
    await ref.read(repositoryProvider).deleteMemory(id).catchError((_) {});
    setState(() =>
        _all.removeWhere((m) => _parseInt(m['id'] ?? m['memory_id']) == id));
  }

  void _addSheet() {
    final ctrl = TextEditingController();
    String type = 'note';
    final t = context.tokens;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: t.surface,
      shape: const RoundedRectangleBorder(
          borderRadius:
              BorderRadius.vertical(top: Radius.circular(AppRadius.x2l))),
      builder: (sheetCtx) => StatefulBuilder(
        builder: (ctx, setSt) => Padding(
          padding: EdgeInsets.fromLTRB(
              24, 16, 24, MediaQuery.viewInsetsOf(ctx).bottom + 24),
          child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SheetHandle(),
                const SizedBox(height: 16),
                Text('Add Memory',
                    style: Theme.of(ctx)
                        .textTheme
                        .headlineLarge
                        ?.copyWith(fontWeight: FontWeight.w800)),
                const SizedBox(height: 16),
                PremiumInputField(
                    controller: ctrl,
                    label: 'What do you want to remember?',
                    maxLines: 4,
                    minLines: 3,
                    autofocus: true),
                const SizedBox(height: 12),
                // Type selector
                Wrap(
                    spacing: 8,
                    children: [
                      'note',
                      'goal',
                      'preference',
                      'context',
                      'feedback'
                    ]
                        .map(
                          (tp) => GestureDetector(
                            onTap: () => setSt(() => type = tp),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 150),
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color:
                                    type == tp ? t.primary : t.backgroundSubtle,
                                borderRadius:
                                    BorderRadius.circular(AppRadius.full),
                                border: Border.all(
                                    color: type == tp ? t.primary : t.border),
                              ),
                              child: Text(tp,
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: type == tp
                                        ? Colors.white
                                        : t.textSecondary,
                                  )),
                            ),
                          ),
                        )
                        .toList()),
                const SizedBox(height: 16),
                PremiumButton(
                  label: 'Save memory',
                  onPressed: () async {
                    if (ctrl.text.trim().isEmpty) return;
                    Navigator.of(ctx).pop();
                    await ref
                        .read(repositoryProvider)
                        .createMemory(content: ctrl.text.trim(), type: type)
                        .catchError((_) => <String, dynamic>{});
                    _load();
                  },
                ),
              ]),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final filtered = _filtered;

    return Scaffold(
      backgroundColor: t.background,
      body: SafeArea(
        child: Stack(children: [
          Column(children: [
            _PageHeading('Life Memory',
                subtitle: '${_all.length} saved',
                actions: [
                  IconButton(
                    onPressed: () => setState(() => _searchOpen = !_searchOpen),
                    icon: Icon(_searchOpen ? LucideIcons.x : LucideIcons.search,
                        size: 18, color: t.textSecondary),
                  ),
                ]).pageEntrance(),

            _SearchBar(
              visible: _searchOpen,
              hint: 'Search memories…',
              onChanged: (v) => setState(() => _search = v),
              onDismiss: () => setState(() {
                _searchOpen = false;
                _search = '';
              }),
            ),

            // Category chips
            SizedBox(
              height: 40,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                children: _categories
                    .map((cat) => Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: _PremiumFilterChip(
                            label: cat == 'all' ? 'All' : cat,
                            selected: _category == cat,
                            onTap: () => setState(() => _category = cat),
                          ),
                        ))
                    .toList(),
              ),
            ),

            const SizedBox(height: 4),
            if (_loading)
              LinearProgressIndicator(
                  color: t.primary,
                  minHeight: 2,
                  backgroundColor: t.backgroundSubtle),

            Expanded(
              child: _error != null
                  ? _InlineErrorState(title: "Couldn't load memories")
                  : RefreshIndicator(
                      onRefresh: _load,
                      color: t.primary,
                      child: filtered.isEmpty
                          ? _MemoryEmptyState(onAdd: _addSheet)
                          : ListView.builder(
                              padding:
                                  const EdgeInsets.fromLTRB(16, 4, 16, 120),
                              itemCount: filtered.length,
                              itemBuilder: (_, i) {
                                final m = filtered[i];
                                final id = _parseInt(m['id'] ?? m['memory_id']);
                                final cat =
                                    (m['category'] ?? m['type'] ?? 'context')
                                        .toString()
                                        .toLowerCase();
                                final col = _catColor(cat, t);
                                return Dismissible(
                                  key: ValueKey('mem_$id'),
                                  direction: DismissDirection.endToStart,
                                  background: Container(
                                    alignment: Alignment.centerRight,
                                    padding: const EdgeInsets.only(right: 20),
                                    decoration: BoxDecoration(
                                      color:
                                          t.destructive.withValues(alpha: 0.12),
                                      borderRadius:
                                          BorderRadius.circular(AppRadius.xl),
                                    ),
                                    child: Icon(LucideIcons.trash2,
                                        color: t.destructive, size: 20),
                                  ),
                                  confirmDismiss: (_) async {
                                    await _delete(id);
                                    return false; // we manage removal ourselves
                                  },
                                  child: PremiumCard(
                                    margin: const EdgeInsets.only(bottom: 10),
                                    padding: const EdgeInsets.all(14),
                                    child: Row(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          // Category dot
                                          Container(
                                            width: 8,
                                            height: 8,
                                            margin:
                                                const EdgeInsets.only(top: 4),
                                            decoration: BoxDecoration(
                                                color: col,
                                                shape: BoxShape.circle),
                                          ),
                                          const SizedBox(width: 10),
                                          Expanded(
                                            child: Column(
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.start,
                                                children: [
                                                  Text(
                                                    (m['content'] ?? '')
                                                        .toString(),
                                                    style: TextStyle(
                                                        color: t.textPrimary,
                                                        fontSize: 14,
                                                        height: 1.5),
                                                    maxLines: 4,
                                                    overflow:
                                                        TextOverflow.ellipsis,
                                                  ),
                                                  const SizedBox(height: 8),
                                                  Row(children: [
                                                    Container(
                                                      padding: const EdgeInsets
                                                          .symmetric(
                                                          horizontal: 8,
                                                          vertical: 3),
                                                      decoration: BoxDecoration(
                                                        color: col.withValues(
                                                            alpha: 0.1),
                                                        borderRadius:
                                                            BorderRadius
                                                                .circular(
                                                                    AppRadius
                                                                        .full),
                                                        border: Border.all(
                                                            color:
                                                                col.withValues(
                                                                    alpha:
                                                                        0.25)),
                                                      ),
                                                      child: Text(cat,
                                                          style: TextStyle(
                                                              color: col,
                                                              fontSize: 10,
                                                              fontWeight:
                                                                  FontWeight
                                                                      .w700)),
                                                    ),
                                                    const Spacer(),
                                                    if ((m['tags'] as List?)
                                                            ?.isNotEmpty ==
                                                        true)
                                                      Text(
                                                        (m['tags'] as List)
                                                            .take(2)
                                                            .map((x) => '#$x')
                                                            .join(' '),
                                                        style: TextStyle(
                                                            color: t.textMuted,
                                                            fontSize: 11),
                                                      ),
                                                  ]),
                                                ]),
                                          ),
                                          IconButton(
                                            onPressed: () => _delete(id),
                                            icon: Icon(LucideIcons.trash2,
                                                size: 15, color: t.textMuted),
                                            padding: EdgeInsets.zero,
                                            constraints: const BoxConstraints(
                                                minWidth: 32, minHeight: 32),
                                          ),
                                        ]),
                                  ).staggered(i),
                                );
                              },
                            ),
                    ),
            ),
          ]),

          // FAB
          Positioned(
            right: 16,
            bottom: 16 + MediaQuery.of(context).padding.bottom,
            child: FloatingActionButton.extended(
              onPressed: _addSheet,
              icon: const Icon(LucideIcons.plus),
              label: const Text('Add Memory'),
              backgroundColor: t.primary,
              foregroundColor: Colors.white,
            ),
          ),
        ]),
      ),
    );
  }

  static int _parseInt(dynamic v) {
    if (v is int) return v;
    return int.tryParse(v?.toString() ?? '') ?? 0;
  }
}

class _MemoryEmptyState extends StatelessWidget {
  const _MemoryEmptyState({required this.onAdd});
  final VoidCallback onAdd;
  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 48),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          EmptyStateOrb(icon: LucideIcons.brain),
          const SizedBox(height: 16),
          Text('No memories yet',
              style: TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 16,
                  color: t.textPrimary)),
          const SizedBox(height: 6),
          Text(
              'Save goals, preferences, decisions, and insights so your AI Coach can personalise its guidance.',
              textAlign: TextAlign.center,
              style: TextStyle(color: t.textMuted, fontSize: 13, height: 1.6)),
          const SizedBox(height: 24),
          PremiumButton(
              label: 'Add your first memory', onPressed: onAdd, minWidth: 200),
        ]).animate().fadeIn(duration: 300.ms),
      ),
    );
  }
}

// ══════════════════════════════════════════════════════════════
// NOTIFICATIONS SCREEN
// Full parity with web /notifications page:
//   - unread dot indicator per item
//   - type colour badges (7 types)
//   - tap item → mark as read
//   - mark all read action button
//   - swipe / icon delete
// ══════════════════════════════════════════════════════════════

class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});
  @override
  ConsumerState<NotificationsScreen> createState() =>
      _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  List<Map<String, dynamic>> _items = [];
  bool _loading = false;
  String? _error;

  // Web TYPE_COLORS ported to Flutter brand colours
  static Color _typeColor(String type) => switch (type) {
        'task-reminder' => const Color(0xFF2563EB),
        'deadline-warning' => const Color(0xFFD97706),
        'milestone-completion' => const Color(0xFF16A34A),
        'ai-recommendation' => const Color(0xFF7C3AED),
        'opportunity-match' => const Color(0xFF0891B2),
        'marketplace-update' => const Color(0xFFEA580C),
        'payment-update' => const Color(0xFF4F46E5),
        _ => const Color(0xFF6B7280),
      };

  int get _unreadCount =>
      _items.where((n) => n['isRead'] != true && n['is_read'] != true).length;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (!mounted) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final items = await ref.read(repositoryProvider).notifications();
      if (!mounted) return;
      setState(() {
        _items = items;
        _loading = false;
      });
      // Sync unread badge
      ref.read(notifCountProvider.notifier).state = _unreadCount;
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  Future<void> _markRead(int id) async {
    await ref
        .read(repositoryProvider)
        .markNotificationRead(id)
        .catchError((_) {});
    setState(() {
      for (final n in _items) {
        if (_parseInt(n['id'] ?? n['notification_id']) == id) {
          n['isRead'] = true;
          n['is_read'] = true;
        }
      }
    });
    ref.read(notifCountProvider.notifier).state = _unreadCount;
  }

  Future<void> _markAllRead() async {
    final unread = _items
        .where((n) => n['isRead'] != true && n['is_read'] != true)
        .toList();
    await Future.wait(unread.map((n) {
      final id = _parseInt(n['id'] ?? n['notification_id']);
      return ref
          .read(repositoryProvider)
          .markNotificationRead(id)
          .catchError((_) {});
    }));
    setState(() {
      for (final n in _items) {
        n['isRead'] = true;
        n['is_read'] = true;
      }
    });
    ref.read(notifCountProvider.notifier).state = 0;
  }

  Future<void> _delete(int id) async {
    await ref
        .read(repositoryProvider)
        .deleteNotification(id)
        .catchError((_) {});
    setState(() => _items
        .removeWhere((n) => _parseInt(n['id'] ?? n['notification_id']) == id));
    ref.read(notifCountProvider.notifier).state = _unreadCount;
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final unread = _unreadCount;

    return Scaffold(
      backgroundColor: t.background,
      body: SafeArea(
        child: Column(children: [
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(56, 18, 12, 12),
            child: Row(children: [
              Expanded(
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Notifications',
                          style: Theme.of(context)
                              .textTheme
                              .displaySmall
                              ?.copyWith(
                                  color: t.textPrimary,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: -1.0)),
                      const SizedBox(height: 3),
                      Text(
                        unread > 0 ? '$unread unread' : 'All caught up',
                        style: TextStyle(color: t.textMuted, fontSize: 13),
                      ),
                    ]),
              ),
              if (unread > 0)
                TextButton.icon(
                  onPressed: _markAllRead,
                  icon:
                      Icon(LucideIcons.checkCheck, size: 14, color: t.primary),
                  label: Text('Mark all read',
                      style: TextStyle(
                          color: t.primary,
                          fontSize: 13,
                          fontWeight: FontWeight.w600)),
                ),
            ]).pageEntrance(),
          ),

          if (_loading)
            LinearProgressIndicator(
                color: t.primary,
                minHeight: 2,
                backgroundColor: t.backgroundSubtle),

          Expanded(
            child: _error != null
                ? _InlineErrorState(title: "Couldn't load notifications")
                : RefreshIndicator(
                    onRefresh: _load,
                    color: t.primary,
                    child: _items.isEmpty && !_loading
                        ? Center(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 40, vertical: 48),
                              child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    EmptyStateOrb(icon: LucideIcons.bellOff),
                                    const SizedBox(height: 16),
                                    Text("You're all caught up!",
                                        style: TextStyle(
                                            fontWeight: FontWeight.w700,
                                            fontSize: 16,
                                            color: t.textPrimary)),
                                    const SizedBox(height: 6),
                                    Text('No notifications right now.',
                                        style: TextStyle(
                                            color: t.textMuted, fontSize: 13)),
                                  ]).animate().fadeIn(duration: 300.ms),
                            ),
                          )
                        : ListView.separated(
                            padding: const EdgeInsets.fromLTRB(16, 4, 16, 32),
                            itemCount: _items.length,
                            separatorBuilder: (_, __) =>
                                Divider(color: t.border, height: 1),
                            itemBuilder: (_, i) {
                              final n = _items[i];
                              final id =
                                  _parseInt(n['id'] ?? n['notification_id']);
                              final isRead =
                                  n['isRead'] == true || n['is_read'] == true;
                              final type = (n['type'] ?? 'system').toString();
                              final typeCol = _typeColor(type);
                              final title =
                                  (n['title'] ?? n['message'] ?? '').toString();
                              final body = (n['body'] ??
                                      n['content'] ??
                                      n['description'] ??
                                      '')
                                  .toString();
                              final time =
                                  (n['createdAt'] ?? n['created_at'] ?? '')
                                      .toString();

                              return Dismissible(
                                key: ValueKey('notif_$id'),
                                direction: DismissDirection.endToStart,
                                background: Container(
                                  alignment: Alignment.centerRight,
                                  padding: const EdgeInsets.only(right: 20),
                                  color: t.destructive.withValues(alpha: 0.12),
                                  child: Icon(LucideIcons.trash2,
                                      color: t.destructive, size: 20),
                                ),
                                confirmDismiss: (_) async {
                                  await _delete(id);
                                  return false;
                                },
                                child: InkWell(
                                  onTap: isRead ? null : () => _markRead(id),
                                  child: Container(
                                    color: isRead
                                        ? Colors.transparent
                                        : t.primarySurface
                                            .withValues(alpha: 0.4),
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 16, vertical: 14),
                                    child: Row(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          // Unread dot
                                          Container(
                                            margin: const EdgeInsets.only(
                                                top: 5, right: 10),
                                            width: 8,
                                            height: 8,
                                            decoration: BoxDecoration(
                                              shape: BoxShape.circle,
                                              color: isRead
                                                  ? Colors.transparent
                                                  : t.primary,
                                            ),
                                          ),
                                          Expanded(
                                              child: Column(
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.start,
                                                  children: [
                                                // Type badge
                                                Container(
                                                  margin: const EdgeInsets.only(
                                                      bottom: 4),
                                                  padding: const EdgeInsets
                                                      .symmetric(
                                                      horizontal: 8,
                                                      vertical: 2),
                                                  decoration: BoxDecoration(
                                                    color: typeCol.withValues(
                                                        alpha: 0.1),
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            AppRadius.full),
                                                    border: Border.all(
                                                        color:
                                                            typeCol.withValues(
                                                                alpha: 0.25)),
                                                  ),
                                                  child: Text(
                                                    type.replaceAll('-', ' '),
                                                    style: TextStyle(
                                                        color: typeCol,
                                                        fontSize: 10,
                                                        fontWeight:
                                                            FontWeight.w700),
                                                  ),
                                                ),
                                                if (title.isNotEmpty)
                                                  Text(title,
                                                      style: TextStyle(
                                                        color: t.textPrimary,
                                                        fontWeight:
                                                            FontWeight.w600,
                                                        fontSize: 14,
                                                        letterSpacing: -0.2,
                                                      ),
                                                      maxLines: 1,
                                                      overflow: TextOverflow
                                                          .ellipsis),
                                                if (body.isNotEmpty) ...[
                                                  const SizedBox(height: 2),
                                                  Text(body,
                                                      style: TextStyle(
                                                          color:
                                                              t.textSecondary,
                                                          fontSize: 13,
                                                          height: 1.4),
                                                      maxLines: 2,
                                                      overflow: TextOverflow
                                                          .ellipsis),
                                                ],
                                                if (time.isNotEmpty) ...[
                                                  const SizedBox(height: 5),
                                                  Text(_relativeTime(time),
                                                      style: TextStyle(
                                                          color: t.textMuted,
                                                          fontSize: 11)),
                                                ],
                                              ])),
                                          IconButton(
                                            onPressed: () => _delete(id),
                                            icon: Icon(LucideIcons.trash2,
                                                size: 15, color: t.textMuted),
                                            padding: EdgeInsets.zero,
                                            constraints: const BoxConstraints(
                                                minWidth: 32, minHeight: 32),
                                          ),
                                        ]),
                                  ),
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

  static String _relativeTime(String iso) {
    final dt = DateTime.tryParse(iso);
    if (dt == null) return '';
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 1) return 'just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${dt.day}/${dt.month}/${dt.year}';
  }

  static int _parseInt(dynamic v) {
    if (v is int) return v;
    return int.tryParse(v?.toString() ?? '') ?? 0;
  }
}

// ══════════════════════════════════════════════════════════════
// OPPORTUNITIES SCREEN
// Full parity with web /opportunities page:
//   - search by title / org
//   - type filter (job / internship / scholarship / course / event / grant / challenge / service / all)
//   - match score badge (colour-coded)
//   - tap → detail bottom sheet with full description, requirements, CTA
//   - saved-only toggle
// ══════════════════════════════════════════════════════════════

class OpportunitiesScreen extends ConsumerStatefulWidget {
  const OpportunitiesScreen({super.key});
  @override
  ConsumerState<OpportunitiesScreen> createState() =>
      _OpportunitiesScreenState();
}

class _OpportunitiesScreenState extends ConsumerState<OpportunitiesScreen> {
  List<Map<String, dynamic>> _all = [];
  bool _loading = false;
  String? _error;
  String _search = '';
  String _type = 'all';
  bool _savedOnly = false;
  bool _searchOpen = false;

  static const _types = [
    'all',
    'job',
    'internship',
    'scholarship',
    'course',
    'event',
    'grant',
    'challenge',
    'service',
  ];

  static Color _typeColor(String type) => switch (type) {
        'job' => const Color(0xFF2563EB),
        'internship' => const Color(0xFF7C3AED),
        'scholarship' => const Color(0xFFEA580C),
        'course' => const Color(0xFF16A34A),
        'event' => const Color(0xFF0891B2),
        'grant' => const Color(0xFFD97706),
        'challenge' => const Color(0xFFDB2777),
        _ => const Color(0xFF6B7280),
      };

  static Color _matchColor(int score) {
    if (score >= 80) return const Color(0xFF16A34A);
    if (score >= 60) return const Color(0xFFD97706);
    return const Color(0xFF6B7280);
  }

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (!mounted) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final items = await ref.read(repositoryProvider).opportunities();
      if (!mounted) return;
      setState(() {
        _all = items;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  List<Map<String, dynamic>> get _filtered {
    return _all.where((o) {
      final title = (o['title'] ?? '').toString().toLowerCase();
      final org = (o['organisation'] ?? o['organization'] ?? '')
          .toString()
          .toLowerCase();
      final type = (o['type'] ?? '').toString().toLowerCase();
      final saved = o['isSaved'] == true || o['is_saved'] == true;
      final matchQ = _search.isEmpty ||
          title.contains(_search.toLowerCase()) ||
          org.contains(_search.toLowerCase());
      final matchType = _type == 'all' || type == _type;
      final matchSave = !_savedOnly || saved;
      return matchQ && matchType && matchSave;
    }).toList();
  }

  void _showDetail(Map<String, dynamic> opp) {
    final t = context.tokens;
    final type = (opp['type'] ?? 'opportunity').toString().toLowerCase();
    final typeCol = _typeColor(type);
    final score =
        (opp['matchScore'] ?? opp['match_score'] as num?)?.toInt() ?? 0;
    final scoreCol = _matchColor(score);
    final desc =
        (opp['description'] ?? opp['eligibilitySummary'] ?? '').toString();
    final url =
        (opp['applicationUrl'] ?? opp['application_url'] ?? '').toString();
    final deadline = (opp['deadline'] ?? '').toString();
    final reqs = opp['requirements'] as List? ?? [];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: t.surface,
      shape: const RoundedRectangleBorder(
          borderRadius:
              BorderRadius.vertical(top: Radius.circular(AppRadius.x2l))),
      builder: (ctx) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.7,
        maxChildSize: 0.92,
        minChildSize: 0.4,
        builder: (_, sc) => ListView(
            controller: sc,
            padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
            children: [
              const SheetHandle(),
              const SizedBox(height: 16),
              Row(children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: typeCol.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(AppRadius.full),
                    border: Border.all(color: typeCol.withValues(alpha: 0.3)),
                  ),
                  child: Text(type,
                      style: TextStyle(
                          color: typeCol,
                          fontSize: 11,
                          fontWeight: FontWeight.w700)),
                ),
                const Spacer(),
                if (score > 0)
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: scoreCol.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(AppRadius.full),
                      border:
                          Border.all(color: scoreCol.withValues(alpha: 0.3)),
                    ),
                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                      Icon(LucideIcons.sparkles, size: 11, color: scoreCol),
                      const SizedBox(width: 4),
                      Text('$score% match',
                          style: TextStyle(
                              color: scoreCol,
                              fontSize: 11,
                              fontWeight: FontWeight.w700)),
                    ]),
                  ),
              ]),
              const SizedBox(height: 12),
              Text((opp['title'] ?? '').toString(),
                  style: Theme.of(ctx)
                      .textTheme
                      .headlineLarge
                      ?.copyWith(fontWeight: FontWeight.w800)),
              if ((opp['organisation'] ?? opp['organization'] ?? '')
                  .toString()
                  .isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Text(
                      (opp['organisation'] ?? opp['organization'] ?? '')
                          .toString(),
                      style: TextStyle(color: t.textMuted, fontSize: 13)),
                ),
              if (deadline.isNotEmpty) ...[
                const SizedBox(height: 8),
                Row(children: [
                  Icon(LucideIcons.calendar, size: 13, color: t.textMuted),
                  const SizedBox(width: 5),
                  Text('Deadline: $deadline',
                      style: TextStyle(color: t.textMuted, fontSize: 12)),
                ]),
              ],
              if (desc.isNotEmpty) ...[
                const SizedBox(height: 16),
                Text('About',
                    style: TextStyle(
                        fontWeight: FontWeight.w700,
                        color: t.textPrimary,
                        fontSize: 14)),
                const SizedBox(height: 6),
                Text(desc,
                    style: TextStyle(
                        color: t.textSecondary, fontSize: 13, height: 1.6)),
              ],
              if (reqs.isNotEmpty) ...[
                const SizedBox(height: 16),
                Text('Requirements',
                    style: TextStyle(
                        fontWeight: FontWeight.w700,
                        color: t.textPrimary,
                        fontSize: 14)),
                const SizedBox(height: 8),
                ...reqs.map((r) {
                  final label = r is Map
                      ? (r['label'] ?? r['requirement'] ?? r.toString())
                      : r.toString();
                  final detail = r is Map ? (r['description'] ?? '') : '';
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(LucideIcons.check, size: 14, color: t.primary),
                          const SizedBox(width: 8),
                          Expanded(
                              child: Text(
                            detail.toString().isNotEmpty
                                ? '$label — $detail'
                                : label.toString(),
                            style: TextStyle(
                                color: t.textSecondary,
                                fontSize: 13,
                                height: 1.4),
                          )),
                        ]),
                  );
                }),
              ],
              const SizedBox(height: 24),
              if (url.isNotEmpty)
                PremiumButton(
                  label: 'Apply now',
                  onPressed: () => Navigator.of(ctx).pop(),
                ),
            ]),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final filtered = _filtered;

    return Scaffold(
      backgroundColor: t.background,
      body: SafeArea(
        child: Column(children: [
          _PageHeading('Opportunities',
              subtitle: '${_all.length} matched',
              actions: [
                IconButton(
                  onPressed: () => setState(() {
                    _searchOpen = !_searchOpen;
                    if (!_searchOpen) _search = '';
                  }),
                  icon: Icon(_searchOpen ? LucideIcons.x : LucideIcons.search,
                      size: 18, color: t.textSecondary),
                ),
                IconButton(
                  onPressed: _load,
                  icon: Icon(LucideIcons.refreshCw,
                      size: 18, color: t.textSecondary),
                ),
              ]).pageEntrance(),

          _SearchBar(
            visible: _searchOpen,
            hint: 'Search opportunities…',
            onChanged: (v) => setState(() => _search = v),
            onDismiss: () => setState(() {
              _searchOpen = false;
              _search = '';
            }),
          ),

          // Type filter chips
          SizedBox(
            height: 40,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                ..._types.map((tp) => Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: _PremiumFilterChip(
                        label: tp == 'all' ? 'All' : tp,
                        selected: _type == tp,
                        onTap: () => setState(() => _type = tp),
                      ),
                    )),
                Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: _PremiumFilterChip(
                    label: 'Saved',
                    selected: _savedOnly,
                    onTap: () => setState(() => _savedOnly = !_savedOnly),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 4),
          if (_loading)
            LinearProgressIndicator(
                color: t.primary,
                minHeight: 2,
                backgroundColor: t.backgroundSubtle),

          Expanded(
            child: _error != null
                ? _InlineErrorState(title: "Couldn't load opportunities")
                : RefreshIndicator(
                    onRefresh: _load,
                    color: t.primary,
                    child: filtered.isEmpty && !_loading
                        ? Center(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 40, vertical: 48),
                              child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    EmptyStateOrb(icon: LucideIcons.compass),
                                    const SizedBox(height: 16),
                                    Text('No opportunities found',
                                        style: TextStyle(
                                            fontWeight: FontWeight.w700,
                                            fontSize: 16,
                                            color: t.textPrimary)),
                                    const SizedBox(height: 6),
                                    Text(
                                        'Adjust filters or refresh to discover new matches.',
                                        textAlign: TextAlign.center,
                                        style: TextStyle(
                                            color: t.textMuted,
                                            fontSize: 13,
                                            height: 1.6)),
                                  ]).animate().fadeIn(duration: 300.ms),
                            ),
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.fromLTRB(16, 4, 16, 32),
                            itemCount: filtered.length,
                            itemBuilder: (_, i) {
                              final opp = filtered[i];
                              final type =
                                  (opp['type'] ?? '').toString().toLowerCase();
                              final typeCol = _typeColor(type);
                              final score = (opp['matchScore'] ??
                                          opp['match_score'] as num?)
                                      ?.toInt() ??
                                  0;
                              final scoreCol = _matchColor(score);
                              final org = (opp['organisation'] ??
                                      opp['organization'] ??
                                      '')
                                  .toString();
                              final deadline =
                                  (opp['deadline'] ?? '').toString();
                              final isRemote = opp['isRemote'] == true ||
                                  opp['is_remote'] == true;

                              return PremiumCard(
                                margin: const EdgeInsets.only(bottom: 10),
                                onTap: () => _showDetail(opp),
                                child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Row(children: [
                                        // Type badge
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 8, vertical: 3),
                                          decoration: BoxDecoration(
                                            color:
                                                typeCol.withValues(alpha: 0.1),
                                            borderRadius: BorderRadius.circular(
                                                AppRadius.full),
                                            border: Border.all(
                                                color: typeCol.withValues(
                                                    alpha: 0.25)),
                                          ),
                                          child: Text(type,
                                              style: TextStyle(
                                                  color: typeCol,
                                                  fontSize: 10,
                                                  fontWeight: FontWeight.w700)),
                                        ),
                                        if (isRemote) ...[
                                          const SizedBox(width: 6),
                                          Container(
                                            padding: const EdgeInsets.symmetric(
                                                horizontal: 8, vertical: 3),
                                            decoration: BoxDecoration(
                                              color: t.backgroundSubtle,
                                              borderRadius:
                                                  BorderRadius.circular(
                                                      AppRadius.full),
                                              border:
                                                  Border.all(color: t.border),
                                            ),
                                            child: Text('Remote',
                                                style: TextStyle(
                                                    color: t.textMuted,
                                                    fontSize: 10,
                                                    fontWeight:
                                                        FontWeight.w600)),
                                          ),
                                        ],
                                        const Spacer(),
                                        if (score > 0)
                                          Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Icon(LucideIcons.sparkles,
                                                    size: 11, color: scoreCol),
                                                const SizedBox(width: 3),
                                                Text('$score%',
                                                    style: TextStyle(
                                                        color: scoreCol,
                                                        fontSize: 12,
                                                        fontWeight:
                                                            FontWeight.w700)),
                                              ]),
                                      ]),
                                      const SizedBox(height: 8),
                                      Text((opp['title'] ?? '').toString(),
                                          style: TextStyle(
                                              fontWeight: FontWeight.w700,
                                              fontSize: 15,
                                              color: t.textPrimary,
                                              letterSpacing: -0.3),
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis),
                                      if (org.isNotEmpty) ...[
                                        const SizedBox(height: 3),
                                        Text(org,
                                            style: TextStyle(
                                                color: t.textMuted,
                                                fontSize: 12)),
                                      ],
                                      if (deadline.isNotEmpty) ...[
                                        const SizedBox(height: 8),
                                        Row(children: [
                                          Icon(LucideIcons.calendar,
                                              size: 12, color: t.textMuted),
                                          const SizedBox(width: 4),
                                          Text(deadline,
                                              style: TextStyle(
                                                  color: t.textMuted,
                                                  fontSize: 12)),
                                        ]),
                                      ],
                                    ]),
                              ).staggered(i);
                            },
                          ),
                  ),
          ),
        ]),
      ),
    );
  }
}

// ══════════════════════════════════════════════════════════════
// AGENTS SCREEN
// Shows available AI domain agents with their status/description
// and a "Run" button that opens the AI Coach with context.
// ══════════════════════════════════════════════════════════════

class AgentsScreen extends ConsumerStatefulWidget {
  const AgentsScreen({super.key});
  @override
  ConsumerState<AgentsScreen> createState() => _AgentsScreenState();
}

class _AgentsScreenState extends ConsumerState<AgentsScreen> {
  List<Map<String, dynamic>> _agents = [];
  bool _loading = false;
  String? _error;

  static IconData _agentIcon(String name) {
    final n = name.toLowerCase();
    if (n.contains('career')) return LucideIcons.briefcase;
    if (n.contains('finance')) return LucideIcons.dollarSign;
    if (n.contains('health')) return LucideIcons.heart;
    if (n.contains('travel')) return LucideIcons.map;
    if (n.contains('business')) return LucideIcons.building2;
    if (n.contains('learn') || n.contains('study')) return LucideIcons.bookOpen;
    return LucideIcons.bot;
  }

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (!mounted) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final items = await ref.read(repositoryProvider).agents();
      if (!mounted) return;
      setState(() {
        _agents = items;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;

    return Scaffold(
      backgroundColor: t.background,
      body: SafeArea(
        child: Column(children: [
          _PageHeading('AI Agents',
                  subtitle: 'Specialist agents powered by your context')
              .pageEntrance(),
          if (_loading)
            LinearProgressIndicator(
                color: t.primary,
                minHeight: 2,
                backgroundColor: t.backgroundSubtle),
          Expanded(
            child: _error != null
                ? _InlineErrorState(title: "Couldn't load agents")
                : RefreshIndicator(
                    onRefresh: _load,
                    color: t.primary,
                    child: _agents.isEmpty && !_loading
                        ? Center(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 40, vertical: 48),
                              child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    EmptyStateOrb(icon: LucideIcons.bot),
                                    const SizedBox(height: 16),
                                    Text('No agents available',
                                        style: TextStyle(
                                            fontWeight: FontWeight.w700,
                                            fontSize: 16,
                                            color: t.textPrimary)),
                                    const SizedBox(height: 6),
                                    Text(
                                        'Domain agents will appear here once configured.',
                                        textAlign: TextAlign.center,
                                        style: TextStyle(
                                            color: t.textMuted,
                                            fontSize: 13,
                                            height: 1.6)),
                                  ]).animate().fadeIn(duration: 300.ms),
                            ),
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.fromLTRB(16, 4, 16, 32),
                            itemCount: _agents.length,
                            itemBuilder: (_, i) {
                              final a = _agents[i];
                              final name = (a['name'] ??
                                      a['agentType'] ??
                                      a['type'] ??
                                      'Agent')
                                  .toString();
                              final desc =
                                  (a['description'] ?? a['prompt'] ?? '')
                                      .toString();
                              final icon = _agentIcon(name);

                              return PremiumCard(
                                margin: const EdgeInsets.only(bottom: 10),
                                child: Row(children: [
                                  Container(
                                    width: 44,
                                    height: 44,
                                    decoration: BoxDecoration(
                                      color: t.primarySurface,
                                      borderRadius:
                                          BorderRadius.circular(AppRadius.md),
                                    ),
                                    child:
                                        Icon(icon, color: t.primary, size: 20),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                      child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                        Text(name,
                                            style: TextStyle(
                                                fontWeight: FontWeight.w700,
                                                fontSize: 14,
                                                color: t.textPrimary)),
                                        if (desc.isNotEmpty) ...[
                                          const SizedBox(height: 3),
                                          Text(desc,
                                              maxLines: 2,
                                              overflow: TextOverflow.ellipsis,
                                              style: TextStyle(
                                                  color: t.textMuted,
                                                  fontSize: 12,
                                                  height: 1.4)),
                                        ],
                                      ])),
                                  const SizedBox(width: 10),
                                  OutlinedButton(
                                    onPressed: () => context.go('/ai-coach'),
                                    style: OutlinedButton.styleFrom(
                                      foregroundColor: t.primary,
                                      side: BorderSide(color: t.primary),
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 14, vertical: 8),
                                      textStyle: const TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w600),
                                      minimumSize: Size.zero,
                                    ),
                                    child: const Text('Run'),
                                  ),
                                ]),
                              ).staggered(i);
                            },
                          ),
                  ),
          ),
        ]),
      ),
    );
  }
}

// ══════════════════════════════════════════════════════════════
// PLANNER SCREEN
// Shows AI-generated plans with structured steps.
// ══════════════════════════════════════════════════════════════

class PlannerScreen extends ConsumerStatefulWidget {
  const PlannerScreen({super.key});
  @override
  ConsumerState<PlannerScreen> createState() => _PlannerScreenState();
}

class _PlannerScreenState extends ConsumerState<PlannerScreen> {
  List<Map<String, dynamic>> _plans = [];
  bool _loading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (!mounted) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final items = await ref.read(repositoryProvider).plans();
      if (!mounted) return;
      setState(() {
        _plans = items;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;

    return Scaffold(
      backgroundColor: t.background,
      body: SafeArea(
        child: Column(children: [
          _PageHeading('Planner',
                  subtitle: 'AI-generated roadmaps for your missions')
              .pageEntrance(),
          if (_loading)
            LinearProgressIndicator(
                color: t.primary,
                minHeight: 2,
                backgroundColor: t.backgroundSubtle),
          Expanded(
            child: _error != null
                ? _InlineErrorState(title: "Couldn't load plans")
                : RefreshIndicator(
                    onRefresh: _load,
                    color: t.primary,
                    child: _plans.isEmpty && !_loading
                        ? Center(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 40, vertical: 48),
                              child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    EmptyStateOrb(
                                        icon: LucideIcons.calendarRange),
                                    const SizedBox(height: 16),
                                    Text('No plans yet',
                                        style: TextStyle(
                                            fontWeight: FontWeight.w700,
                                            fontSize: 16,
                                            color: t.textPrimary)),
                                    const SizedBox(height: 6),
                                    Text(
                                        'Ask your AI Coach to generate a plan for any mission.',
                                        textAlign: TextAlign.center,
                                        style: TextStyle(
                                            color: t.textMuted,
                                            fontSize: 13,
                                            height: 1.6)),
                                    const SizedBox(height: 24),
                                    PremiumButton(
                                      label: 'Open AI Coach',
                                      onPressed: () => context.go('/ai-coach'),
                                      minWidth: 180,
                                    ),
                                  ]).animate().fadeIn(duration: 300.ms),
                            ),
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.fromLTRB(16, 4, 16, 32),
                            itemCount: _plans.length,
                            itemBuilder: (_, i) {
                              final p = _plans[i];
                              final title =
                                  (p['title'] ?? p['name'] ?? 'Plan ${i + 1}')
                                      .toString();
                              final desc = (p['description'] ?? p['goal'] ?? '')
                                  .toString();
                              final steps = p['steps'] as List? ??
                                  p['tasks'] as List? ??
                                  [];
                              final mTitle = (p['missionTitle'] ??
                                      p['mission_title'] ??
                                      '')
                                  .toString();

                              return PremiumCard(
                                margin: const EdgeInsets.only(bottom: 12),
                                child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Row(children: [
                                        Icon(LucideIcons.calendarRange,
                                            size: 16, color: t.primary),
                                        const SizedBox(width: 8),
                                        Expanded(
                                            child: Text(title,
                                                style: TextStyle(
                                                    fontWeight: FontWeight.w700,
                                                    fontSize: 15,
                                                    color: t.textPrimary,
                                                    letterSpacing: -0.3),
                                                maxLines: 1,
                                                overflow:
                                                    TextOverflow.ellipsis)),
                                      ]),
                                      if (mTitle.isNotEmpty) ...[
                                        const SizedBox(height: 3),
                                        Text(mTitle,
                                            style: TextStyle(
                                                color: t.primary,
                                                fontSize: 12,
                                                fontWeight: FontWeight.w600)),
                                      ],
                                      if (desc.isNotEmpty) ...[
                                        const SizedBox(height: 6),
                                        Text(desc,
                                            maxLines: 3,
                                            overflow: TextOverflow.ellipsis,
                                            style: TextStyle(
                                                color: t.textSecondary,
                                                fontSize: 13,
                                                height: 1.5)),
                                      ],
                                      if (steps.isNotEmpty) ...[
                                        const SizedBox(height: 12),
                                        Divider(color: t.border, height: 1),
                                        const SizedBox(height: 8),
                                        Text(
                                            '${steps.length} step${steps.length == 1 ? '' : 's'}',
                                            style: TextStyle(
                                                color: t.textMuted,
                                                fontSize: 12,
                                                fontWeight: FontWeight.w600)),
                                        const SizedBox(height: 6),
                                        ...steps.take(3).map((s) {
                                          final st = s is Map
                                              ? (s['title'] ??
                                                  s['name'] ??
                                                  s['step'] ??
                                                  s.toString())
                                              : s.toString();
                                          return Padding(
                                            padding: const EdgeInsets.only(
                                                bottom: 4),
                                            child: Row(
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.start,
                                                children: [
                                                  Icon(LucideIcons.circleDot,
                                                      size: 11,
                                                      color: t.primary),
                                                  const SizedBox(width: 6),
                                                  Expanded(
                                                      child: Text(st.toString(),
                                                          maxLines: 1,
                                                          overflow: TextOverflow
                                                              .ellipsis,
                                                          style: TextStyle(
                                                              color: t
                                                                  .textSecondary,
                                                              fontSize: 12))),
                                                ]),
                                          );
                                        }),
                                        if (steps.length > 3)
                                          Padding(
                                            padding:
                                                const EdgeInsets.only(top: 2),
                                            child: Text(
                                                '+ ${steps.length - 3} more',
                                                style: TextStyle(
                                                    color: t.textMuted,
                                                    fontSize: 11)),
                                          ),
                                      ],
                                    ]),
                              ).staggered(i);
                            },
                          ),
                  ),
          ),
        ]),
      ),
    );
  }
}

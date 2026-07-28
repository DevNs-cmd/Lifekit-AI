import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:percent_indicator/linear_percent_indicator.dart';
import '../../core/constants.dart';
import 'mission_provider.dart';
import 'widgets/task_checklist_item.dart';
import 'widgets/ai_coach_bottom_sheet.dart';

class MissionDetailScreen extends ConsumerWidget {
  final String missionId;

  const MissionDetailScreen({Key? key, required this.missionId}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final mission = ref.watch(selectedMissionProvider(missionId));

    if (mission == null) {
      return Scaffold(
        backgroundColor: AppColors.primaryBg,
        appBar: AppBar(
          backgroundColor: AppColors.primaryBg,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () => context.go('/home'),
          ),
        ),
        body: const Center(
          child: Text('Mission not found', style: TextStyle(color: Colors.white)),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.primaryBg,
      appBar: AppBar(
        backgroundColor: AppColors.primaryBg,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 18),
          onPressed: () => context.go('/home'),
        ),
        title: Text(
          mission.title,
          style: const TextStyle(
            color: AppColors.textHigh,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined, color: AppColors.textMedium),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Mission roadmap shared to community!')),
              );
            },
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          showModalBottomSheet(
            context: context,
            isScrollControlled: true,
            backgroundColor: Colors.transparent,
            builder: (_) => AICoachBottomSheet(mission: mission),
          );
        },
        backgroundColor: AppColors.accentPurple,
        elevation: 6,
        icon: const Icon(Icons.psychology, color: Colors.white),
        label: const Text(
          'AI Coach',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Mission Overview Card Header
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.borderSubtle),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Builder(
                        builder: (context) {
                          final catColors = AppColors.getCategoryColors(mission.category);
                          return Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: catColors.backgroundColor,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              mission.category,
                              style: TextStyle(
                                color: catColors.textColor,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                          );
                        },
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceLight,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.timer_outlined, size: 12, color: AppColors.textMedium),
                            const SizedBox(width: 4),
                            Text(
                              mission.duration,
                              style: const TextStyle(
                                color: AppColors.textMedium,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Overall Progress',
                        style: TextStyle(
                          color: AppColors.textMedium,
                          fontSize: 13,
                        ),
                      ),
                      Text(
                        '${mission.progressPercentInt}%',
                        style: const TextStyle(
                          color: AppColors.textHigh,
                          fontWeight: FontWeight.w900,
                          fontSize: 22,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  LinearPercentIndicator(
                    lineHeight: 10.0,
                    percent: mission.progressPercentage.clamp(0.0, 1.0),
                    backgroundColor: AppColors.surfaceLight,
                    progressColor: AppColors.accentGlow,
                    barRadius: const Radius.circular(5),
                    padding: EdgeInsets.zero,
                    animation: true,
                    animationDuration: 400,
                  ),
                  const SizedBox(height: 14),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '${mission.completedTaskCount} / ${mission.tasks.length} Milestones Achieved',
                        style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                      ),
                      Text(
                        '${mission.tasks.length - mission.completedTaskCount} Remaining',
                        style: const TextStyle(color: AppColors.warningOrange, fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Execution Checklist Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Execution Checklist',
                  style: TextStyle(
                    color: AppColors.textHigh,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                TextButton.icon(
                  onPressed: () {
                    _showAddTaskDialog(context, ref, mission.id);
                  },
                  icon: const Icon(Icons.add, color: AppColors.accentGlow, size: 18),
                  label: const Text(
                    'Add Step',
                    style: TextStyle(color: AppColors.accentGlow, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Interactive Task Checklist List
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: mission.tasks.length,
              itemBuilder: (context, idx) {
                final task = mission.tasks[idx];
                return TaskChecklistItem(
                  task: task,
                  onToggle: (_) {
                    ref.read(missionProvider.notifier).toggleTask(mission.id, task.id);
                  },
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showAddTaskDialog(BuildContext context, WidgetRef ref, String missionId) {
    final taskController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.cardBg,
        title: const Text('Add Execution Step', style: TextStyle(color: AppColors.textHigh)),
        content: TextField(
          controller: taskController,
          autofocus: true,
          style: const TextStyle(color: AppColors.textHigh),
          decoration: InputDecoration(
            hintText: 'e.g., Complete System Architecture Review',
            hintStyle: const TextStyle(color: AppColors.textMuted),
            filled: true,
            fillColor: AppColors.surfaceLight,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textMuted)),
          ),
          ElevatedButton(
            onPressed: () {
              if (taskController.text.trim().isNotEmpty) {
                ref.read(missionProvider.notifier).addTask(missionId, taskController.text.trim());
                Navigator.pop(ctx);
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.accentPurple),
            child: const Text('Add Step', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
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
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Text(
                            'Good Morning, Aditya',
                            style: TextStyle(
                              color: AppColors.textHigh,
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(width: 6),
                          const Text('👋', style: TextStyle(fontSize: 20)),
                        ],
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'LifeKit Goal Execution Command Center',
                        style: TextStyle(
                          color: AppColors.textMuted,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                  GestureDetector(
                    onTap: () => context.go('/profile'),
                    child: Container(
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: AppColors.accentGlow, width: 2),
                      ),
                      child: const CircleAvatar(
                        radius: 22,
                        backgroundColor: AppColors.surfaceLight,
                        child: Text(
                          'AK',
                          style: TextStyle(
                            color: AppColors.textHigh,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // AI Suggestion Widget
              AISuggestionCard(
                onExecute: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('⚡ Focus mode activated! Starting 45 min deep work sprint.'),
                      backgroundColor: AppColors.accentPurple,
                    ),
                  );
                },
              ),
              const SizedBox(height: 28),

              // Section Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Active Missions',
                    style: TextStyle(
                      color: AppColors.textHigh,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  TextButton.icon(
                    onPressed: () {
                      _showCreateMissionDialog(context, ref);
                    },
                    icon: const Icon(Icons.add_circle_outline, color: AppColors.accentGlow, size: 18),
                    label: const Text(
                      'New Goal',
                      style: TextStyle(
                        color: AppColors.accentGlow,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Active Missions List
              if (missions.isEmpty)
                Container(
                  padding: const EdgeInsets.all(24),
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: AppColors.cardBg,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Text(
                    'No active missions yet. Tap "New Goal" to begin!',
                    style: TextStyle(color: AppColors.textMuted),
                  ),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: missions.length,
                  itemBuilder: (context, index) {
                    return ActiveMissionCard(mission: missions[index]);
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }

  void _showCreateMissionDialog(BuildContext context, WidgetRef ref) {
    final titleController = TextEditingController();
    String category = 'Career';
    String duration = '3 months';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.cardBg,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
          top: 24,
          left: 20,
          right: 20,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Launch New LifeKit Mission',
              style: TextStyle(
                color: AppColors.textHigh,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: titleController,
              style: const TextStyle(color: AppColors.textHigh),
              decoration: InputDecoration(
                hintText: 'e.g. Master AI Prompt Engineering',
                hintStyle: const TextStyle(color: AppColors.textMuted),
                filled: true,
                fillColor: AppColors.surfaceLight,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Category', style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceLight,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: category,
                            dropdownColor: AppColors.cardBg,
                            style: const TextStyle(color: AppColors.textHigh),
                            items: ['Career', 'Finance', 'Health', 'Business', 'Education']
                                .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                                .toList(),
                            onChanged: (val) {
                              if (val != null) category = val;
                            },
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Target Duration', style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceLight,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: duration,
                            dropdownColor: AppColors.cardBg,
                            style: const TextStyle(color: AppColors.textHigh),
                            items: ['1 month', '3 months', '6 months', '1 year']
                                .map((d) => DropdownMenuItem(value: d, child: Text(d)))
                                .toList(),
                            onChanged: (val) {
                              if (val != null) duration = val;
                            },
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                if (titleController.text.trim().isNotEmpty) {
                  final newMission = MissionModel(
                    id: 'm_${DateTime.now().millisecondsSinceEpoch}',
                    title: titleController.text.trim(),
                    category: category,
                    duration: duration,
                    iconName: 'target',
                    tasks: [
                      TaskModel(id: 't_new_1', title: 'Define key success metrics', isCompleted: false),
                      TaskModel(id: 't_new_2', title: 'Execute first action milestone', isCompleted: false),
                    ],
                  );
                  ref.read(missionProvider.notifier).addMission(newMission);
                  Navigator.pop(ctx);
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.accentPurple,
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 48),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Launch Mission', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}

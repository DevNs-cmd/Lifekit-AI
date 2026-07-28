import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/mission_model.dart';

class MissionNotifier extends StateNotifier<List<MissionModel>> {
  MissionNotifier() : super(_initialMissions);

  static final List<MissionModel> _initialMissions = [
    MissionModel(
      id: 'm1',
      title: 'Build Startup',
      category: 'Business',
      duration: '3 months',
      iconName: 'rocket',
      tasks: [
        TaskModel(id: 't1_1', title: 'Validate MVP Problem Statement', isCompleted: true, difficulty: 'High'),
        TaskModel(id: 't1_2', title: 'Design Figma Interactive Wireframes', isCompleted: true, difficulty: 'Medium'),
        TaskModel(id: 't1_3', title: 'Setup Flutter + Riverpod Architecture', isCompleted: true, difficulty: 'High'),
        TaskModel(id: 't1_4', title: 'Deploy Backend Server & API Routes', isCompleted: false, difficulty: 'High'),
        TaskModel(id: 't1_5', title: 'Launch Beta to 50 Early Adopters', isCompleted: false, difficulty: 'Extreme'),
      ],
    ),
    MissionModel(
      id: 'm2',
      title: 'Become Software Engineer',
      category: 'Career',
      duration: '6 months',
      iconName: 'code',
      tasks: [
        TaskModel(id: 't2_1', title: 'Master Data Structures & Algorithms', isCompleted: true, difficulty: 'High'),
        TaskModel(id: 't2_2', title: 'Build 3 Full-Stack Production Projects', isCompleted: true, difficulty: 'Extreme'),
        TaskModel(id: 't2_3', title: 'Optimize GitHub Profile & Technical Blog', isCompleted: true, difficulty: 'Medium'),
        TaskModel(id: 't2_4', title: 'Conduct 10 Mock System Design Interviews', isCompleted: false, difficulty: 'High'),
        TaskModel(id: 't2_5', title: 'Apply to Top Tier Tech Companies', isCompleted: false, difficulty: 'High'),
      ],
    ),
    MissionModel(
      id: 'm3',
      title: 'Save ₹5 Lakh',
      category: 'Finance',
      duration: '12 months',
      iconName: 'wallet',
      tasks: [
        TaskModel(id: 't3_1', title: 'Set up automated index fund SIPs', isCompleted: true, difficulty: 'Low'),
        TaskModel(id: 't3_2', title: 'Cut unnecessary subscription overhead', isCompleted: false, difficulty: 'Low'),
        TaskModel(id: 't3_3', title: 'Allocate 20% savings to emergency fund', isCompleted: false, difficulty: 'Medium'),
        TaskModel(id: 't3_4', title: 'Build high-yield side income stream', isCompleted: false, difficulty: 'High'),
      ],
    ),
    MissionModel(
      id: 'm4',
      title: 'Fitness & Marathon Goal',
      category: 'Health',
      duration: '4 months',
      iconName: 'heart',
      tasks: [
        TaskModel(id: 't4_1', title: 'Complete 10km weekly baseline run', isCompleted: true, difficulty: 'Medium'),
        TaskModel(id: 't4_2', title: 'Optimize high-protein clean nutrition plan', isCompleted: true, difficulty: 'Medium'),
        TaskModel(id: 't4_3', title: 'Hit 21km Half-Marathon test milestone', isCompleted: false, difficulty: 'High'),
        TaskModel(id: 't4_4', title: 'Register for Official City Marathon', isCompleted: false, difficulty: 'Low'),
      ],
    ),
  ];

  void toggleTask(String missionId, String taskId) {
    state = [
      for (final mission in state)
        if (mission.id == missionId)
          mission.copyWith(
            tasks: [
              for (final task in mission.tasks)
                if (task.id == taskId)
                  task.copyWith(isCompleted: !task.isCompleted)
                else
                  task
            ],
          )
        else
          mission
    ];
  }

  void addTask(String missionId, String taskTitle) {
    if (taskTitle.trim().isEmpty) return;
    final newTask = TaskModel(
      id: 't_${DateTime.now().millisecondsSinceEpoch}',
      title: taskTitle.trim(),
      isCompleted: false,
      difficulty: 'Medium',
    );

    state = [
      for (final mission in state)
        if (mission.id == missionId)
          mission.copyWith(tasks: [...mission.tasks, newTask])
        else
          mission
    ];
  }

  void addMission(MissionModel newMission) {
    state = [...state, newMission];
  }
}

final missionProvider =
    StateNotifierProvider<MissionNotifier, List<MissionModel>>((ref) {
  return MissionNotifier();
});

final selectedMissionProvider = Provider.family<MissionModel?, String>((ref, id) {
  final missions = ref.watch(missionProvider);
  try {
    return missions.firstWhere((m) => m.id == id);
  } catch (_) {
    return missions.isNotEmpty ? missions.first : null;
  }
});

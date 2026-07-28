class TaskModel {
  final String id;
  final String title;
  final bool isCompleted;
  final String? dueDate;
  final String? difficulty;

  TaskModel({
    required this.id,
    required this.title,
    this.isCompleted = false,
    this.dueDate,
    this.difficulty,
  });

  TaskModel copyWith({
    String? id,
    String? title,
    bool? isCompleted,
    String? dueDate,
    String? difficulty,
  }) {
    return TaskModel(
      id: id ?? this.id,
      title: title ?? this.title,
      isCompleted: isCompleted ?? this.isCompleted,
      dueDate: dueDate ?? this.dueDate,
      difficulty: difficulty ?? this.difficulty,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'isCompleted': isCompleted,
        'dueDate': dueDate,
        'difficulty': difficulty,
      };

  factory TaskModel.fromJson(Map<String, dynamic> json) => TaskModel(
        id: json['id'],
        title: json['title'],
        isCompleted: json['isCompleted'] ?? false,
        dueDate: json['dueDate'],
        difficulty: json['difficulty'],
      );
}

class MissionModel {
  final String id;
  final String title;
  final String category;
  final String duration;
  final String iconName;
  final List<TaskModel> tasks;

  MissionModel({
    required this.id,
    required this.title,
    required this.category,
    required this.duration,
    required this.iconName,
    required this.tasks,
  });

  int get completedTaskCount => tasks.where((t) => t.isCompleted).length;
  
  double get progressPercentage {
    if (tasks.isEmpty) return 0.0;
    return completedTaskCount / tasks.length;
  }

  int get progressPercentInt => (progressPercentage * 100).round();

  MissionModel copyWith({
    String? id,
    String? title,
    String? category,
    String? duration,
    String? iconName,
    List<TaskModel>? tasks,
  }) {
    return MissionModel(
      id: id ?? this.id,
      title: title ?? this.title,
      category: category ?? this.category,
      duration: duration ?? this.duration,
      iconName: iconName ?? this.iconName,
      tasks: tasks ?? this.tasks,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'category': category,
        'duration': duration,
        'iconName': iconName,
        'tasks': tasks.map((t) => t.toJson()).toList(),
      };

  factory MissionModel.fromJson(Map<String, dynamic> json) => MissionModel(
        id: json['id'],
        title: json['title'],
        category: json['category'],
        duration: json['duration'],
        iconName: json['iconName'] ?? 'rocket',
        tasks: (json['tasks'] as List? ?? [])
            .map((t) => TaskModel.fromJson(t))
            .toList(),
      );
}

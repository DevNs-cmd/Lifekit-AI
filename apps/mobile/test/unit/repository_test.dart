import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lifekit_mobile/src/core/repository.dart';

void main() {
  late LifeKitRepository repo;

  setUp(() {
    final dio = Dio();
    repo = LifeKitRepository(dio);
  });

  group('LifeKitRepository Unit Tests', () {
    test('profile handles empty map on initial network offline state', () async {
      final user = await repo.profile();
      expect(user, isA<Map<String, dynamic>>());
    });

    test('createMission adds new mission locally and returns payload', () async {
      final initialCount = (await repo.missions()).length;
      final created = await repo.createMission(
        title: 'Learn Go & Kubernetes',
        description: 'Master cloud-native backend development',
        category: 'Career',
      );

      expect(created['title'], equals('Learn Go & Kubernetes'));
      final updatedMissions = await repo.missions();
      expect(updatedMissions.length, equals(initialCount + 1));
    });

    test('tasks returns list for specified mission query', () async {
      final tasks = await repo.tasks(missionId: 1);
      expect(tasks, isA<List<Map<String, dynamic>>>());
    });

    test('createTask creates and stores a valid task payload', () async {
      final created = await repo.createTask(
        missionId: 1,
        title: 'Complete System Design Module',
        description: 'Covers caching, sharding, and load balancing',
        priority: 'high',
        estimatedDurationMinutes: 45,
      );

      expect(created['title'], equals('Complete System Design Module'));
      expect(created['priority'], equals('high'));
      expect(created['status'], equals('PENDING'));
      expect(created['dueDate'], isNotEmpty);
      expect(created['estimatedDurationMinutes'], equals(45));
    });

    test('updateTask updates existing task in offline store', () async {
      final created = await repo.createTask(
        missionId: 1,
        title: 'Task before update',
      );
      final id = created['id'] as int;

      final updated = await repo.updateTask(id, {
        'title': 'Task after update',
        'priority': 'urgent',
      });

      expect(updated['title'], equals('Task after update'));
      expect(updated['priority'], equals('urgent'));
    });

    test('setTaskStatus updates task status', () async {
      final created = await repo.createTask(
        missionId: 1,
        title: 'Status Test Task',
      );
      final id = created['id'] as int;

      final updated = await repo.setTaskStatus(id, 'COMPLETED');
      expect(updated['status'], equals('COMPLETED'));
    });

    test('deleteTask removes task from repository', () async {
      final created = await repo.createTask(
        missionId: 1,
        title: 'Task to be deleted',
      );
      final id = created['id'] as int;

      await repo.deleteTask(id);
      final all = await repo.tasks(missionId: 1);
      expect(all.any((t) => t['id'] == id), isFalse);
    });

    test('agents returns list of specialist AI agents', () async {
      final agents = await repo.agents();
      expect(agents, isA<List<Map<String, dynamic>>>());
    });

    test('runAgent returns response message container', () async {
      final res = await repo.runAgent(
        agentType: 'agent-tech',
        userInput: 'System Design for Caching',
      );

      expect(res, isNotNull);
      expect(res['message'], isNotEmpty);
    });

    test('memories and createMemory manage memory items', () async {
      final initial = await repo.memories();
      final created = await repo.createMemory(
        content: 'Prefers 8 AM morning focus block',
        tags: ['focus', 'time'],
      );

      expect(created['content'], contains('8 AM'));
      final updated = await repo.memories();
      expect(updated.length, equals(initial.length + 1));
    });

    test('notifications unread count calculation', () async {
      final count = await repo.unreadNotificationCount();
      expect(count, isA<int>());
    });

    test('analytics returns structured productivity and completion metrics', () async {
      final a = await repo.analytics();
      expect(a, isA<Map<String, dynamic>>());
      expect(a.containsKey('taskCompletionRate'), isTrue);
      expect(a.containsKey('weeklyProductivity'), isTrue);
    });

    test('generateInsight produces rich structured insight payload', () async {
      final insight = await repo.generateInsight(
        missions: ['Build Mobile App', 'Learn Backend'],
        tasksCompleted: 4,
        tasksPending: 2,
        streakDays: 5,
        topCategory: 'Engineering',
        fullName: 'Alex Doe',
      );

      expect(insight, isA<Map<String, dynamic>>());
      expect(insight['headline'], isNotEmpty);
      expect(insight['summary'], isNotEmpty);
      expect(insight['momentum_score'], isA<int>());
      expect(insight['trend'], isIn(['up', 'down', 'steady']));
      expect(insight['highlights'], isA<List>());
      expect(insight['nudges'], isA<List>());
    });
  });
}

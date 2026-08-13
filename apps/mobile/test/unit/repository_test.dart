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
  });
}

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
    test('profile returns mock user profile on network fallback', () async {
      final user = await repo.profile();
      expect(user, isNotEmpty);
      expect(user['fullName'], equals('Arjun Sharma'));
      expect(user['email'], equals('arjun@example.com'));
    });

    test('missions returns mock missions on fallback', () async {
      final missions = await repo.missions();
      expect(missions.length, greaterThanOrEqualTo(3));
      expect(missions.first['title'], equals('Become a Software Engineer'));
    });

    test('createMission adds new mission locally on fallback', () async {
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

    test('tasks returns tasks for specified mission', () async {
      final tasks = await repo.tasks(missionId: 1);
      expect(tasks, isNotEmpty);
      expect(tasks.first['missionId'], equals(1));
    });

    test('agents returns specialist AI agents', () async {
      final agents = await repo.agents();
      expect(agents.length, equals(4));
      expect(agents.first['name'], equals('AI Life Coach'));
    });

    test('runAgent returns mock response message', () async {
      final res = await repo.runAgent(
        agentType: 'agent-tech',
        userInput: 'System Design for Caching',
      );

      expect(res, isNotNull);
      expect(res['message'], contains('System Design'));
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
      expect(count, equals(2));
    });
  });
}

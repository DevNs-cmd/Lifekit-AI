import 'package:flutter_test/flutter_test.dart';
import 'package:lifekit_mobile/src/features/dashboard/screens.dart';

void main() {
  group('MissionData Model Tests', () {
    test('fromJson parses raw backend mission JSON correctly', () {
      final json = {
        'id': 1,
        'title': 'Become a Software Engineer',
        'goal': 'Master Python & DSA',
        'category': 'Career',
        'status': 'ACTIVE',
        'priority': 'HIGH',
        'progress': 42.0,
        'targetDate': '2025-12-31T00:00:00Z',
      };

      final mission = MissionData.fromJson(json);

      expect(mission.id, equals(1));
      expect(mission.title, equals('Become a Software Engineer'));
      expect(mission.category, equals('Career'));
      expect(mission.status, equals('Active'));
      expect(mission.priority, equals('high'));
      expect(mission.progress, equals(0.42));
      expect(mission.deadline, equals('31/12/2025'));
    });

    test('fromJson handles normalized status strings', () {
      final jsonPaused = {'id': 2, 'status': 'PAUSED'};
      final jsonDone = {'id': 3, 'status': 'COMPLETED'};

      expect(MissionData.fromJson(jsonPaused).status, equals('Paused'));
      expect(MissionData.fromJson(jsonDone).status, equals('Completed'));
    });
  });

  group('TaskData Model Tests', () {
    test('fromJson parses task fields correctly', () {
      final json = {
        'id': 1001,
        'mission_id': 1,
        'title': 'Solve 2 LeetCode Medium problems',
        'priority': 'URGENT',
        'estimated_time': 45,
        'status': 'IN_PROGRESS',
      };

      final task = TaskData.fromJson(json, 'Become a Software Engineer');

      expect(task.id, equals(1001));
      expect(task.missionId, equals(1));
      expect(task.title, equals('Solve 2 LeetCode Medium problems'));
      expect(task.missionTitle, equals('Become a Software Engineer'));
      expect(task.priority, equals('urgent'));
      expect(task.minutes, equals(45));
      expect(task.status, equals('In Progress'));
      expect(task.done, isFalse);
    });

    test('fromJson marks completed tasks as done', () {
      final json = {
        'id': 1002,
        'mission_id': 1,
        'title': 'Read System Design chapter',
        'status': 'COMPLETED',
      };

      final task = TaskData.fromJson(json, 'Mission Title');
      expect(task.status, equals('Done'));
      expect(task.done, isTrue);
    });

    test('fromJson parses description, dueDate, and camelCase missionId', () {
      final json = {
        'id': 1003,
        'missionId': 5,
        'title': 'Implement auth flow',
        'description': 'Handle JWT and refresh token storage',
        'dueDate': '2026-08-20T12:00:00.000Z',
        'estimatedDurationMinutes': 60,
        'status': 'PENDING',
        'priority': 'HIGH',
      };

      final task = TaskData.fromJson(json, 'Mobile App Dev');
      expect(task.id, equals(1003));
      expect(task.missionId, equals(5));
      expect(task.title, equals('Implement auth flow'));
      expect(task.description, equals('Handle JWT and refresh token storage'));
      expect(task.dueDate, equals('2026-08-20T12:00:00.000Z'));
      expect(task.minutes, equals(60));
      expect(task.status, equals('To Do'));
      expect(task.priority, equals('high'));
      expect(task.done, isFalse);
    });
  });
}

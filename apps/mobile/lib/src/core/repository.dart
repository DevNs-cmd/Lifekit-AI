import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'api.dart';
import 'mock_data.dart';

final repositoryProvider = Provider<LifeKitRepository>(
  (ref) => LifeKitRepository(ref.watch(dioProvider)),
);

// ─── Response helpers ────────────────────────────────────────────────────────
Map<String, dynamic> _asMap(dynamic v) {
  if (v is Map<String, dynamic>) return v;
  if (v is Map) return Map<String, dynamic>.from(v);
  return {};
}

List<Map<String, dynamic>> _asList(dynamic v) {
  List<dynamic> raw;
  if (v is Map) {
    final inner = v['data'] ?? v['items'] ?? v;
    raw = inner is List ? inner : [];
  } else if (v is List) {
    raw = v;
  } else {
    raw = [];
  }
  return raw.whereType<Map>().map(_asMap).toList();
}

dynamic _unwrap(dynamic v) {
  if (v is Map && (v.containsKey('data') || v.containsKey('success'))) {
    return v['data'] ?? v;
  }
  return v;
}

// ─── Repository ──────────────────────────────────────────────────────────────
class LifeKitRepository {
  LifeKitRepository(this._dio);
  final Dio _dio;

  // Local state caches for mock mutability
  final List<Map<String, dynamic>> _localMissions =
      List.from(MockData.missions);
  final List<Map<String, dynamic>> _localTasks = List.from(MockData.tasks);
  final List<Map<String, dynamic>> _localMemories =
      List.from(MockData.memories);
  final List<Map<String, dynamic>> _localNotifications =
      List.from(MockData.notifications);
  Map<String, dynamic> _localProfile = Map.from(MockData.user);

  // ── Users / Profile ────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> profile() async {
    try {
      final res = await _dio.get<dynamic>('/users/me');
      final data = _asMap(_unwrap(res.data));
      if (data.isNotEmpty) _localProfile = data;
      return _localProfile;
    } catch (_) {
      return _localProfile;
    }
  }

  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    try {
      final res = await _dio.patch<dynamic>('/users/me', data: data);
      final updated = _asMap(_unwrap(res.data));
      if (updated.isNotEmpty) {
        _localProfile.addAll(updated);
      } else {
        _localProfile.addAll(data);
      }
      return _localProfile;
    } catch (_) {
      _localProfile.addAll(data);
      return _localProfile;
    }
  }

  // ── Life Missions ──────────────────────────────────────────────────────────
  Future<List<Map<String, dynamic>>> missions({
    String? status,
    int page = 1,
    int limit = 50,
  }) async {
    try {
      final res = await _dio.get<dynamic>('/life-missions', queryParameters: {
        'page': page,
        'limit': limit,
        if (status != null) 'status': status,
      });
      final fetched = _asList(_unwrap(res.data));
      if (fetched.isNotEmpty) return fetched;
      return _filterMissions(status);
    } catch (_) {
      return _filterMissions(status);
    }
  }

  List<Map<String, dynamic>> _filterMissions(String? status) {
    if (status == null || status.isEmpty || status.toUpperCase() == 'ALL') {
      return List.unmodifiable(_localMissions);
    }
    return _localMissions
        .where((m) =>
            (m['status'] ?? '').toString().toUpperCase() ==
            status.toUpperCase())
        .toList();
  }

  Future<Map<String, dynamic>> mission(int id) async {
    try {
      final res = await _dio.get<dynamic>('/life-missions/$id');
      final data = _asMap(_unwrap(res.data));
      if (data.isNotEmpty) return data;
    } catch (_) {}
    return _localMissions.firstWhere(
      (m) =>
          (m['id'] is int ? m['id'] : int.tryParse(m['id'].toString())) == id,
      orElse: () => _localMissions.first,
    );
  }

  Future<Map<String, dynamic>> createMission({
    required String title,
    required String description,
    String category = 'Career',
    String? targetDate,
  }) async {
    final now = DateTime.now();
    final target =
        targetDate ?? now.add(const Duration(days: 90)).toIso8601String();
    final newMission = {
      'id': _localMissions.length + 1,
      'title': title,
      'description': description,
      'goal': description,
      'category': category,
      'status': 'ACTIVE',
      'priority': 'medium',
      'progress': 0.0,
      'startDate': now.toIso8601String(),
      'targetDate': target,
      'milestones': <Map<String, dynamic>>[
        {'id': 1, 'title': 'Initial Setup & Planning', 'status': 'IN_PROGRESS'},
      ],
    };

    try {
      final res = await _dio.post<dynamic>('/life-missions', data: {
        'title': title,
        'description': description,
        'category': category,
        'targetDate': target,
      });
      final created = _asMap(_unwrap(res.data));
      if (created.isNotEmpty) {
        _localMissions.insert(0, created);
        return created;
      }
    } catch (_) {}

    _localMissions.insert(0, newMission);
    return newMission;
  }

  Future<Map<String, dynamic>> updateMission(
      int id, Map<String, dynamic> data) async {
    try {
      await _dio.patch<dynamic>('/life-missions/$id', data: data);
    } catch (_) {}

    final idx = _localMissions.indexWhere((m) => m['id'] == id);
    if (idx != -1) {
      _localMissions[idx].addAll(data);
      return _localMissions[idx];
    }
    return data;
  }

  Future<void> deleteMission(int id) async {
    try {
      await _dio.delete<void>('/life-missions/$id');
    } catch (_) {}
    _localMissions.removeWhere((m) => m['id'] == id);
  }

  // ── Tasks ──────────────────────────────────────────────────────────────────
  Future<List<Map<String, dynamic>>> tasks({int? missionId}) async {
    try {
      final res = await _dio.get<dynamic>('/tasks', queryParameters: {
        if (missionId != null) 'missionId': missionId,
      });
      final list = _asList(_unwrap(res.data));
      if (list.isNotEmpty) return list;
    } catch (_) {}

    if (missionId == null) return List.unmodifiable(_localTasks);
    return _localTasks.where((t) => t['missionId'] == missionId).toList();
  }

  Future<Map<String, dynamic>> createTask({
    required int missionId,
    required String title,
    String description = '',
    String priority = 'medium',
    int minutes = 30,
  }) async {
    final newTask = {
      'id': DateTime.now().millisecondsSinceEpoch % 100000,
      'missionId': missionId,
      'title': title,
      'description': description,
      'status': 'PENDING',
      'priority': priority,
      'estimatedDurationMinutes': minutes,
      'dueDate': DateTime.now().add(const Duration(days: 1)).toIso8601String(),
    };

    try {
      final res = await _dio.post<dynamic>('/tasks', data: newTask);
      final created = _asMap(_unwrap(res.data));
      if (created.isNotEmpty) {
        _localTasks.insert(0, created);
        return created;
      }
    } catch (_) {}

    _localTasks.insert(0, newTask);
    return newTask;
  }

  Future<Map<String, dynamic>> updateTask(
      int id, Map<String, dynamic> data) async {
    try {
      await _dio.patch<dynamic>('/tasks/$id', data: data);
    } catch (_) {}

    final idx = _localTasks.indexWhere((t) => t['id'] == id);
    if (idx != -1) {
      _localTasks[idx].addAll(data);
      return _localTasks[idx];
    }
    return data;
  }

  Future<void> setTaskStatus(int id, String status) async {
    try {
      await _dio.patch<dynamic>('/tasks/$id/status', data: {'status': status});
    } catch (_) {}

    final idx = _localTasks.indexWhere((t) => t['id'] == id);
    if (idx != -1) {
      _localTasks[idx]['status'] = status;
    }
  }

  Future<void> deleteTask(int id) async {
    try {
      await _dio.delete<void>('/tasks/$id');
    } catch (_) {}
    _localTasks.removeWhere((t) => t['id'] == id);
  }

  // ── AI Coach & Agents ──────────────────────────────────────────────────────
  Future<List<Map<String, dynamic>>> agents() async {
    try {
      final res = await _dio.get<dynamic>('/agents');
      final list = _asList(_unwrap(res.data));
      if (list.isNotEmpty) return list;
    } catch (_) {}
    return MockData.agents;
  }

  Future<Map<String, dynamic>> runAgent({
    required String agentType,
    required String userInput,
    Map<String, dynamic>? contextData,
  }) async {
    try {
      final res = await _dio.post<dynamic>('/agents/run', data: {
        'agentType': agentType,
        'userInput': userInput,
        'contextData': contextData ?? <String, dynamic>{},
      });
      final map = _asMap(_unwrap(res.data));
      if (map.isNotEmpty) return map;
    } catch (_) {}

    // Mock AI response generation
    await Future<void>.delayed(const Duration(milliseconds: 600));
    final responseMessage = switch (agentType.toLowerCase()) {
      'agent-tech' =>
        'Here is a breakdown for "$userInput":\n\n1. Review System Design pattern (Caching & Replication)\n2. Implement a high-throughput Queue using Redis\n3. Benchmark p99 latency under load.',
      'agent-wealth' =>
        'Financial analysis for "$userInput":\n\n- Allocate 60% in index mutual funds\n- Maintain ₹1 Lakh in emergency liquid fund\n- Review SIP schedule monthly.',
      'agent-fitness' =>
        'Endurance recommendation for "$userInput":\n\n- Start with 5 min warm-up jog\n- Run 3x 2K intervals @ 5:30 pace\n- Hydrate with electrolytes.',
      _ =>
        'Life Coach Insight for "$userInput":\n\nGreat initiative! Let\'s break this down into 2 clear focus tasks and assign high priority.',
    };

    return {
      'id': 'agent-res-${DateTime.now().millisecondsSinceEpoch}',
      'agentType': agentType,
      'message': responseMessage,
      'suggestedActions': ['Create Task', 'Add to Memory'],
      'timestamp': DateTime.now().toIso8601String(),
    };
  }

  // ── Memories ───────────────────────────────────────────────────────────────
  Future<List<Map<String, dynamic>>> memories({String? query}) async {
    try {
      final res = await _dio.get<dynamic>('/memories', queryParameters: {
        if (query != null && query.isNotEmpty) 'query': query,
      });
      final list = _asList(_unwrap(res.data));
      if (list.isNotEmpty) return list;
    } catch (_) {}

    if (query == null || query.isEmpty)
      return List.unmodifiable(_localMemories);
    final q = query.toLowerCase();
    return _localMemories
        .where((m) =>
            m['content'].toString().toLowerCase().contains(q) ||
            (m['tags'] as List? ?? [])
                .any((t) => t.toString().toLowerCase().contains(q)))
        .toList();
  }

  Future<Map<String, dynamic>> createMemory({
    required String content,
    String type = 'note',
    List<String> tags = const [],
  }) async {
    final item = {
      'id': _localMemories.length + 1,
      'content': content,
      'type': type,
      'tags': tags.isEmpty ? ['general'] : tags,
      'createdAt': DateTime.now().toIso8601String(),
    };

    try {
      final res = await _dio.post<dynamic>('/memories', data: item);
      final created = _asMap(_unwrap(res.data));
      if (created.isNotEmpty) {
        _localMemories.insert(0, created);
        return created;
      }
    } catch (_) {}

    _localMemories.insert(0, item);
    return item;
  }

  Future<void> deleteMemory(int id) async {
    try {
      await _dio.delete<void>('/memories/$id');
    } catch (_) {}
    _localMemories.removeWhere((m) => m['id'] == id);
  }

  // ── Opportunities & Marketplace ────────────────────────────────────────────
  Future<List<Map<String, dynamic>>> opportunities({String? category}) async {
    try {
      final res = await _dio.get<dynamic>('/opportunities');
      final list = _asList(_unwrap(res.data));
      if (list.isNotEmpty) return list;
    } catch (_) {}
    if (category == null || category.isEmpty || category == 'All') {
      return MockData.opportunities;
    }
    return MockData.opportunities
        .where((o) =>
            (o['category'] ?? '').toString().toLowerCase() ==
            category.toLowerCase())
        .toList();
  }

  Future<List<Map<String, dynamic>>> marketplace({String? category}) async {
    try {
      final res = await _dio.get<dynamic>('/marketplace');
      final list = _asList(_unwrap(res.data));
      if (list.isNotEmpty) return list;
    } catch (_) {}
    if (category == null || category.isEmpty || category == 'All') {
      return MockData.marketplace;
    }
    return MockData.marketplace
        .where((m) =>
            (m['category'] ?? '').toString().toLowerCase() ==
            category.toLowerCase())
        .toList();
  }

  Future<Map<String, dynamic>> marketplaceListing(int id) async {
    try {
      final res = await _dio.get<dynamic>('/marketplace/$id');
      final map = _asMap(_unwrap(res.data));
      if (map.isNotEmpty) return map;
    } catch (_) {}
    return MockData.marketplace.firstWhere(
      (m) => m['id'] == id,
      orElse: () => MockData.marketplace.first,
    );
  }

  // ── Notifications ──────────────────────────────────────────────────────────
  Future<List<Map<String, dynamic>>> notifications() async {
    try {
      final res = await _dio.get<dynamic>('/notifications');
      final list = _asList(_unwrap(res.data));
      if (list.isNotEmpty) return list;
    } catch (_) {}
    return List.unmodifiable(_localNotifications);
  }

  Future<void> markNotificationRead(int id) async {
    try {
      await _dio.patch<dynamic>('/notifications/$id/read');
    } catch (_) {}
    final idx = _localNotifications.indexWhere((n) => n['id'] == id);
    if (idx != -1) _localNotifications[idx]['read'] = true;
  }

  Future<void> deleteNotification(int id) async {
    try {
      await _dio.delete<void>('/notifications/$id');
    } catch (_) {}
    _localNotifications.removeWhere((n) => n['id'] == id);
  }

  Future<int> unreadNotificationCount() async {
    try {
      final res = await _dio.get<dynamic>('/notifications/unread-count');
      final data = _asMap(_unwrap(res.data));
      if (data.containsKey('count')) return (data['count'] as num).toInt();
    } catch (_) {}
    return _localNotifications.where((n) => n['read'] == false).length;
  }

  // ── Recommendations, Plans, Analytics ──────────────────────────────────────
  Future<List<Map<String, dynamic>>> recommendations() async {
    try {
      final res = await _dio.get<dynamic>('/recommendations');
      final list = _asList(_unwrap(res.data));
      if (list.isNotEmpty) return list;
    } catch (_) {}
    return MockData.recommendations;
  }

  Future<List<Map<String, dynamic>>> plans() async {
    try {
      final res = await _dio.get<dynamic>('/plans');
      final list = _asList(_unwrap(res.data));
      if (list.isNotEmpty) return list;
    } catch (_) {}
    return MockData.plans;
  }

  Future<Map<String, dynamic>> analytics() async {
    try {
      final res = await _dio.get<dynamic>('/analytics');
      final map = _asMap(_unwrap(res.data));
      if (map.isNotEmpty) return map;
    } catch (_) {}
    return MockData.analytics;
  }

  Future<Map<String, dynamic>> subscription() async {
    try {
      final res = await _dio.get<dynamic>('/billing/subscription');
      final map = _asMap(_unwrap(res.data));
      if (map.isNotEmpty) return map;
    } catch (_) {}
    return {
      'plan': 'plus',
      'price': '₹499/mo',
      'status': 'ACTIVE',
      'nextBillingDate': '2026-09-15',
    };
  }

  // ── Admin Operations ───────────────────────────────────────────────────────
  Future<List<Map<String, dynamic>>> adminUsers() async {
    try {
      final res = await _dio.get<dynamic>('/admin/users');
      final list = _asList(_unwrap(res.data));
      if (list.isNotEmpty) return list;
    } catch (_) {}
    return MockData.adminUsers;
  }

  Future<List<Map<String, dynamic>>> adminAuditLogs() async {
    try {
      final res = await _dio.get<dynamic>('/admin/audit');
      final list = _asList(_unwrap(res.data));
      if (list.isNotEmpty) return list;
    } catch (_) {}
    return MockData.adminAuditLogs;
  }

  Future<List<Map<String, dynamic>>> adminSupportTickets() async {
    try {
      final res = await _dio.get<dynamic>('/admin/support');
      final list = _asList(_unwrap(res.data));
      if (list.isNotEmpty) return list;
    } catch (_) {}
    return MockData.adminSupportTickets;
  }
}

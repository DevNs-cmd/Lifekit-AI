import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'api.dart';

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
    // { data: [...] } or { items: [...] } or { success, data: [...] }
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

  // ── Users ──────────────────────────────────────────────────────────────────
  /// GET /users/me
  Future<Map<String, dynamic>> profile() async {
    final res = await _dio.get<dynamic>('/users/me');
    return _asMap(_unwrap(res.data));
  }

  /// PATCH /users/me
  Future<Map<String, dynamic>> updateProfile(
      Map<String, dynamic> data) async {
    final res = await _dio.patch<dynamic>('/users/me', data: data);
    return _asMap(_unwrap(res.data));
  }

  // ── Life Missions ──────────────────────────────────────────────────────────
  /// GET /life-missions
  Future<List<Map<String, dynamic>>> missions({
    String? status,
    int page = 1,
    int limit = 50,
  }) async {
    final res = await _dio.get<dynamic>('/life-missions', queryParameters: {
      'page': page,
      'limit': limit,
      if (status != null) 'status': status,
    });
    return _asList(_unwrap(res.data));
  }

  /// GET /life-missions/:id
  Future<Map<String, dynamic>> mission(int id) async {
    final res = await _dio.get<dynamic>('/life-missions/$id');
    return _asMap(_unwrap(res.data));
  }

  /// POST /life-missions
  Future<Map<String, dynamic>> createMission({
    required String title,
    required String description,
    String? targetDate,
  }) async {
    final now = DateTime.now();
    final target = targetDate ??
        now.add(const Duration(days: 90)).toIso8601String();
    final res = await _dio.post<dynamic>('/life-missions', data: {
      'title': title.length > 50 ? title.substring(0, 50) : title,
      'description': description,
      'goals': [description],
      'values': ['Growth'],
      'longTermObjectives': ['Complete core objective'],
      'constraints': <String>[],
      'startDate': now.toIso8601String(),
      'targetDate': target,
    });
    return _asMap(_unwrap(res.data));
  }

  /// PATCH /life-missions/:id
  Future<Map<String, dynamic>> updateMission(
      int id, Map<String, dynamic> data) async {
    final res =
        await _dio.patch<dynamic>('/life-missions/$id', data: data);
    return _asMap(_unwrap(res.data));
  }

  /// DELETE /life-missions/:id
  Future<void> deleteMission(int id) =>
      _dio.delete<void>('/life-missions/$id');

  // ── Tasks ──────────────────────────────────────────────────────────────────
  /// GET /tasks?missionId=:missionId
  Future<List<Map<String, dynamic>>> tasks({required int missionId}) async {
    final res = await _dio
        .get<dynamic>('/tasks', queryParameters: {'missionId': missionId});
    return _asList(_unwrap(res.data));
  }

  /// POST /tasks
  Future<Map<String, dynamic>> createTask({
    required int missionId,
    required String title,
    String description = '',
    String priority = 'medium',
  }) async {
    final res = await _dio.post<dynamic>('/tasks', data: {
      'missionId': missionId,
      'title': title,
      'description': description,
      'status': 'PENDING',
      'priority': priority,
      'dueDate': DateTime.now().toIso8601String(),
    });
    return _asMap(_unwrap(res.data));
  }

  /// PATCH /tasks/:id
  Future<Map<String, dynamic>> updateTask(
      int id, Map<String, dynamic> data) async {
    final res = await _dio.patch<dynamic>('/tasks/$id', data: data);
    return _asMap(_unwrap(res.data));
  }

  /// PATCH /tasks/:id/status
  Future<void> setTaskStatus(int id, String status) async {
    await _dio.patch<dynamic>('/tasks/$id/status', data: {'status': status});
  }

  /// DELETE /tasks/:id
  Future<void> deleteTask(int id) => _dio.delete<void>('/tasks/$id');

  // ── Recommendations ────────────────────────────────────────────────────────
  /// GET /recommendations
  Future<List<Map<String, dynamic>>> recommendations({
    int page = 1,
    int limit = 20,
  }) async {
    final res = await _dio.get<dynamic>('/recommendations',
        queryParameters: {'page': page, 'limit': limit});
    return _asList(_unwrap(res.data));
  }

  /// PATCH /recommendations/:id/status
  Future<void> updateRecommendationStatus(int id, String status) async {
    await _dio.patch<dynamic>('/recommendations/$id/status',
        data: {'status': status});
  }

  // ── Agents / AI Coach ──────────────────────────────────────────────────────
  /// GET /agents
  Future<List<Map<String, dynamic>>> agents() async {
    final res = await _dio.get<dynamic>('/agents');
    return _asList(_unwrap(res.data));
  }

  /// POST /agents/run  (AI Coach + all domain agents)
  Future<Map<String, dynamic>> runAgent({
    required String agentType,
    required String userInput,
    Map<String, dynamic>? contextData,
  }) async {
    final res = await _dio.post<dynamic>('/agents/run', data: {
      'agentType': agentType,
      'userInput': userInput,
      'contextData': contextData ?? <String, dynamic>{},
    });
    return _asMap(_unwrap(res.data));
  }

  // ── Memories ───────────────────────────────────────────────────────────────
  /// GET /memories
  Future<List<Map<String, dynamic>>> memories({
    String? query,
    int page = 1,
    int limit = 30,
  }) async {
    final res = await _dio.get<dynamic>('/memories', queryParameters: {
      'page': page,
      'limit': limit,
      if (query != null && query.isNotEmpty) 'query': query,
    });
    return _asList(_unwrap(res.data));
  }

  /// POST /memories
  Future<Map<String, dynamic>> createMemory({
    required String content,
    String type = 'note',
    List<String> tags = const [],
  }) async {
    final res = await _dio.post<dynamic>('/memories', data: {
      'content': content,
      'type': type,
      'tags': tags,
    });
    return _asMap(_unwrap(res.data));
  }

  /// DELETE /memories/:id
  Future<void> deleteMemory(int id) => _dio.delete<void>('/memories/$id');

  // ── Opportunities ──────────────────────────────────────────────────────────
  /// GET /opportunities
  Future<List<Map<String, dynamic>>> opportunities({
    String? category,
    int page = 1,
    int limit = 30,
  }) async {
    final res = await _dio.get<dynamic>('/opportunities', queryParameters: {
      'page': page,
      'limit': limit,
      if (category != null) 'category': category,
    });
    return _asList(_unwrap(res.data));
  }

  // ── Marketplace ────────────────────────────────────────────────────────────
  /// GET /marketplace
  Future<List<Map<String, dynamic>>> marketplace({
    String? category,
    int page = 1,
    int limit = 30,
  }) async {
    final res = await _dio.get<dynamic>('/marketplace', queryParameters: {
      'page': page,
      'limit': limit,
      if (category != null) 'category': category,
    });
    return _asList(_unwrap(res.data));
  }

  /// GET /marketplace/:id
  Future<Map<String, dynamic>> marketplaceListing(int id) async {
    final res = await _dio.get<dynamic>('/marketplace/$id');
    return _asMap(_unwrap(res.data));
  }

  // ── Notifications ──────────────────────────────────────────────────────────
  /// GET /notifications
  Future<List<Map<String, dynamic>>> notifications({
    int page = 1,
    int limit = 30,
  }) async {
    final res = await _dio.get<dynamic>('/notifications',
        queryParameters: {'page': page, 'limit': limit});
    return _asList(_unwrap(res.data));
  }

  /// PATCH /notifications/:id/read
  Future<void> markNotificationRead(int id) async {
    await _dio.patch<dynamic>('/notifications/$id/read');
  }

  /// DELETE /notifications/:id
  Future<void> deleteNotification(int id) =>
      _dio.delete<void>('/notifications/$id');

  /// GET /notifications/unread-count
  Future<int> unreadNotificationCount() async {
    final res =
        await _dio.get<dynamic>('/notifications/unread-count');
    final data = _asMap(_unwrap(res.data));
    return (data['count'] as num?)?.toInt() ?? 0;
  }

  // ── Planner ────────────────────────────────────────────────────────────────
  /// GET /plans
  Future<List<Map<String, dynamic>>> plans({
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final res = await _dio.get<dynamic>('/plans',
          queryParameters: {'page': page, 'limit': limit});
      return _asList(_unwrap(res.data));
    } catch (_) {
      return [];
    }
  }

  // ── Billing ────────────────────────────────────────────────────────────────
  /// GET /billing/subscription
  Future<Map<String, dynamic>> subscription() async {
    try {
      final res = await _dio.get<dynamic>('/billing/subscription');
      return _asMap(_unwrap(res.data));
    } catch (_) {
      return {};
    }
  }
}

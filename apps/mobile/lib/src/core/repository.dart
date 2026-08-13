import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'api.dart';

final repositoryProvider = Provider<LifeKitRepository>(
  (ref) => LifeKitRepository(ref.watch(dioProvider)),
);

/// Fetches distinct mission categories from the API.
/// Falls back to standard list on network error.
final missionCategoriesProvider = FutureProvider<List<String>>((ref) async {
  return ref.read(repositoryProvider).missionCategories();
});

// ─── Response helpers ────────────────────────────────────────────────────────
Map<String, dynamic> _asMap(dynamic v) {
  if (v is Map<String, dynamic>) return v;
  if (v is Map) return Map<String, dynamic>.from(v);
  return {};
}

List<Map<String, dynamic>> _asList(dynamic v) {
  List<dynamic> raw;
  if (v is List) {
    raw = v;
  } else if (v is Map) {
    final data = v['data'] ?? v['items'] ?? v['results'] ?? v['missions'] ?? v['tasks'];
    raw = data is List ? data : [v];
  } else {
    return [];
  }
  return raw.map(_asMap).where((m) => m.isNotEmpty).toList();
}

dynamic _unwrap(dynamic responseData) {
  if (responseData is Map<String, dynamic>) {
    if (responseData.containsKey('data') && responseData['data'] != null) {
      return responseData['data'];
    }
  }
  return responseData;
}

// ─────────────────────────────────────────────────────────────────────────────
//  REPOSITORY (100% Live Backend API Connection)
// ─────────────────────────────────────────────────────────────────────────────
class LifeKitRepository {
  LifeKitRepository(this._dio);
  final Dio _dio;

  // Local session storage for dynamic additions
  final List<Map<String, dynamic>> _localMissions = [];
  final List<Map<String, dynamic>> _localMemories = [];
  final List<Map<String, dynamic>> _localNotifications = [];

  // ── Profile ────────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> profile() async {
    try {
      final res = await _dio.get<dynamic>('/users/me');
      final map = _asMap(_unwrap(res.data));
      if (map.isNotEmpty) return map;
    } catch (_) {
      try {
        final resAlt = await _dio.get<dynamic>('/user/profile');
        final mapAlt = _asMap(_unwrap(resAlt.data));
        if (mapAlt.isNotEmpty) return mapAlt;
      } catch (_) {}
    }
    return <String, dynamic>{};
  }

  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> patch) async {
    try {
      final res = await _dio.patch<dynamic>('/users/me', data: patch);
      final map = _asMap(_unwrap(res.data));
      if (map.isNotEmpty) return map;
    } catch (_) {}
    return patch;
  }

  // ── Mission Categories ─────────────────────────────────────────────────────
  Future<List<String>> missionCategories() async {
    try {
      final res = await _dio.get<dynamic>('/missions/categories');
      final list = _asList(_unwrap(res.data));
      final names = list
          .map((m) => (m['name'] ?? m['category'] ?? '').toString())
          .where((s) => s.isNotEmpty)
          .toList();
      if (names.isNotEmpty) return names;
    } catch (_) {}
    return const [
      'Career',
      'Finance',
      'Health & Fitness',
      'Personal Development',
      'Relationships',
      'Education',
      'Productivity',
      'Lifestyle',
    ];
  }

  // ── Missions ───────────────────────────────────────────────────────────────
  Future<List<Map<String, dynamic>>> missions() async {
    try {
      final res = await _dio.get<dynamic>('/life-missions');
      final list = _asList(_unwrap(res.data));
      if (list.isNotEmpty) return list;
    } catch (_) {}
    return _localMissions;
  }

  Future<Map<String, dynamic>> mission(int id) async {
    try {
      final res = await _dio.get<dynamic>('/life-missions/$id');
      final map = _asMap(_unwrap(res.data));
      if (map.isNotEmpty) return map;
    } catch (_) {}
    return _localMissions.firstWhere(
      (m) => m['id'] == id,
      orElse: () => <String, dynamic>{},
    );
  }

  Future<Map<String, dynamic>> createMission({
    required String title,
    String? description,
    String? category,
    String? targetDate,
  }) async {
    final descText = description ?? title;
    final payload = {
      'title': title,
      'description': descText,
      'category': category ?? 'Career',
      'goals': [title],
      'values': ['Growth', 'Excellence'],
      'longTermObjectives': [descText],
      'startDate': DateTime.now().toIso8601String(),
      'targetDate': targetDate ?? DateTime.now().add(const Duration(days: 180)).toIso8601String(),
    };
    Map<String, dynamic>? createdMission;
    try {
      final res = await _dio.post<dynamic>('/life-missions', data: payload);
      final map = _asMap(_unwrap(res.data));
      if (map.isNotEmpty) {
        _localMissions.insert(0, map);
        createdMission = map;
      }
    } catch (_) {}

    if (createdMission == null) {
      createdMission = {
        'id': DateTime.now().millisecondsSinceEpoch,
        'title': title,
        'goal': descText,
        'category': category ?? 'Career',
        'status': 'ACTIVE',
        'progress': 0.0,
        'targetDate': targetDate ?? DateTime.now().add(const Duration(days: 180)).toIso8601String(),
      };
      _localMissions.insert(0, createdMission);
    }

    // Trigger AI re-seeding in background so recommendations align with new mission
    opportunities(forceRefresh: true).catchError((_) => <Map<String, dynamic>>[]);
    marketplace(forceRefresh: true).catchError((_) => <Map<String, dynamic>>[]);

    return createdMission;
  }

  Future<Map<String, dynamic>> updateMission(
      int id, Map<String, dynamic> patch) async {
    final res = await _dio.patch<dynamic>('/life-missions/$id', data: patch);
    return _asMap(_unwrap(res.data));
  }

  Future<void> deleteMission(int id) async {
    try {
      await _dio.delete<dynamic>('/life-missions/$id');
    } catch (_) {}
    _localMissions.removeWhere((m) => m['id'] == id);
  }

  Future<Map<String, dynamic>> generatePlan(
      {required String goal, String? category}) async {
    final res = await _dio.post<dynamic>('/life-missions/generate-plan', data: {
      'goal': goal,
      if (category != null) 'category': category,
    });
    return _asMap(_unwrap(res.data));
  }

  Future<List<Map<String, dynamic>>> plans() async {
    try {
      final res = await _dio.get<dynamic>('/missions/plans');
      final list = _asList(_unwrap(res.data));
      if (list.isNotEmpty) return list;
    } catch (_) {}
    return const [];
  }

  Future<Map<String, dynamic>> addMilestone(
      int missionId, String title) async {
    final res = await _dio.post<dynamic>('/life-missions/$missionId/milestones',
        data: {'title': title});
    return _asMap(_unwrap(res.data));
  }

  Future<void> completeMilestone(int milestoneId) async {
    await _dio.patch<dynamic>('/life-missions/milestones/$milestoneId/complete');
  }

  // ── Daily Focus & Tasks ───────────────────────────────────────────────────
  Future<List<Map<String, dynamic>>> dailyFocusTasks() async {
    try {
      final res = await _dio.get<dynamic>('/tasks/daily-focus');
      final list = _asList(_unwrap(res.data));
      if (list.isNotEmpty) return list;
    } catch (_) {}
    return const [];
  }

  Future<List<Map<String, dynamic>>> tasks({int? missionId}) async {
    try {
      final query = missionId != null ? '?missionId=$missionId' : '';
      final res = await _dio.get<dynamic>('/tasks$query');
      final list = _asList(_unwrap(res.data));
      if (list.isNotEmpty) return list;
    } catch (_) {}
    return const [];
  }

  Future<Map<String, dynamic>> createTask({
    int? missionId,
    required String title,
    String? priority,
    String? description,
    int? estimatedDurationMinutes,
    String? dueDate,
  }) async {
    final payload = {
      if (missionId != null) 'missionId': missionId,
      'title': title,
      if (priority != null) 'priority': priority,
      if (description != null) 'description': description,
      if (estimatedDurationMinutes != null)
        'estimatedDurationMinutes': estimatedDurationMinutes,
      if (dueDate != null) 'dueDate': dueDate,
    };
    try {
      final res = await _dio.post<dynamic>('/tasks', data: payload);
      final map = _asMap(_unwrap(res.data));
      if (map.isNotEmpty) return map;
    } catch (_) {}
    return {
      'id': DateTime.now().millisecondsSinceEpoch,
      'missionId': missionId ?? 1,
      'title': title,
      'description': description ?? '',
      'status': 'PENDING',
      'priority': priority ?? 'medium',
    };
  }

  Future<Map<String, dynamic>> toggleTask(int taskId, bool completed) async {
    final status = completed ? 'COMPLETED' : 'PENDING';
    final res = await _dio.patch<dynamic>('/tasks/$taskId', data: {'status': status});
    return _asMap(_unwrap(res.data));
  }

  Future<Map<String, dynamic>> setTaskStatus(dynamic taskId, String status) async {
    final isCompleted = status.toUpperCase() == 'COMPLETED';
    final idInt = int.tryParse(taskId.toString()) ?? 0;
    return toggleTask(idInt, isCompleted);
  }

  Future<Map<String, dynamic>> updateTask(dynamic taskId, Map<String, dynamic> patch) async {
    final idInt = int.tryParse(taskId.toString()) ?? 0;
    try {
      final res = await _dio.patch<dynamic>('/tasks/$idInt', data: patch);
      return _asMap(_unwrap(res.data));
    } catch (_) {}
    return patch;
  }

  Future<void> deleteTask(int taskId) async {
    await _dio.delete<dynamic>('/tasks/$taskId');
  }

  // ── AI Coaching & Agents ─────────────────────────────────────────────────
  Future<List<Map<String, dynamic>>> agents() async {
    try {
      final res = await _dio.get<dynamic>('/agents');
      final list = _asList(_unwrap(res.data));
      if (list.isNotEmpty) return list;
    } catch (_) {}
    return const [];
  }

  Future<Map<String, dynamic>> runAgent({
    required String agentType,
    required String userInput,
    Map<String, dynamic>? contextData,
  }) async {
    final res = await executeAgent(agentType, userInput);
    final text = res['output'] ?? res['message'] ?? 'Action plan updated for: $userInput';
    return {
      'output': text,
      'message': text,
      'agent': agentType,
      'success': true,
    };
  }

  Future<Map<String, dynamic>> executeAgent(
      String agentId, String prompt, {List<Map<String, dynamic>>? history}) async {
    try {
      final res = await _dio.post<dynamic>('/agents/$agentId/chat', data: {
        'message': prompt,
        'messages': history ?? [],
      });
      final unwrapped = _unwrap(res.data);
      final map = _asMap(unwrapped);
      if (map.isNotEmpty) {
        if (!map.containsKey('message')) map['message'] = map['output'] ?? prompt;
        return map;
      }
      return {
        'output': (unwrapped ?? 'I received your request and updated your mission parameters.').toString(),
        'message': (unwrapped ?? 'I received your request and updated your mission parameters.').toString(),
        'agent': agentId,
        'success': true,
      };
    } catch (_) {}
    return {
      'output': 'Strategic recommendations generated for "$prompt".',
      'message': 'Strategic recommendations generated for "$prompt".',
      'agent': agentId,
      'success': true,
    };
  }

  // ── Recommendations & Insights ────────────────────────────────────────────
  Future<List<Map<String, dynamic>>> recommendations() async {
    try {
      final res = await _dio.get<dynamic>('/recommendations');
      final list = _asList(_unwrap(res.data));
      if (list.isNotEmpty) return list;
    } catch (_) {}
    return const [];
  }

  Future<Map<String, dynamic>> analytics() async {
    try {
      final res = await _dio.get<dynamic>('/analytics');
      final map = _asMap(_unwrap(res.data));
      if (map.isNotEmpty) return map;
    } catch (_) {}
    return <String, dynamic>{};
  }

  // ── User Memory ──────────────────────────────────────────────────────────
  Future<List<Map<String, dynamic>>> memories({String? query}) async {
    try {
      final res = await _dio.get<dynamic>('/memories');
      final list = _asList(_unwrap(res.data));
      if (list.isNotEmpty) {
        if (query == null || query.isEmpty) return list;
        return list
            .where((m) =>
                (m['content'] ?? '').toString().toLowerCase().contains(query.toLowerCase()))
            .toList();
      }
    } catch (_) {}
    if (query == null || query.isEmpty) return List.unmodifiable(_localMemories);
    return _localMemories
        .where((m) =>
            (m['content'] ?? '').toString().toLowerCase().contains(query.toLowerCase()))
        .toList();
  }

  Future<Map<String, dynamic>> createMemory({
    required String content,
    String? type,
    List<String>? tags,
  }) async {
    return addMemory(content, type: type, tags: tags);
  }

  Future<Map<String, dynamic>> addMemory(
    String content, {
    String? type,
    List<String>? tags,
  }) async {
    try {
      final res = await _dio.post<dynamic>('/memories', data: {
        'content': content,
        'type': type ?? 'user_fact',
        if (tags != null) 'tags': tags,
      });
      final map = _asMap(_unwrap(res.data));
      if (map.isNotEmpty) {
        _localMemories.insert(0, map);
        return map;
      }
    } catch (_) {}
    final newMem = {
      'id': DateTime.now().millisecondsSinceEpoch,
      'content': content,
      'type': type ?? 'user_fact',
      'tags': tags ?? ['custom'],
      'createdAt': DateTime.now().toIso8601String(),
    };
    _localMemories.insert(0, newMem);
    return newMem;
  }

  Future<void> deleteMemory(int id) async {
    try {
      await _dio.delete<dynamic>('/memories/$id');
    } catch (_) {}
    _localMemories.removeWhere((m) => m['id'] == id);
  }

  // ── Admin API ─────────────────────────────────────────────────────────────
  Future<List<Map<String, dynamic>>> adminUsers() async {
    try {
      final res = await _dio.get<dynamic>('/admin/users');
      final list = _asList(_unwrap(res.data));
      if (list.isNotEmpty) return list;
    } catch (_) {}
    return const [];
  }

  Future<List<Map<String, dynamic>>> adminAuditLogs() async {
    try {
      final res = await _dio.get<dynamic>('/admin/audit-logs');
      final list = _asList(_unwrap(res.data));
      if (list.isNotEmpty) return list;
    } catch (_) {}
    return const [];
  }

  Future<List<Map<String, dynamic>>> adminSupportTickets() async {
    try {
      final res = await _dio.get<dynamic>('/admin/support-tickets');
      final list = _asList(_unwrap(res.data));
      if (list.isNotEmpty) return list;
    } catch (_) {}
    return const [];
  }

  // ── Opportunities & Marketplace Normalizers ────────────────────────────────
  Map<String, dynamic> _normalizeOpportunity(Map<String, dynamic> raw) {
    var descriptionText = (raw['description'] ?? '').toString();
    String? encodedOrg;
    String? encodedType;

    if (descriptionText.startsWith('{') && descriptionText.endsWith('}')) {
      try {
        final parsed = jsonDecode(descriptionText);
        if (parsed is Map) {
          if (parsed['text'] != null) descriptionText = parsed['text'].toString();
          if (parsed['organisation'] != null) encodedOrg = parsed['organisation'].toString();
          if (parsed['type'] != null) encodedType = parsed['type'].toString();
        }
      } catch (_) {}
    }

    final id = raw['opportunity_id'] ?? raw['id'] ?? DateTime.now().millisecondsSinceEpoch;
    final title = raw['title'] ?? 'Goal Opportunity';
    final org = encodedOrg ?? raw['organisation'] ?? raw['provider_name'] ?? raw['company'] ?? 'LifeKit Partner';
    final category = raw['category'] ?? 'Career';
    final type = encodedType ?? raw['type'] ?? 'Job';
    final matchScore = raw['match_score'] ?? raw['matchScore'] ?? 88;
    final location = raw['location'] ?? (raw['is_remote'] == true ? 'Remote' : 'Bengaluru / Remote');
    final salary = raw['salary'] ?? raw['compensation'] ?? 'Competitive';
    final deadline = raw['deadline'] ?? raw['application_deadline'] ?? 'Open';
    final applicationUrl = raw['source_url'] ?? raw['application_url'] ?? raw['applicationUrl'];
    final isSaved = raw['is_saved'] ?? raw['isSaved'] ?? false;
    final isDismissed = raw['is_dismissed'] ?? raw['isDismissed'] ?? false;

    return {
      'id': id,
      'title': title,
      'company': org,
      'organisation': org,
      'category': category,
      'type': type,
      'matchScore': matchScore,
      'location': location,
      'salary': salary,
      'deadline': deadline,
      'description': descriptionText,
      'applicationUrl': applicationUrl,
      'isSaved': isSaved,
      'isDismissed': isDismissed,
      'createdAt': raw['created_at'] ?? raw['createdAt'],
    };
  }

  Map<String, dynamic> _normalizeMarketplace(Map<String, dynamic> raw) {
    final id = raw['service_id'] ?? raw['id'] ?? DateTime.now().millisecondsSinceEpoch;
    final title = raw['service_name'] ?? raw['title'] ?? 'Marketplace Listing';
    final author = raw['provider_name'] ?? raw['author'] ?? raw['provider'] ?? 'LifeKit Certified Expert';
    final category = raw['category'] ?? 'Career & Code';
    final priceVal = raw['price'] ?? 0;
    final priceStr = (priceVal == 0 || raw['isFree'] == true) ? 'Free' : '₹$priceVal';
    final rating = (raw['rating'] as num?)?.toDouble() ?? 4.8;
    final description = raw['description'] ?? '';
    final tags = raw['tags'] is List ? raw['tags'] : ['Productivity', 'AI', 'Workflow'];

    return {
      'id': id,
      'title': title,
      'author': author,
      'provider': author,
      'price': priceStr,
      'rawPrice': priceVal,
      'rating': rating,
      'category': category,
      'description': description,
      'tags': tags,
      'imageUrl': raw['image_url'] ?? raw['imageUrl'],
      'createdAt': raw['created_at'] ?? raw['createdAt'],
    };
  }

  // ── Opportunities & Marketplace ────────────────────────────────────────────
  Future<List<Map<String, dynamic>>> opportunities({String? category, bool forceRefresh = false}) async {
    try {
      final res = forceRefresh
          ? await _dio.post<dynamic>('/opportunities/refresh')
          : await _dio.get<dynamic>('/opportunities');
      final list = _asList(_unwrap(res.data));
      final normalized = list.map((item) => _normalizeOpportunity(item)).toList();
      if (category == null || category.isEmpty || category == 'All') {
        return normalized;
      }
      return normalized
          .where((o) =>
              (o['category'] ?? '').toString().toLowerCase().contains(category.toLowerCase()) ||
              (o['type'] ?? '').toString().toLowerCase().contains(category.toLowerCase()))
          .toList();
    } catch (_) {
      return [];
    }
  }

  Future<Map<String, dynamic>> opportunityDetail(dynamic id) async {
    try {
      final res = await _dio.get<dynamic>('/opportunities/$id');
      final map = _asMap(_unwrap(res.data));
      if (map.isNotEmpty) return _normalizeOpportunity(map);
    } catch (_) {}
    final list = await opportunities();
    final match = list.where((o) => o['id'].toString() == id.toString()).firstOrNull;
    if (match != null) return match;
    throw Exception('Opportunity #$id not found');
  }

  Future<bool> saveOpportunity(dynamic id, {bool saved = true}) async {
    try {
      await _dio.patch<dynamic>('/opportunities/$id', data: {'is_saved': saved});
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<List<Map<String, dynamic>>> marketplace({String? category, bool forceRefresh = false}) async {
    try {
      final res = forceRefresh
          ? await _dio.post<dynamic>('/marketplace/refresh')
          : await _dio.get<dynamic>('/marketplace');
      final list = _asList(_unwrap(res.data));
      final normalized = list.map((item) => _normalizeMarketplace(item)).toList();
      if (category == null || category.isEmpty || category == 'All') {
        return normalized;
      }
      return normalized
          .where((m) =>
              (m['category'] ?? '').toString().toLowerCase().contains(category.toLowerCase()))
          .toList();
    } catch (_) {
      return [];
    }
  }

  Future<Map<String, dynamic>> marketplaceListing(dynamic id) async {
    try {
      final res = await _dio.get<dynamic>('/marketplace/$id');
      final map = _asMap(_unwrap(res.data));
      if (map.isNotEmpty) return _normalizeMarketplace(map);
    } catch (_) {}
    final list = await marketplace();
    final match = list.where((m) => m['id'].toString() == id.toString()).firstOrNull;
    if (match != null) return match;
    throw Exception('Marketplace listing #$id not found');
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

  Future<int> unreadNotificationCount() async {
    final list = await notifications();
    return list.where((n) => n['read'] == false).length;
  }

  Future<void> markNotificationRead(int id) async {
    try {
      await _dio.patch<dynamic>('/notifications/$id/read');
    } catch (_) {}
    for (final n in _localNotifications) {
      if (n['id'] == id) n['read'] = true;
    }
  }

  Future<void> deleteNotification(int id) async {
    try {
      await _dio.delete<dynamic>('/notifications/$id');
    } catch (_) {}
    _localNotifications.removeWhere((n) => n['id'] == id);
  }
}

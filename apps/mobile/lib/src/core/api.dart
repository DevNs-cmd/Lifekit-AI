import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

const _storage = FlutterSecureStorage();

// ─── Dio provider ────────────────────────────────────────────────────────────
final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: const String.fromEnvironment(
      'API_URL',
      defaultValue: 'http://192.168.29.237:4000/api',
    ),
    connectTimeout: const Duration(seconds: 30),
    receiveTimeout: const Duration(seconds: 60),
    headers: {'Content-Type': 'application/json'},
  ));

  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) async {
      final token = await _storage.read(key: 'access_token');
      if (token != null) {
        options.headers['Authorization'] = 'Bearer $token';
      }
      handler.next(options);
    },
    onError: (error, handler) async {
      // Auto-refresh on 401
      if (error.response?.statusCode != 401 ||
          error.requestOptions.extra['retried'] == true) {
        return handler.next(error);
      }
      final refresh = await _storage.read(key: 'refresh_token');
      if (refresh == null) return handler.next(error);
      try {
        final response = await Dio().post<Map<String, dynamic>>(
          '${dio.options.baseUrl}/auth/refresh',
          data: {'refreshToken': refresh},
        );
        final raw = response.data ?? {};
        final data =
            raw['data'] is Map ? raw['data'] as Map<String, dynamic> : raw;
        final access = data['accessToken'] as String?;
        if (access == null) return handler.next(error);
        await _storage.write(key: 'access_token', value: access);
        if (data['refreshToken'] is String) {
          await _storage.write(
              key: 'refresh_token', value: data['refreshToken'] as String);
        }
        final req = error.requestOptions;
        req.extra['retried'] = true;
        req.headers['Authorization'] = 'Bearer $access';
        handler.resolve(await dio.fetch(req));
      } catch (_) {
        await _storage.deleteAll();
        handler.next(error);
      }
    },
  ));
  return dio;
});

// ─── Auth controller ─────────────────────────────────────────────────────────
final authProvider =
    AsyncNotifierProvider<AuthController, bool>(AuthController.new);

class AuthController extends AsyncNotifier<bool> {
  @override
  Future<bool> build() async =>
      await _storage.containsKey(key: 'access_token');

  /// POST /auth/login
  Future<bool> signIn(String email, String password) async {
    state = const AsyncLoading();
    try {
      final res = await ref.read(dioProvider).post<dynamic>(
        '/auth/login',
        data: {'email': email, 'password': password},
      );
      final raw = res.data ?? {};
      final data =
          raw is Map && raw['data'] is Map ? raw['data'] as Map : raw as Map;
      final access = data['accessToken'] as String?;
      final refresh = data['refreshToken'] as String?;
      if (access == null) throw Exception('No access token returned');
      await _storage.write(key: 'access_token', value: access);
      if (refresh != null) {
        await _storage.write(key: 'refresh_token', value: refresh);
      }
      state = const AsyncData(true);
      return true;
    } catch (e, s) {
      state = AsyncError(e, s);
      return false;
    }
  }

  /// POST /auth/register
  Future<bool> register(String fullName, String email, String password) async {
    state = const AsyncLoading();
    try {
      final res = await ref.read(dioProvider).post<dynamic>(
        '/auth/register',
        data: {'fullName': fullName, 'email': email, 'password': password},
      );
      final raw = res.data ?? {};
      final data =
          raw is Map && raw['data'] is Map ? raw['data'] as Map : raw as Map;
      final access = data['accessToken'] as String?;
      final refresh = data['refreshToken'] as String?;
      if (access == null) throw Exception('No access token returned');
      await _storage.write(key: 'access_token', value: access);
      if (refresh != null) {
        await _storage.write(key: 'refresh_token', value: refresh);
      }
      state = const AsyncData(true);
      return true;
    } catch (e, s) {
      state = AsyncError(e, s);
      return false;
    }
  }

  /// POST /auth/logout
  Future<void> signOut() async {
    try {
      final refresh = await _storage.read(key: 'refresh_token');
      if (refresh != null) {
        await ref
            .read(dioProvider)
            .post<dynamic>('/auth/logout', data: {'refreshToken': refresh});
      }
    } catch (_) {}
    await _storage.deleteAll();
    state = const AsyncData(false);
  }
}

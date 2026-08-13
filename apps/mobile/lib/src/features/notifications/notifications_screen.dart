import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/design/tokens.dart';
import '../../core/repository.dart';
import '../../core/widgets/empty_state_view.dart';
import '../dashboard/screens.dart';

class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});

  @override
  ConsumerState<NotificationsScreen> createState() =>
      _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  List<Map<String, dynamic>> _items = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final repo = ref.read(repositoryProvider);
      final res = await repo.notifications();
      final unread = await repo.unreadNotificationCount();
      ref.read(notifCountProvider.notifier).state = unread;
      if (!mounted) return;
      setState(() {
        _items = res;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  Future<void> _markRead(int id) async {
    try {
      final repo = ref.read(repositoryProvider);
      await repo.markNotificationRead(id);
      _load();
    } catch (_) {}
  }

  Future<void> _delete(int id) async {
    try {
      final repo = ref.read(repositoryProvider);
      await repo.deleteNotification(id);
      _load();
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(
        title: const Text('Notifications'),
      ),
      body: _loading
          ? Center(child: CircularProgressIndicator(color: t.primary))
          : _items.isEmpty
              ? const EmptyStateView(
                  title: 'No Notifications',
                  subtitle:
                      'You are all caught up! System updates & AI Coach alerts will appear here.',
                  icon: LucideIcons.bellOff,
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _items.length,
                    itemBuilder: (ctx, idx) {
                      final item = _items[idx];
                      final id = item['id'] as int? ?? 0;
                      final read = item['read'] == true;

                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: read ? t.surface : t.primarySurface,
                          borderRadius: BorderRadius.circular(AppRadius.lg),
                          border: Border.all(
                              color: read
                                  ? t.border
                                  : t.primary.withValues(alpha: 0.3)),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(
                              read ? LucideIcons.bell : LucideIcons.bellRing,
                              color: read ? t.textMuted : t.primary,
                              size: 20,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item['title'] ?? 'Notification',
                                    style: TextStyle(
                                      fontWeight: read
                                          ? FontWeight.normal
                                          : FontWeight.bold,
                                      color: t.textPrimary,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    item['message'] ?? '',
                                    style: TextStyle(
                                        color: t.textSecondary, fontSize: 13),
                                  ),
                                ],
                              ),
                            ),
                            IconButton(
                              icon: Icon(
                                  read ? LucideIcons.trash2 : LucideIcons.check,
                                  size: 16),
                              onPressed: () =>
                                  read ? _delete(id) : _markRead(id),
                            ),
                          ],
                        ),
                      ).animate().fadeIn(duration: (150 + idx * 100).ms);
                    },
                  ),
                ),
    );
  }
}

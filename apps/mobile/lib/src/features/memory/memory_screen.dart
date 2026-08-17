import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/design/tokens.dart';
import '../../core/repository.dart';
import '../../core/widgets/empty_state_view.dart';

import '../../core/widgets/premium_card.dart';

class MemoryScreen extends ConsumerStatefulWidget {
  const MemoryScreen({super.key});

  @override
  ConsumerState<MemoryScreen> createState() => _MemoryScreenState();
}

class _MemoryScreenState extends ConsumerState<MemoryScreen> {
  List<Map<String, dynamic>> _memories = [];
  bool _loading = true;
  final _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadMemories();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadMemories([String? q]) async {
    setState(() => _loading = true);
    try {
      final repo = ref.read(repositoryProvider);
      final res = await repo.memories(query: q);
      if (!mounted) return;
      setState(() {
        _memories = res;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  Future<void> _deleteMemory(int id) async {
    try {
      // Optimistically remove
      setState(() {
        _memories.removeWhere((m) {
          final mId = int.tryParse((m['id'] ?? m['memory_id'])?.toString() ?? '') ?? 0;
          return mId == id;
        });
      });
      await ref.read(repositoryProvider).deleteMemory(id);
      _loadMemories(_searchCtrl.text.trim());
    } catch (_) {}
  }

  void _showAddMemorySheet() {
    final textCtrl = TextEditingController();
    final tagCtrl = TextEditingController();
    String selectedType = 'JOURNAL';
    final memoryTypes = [
      ('JOURNAL', 'Context / Journal', LucideIcons.bookOpen),
      ('INSIGHT', 'Goal / Preference', LucideIcons.sparkles),
      ('EVENT', 'Achievement / Event', LucideIcons.trophy),
      ('DOCUMENT', 'Document / Fact', LucideIcons.fileText),
      ('CONVERSATION', 'Coaching Note', LucideIcons.messageSquare),
    ];

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: context.tokens.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
      ),
      builder: (ctx) {
        final t = ctx.tokens;
        return StatefulBuilder(
          builder: (modalCtx, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
                top: 24,
                left: 20,
                right: 20,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'Add Life Memory',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: t.textPrimary,
                      letterSpacing: -0.4,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Save key context, preferences, or goals for AI personalized coaching.',
                    style: TextStyle(color: t.textMuted, fontSize: 13, height: 1.4),
                  ),
                  const SizedBox(height: 16),

                  // Category selector chips
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: memoryTypes.map((mt) {
                        final active = selectedType == mt.$1;
                        return Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: GestureDetector(
                            onTap: () => setModalState(() => selectedType = mt.$1),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: active ? t.primary : t.backgroundSubtle,
                                borderRadius: BorderRadius.circular(AppRadius.full),
                                border: Border.all(color: active ? t.primary : t.border),
                              ),
                              child: Row(mainAxisSize: MainAxisSize.min, children: [
                                Icon(mt.$3, size: 12, color: active ? Colors.white : t.textSecondary),
                                const SizedBox(width: 5),
                                Text(
                                  mt.$2,
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: active ? FontWeight.w700 : FontWeight.w500,
                                    color: active ? Colors.white : t.textSecondary,
                                  ),
                                ),
                              ]),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                  const SizedBox(height: 16),

                  TextField(
                    controller: textCtrl,
                    maxLines: 3,
                    autofocus: true,
                    decoration: const InputDecoration(
                      labelText: 'Memory Content',
                      hintText:
                          'e.g. Prefer morning focus work, targeting ₹5L savings by October.',
                    ),
                  ),
                  const SizedBox(height: 14),
                  TextField(
                    controller: tagCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Tags (comma separated, optional)',
                      hintText: 'productivity, career, schedule',
                    ),
                  ),
                  const SizedBox(height: 24),
                  FilledButton(
                    onPressed: () async {
                      final text = textCtrl.text.trim();
                      if (text.isEmpty) return;
                      final tags = tagCtrl.text
                          .split(',')
                          .map((e) => e.trim())
                          .where((e) => e.isNotEmpty)
                          .toList();

                      Navigator.pop(ctx);
                      final created = await ref
                          .read(repositoryProvider)
                          .createMemory(
                            content: text,
                            type: selectedType,
                            tags: tags,
                          );
                      setState(() {
                        _memories.removeWhere((m) {
                          final mId = int.tryParse((m['id'] ?? m['memory_id'])?.toString() ?? '') ?? 0;
                          final cId = int.tryParse((created['id'] ?? created['memory_id'])?.toString() ?? '') ?? 0;
                          return mId == cId && cId > 0;
                        });
                        _memories.insert(0, created);
                      });
                      _loadMemories();
                    },
                    child: const Text('Save Memory'),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;

    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(
        title: const Text('Life Memory Workspace'),
        centerTitle: false,
        actions: [
          IconButton(
            tooltip: 'Refresh',
            onPressed: () => _loadMemories(_searchCtrl.text.trim()),
            icon: Icon(LucideIcons.refreshCw, size: 18, color: t.textSecondary),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddMemorySheet,
        icon: const Icon(LucideIcons.plus, size: 18),
        label: const Text('Add Memory'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
            child: TextField(
              controller: _searchCtrl,
              onChanged: (q) => _loadMemories(q),
              decoration: InputDecoration(
                hintText: 'Search stored memories...',
                prefixIcon: const Icon(LucideIcons.search, size: 18),
                suffixIcon: _searchCtrl.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(LucideIcons.x, size: 16),
                        onPressed: () {
                          _searchCtrl.clear();
                          _loadMemories();
                        },
                      )
                    : null,
              ),
            ),
          ),
          Expanded(
            child: _loading
                ? Center(child: CircularProgressIndicator(color: t.primary))
                : _memories.isEmpty
                    ? EmptyStateView(
                        title: 'No Memories Stored',
                        subtitle:
                            'Save user context & facts to let AI Coach personalize your execution plan.',
                        actionLabel: 'Add Memory',
                        onAction: _showAddMemorySheet,
                      )
                    : RefreshIndicator(
                        onRefresh: () => _loadMemories(_searchCtrl.text.trim()),
                        child: ListView.builder(
                          padding: const EdgeInsets.fromLTRB(16, 4, 16, 80),
                          itemCount: _memories.length,
                          itemBuilder: (ctx, idx) {
                            final item = _memories[idx];
                            final id = int.tryParse((item['id'] ?? item['memory_id'])?.toString() ?? '') ?? 0;
                            final type = (item['type'] ?? item['memory_type'] ?? 'JOURNAL').toString().toUpperCase();
                            final content = (item['content'] ?? item['text'] ?? '').toString();
                            final tags = (item['tags'] as List? ?? []);

                            final (badgeColor, badgeIcon) = switch (type) {
                              'INSIGHT' => (t.primary, LucideIcons.sparkles),
                              'EVENT' => (t.warning, LucideIcons.trophy),
                              'DOCUMENT' => (t.info, LucideIcons.fileText),
                              'CONVERSATION' => (t.primary, LucideIcons.messageSquare),
                              _ => (t.success, LucideIcons.bookOpen),
                            };

                            return Padding(
                              padding: const EdgeInsets.only(bottom: 12),
                              child: PremiumCard(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.all(6),
                                          decoration: BoxDecoration(
                                            color: badgeColor.withValues(alpha: 0.12),
                                            borderRadius:
                                                BorderRadius.circular(AppRadius.sm),
                                          ),
                                          child: Icon(badgeIcon,
                                              color: badgeColor, size: 15),
                                        ),
                                        const SizedBox(width: 10),
                                        Expanded(
                                          child: Text(
                                            type,
                                            style: TextStyle(
                                              color: badgeColor,
                                              fontWeight: FontWeight.w800,
                                              fontSize: 11,
                                              letterSpacing: 1.0,
                                            ),
                                          ),
                                        ),
                                        IconButton(
                                          icon: Icon(LucideIcons.trash2,
                                              size: 16, color: t.textMuted),
                                          onPressed: () => _deleteMemory(id),
                                          padding: EdgeInsets.zero,
                                          constraints: const BoxConstraints(
                                              minWidth: 28, minHeight: 28),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 10),
                                    Text(
                                      content,
                                      style: TextStyle(
                                        color: t.textPrimary,
                                        fontSize: 14,
                                        height: 1.5,
                                      ),
                                    ),
                                    if (tags.isNotEmpty) ...[
                                      const SizedBox(height: 12),
                                      Wrap(
                                        spacing: 6,
                                        runSpacing: 6,
                                        children: tags.map((tag) {
                                          return Container(
                                            padding: const EdgeInsets.symmetric(
                                                horizontal: 9, vertical: 4),
                                            decoration: BoxDecoration(
                                              color: t.backgroundSubtle,
                                              borderRadius:
                                                  BorderRadius.circular(
                                                      AppRadius.full),
                                              border: Border.all(
                                                  color: t.border),
                                            ),
                                            child: Text(
                                              '#$tag',
                                              style: TextStyle(
                                                fontSize: 11,
                                                color: t.textSecondary,
                                                fontWeight: FontWeight.w500,
                                              ),
                                            ),
                                          );
                                        }).toList(),
                                      ),
                                    ],
                                  ],
                                ),
                              ).animate().fadeIn(duration: (120 + idx * 50).ms),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}


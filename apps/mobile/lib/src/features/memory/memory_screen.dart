import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/design/tokens.dart';
import '../../core/repository.dart';
import '../../core/widgets/empty_state_view.dart';

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
      await ref.read(repositoryProvider).deleteMemory(id);
      _loadMemories();
    } catch (_) {}
  }

  void _showAddMemorySheet() {
    final textCtrl = TextEditingController();
    final tagCtrl = TextEditingController();

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (ctx) {
        final t = ctx.tokens;
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
            top: 20,
            left: 20,
            right: 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Add Life Memory Fact',
                  style: Theme.of(ctx)
                      .textTheme
                      .titleLarge
                      ?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text(
                  'Save key facts, preferences, or context for AI personalized coaching.',
                  style: TextStyle(color: t.textMuted, fontSize: 13)),
              const SizedBox(height: 16),
              TextField(
                controller: textCtrl,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Memory Content',
                  hintText:
                      'e.g. Prefer morning focus work, targeting ₹5L savings by October.',
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: tagCtrl,
                decoration: const InputDecoration(
                  labelText: 'Tags (comma separated)',
                  hintText: 'productivity, finance, schedule',
                ),
              ),
              const SizedBox(height: 20),
              FilledButton(
                onPressed: () async {
                  final text = textCtrl.text.trim();
                  if (text.isEmpty) return;
                  final tags = tagCtrl.text
                      .split(',')
                      .map((e) => e.trim())
                      .where((e) => e.isNotEmpty)
                      .toList();
                  await ref
                      .read(repositoryProvider)
                      .createMemory(content: text, tags: tags);
                  if (ctx.mounted) Navigator.pop(ctx);
                  _loadMemories();
                },
                child: const Text('Save Memory'),
              ),
            ],
          ),
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
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddMemorySheet,
        icon: const Icon(LucideIcons.plus),
        label: const Text('Add Memory'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
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
                        onRefresh: _loadMemories,
                        child: ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: _memories.length,
                          itemBuilder: (ctx, idx) {
                            final item = _memories[idx];
                            final id = item['id'] as int? ?? 0;
                            return Card(
                              margin: const EdgeInsets.only(bottom: 12),
                              child: Padding(
                                padding: const EdgeInsets.all(16.0),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Icon(LucideIcons.brain,
                                            color: t.primary, size: 18),
                                        const SizedBox(width: 8),
                                        Expanded(
                                          child: Text(
                                            (item['type'] ?? 'note')
                                                .toString()
                                                .toUpperCase(),
                                            style: TextStyle(
                                                color: t.primary,
                                                fontWeight: FontWeight.bold,
                                                fontSize: 11),
                                          ),
                                        ),
                                        IconButton(
                                          icon: const Icon(LucideIcons.trash2,
                                              size: 16),
                                          onPressed: () => _deleteMemory(id),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 6),
                                    Text(
                                      item['content'] ?? '',
                                      style: TextStyle(
                                          color: t.textPrimary,
                                          fontSize: 14,
                                          height: 1.4),
                                    ),
                                    const SizedBox(height: 10),
                                    Wrap(
                                      spacing: 6,
                                      children: (item['tags'] as List? ?? [])
                                          .map((tag) {
                                        return Chip(
                                          label: Text('#$tag',
                                              style: const TextStyle(
                                                  fontSize: 10)),
                                          padding: EdgeInsets.zero,
                                        );
                                      }).toList(),
                                    ),
                                  ],
                                ),
                              ),
                            ).animate().fadeIn(duration: (150 + idx * 100).ms);
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}

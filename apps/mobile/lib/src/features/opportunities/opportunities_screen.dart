import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/design/tokens.dart';
import '../../core/repository.dart';

class OpportunitiesScreen extends ConsumerStatefulWidget {
  const OpportunitiesScreen({super.key});

  @override
  ConsumerState<OpportunitiesScreen> createState() =>
      _OpportunitiesScreenState();
}

class _OpportunitiesScreenState extends ConsumerState<OpportunitiesScreen> {
  List<Map<String, dynamic>> _items = [];
  bool _loading = true;
  String _category = 'All';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final repo = ref.read(repositoryProvider);
      final res = await repo.opportunities(category: _category);
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

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final categories = ['All', 'Jobs', 'Grants', 'Internships'];

    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(
        title: const Text('Goal Opportunities'),
      ),
      body: Column(
        children: [
          SizedBox(
            height: 48,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              itemCount: categories.length,
              itemBuilder: (ctx, idx) {
                final cat = categories[idx];
                final selected = _category == cat;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(cat),
                    selected: selected,
                    onSelected: (_) {
                      setState(() => _category = cat);
                      _load();
                    },
                  ),
                );
              },
            ),
          ),
          Expanded(
            child: _loading
                ? Center(child: CircularProgressIndicator(color: t.primary))
                : RefreshIndicator(
                    onRefresh: _load,
                    child: ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _items.length,
                      itemBuilder: (ctx, idx) {
                        final item = _items[idx];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          child: InkWell(
                            onTap: () {
                              context.push('/opportunities/${item['id']}',
                                  extra: item);
                            },
                            borderRadius: BorderRadius.circular(AppRadius.xl),
                            child: Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 8, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: t.primarySurface,
                                          borderRadius: BorderRadius.circular(
                                              AppRadius.full),
                                        ),
                                        child: Text(
                                          '${item['matchScore'] ?? 90}% Match',
                                          style: TextStyle(
                                              color: t.primary,
                                              fontWeight: FontWeight.bold,
                                              fontSize: 11),
                                        ),
                                      ),
                                      const Spacer(),
                                      Text(item['deadline'] ?? 'Soon',
                                          style: TextStyle(
                                              color: t.textMuted,
                                              fontSize: 12)),
                                    ],
                                  ),
                                  const SizedBox(height: 10),
                                  Text(
                                    item['title'] ?? 'Opportunity Title',
                                    style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 16),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                      '${item['company']} • ${item['location']}',
                                      style: TextStyle(
                                          color: t.textMuted, fontSize: 12)),
                                  const SizedBox(height: 8),
                                  Text(item['description'] ?? '',
                                      style: TextStyle(
                                          color: t.textSecondary,
                                          fontSize: 13)),
                                  const SizedBox(height: 12),
                                  Row(
                                    children: [
                                      Text(item['salary'] ?? '',
                                          style: TextStyle(
                                              color: t.primary,
                                              fontWeight: FontWeight.bold,
                                              fontSize: 13)),
                                      const Spacer(),
                                      Text('View Opportunity →',
                                          style: TextStyle(
                                              color: t.primary,
                                              fontWeight: FontWeight.bold,
                                              fontSize: 12)),
                                    ],
                                  ),
                                ],
                              ),
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

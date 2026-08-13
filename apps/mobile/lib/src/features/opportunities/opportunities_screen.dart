import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/design/tokens.dart';
import '../../core/repository.dart';

import '../../core/widgets/premium_card.dart';

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
        centerTitle: false,
      ),
      body: Column(
        children: [
          SizedBox(
            height: 44,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
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
                      padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
                      itemCount: _items.length,
                      itemBuilder: (ctx, idx) {
                        final item = _items[idx];
                        final matchScore = item['matchScore'] ?? 90;
                        final company = (item['company'] ?? '').toString();
                        final location = (item['location'] ?? '').toString();
                        final salary = (item['salary'] ?? '').toString();
                        final deadline = (item['deadline'] ?? '').toString();

                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: PremiumCard(
                            padding: const EdgeInsets.all(18),
                            child: InkWell(
                              onTap: () {
                                context.push('/opportunities/${item['id']}',
                                    extra: item);
                              },
                              borderRadius: BorderRadius.circular(AppRadius.lg),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 9, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: t.primarySurface,
                                          borderRadius: BorderRadius.circular(
                                              AppRadius.full),
                                          border: Border.all(
                                              color: t.primary
                                                  .withValues(alpha: 0.2)),
                                        ),
                                        child: Text(
                                          '$matchScore% Match',
                                          style: TextStyle(
                                            color: t.primary,
                                            fontWeight: FontWeight.w700,
                                            fontSize: 11,
                                          ),
                                        ),
                                      ),
                                      const Spacer(),
                                      Text(
                                        deadline.isEmpty ? 'Soon' : deadline,
                                        style: TextStyle(
                                          color: t.textMuted,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    item['title'] ?? 'Opportunity Title',
                                    style: TextStyle(
                                      fontWeight: FontWeight.w800,
                                      fontSize: 16,
                                      color: t.textPrimary,
                                      letterSpacing: -0.3,
                                    ),
                                  ),
                                  if (company.isNotEmpty || location.isNotEmpty) ...[
                                    const SizedBox(height: 3),
                                    Text(
                                      '$company${company.isNotEmpty && location.isNotEmpty ? ' • ' : ''}$location',
                                      style: TextStyle(
                                        color: t.textMuted,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ],
                                  const SizedBox(height: 14),
                                  Row(
                                    children: [
                                      if (salary.isNotEmpty)
                                        Text(
                                          salary,
                                          style: TextStyle(
                                            color: t.primary,
                                            fontWeight: FontWeight.w800,
                                            fontSize: 14,
                                          ),
                                        ),
                                      const Spacer(),
                                      Text(
                                        'View Details →',
                                        style: TextStyle(
                                          color: t.primary,
                                          fontWeight: FontWeight.w700,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
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


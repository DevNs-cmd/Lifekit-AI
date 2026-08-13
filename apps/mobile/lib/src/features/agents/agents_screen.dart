import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/design/tokens.dart';
import '../../core/repository.dart';

import '../../core/widgets/premium_card.dart';

class AgentsScreen extends ConsumerStatefulWidget {
  const AgentsScreen({super.key});

  @override
  ConsumerState<AgentsScreen> createState() => _AgentsScreenState();
}

class _AgentsScreenState extends ConsumerState<AgentsScreen> {
  List<Map<String, dynamic>> _agentsList = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadAgents();
  }

  Future<void> _loadAgents() async {
    try {
      final repo = ref.read(repositoryProvider);
      final res = await repo.agents();
      if (!mounted) return;
      setState(() {
        _agentsList = res;
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
    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(
        title: const Text('Specialist AI Agents'),
        centerTitle: false,
      ),
      body: _loading
          ? Center(child: CircularProgressIndicator(color: t.primary))
          : RefreshIndicator(
              onRefresh: _loadAgents,
              child: ListView.builder(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
                itemCount: _agentsList.length,
                itemBuilder: (ctx, idx) {
                  final agent = _agentsList[idx];
                  final caps = (agent['capabilities'] as List? ?? []);
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: PremiumCard(
                      padding: const EdgeInsets.all(18),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 44,
                                height: 44,
                                decoration: BoxDecoration(
                                  color: t.primarySurface,
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                      color: t.primary.withValues(alpha: 0.2)),
                                ),
                                child: Center(
                                  child: Text(
                                    agent['avatar'] ?? '🤖',
                                    style: const TextStyle(fontSize: 20),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Expanded(
                                          child: Text(
                                            agent['name'] ?? 'AI Agent',
                                            style: TextStyle(
                                              fontWeight: FontWeight.w700,
                                              fontSize: 16,
                                              color: t.textPrimary,
                                              letterSpacing: -0.3,
                                            ),
                                          ),
                                        ),
                                        Row(
                                          children: [
                                            const Icon(LucideIcons.star,
                                                size: 13, color: Colors.amber),
                                            const SizedBox(width: 3),
                                            Text(
                                              '${agent['rating'] ?? 4.9}',
                                              style: TextStyle(
                                                fontWeight: FontWeight.w700,
                                                fontSize: 12,
                                                color: t.textPrimary,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      agent['role'] ?? 'Specialist',
                                      style: TextStyle(
                                        color: t.primary,
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            agent['description'] ?? '',
                            style: TextStyle(
                              color: t.textSecondary,
                              fontSize: 13,
                              height: 1.45,
                            ),
                          ),
                          if (caps.isNotEmpty) ...[
                            const SizedBox(height: 12),
                            Wrap(
                              spacing: 6,
                              runSpacing: 6,
                              children: caps.take(4).map((cap) {
                                return Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 9, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: t.backgroundSubtle,
                                    borderRadius:
                                        BorderRadius.circular(AppRadius.full),
                                    border: Border.all(color: t.border),
                                  ),
                                  child: Text(
                                    cap.toString(),
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
                          const SizedBox(height: 14),
                          Align(
                            alignment: Alignment.centerRight,
                            child: FilledButton.icon(
                              style: FilledButton.styleFrom(
                                minimumSize: const Size(0, 38),
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 16, vertical: 8),
                              ),
                              onPressed: () {
                                final id = agent['id'] ?? 'agent-coach';
                                context.push('/agents/$id', extra: agent);
                              },
                              icon: const Icon(LucideIcons.messageSquare,
                                  size: 14),
                              label: const Text('Start Workspace'),
                            ),
                          ),
                        ],
                      ),
                    ).animate().fadeIn(duration: (150 + idx * 60).ms),
                  );
                },
              ),
            ),
    );
  }
}


import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/design/tokens.dart';
import '../../core/repository.dart';

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
      ),
      body: _loading
          ? Center(child: CircularProgressIndicator(color: t.primary))
          : RefreshIndicator(
              onRefresh: _loadAgents,
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: _agentsList.length,
                itemBuilder: (ctx, idx) {
                  final agent = _agentsList[idx];
                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              color: t.primarySurface,
                              shape: BoxShape.circle,
                            ),
                            child: Center(
                              child: Text(
                                agent['avatar'] ?? '🤖',
                                style: const TextStyle(fontSize: 22),
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
                                        style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 16),
                                      ),
                                    ),
                                    Row(
                                      children: [
                                        const Icon(LucideIcons.star,
                                            size: 14, color: Colors.amber),
                                        const SizedBox(width: 4),
                                        Text('${agent['rating'] ?? 4.9}',
                                            style: const TextStyle(
                                                fontWeight: FontWeight.bold,
                                                fontSize: 12)),
                                      ],
                                    ),
                                  ],
                                ),
                                Text(
                                  agent['role'] ?? 'Specialist',
                                  style: TextStyle(
                                      color: t.primary,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  agent['description'] ?? '',
                                  style: TextStyle(
                                      color: t.textMuted, fontSize: 13),
                                ),
                                const SizedBox(height: 12),
                                Wrap(
                                  spacing: 6,
                                  runSpacing: 4,
                                  children:
                                      (agent['capabilities'] as List? ?? [])
                                          .map((cap) {
                                    return Chip(
                                      label: Text(cap.toString(),
                                          style: const TextStyle(fontSize: 10)),
                                      padding: EdgeInsets.zero,
                                    );
                                  }).toList(),
                                ),
                                const SizedBox(height: 10),
                                Align(
                                  alignment: Alignment.centerRight,
                                  child: OutlinedButton.icon(
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
                          ),
                        ],
                      ),
                    ),
                  ).animate().fadeIn(duration: (200 + idx * 100).ms);
                },
              ),
            ),
    );
  }
}

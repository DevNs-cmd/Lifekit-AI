import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/design/tokens.dart';
import '../../core/repository.dart';

class AgentChatScreen extends ConsumerStatefulWidget {
  const AgentChatScreen({required this.agentId, this.agentData, super.key});

  final String agentId;
  final Map<String, dynamic>? agentData;

  @override
  ConsumerState<AgentChatScreen> createState() => _AgentChatScreenState();
}

class _AgentChatScreenState extends ConsumerState<AgentChatScreen> {
  final List<Map<String, dynamic>> _messages = [];
  final _inputCtrl = TextEditingController();
  bool _sending = false;

  @override
  void initState() {
    super.initState();
    _messages.add({
      'sender': 'agent',
      'text':
          'Hello! I am your ${widget.agentData?['name'] ?? 'AI Specialist'}. How can I assist with your goals today?',
      'time': 'Just now',
    });
  }

  @override
  void dispose() {
    _inputCtrl.dispose();
    super.dispose();
  }

  Future<void> _sendMessage() async {
    final text = _inputCtrl.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add({'sender': 'user', 'text': text, 'time': 'Just now'});
      _sending = true;
    });
    _inputCtrl.clear();

    try {
      final repo = ref.read(repositoryProvider);
      final res = await repo.runAgent(
        agentType: widget.agentId,
        userInput: text,
      );
      if (!mounted) return;
      setState(() {
        _messages.add({
          'sender': 'agent',
          'text': res['message'] ?? 'Action plan updated.',
          'time': 'Just now',
        });
        _sending = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final agentName = widget.agentData?['name'] ?? 'Agent Workspace';

    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(
        title: Row(
          children: [
            Text(widget.agentData?['avatar'] ?? '🤖',
                style: const TextStyle(fontSize: 20)),
            const SizedBox(width: 8),
            Expanded(child: Text(agentName, overflow: TextOverflow.ellipsis)),
          ],
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (ctx, idx) {
                final msg = _messages[idx];
                final isUser = msg['sender'] == 'user';
                return Align(
                  alignment:
                      isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(14),
                    constraints: BoxConstraints(
                        maxWidth: MediaQuery.of(context).size.width * 0.8),
                    decoration: BoxDecoration(
                      color: isUser ? t.primary : t.surface,
                      borderRadius: BorderRadius.circular(AppRadius.lg),
                      border: isUser ? null : Border.all(color: t.border),
                    ),
                    child: Text(
                      msg['text'].toString(),
                      style: TextStyle(
                        color: isUser ? Colors.white : t.textPrimary,
                        fontSize: 14,
                        height: 1.4,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          if (_sending)
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Row(
                children: [
                  const SizedBox(width: 16),
                  SizedBox(
                      width: 14,
                      height: 14,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: t.primary)),
                  const SizedBox(width: 8),
                  Text('Agent is formulating response...',
                      style: TextStyle(color: t.textMuted, fontSize: 12)),
                ],
              ),
            ),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: t.surface,
              border: Border(top: BorderSide(color: t.border)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _inputCtrl,
                    decoration: const InputDecoration(
                      hintText: 'Type your message...',
                      contentPadding:
                          EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  onPressed: _sending ? null : _sendMessage,
                  icon: Icon(LucideIcons.send, color: t.primary),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

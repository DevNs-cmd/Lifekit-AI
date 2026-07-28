import 'package:flutter/material.dart';
import '../../../core/constants.dart';
import '../../models/mission_model.dart';

class AICoachBottomSheet extends StatefulWidget {
  final MissionModel mission;

  const AICoachBottomSheet({Key? key, required this.mission}) : super(key: key);

  @override
  State<AICoachBottomSheet> createState() => _AICoachBottomSheetState();
}

class _AICoachBottomSheetState extends State<AICoachBottomSheet> {
  final TextEditingController _promptController = TextEditingController();
  final List<Map<String, String>> _messages = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _messages.add({
      'role': 'assistant',
      'text':
          '👋 Hello! I am your LifeKit AI Coach for "${widget.mission.title}". You are currently at ${widget.mission.progressPercentInt}% execution progress. How can I assist you with your roadmap or task execution strategy today?'
    });
  }

  void _sendQuery() async {
    final query = _promptController.text.trim();
    if (query.isEmpty || _isLoading) return;

    setState(() {
      _messages.add({'role': 'user', 'text': query});
      _promptController.clear();
      _isLoading = true;
    });

    // Simulate AI Coach response or call API
    await Future.delayed(const Duration(milliseconds: 1200));

    String aiReply = '';
    if (query.toLowerCase().contains('time') || query.toLowerCase().contains('schedule')) {
      aiReply =
          '⚡ **Time Strategy**: For "${widget.mission.title}", schedule two 60-minute deep work blocks daily. Focus strictly on uncompleted items like "${widget.mission.tasks.firstWhere((t) => !t.isCompleted, orElse: () => widget.mission.tasks.first).title}".';
    } else if (query.toLowerCase().contains('stuck') || query.toLowerCase().contains('help')) {
      aiReply =
          '🚀 **Overcoming Bottlenecks**: Break your current task down into 3 sub-tasks taking < 15 minutes each. Micro-wins trigger momentum!';
    } else {
      aiReply =
          '🎯 **Execution Advice**: To push "${widget.mission.title}" from ${widget.mission.progressPercentInt}% to 100%, complete your next open task today. Would you like me to draft a 3-step action checklist for this milestone?';
    }

    if (mounted) {
      setState(() {
        _messages.add({'role': 'assistant', 'text': aiReply});
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
      padding: const EdgeInsets.all(20),
      decoration: const BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Sheet Header
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.surfaceLight,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.accentPurple,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.psychology, color: Colors.white, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'AI Mission Execution Coach',
                      style: TextStyle(
                        color: AppColors.textHigh,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      'Active Goal: ${widget.mission.title}',
                      style: const TextStyle(
                        color: AppColors.accentGlow,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.close, color: AppColors.textMuted),
              ),
            ],
          ),
          const Divider(color: AppColors.borderSubtle, height: 24),

          // Message Chat Area
          Expanded(
            child: ListView.builder(
              itemCount: _messages.length,
              itemBuilder: (context, idx) {
                final msg = _messages[idx];
                final isUser = msg['role'] == 'user';

                return Align(
                  alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 6),
                    padding: const EdgeInsets.all(14),
                    constraints: BoxConstraints(
                      maxWidth: MediaQuery.of(context).size.width * 0.8,
                    ),
                    decoration: BoxDecoration(
                      color: isUser ? AppColors.accentPurple : AppColors.surfaceLight,
                      borderRadius: BorderRadius.circular(16).copyWith(
                        bottomRight: isUser ? Radius.zero : const Radius.circular(16),
                        bottomLeft: !isUser ? Radius.zero : const Radius.circular(16),
                      ),
                    ),
                    child: Text(
                      msg['text']!,
                      style: const TextStyle(
                        color: AppColors.textHigh,
                        fontSize: 13,
                        height: 1.4,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          if (_isLoading)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 8),
              child: Row(
                children: [
                  SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: AppColors.accentGlow,
                    ),
                  ),
                  SizedBox(width: 10),
                  Text('AI Coach is thinking...', style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
                ],
              ),
            ),

          const SizedBox(height: 8),

          // Input field
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _promptController,
                  style: const TextStyle(color: AppColors.textHigh, fontSize: 14),
                  decoration: InputDecoration(
                    hintText: 'Ask AI Coach for advice or strategies...',
                    hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 13),
                    filled: true,
                    fillColor: AppColors.surfaceLight,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(24),
                      borderSide: BorderSide.none,
                    ),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                  ),
                  onSubmitted: (_) => _sendQuery(),
                ),
              ),
              const SizedBox(width: 8),
              CircleAvatar(
                radius: 22,
                backgroundColor: AppColors.accentPurple,
                child: IconButton(
                  icon: const Icon(Icons.send_rounded, size: 18, color: Colors.white),
                  onPressed: _sendQuery,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

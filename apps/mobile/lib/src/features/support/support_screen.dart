import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/design/tokens.dart';

class SupportScreen extends ConsumerStatefulWidget {
  const SupportScreen({super.key});

  @override
  ConsumerState<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends ConsumerState<SupportScreen> {
  final _subjectCtrl = TextEditingController();
  final _msgCtrl = TextEditingController();
  bool _submitting = false;

  @override
  void dispose() {
    _subjectCtrl.dispose();
    _msgCtrl.dispose();
    super.dispose();
  }

  void _submitTicket() {
    if (_subjectCtrl.text.isEmpty || _msgCtrl.text.isEmpty) return;
    setState(() => _submitting = true);
    Future.delayed(const Duration(milliseconds: 600), () {
      if (!mounted) return;
      setState(() => _submitting = false);
      _subjectCtrl.clear();
      _msgCtrl.clear();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content:
                Text('Support ticket submitted! Our team will reply shortly.')),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final faqs = [
      (
        'How does LifeKit AI Coach work?',
        'The AI Coach reads your active missions and memories to suggest daily focus tasks.'
      ),
      (
        'Can I export my data?',
        'Yes, go to Settings -> Privacy & Data to download your complete JSON backup.'
      ),
      (
        'Is my data stored securely?',
        'Yes, all sensitive data is encrypted using AES-256 and stored in secure vector databases.'
      ),
    ];

    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(
        title: const Text('Help & Support'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Frequently Asked Questions',
                style: Theme.of(context)
                    .textTheme
                    .titleMedium
                    ?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            ...faqs.map((faq) {
              return ExpansionTile(
                title: Text(faq.$1,
                    style: const TextStyle(
                        fontWeight: FontWeight.w600, fontSize: 14)),
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                    child: Text(faq.$2,
                        style: TextStyle(
                            color: t.textMuted, fontSize: 13, height: 1.4)),
                  ),
                ],
              );
            }),
            const SizedBox(height: 24),
            Text('Submit a Support Ticket',
                style: Theme.of(context)
                    .textTheme
                    .titleMedium
                    ?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            TextField(
              controller: _subjectCtrl,
              decoration: const InputDecoration(labelText: 'Subject'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _msgCtrl,
              maxLines: 4,
              decoration: const InputDecoration(labelText: 'How can we help?'),
            ),
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: _submitting ? null : _submitTicket,
              icon: const Icon(LucideIcons.send, size: 16),
              label: Text(_submitting ? 'Submitting...' : 'Submit Ticket'),
            ),
          ],
        ),
      ),
    );
  }
}

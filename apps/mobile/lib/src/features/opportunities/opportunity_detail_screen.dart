import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/design/tokens.dart';
import '../../core/repository.dart';

class OpportunityDetailScreen extends ConsumerStatefulWidget {
  const OpportunityDetailScreen({required this.id, this.itemData, super.key});

  final String id;
  final Map<String, dynamic>? itemData;

  @override
  ConsumerState<OpportunityDetailScreen> createState() =>
      _OpportunityDetailScreenState();
}

class _OpportunityDetailScreenState
    extends ConsumerState<OpportunityDetailScreen> {
  Map<String, dynamic>? _item;
  bool _loading = false;
  bool _saving = false;
  bool _saved = false;

  @override
  void initState() {
    super.initState();
    if (widget.itemData != null && widget.itemData!.isNotEmpty) {
      _item = widget.itemData;
      _saved = _item!['isSaved'] == true;
    } else {
      _fetch();
    }
  }

  Future<void> _fetch() async {
    setState(() => _loading = true);
    try {
      final res = await ref.read(repositoryProvider).opportunityDetail(widget.id);
      if (!mounted) return;
      setState(() {
        _item = res;
        _saved = res['isSaved'] == true;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  Future<void> _toggleSave() async {
    setState(() => _saving = true);
    final newStatus = !_saved;
    final ok = await ref.read(repositoryProvider).saveOpportunity(widget.id, saved: newStatus);
    if (!mounted) return;
    setState(() {
      _saving = false;
      if (ok) _saved = newStatus;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(_saved
            ? 'Opportunity saved to your Bookmarks!'
            : 'Opportunity removed from Bookmarks'),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;

    if (_loading && _item == null) {
      return Scaffold(
        backgroundColor: t.background,
        appBar: AppBar(title: const Text('Opportunity Details')),
        body: Center(child: CircularProgressIndicator(color: t.primary)),
      );
    }

    if (_item == null) {
      return Scaffold(
        backgroundColor: t.background,
        appBar: AppBar(title: const Text('Opportunity Details')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(LucideIcons.circleAlert, size: 48, color: t.destructive),
                const SizedBox(height: 12),
                Text('Could not load opportunity',
                    style: TextStyle(color: t.textPrimary, fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                ElevatedButton(onPressed: _fetch, child: const Text('Retry')),
              ],
            ),
          ),
        ),
      );
    }

    final item = _item!;

    final title = item['title'] ?? 'Opportunity Title';
    final company = item['company'] ?? item['organisation'] ?? 'LifeKit Partner';
    final location = item['location'] ?? 'Remote';
    final salary = item['salary'] ?? 'Competitive';
    final deadline = item['deadline'] ?? 'Open';
    final matchScore = item['matchScore'] ?? 90;
    final description = item['description'] ?? '';

    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(
        title: const Text('Opportunity Details'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: t.surface,
                borderRadius: BorderRadius.circular(AppRadius.xl),
                border: Border.all(color: t.border),
              ),
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
                          borderRadius: BorderRadius.circular(AppRadius.full),
                        ),
                        child: Text(
                          '$matchScore% AI Goal Match',
                          style: TextStyle(
                            color: t.primary,
                            fontWeight: FontWeight.bold,
                            fontSize: 11,
                          ),
                        ),
                      ),
                      const Spacer(),
                      Text(
                        deadline,
                        style: TextStyle(color: t.textMuted, fontSize: 12),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    title,
                    style: Theme.of(context)
                        .textTheme
                        .titleLarge
                        ?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '$company • $location',
                    style: TextStyle(color: t.textMuted),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    salary,
                    style: TextStyle(
                      color: t.primary,
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'Description & Requirements',
              style: Theme.of(context)
                  .textTheme
                  .titleMedium
                  ?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              description,
              style: TextStyle(color: t.textSecondary, height: 1.5),
            ),
            const SizedBox(height: 30),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _saving ? null : _toggleSave,
                    icon: Icon(_saved ? LucideIcons.bookmarkCheck : LucideIcons.bookmark),
                    label: Text(_saved ? 'Bookmarked' : 'Bookmark'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: FilledButton.icon(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Redirecting to Application Portal...'),
                        ),
                      );
                    },
                    icon: const Icon(LucideIcons.externalLink),
                    label: const Text('Apply Now'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

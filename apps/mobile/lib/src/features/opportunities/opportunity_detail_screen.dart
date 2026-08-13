import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/design/tokens.dart';

class OpportunityDetailScreen extends ConsumerWidget {
  const OpportunityDetailScreen({required this.id, this.itemData, super.key});

  final String id;
  final Map<String, dynamic>? itemData;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.tokens;
    final item = itemData ??
        {
          'title': 'Senior AI Developer #$id',
          'company': 'NexusAI Labs',
          'location': 'Remote',
          'salary': '₹30 - 45 LPA',
          'deadline': 'In 5 days',
          'matchScore': 94,
          'description':
              'Work on cutting-edge AI orchestration software and high-throughput agent workflows.',
        };

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
                            '${item['matchScore'] ?? 90}% AI Goal Match',
                            style: TextStyle(
                                color: t.primary,
                                fontWeight: FontWeight.bold,
                                fontSize: 11)),
                      ),
                      const Spacer(),
                      Text(item['deadline'] ?? '',
                          style: TextStyle(color: t.textMuted, fontSize: 12)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    item['title'] ?? 'Title',
                    style: Theme.of(context)
                        .textTheme
                        .titleLarge
                        ?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 6),
                  Text('${item['company']} • ${item['location']}',
                      style: TextStyle(color: t.textMuted)),
                  const SizedBox(height: 12),
                  Text(item['salary'] ?? '',
                      style: TextStyle(
                          color: t.primary,
                          fontWeight: FontWeight.bold,
                          fontSize: 18)),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Text('Description & Requirements',
                style: Theme.of(context)
                    .textTheme
                    .titleMedium
                    ?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(item['description'] ?? '',
                style: TextStyle(color: t.textSecondary, height: 1.5)),
            const SizedBox(height: 30),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                            content:
                                Text('Opportunity saved to your Bookmarks!')),
                      );
                    },
                    icon: const Icon(LucideIcons.bookmark),
                    label: const Text('Bookmark'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: FilledButton.icon(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                            content:
                                Text('Redirecting to Application Portal...')),
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

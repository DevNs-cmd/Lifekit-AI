import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/design/tokens.dart';

class MarketplaceDetailScreen extends ConsumerWidget {
  const MarketplaceDetailScreen({required this.id, this.itemData, super.key});

  final String id;
  final Map<String, dynamic>? itemData;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.tokens;
    final item = itemData ??
        {
          'title': 'AI Execution Kit #$id',
          'author': 'Verified Creator',
          'price': '₹499',
          'rating': 4.9,
          'description':
              'Comprehensive AI execution blueprint with prompts, templates, and automated task workflows.',
          'tags': ['Productivity', 'AI', 'Workflow'],
        };

    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(
        title: const Text('Listing Detail'),
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
                      Chip(
                          label: Text((item['tags'] as List? ?? ['AI'])
                              .first
                              .toString())),
                      const Spacer(),
                      Text(item['price'] ?? 'Free',
                          style: TextStyle(
                              color: t.primary,
                              fontWeight: FontWeight.bold,
                              fontSize: 18)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    item['title'] ?? 'Listing Item',
                    style: Theme.of(context)
                        .textTheme
                        .titleLarge
                        ?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 6),
                  Text(
                      'Created by ${item['author'] ?? 'LifeKit Certified Builder'}',
                      style: TextStyle(color: t.textMuted)),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      const Icon(LucideIcons.star,
                          color: Colors.amber, size: 18),
                      const SizedBox(width: 4),
                      Text('${item['rating'] ?? 4.9} (128 reviews)',
                          style: const TextStyle(fontWeight: FontWeight.bold)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Text('Overview & Instructions',
                style: Theme.of(context)
                    .textTheme
                    .titleMedium
                    ?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(item['description'] ?? '',
                style: TextStyle(color: t.textSecondary, height: 1.5)),
            const SizedBox(height: 30),
            FilledButton.icon(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                      content:
                          Text('Listing unlocked & added to your AI Library!')),
                );
              },
              icon: const Icon(LucideIcons.download),
              label: Text('Unlock & Install (${item['price'] ?? 'Free'})'),
            ),
          ],
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/design/tokens.dart';
import '../../core/repository.dart';

class MarketplaceDetailScreen extends ConsumerStatefulWidget {
  const MarketplaceDetailScreen({required this.id, this.itemData, super.key});

  final String id;
  final Map<String, dynamic>? itemData;

  @override
  ConsumerState<MarketplaceDetailScreen> createState() =>
      _MarketplaceDetailScreenState();
}

class _MarketplaceDetailScreenState
    extends ConsumerState<MarketplaceDetailScreen> {
  Map<String, dynamic>? _item;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    if (widget.itemData != null && widget.itemData!.isNotEmpty) {
      _item = widget.itemData;
    } else {
      _fetch();
    }
  }

  Future<void> _fetch() async {
    setState(() => _loading = true);
    try {
      final res = await ref.read(repositoryProvider).marketplaceListing(widget.id);
      if (!mounted) return;
      setState(() {
        _item = res;
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

    if (_loading && _item == null) {
      return Scaffold(
        backgroundColor: t.background,
        appBar: AppBar(title: const Text('Listing Detail')),
        body: Center(child: CircularProgressIndicator(color: t.primary)),
      );
    }

    if (_item == null) {
      return Scaffold(
        backgroundColor: t.background,
        appBar: AppBar(title: const Text('Listing Detail')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(LucideIcons.circleAlert, size: 48, color: t.destructive),
                const SizedBox(height: 12),
                Text('Could not load marketplace listing',
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

    final title = item['title'] ?? 'Listing Item';
    final author = item['author'] ?? item['provider'] ?? 'LifeKit Certified Expert';
    final price = item['price'] ?? 'Free';
    final rating = item['rating'] ?? 4.9;
    final description = item['description'] ?? '';
    final tags = (item['tags'] as List? ?? ['AI']).map((e) => e.toString()).toList();

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
                        label: Text(
                          tags.isNotEmpty ? tags.first : 'AI',
                          style: TextStyle(color: t.primary, fontWeight: FontWeight.bold, fontSize: 11),
                        ),
                        backgroundColor: t.primarySurface,
                      ),
                      const Spacer(),
                      Text(
                        price,
                        style: TextStyle(
                          color: t.primary,
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
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
                    'Created by $author',
                    style: TextStyle(color: t.textMuted),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      const Icon(LucideIcons.star, color: Colors.amber, size: 18),
                      const SizedBox(width: 4),
                      Text(
                        '$rating (128 reviews)',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'Overview & Instructions',
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
            SizedBox(
              width: double.infinity,
              height: 48,
              child: FilledButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Unlocked "$title" & added to your AI Library!'),
                    ),
                  );
                },
                icon: const Icon(LucideIcons.download),
                label: Text('Unlock & Install ($price)'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

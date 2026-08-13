import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/api.dart';
import '../../core/design/tokens.dart';

class SettingsHubScreen extends ConsumerWidget {
  const SettingsHubScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.tokens;
    final options = [
      (
        'General',
        'Language, timezone & notifications',
        LucideIcons.sliders,
        '/settings/general'
      ),
      (
        'Appearance',
        'Theme mode, font sizes & visuals',
        LucideIcons.palette,
        '/settings/appearance'
      ),
      (
        'AI Preferences',
        'Model choice, creativity & context',
        LucideIcons.bot,
        '/settings/ai'
      ),
      (
        'Privacy & Data',
        'Memory retention & data export',
        LucideIcons.shield,
        '/settings/privacy'
      ),
      (
        'Security',
        'Password, 2FA & active sessions',
        LucideIcons.lock,
        '/settings/security'
      ),
      (
        'Integrations',
        'Connected Google, GitHub & Notion',
        LucideIcons.link,
        '/settings/integrations'
      ),
      (
        'Subscription Plan',
        'Current tier & plan upgrade',
        LucideIcons.sparkles,
        '/settings/subscription'
      ),
      (
        'Billing & Invoices',
        'Saved payments & receipt logs',
        LucideIcons.receipt,
        '/settings/billing'
      ),
    ];

    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(
        title: const Text('Settings Hub'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          ...options.map((opt) {
            return Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                leading: Icon(opt.$3, color: t.primary),
                title: Text(opt.$1,
                    style: const TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Text(opt.$2,
                    style: TextStyle(color: t.textMuted, fontSize: 12)),
                trailing: const Icon(LucideIcons.chevronRight, size: 18),
                onTap: () => context.push(opt.$4),
              ),
            );
          }),
          const SizedBox(height: 20),
          FilledButton.icon(
            onPressed: () async {
              await ref.read(authProvider.notifier).signOut();
              if (context.mounted) context.go('/auth/sign-in');
            },
            style: FilledButton.styleFrom(backgroundColor: t.destructive),
            icon: const Icon(LucideIcons.logOut, size: 16),
            label: const Text('Sign Out'),
          ),
        ],
      ),
    );
  }
}

// ignore_for_file: deprecated_member_use
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../app.dart';
import '../../core/design/tokens.dart';

// 1. General Settings
class GeneralSettingsScreen extends ConsumerStatefulWidget {
  const GeneralSettingsScreen({super.key});
  @override
  ConsumerState<GeneralSettingsScreen> createState() =>
      _GeneralSettingsScreenState();
}

class _GeneralSettingsScreenState extends ConsumerState<GeneralSettingsScreen> {
  String _language = 'English (en)';
  String _timezone = 'Asia/Kolkata (IST)';
  bool _emailNotifs = true;
  bool _pushNotifs = true;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(title: const Text('General Settings')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          DropdownButtonFormField<String>(
            initialValue: _language,
            items: const [
              DropdownMenuItem(
                  value: 'English (en)', child: Text('English (en)')),
              DropdownMenuItem(value: 'Hindi (hi)', child: Text('Hindi (hi)')),
              DropdownMenuItem(
                  value: 'Spanish (es)', child: Text('Spanish (es)')),
            ],
            onChanged: (val) {
              if (val != null) setState(() => _language = val);
            },
            decoration: const InputDecoration(labelText: 'App Language'),
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            initialValue: _timezone,
            items: const [
              DropdownMenuItem(
                  value: 'Asia/Kolkata (IST)',
                  child: Text('Asia/Kolkata (IST)')),
              DropdownMenuItem(
                  value: 'America/New_York (EST)',
                  child: Text('America/New_York (EST)')),
              DropdownMenuItem(
                  value: 'Europe/London (GMT)',
                  child: Text('Europe/London (GMT)')),
            ],
            onChanged: (val) {
              if (val != null) setState(() => _timezone = val);
            },
            decoration: const InputDecoration(labelText: 'Timezone'),
          ),
          const SizedBox(height: 20),
          SwitchListTile(
            title: const Text('Email Notifications'),
            value: _emailNotifs,
            onChanged: (v) => setState(() => _emailNotifs = v),
          ),
          SwitchListTile(
            title: const Text('Push Notifications'),
            value: _pushNotifs,
            onChanged: (v) => setState(() => _pushNotifs = v),
          ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('General settings saved!')),
              );
            },
            child: const Text('Save Changes'),
          ),
        ],
      ),
    );
  }
}

// 2. Appearance Settings
class AppearanceSettingsScreen extends ConsumerWidget {
  const AppearanceSettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.tokens;
    final mode = ref.watch(themeModeProvider);

    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(title: const Text('Appearance & Theme')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          RadioListTile<ThemeMode>(
            title: const Text('Light Mode'),
            subtitle: const Text('Deep purple on bright white'),
            value: ThemeMode.light,
            groupValue: mode,
            onChanged: (m) => ref.read(themeModeProvider.notifier).state = m!,
          ),
          RadioListTile<ThemeMode>(
            title: const Text('Dark Mode'),
            subtitle: const Text('Deep purple on dark navy slate'),
            value: ThemeMode.dark,
            groupValue: mode,
            onChanged: (m) => ref.read(themeModeProvider.notifier).state = m!,
          ),
          RadioListTile<ThemeMode>(
            title: const Text('System Default'),
            subtitle: const Text('Follow OS system theme'),
            value: ThemeMode.system,
            groupValue: mode,
            onChanged: (m) => ref.read(themeModeProvider.notifier).state = m!,
          ),
        ],
      ),
    );
  }
}

// 3. AI Preferences
class AiSettingsScreen extends ConsumerStatefulWidget {
  const AiSettingsScreen({super.key});
  @override
  ConsumerState<AiSettingsScreen> createState() => _AiSettingsScreenState();
}

class _AiSettingsScreenState extends ConsumerState<AiSettingsScreen> {
  String _model = 'Gemini 1.5 Pro (Balanced)';
  double _creativity = 0.7;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(title: const Text('AI Preferences')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          DropdownButtonFormField<String>(
            initialValue: _model,
            items: const [
              DropdownMenuItem(
                  value: 'Gemini 1.5 Pro (Balanced)',
                  child: Text('Gemini 1.5 Pro (Balanced)')),
              DropdownMenuItem(
                  value: 'Gemini Flash (Fast)',
                  child: Text('Gemini Flash (Fast)')),
            ],
            onChanged: (val) {
              if (val != null) setState(() => _model = val);
            },
            decoration: const InputDecoration(labelText: 'Default AI Engine'),
          ),
          const SizedBox(height: 24),
          Text('Creativity / Temperature: ${_creativity.toStringAsFixed(1)}',
              style: const TextStyle(fontWeight: FontWeight.bold)),
          Slider(
            value: _creativity,
            min: 0.1,
            max: 1.0,
            onChanged: (v) => setState(() => _creativity = v),
          ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('AI preferences updated!')),
              );
            },
            child: const Text('Save AI Preferences'),
          ),
        ],
      ),
    );
  }
}

// 4. Privacy Settings
class PrivacySettingsScreen extends ConsumerWidget {
  const PrivacySettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.tokens;
    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(title: const Text('Privacy & Data')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          ListTile(
            title: const Text('Export Personal Data'),
            subtitle: const Text(
                'Download a JSON backup of all missions, tasks and memories'),
            trailing: const Icon(LucideIcons.download),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                    content:
                        Text('Exporting user data JSON... Check downloads.')),
              );
            },
          ),
          const Divider(),
          ListTile(
            title: Text('Delete Account',
                style: TextStyle(
                    color: t.destructive, fontWeight: FontWeight.bold)),
            subtitle: const Text('Permanently erase account data and history'),
            trailing: Icon(LucideIcons.alertTriangle, color: t.destructive),
            onTap: () {
              showDialog<void>(
                context: context,
                builder: (ctx) => AlertDialog(
                  title: const Text('Confirm Account Deletion'),
                  content: const Text(
                      'Are you sure? This operation cannot be undone.'),
                  actions: [
                    TextButton(
                        onPressed: () => Navigator.pop(ctx),
                        child: const Text('Cancel')),
                    FilledButton(
                      style: FilledButton.styleFrom(
                          backgroundColor: t.destructive),
                      onPressed: () => Navigator.pop(ctx),
                      child: const Text('Delete'),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

// 5. Security Settings
class SecuritySettingsScreen extends ConsumerWidget {
  const SecuritySettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.tokens;
    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(title: const Text('Security & 2FA')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const TextField(
            obscureText: true,
            decoration: InputDecoration(labelText: 'Current Password'),
          ),
          const SizedBox(height: 12),
          const TextField(
            obscureText: true,
            decoration: InputDecoration(labelText: 'New Password'),
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Password updated successfully!')),
              );
            },
            child: const Text('Update Password'),
          ),
        ],
      ),
    );
  }
}

// 6. Integrations
class IntegrationsSettingsScreen extends ConsumerStatefulWidget {
  const IntegrationsSettingsScreen({super.key});
  @override
  ConsumerState<IntegrationsSettingsScreen> createState() =>
      _IntegrationsSettingsScreenState();
}

class _IntegrationsSettingsScreenState
    extends ConsumerState<IntegrationsSettingsScreen> {
  bool _gcal = true;
  bool _github = false;
  bool _notion = true;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(title: const Text('Connected Apps')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          SwitchListTile(
            title: const Text('Google Calendar'),
            subtitle: const Text('Sync daily focus tasks to your calendar'),
            value: _gcal,
            onChanged: (v) => setState(() => _gcal = v),
          ),
          SwitchListTile(
            title: const Text('GitHub Integration'),
            subtitle:
                const Text('Link PRs and commit streaks to career missions'),
            value: _github,
            onChanged: (v) => setState(() => _github = v),
          ),
          SwitchListTile(
            title: const Text('Notion Workspace'),
            subtitle:
                const Text('Export AI Planner goals into Notion databases'),
            value: _notion,
            onChanged: (v) => setState(() => _notion = v),
          ),
        ],
      ),
    );
  }
}

// 7. Subscription Settings
class SubscriptionSettingsScreen extends ConsumerWidget {
  const SubscriptionSettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.tokens;
    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(title: const Text('Subscription Plan')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: t.primarySurface,
                borderRadius: BorderRadius.circular(AppRadius.xl),
                border: Border.all(color: t.primary),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text('LifeKit Plus Plan',
                          style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: t.primary)),
                      const Spacer(),
                      Chip(
                          label: Text('ACTIVE',
                              style:
                                  TextStyle(color: t.primary, fontSize: 10))),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Text(
                      'Unlimited AI Coach runs, 50 Specialist Agent queries/day, Vector Life Memory.'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// 8. Billing Settings
class BillingSettingsScreen extends ConsumerWidget {
  const BillingSettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.tokens;
    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(title: const Text('Billing & Invoices')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Card(
            child: ListTile(
              title: const Text('Invoice #INV-2026-07'),
              subtitle: const Text('₹499 • Paid on 15 July 2026'),
              trailing: const Icon(LucideIcons.download),
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Downloading PDF Invoice...')),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

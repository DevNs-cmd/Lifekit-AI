import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/design/tokens.dart';

class PublicInfoScreen extends StatelessWidget {
  const PublicInfoScreen({required this.path, super.key});

  final String path;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final (title, icon, content) = _infoContent(path);

    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(
        title: Text(title),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: t.primarySurface,
                borderRadius: BorderRadius.circular(AppRadius.xl),
                border: Border.all(color: t.primary.withValues(alpha: 0.2)),
              ),
              child: Row(
                children: [
                  Icon(icon, size: 36, color: t.primary),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Text(
                      title,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: t.primary,
                          ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Text(
              content,
              style:
                  TextStyle(color: t.textSecondary, fontSize: 14, height: 1.6),
            ),
          ],
        ),
      ),
    );
  }

  (String, IconData, String) _infoContent(String rawPath) {
    return switch (rawPath) {
      '/product' => (
          'Product Overview',
          LucideIcons.layoutGrid,
          'LifeKit is the AI Execution Marketplace designed for Human Goals. Break complex ambitions into daily focus tasks, get strategic coaching, and unlock pre-built execution prompt kits.'
        ),
      '/solutions' => (
          'Tailored Solutions',
          LucideIcons.users,
          'Whether you are an ambitious engineer, founder, student, or creative professional, LifeKit provides custom AI agents tuned to your domain.'
        ),
      '/pricing' => (
          'Flexible Plans & Pricing',
          LucideIcons.creditCard,
          'Start free with basic goal tracking and AI recommendations. Upgrade to LifeKit Plus (₹499/mo) for unlimited coach runs and Vector Life Memory.'
        ),
      '/enterprise' => (
          'Enterprise Deployment',
          LucideIcons.building2,
          'Custom SLA, dedicated vector database instances, SOC2 compliance, and team-wide goal alignment analytics.'
        ),
      '/about' => (
          'About LifeKit AI',
          LucideIcons.info,
          'Built by engineers and AI researchers with a single mission: empowering humans to convert abstract goals into concrete, daily execution.'
        ),
      '/contact' => (
          'Contact & Support',
          LucideIcons.mail,
          'Have questions or feedback? Reach out to support@lifekit.ai or submit a support ticket in the app.'
        ),
      _ => (
          'Marketplace Info',
          LucideIcons.store,
          'Public marketplace directory overview detailing prompt blueprints, automated workflows, and community templates.'
        ),
    };
  }
}

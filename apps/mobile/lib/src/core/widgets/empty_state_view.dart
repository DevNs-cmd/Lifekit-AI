import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../design/tokens.dart';
import '../design/animations.dart';
import 'premium_card.dart';
import 'premium_input.dart';

// ─────────────────────────────────────────────
//  EMPTY STATE VIEW
//  Matches website's empty-state patterns:
//  pulsing orb icon + title + subtitle + CTA.
//  Used across Missions, Tasks, Memory, etc.
// ─────────────────────────────────────────────
class EmptyStateView extends StatelessWidget {
  const EmptyStateView({
    required this.title,
    required this.subtitle,
    this.icon        = LucideIcons.inbox,
    this.actionLabel,
    this.onAction,
    this.secondaryLabel,
    this.onSecondary,
    super.key,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final String? actionLabel;
  final VoidCallback? onAction;
  final String? secondaryLabel;
  final VoidCallback? onSecondary;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 36, vertical: 48),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Orb with pop entrance animation
            EmptyStateOrb(icon: icon, size: 76, iconSize: 34)
                .animate()
                .scale(
                  begin:    const Offset(0.6, 0.6),
                  duration: 400.ms,
                  curve:    Curves.easeOutBack,
                )
                .fadeIn(duration: 300.ms),

            const SizedBox(height: 24),

            // Title
            Text(
              title,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    color:         t.textPrimary,
                    fontWeight:    FontWeight.w800,
                    fontSize:      18,
                    letterSpacing: -0.4,
                  ),
            ).animate(delay: 80.ms).fadeIn(duration: 280.ms).slideY(
                  begin: 0.04,
                  end:   0,
                  duration: 280.ms,
                ),

            const SizedBox(height: 10),

            // Subtitle
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: TextStyle(
                color:  t.textMuted,
                fontSize: 13,
                height: 1.6,
              ),
            ).animate(delay: 130.ms).fadeIn(duration: 280.ms),

            // Primary CTA
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(height: 28),
              PremiumButton(
                label:     actionLabel!,
                onPressed: onAction,
                icon:      const Icon(LucideIcons.plus, size: 16),
                minWidth:  180,
              ).animate(delay: 180.ms).fadeIn(duration: 280.ms).slideY(
                    begin: 0.04,
                    end:   0,
                    duration: 280.ms,
                  ),
            ],

            // Secondary CTA
            if (secondaryLabel != null && onSecondary != null) ...[
              const SizedBox(height: 12),
              TextButton(
                onPressed: onSecondary,
                child: Text(
                  secondaryLabel!,
                  style: TextStyle(
                    color:      t.textMuted,
                    fontSize:   13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ).animate(delay: 220.ms).fadeIn(duration: 250.ms),
            ],
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  FULLSCREEN EMPTY STATE
//  Takes the full available height. Used when
//  the empty state is the sole content of a tab.
// ─────────────────────────────────────────────
class FullscreenEmptyState extends StatelessWidget {
  const FullscreenEmptyState({
    super.key,
    required this.icon,
    required this.title,
    required this.subtitle,
    this.actionLabel,
    this.onAction,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return SizedBox.expand(
      child: EmptyStateView(
        icon:        icon,
        title:       title,
        subtitle:    subtitle,
        actionLabel: actionLabel,
        onAction:    onAction,
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  INLINE RETRY BANNER
//  Small banner shown inside a list when an
//  API fetch fails — non-destructive, dismissible.
//  Matches website's inline error toast style.
// ─────────────────────────────────────────────
class InlineRetryBanner extends StatelessWidget {
  const InlineRetryBanner({
    super.key,
    required this.message,
    required this.onRetry,
  });

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final t   = context.tokens;
    final msg = message.replaceFirst('Exception:', '').trim();
    return Container(
      margin:  const EdgeInsets.symmetric(vertical: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color:        t.destructiveSurface,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border:       Border.all(color: t.destructive.withValues(alpha: 0.3)),
      ),
      child: Row(children: [
        Icon(LucideIcons.wifiOff, color: t.destructive, size: 16),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            msg.length > 100 ? '${msg.substring(0, 100)}…' : msg,
            style: TextStyle(color: t.destructive, fontSize: 12, height: 1.5),
          ),
        ),
        const SizedBox(width: 8),
        GestureDetector(
          onTap: onRetry,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color:        t.destructive,
              borderRadius: BorderRadius.circular(AppRadius.full),
            ),
            child: Text(
              'Retry',
              style: const TextStyle(
                color:      Colors.white,
                fontSize:   11,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ),
      ]),
    ).animate().fadeIn(duration: 200.ms).slideY(begin: -0.04, end: 0);
  }
}

// ─────────────────────────────────────────────
//  SKELETON CARD PLACEHOLDER
//  Generic shimmer card — specify height.
// ─────────────────────────────────────────────
class SkeletonCard extends StatelessWidget {
  const SkeletonCard({
    super.key,
    this.height = 120,
    this.margin  = const EdgeInsets.only(bottom: 12),
  });

  final double height;
  final EdgeInsetsGeometry margin;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Container(
      height:  height,
      margin:  margin,
      decoration: BoxDecoration(
        color:        t.cardBg,
        borderRadius: BorderRadius.circular(AppRadius.x2l),
        border:       Border.all(color: t.cardBorder),
      ),
      child: ShimmerBox(height: height, borderRadius: AppRadius.x2l),
    );
  }
}

// ─────────────────────────────────────────────
//  SEARCH NO-RESULTS STATE
//  Compact empty state for filtered searches.
// ─────────────────────────────────────────────
class SearchNoResults extends StatelessWidget {
  const SearchNoResults({super.key, required this.query});
  final String query;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 32),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Icon(LucideIcons.searchX, size: 36, color: t.textMuted),
          const SizedBox(height: 16),
          Text(
            'No results for "$query"',
            textAlign: TextAlign.center,
            style: TextStyle(
              color:      t.textPrimary,
              fontSize:   15,
              fontWeight: FontWeight.w600,
              letterSpacing: -0.2,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Try different keywords or clear the search.',
            textAlign: TextAlign.center,
            style: TextStyle(color: t.textMuted, fontSize: 12, height: 1.5),
          ),
        ]).animate().fadeIn(duration: 250.ms),
      ),
    );
  }
}

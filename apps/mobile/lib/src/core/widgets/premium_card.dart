import 'dart:ui';
import 'package:flutter/material.dart';

import '../design/tokens.dart';

// ─────────────────────────────────────────────
//  PREMIUM CARD
//  Base card used everywhere in the app.
// ─────────────────────────────────────────────
class PremiumCard extends StatelessWidget {
  const PremiumCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(20),
    this.radius = AppRadius.xl,
    this.shadows = AppShadows.card,
    this.margin = EdgeInsets.zero,
    this.onTap,
    this.onLongPress,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final double radius;
  final List<BoxShadow> shadows;
  final EdgeInsetsGeometry margin;
  final VoidCallback? onTap;
  final VoidCallback? onLongPress;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return GestureDetector(
      onTap: onTap,
      onLongPress: onLongPress,
      child: Container(
        margin: margin,
        decoration: BoxDecoration(
          color:        t.cardBg,
          borderRadius: BorderRadius.circular(radius),
          border:       Border.all(color: t.cardBorder),
          boxShadow:    shadows,
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(radius),
          child: Stack(
            children: [
              // Sheen highlight — top 60dp glassy highlight
              Positioned(
                top: 0, left: 0, right: 0,
                child: Container(
                  height: 60,
                  decoration: BoxDecoration(
                    gradient: AppGradients.cardSheen,
                    borderRadius: BorderRadius.vertical(
                        top: Radius.circular(radius)),
                  ),
                ),
              ),
              // Content
              Padding(padding: padding, child: child),
            ],
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  GRADIENT CARD — hero / highlighted panels
// ─────────────────────────────────────────────
class GradientCard extends StatelessWidget {
  const GradientCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(24),
    this.radius = AppRadius.x3l,
    this.gradient,
    this.shadows = AppShadows.lg,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final double radius;
  final LinearGradient? gradient;
  final List<BoxShadow> shadows;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final grad = gradient ?? t.heroGradient;

    return Container(
      decoration: BoxDecoration(
        gradient:     grad,
        borderRadius: BorderRadius.circular(radius),
        boxShadow:    shadows,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(radius),
        child: Stack(
          children: [
            // Noise texture-like overlay using a semi-transparent
            // gradient to simulate grain at 4% opacity
            Positioned.fill(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: RadialGradient(
                    center: Alignment.topLeft,
                    radius: 2,
                    colors: [
                      Colors.white.withValues(alpha: 0.04),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),
            Padding(padding: padding, child: child),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  GLASS CARD — modals, overlays, floating UI
// ─────────────────────────────────────────────
class GlassCard extends StatelessWidget {
  const GlassCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.radius = AppRadius.xl,
    this.sigmaX = 16,
    this.sigmaY = 16,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final double radius;
  final double sigmaX;
  final double sigmaY;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark
        ? const Color(0xCC1C1C1C)
        : const Color(0xCCFFFFFF);
    final borderColor = isDark
        ? const Color(0x22FFFFFF)
        : const Color(0x33FFFFFF);

    return ClipRRect(
      borderRadius: BorderRadius.circular(radius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: sigmaX, sigmaY: sigmaY),
        child: Container(
          decoration: BoxDecoration(
            color:        bgColor,
            borderRadius: BorderRadius.circular(radius),
            border:       Border.all(color: borderColor),
            boxShadow:    AppShadows.xl,
          ),
          child: Padding(padding: padding, child: child),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  STATUS BADGE
// ─────────────────────────────────────────────
class StatusBadge extends StatelessWidget {
  const StatusBadge(this.status, {super.key});
  final String status;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final (bg, fg, border) = switch (status.toLowerCase()) {
      'active' || 'in progress' || 'in_progress' => (
          t.statusActiveBg, t.statusActiveFg, t.statusActiveBorder
        ),
      'paused' => (
          t.statusPausedBg, t.statusPausedFg, t.statusPausedBorder
        ),
      _ => (t.statusDraftBg, t.statusDraftFg, t.statusDraftBorder),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color:        bg,
        borderRadius: BorderRadius.circular(AppRadius.full),
        border:       Border.all(color: border),
      ),
      child: Text(
        status,
        style: TextStyle(
          color:       fg,
          fontSize:    11,
          fontWeight:  FontWeight.w700,
          letterSpacing: 0.2,
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  PRIORITY BADGE
// ─────────────────────────────────────────────
class PriorityBadge extends StatelessWidget {
  const PriorityBadge(this.priority, {super.key});
  final String priority;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final (bg, fg) = switch (priority.toLowerCase()) {
      'urgent' => (t.priorityUrgentBg, t.priorityUrgentFg),
      'high'   => (t.priorityHighBg,   t.priorityHighFg),
      'medium' => (t.priorityMedBg,    t.priorityMedFg),
      _        => (t.priorityLowBg,    t.priorityLowFg),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
      decoration: BoxDecoration(
        color:        bg,
        borderRadius: BorderRadius.circular(AppRadius.full),
      ),
      child: Text(
        priority.toUpperCase(),
        style: TextStyle(
          color:       fg,
          fontSize:    9,
          fontWeight:  FontWeight.w800,
          letterSpacing: 0.6,
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  CATEGORY CHIP — small inline label
// ─────────────────────────────────────────────
class CategoryChip extends StatelessWidget {
  const CategoryChip(this.label, {super.key, this.color});
  final String label;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final c = color ?? t.info;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color:        c.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(AppRadius.full),
      ),
      child: Text(
        label,
        style: TextStyle(
          color:      c,
          fontSize:   11,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  SECTION LABEL — uppercase spaced label
// ─────────────────────────────────────────────
class SectionLabel extends StatelessWidget {
  const SectionLabel(this.text, {super.key});
  final String text;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Text(
      text.toUpperCase(),
      style: TextStyle(
        color:       t.textMuted,
        fontSize:    10,
        fontWeight:  FontWeight.w700,
        letterSpacing: 1.2,
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  PREMIUM PROGRESS BAR — gradient fill
// ─────────────────────────────────────────────
class PremiumProgressBar extends StatelessWidget {
  const PremiumProgressBar({
    super.key,
    required this.value,
    this.height = 6,
    this.animate = true,
  });

  final double value; // 0.0 – 1.0
  final double height;
  final bool animate;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return ClipRRect(
      borderRadius: BorderRadius.circular(AppRadius.full),
      child: Container(
        height: height,
        color: t.backgroundSubtle,
        child: LayoutBuilder(
          builder: (_, constraints) {
            final targetWidth = constraints.maxWidth * value.clamp(0.0, 1.0);
            return TweenAnimationBuilder<double>(
              tween: Tween(begin: 0, end: targetWidth),
              duration: animate
                  ? const Duration(milliseconds: 800)
                  : Duration.zero,
              curve: Curves.easeOutCubic,
              builder: (_, w, __) => Align(
                alignment: Alignment.centerLeft,
                child: Container(
                  width: w,
                  height: height,
                  decoration: const BoxDecoration(
                    gradient: AppGradients.lifekit,
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  MESH BACKGROUND WIDGET
// ─────────────────────────────────────────────
class MeshBackground extends StatefulWidget {
  const MeshBackground({super.key, required this.child});
  final Widget child;

  @override
  State<MeshBackground> createState() => _MeshBackgroundState();
}

class _MeshBackgroundState extends State<MeshBackground>
    with TickerProviderStateMixin {
  late final AnimationController _ctrl1 = AnimationController(
    vsync: this,
    duration: const Duration(seconds: 8),
  )..repeat(reverse: true);

  late final AnimationController _ctrl2 = AnimationController(
    vsync: this,
    duration: const Duration(seconds: 10),
  )..repeat(reverse: true);

  @override
  void dispose() {
    _ctrl1.dispose();
    _ctrl2.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Stack(
      children: [
        // Base background
        Positioned.fill(child: ColoredBox(color: t.background)),
        // Blob 1 — top-right, translates 0→12dp X, 0→-8dp Y
        AnimatedBuilder(
          animation: _ctrl1,
          builder: (_, __) => Positioned.fill(
            child: Transform.translate(
              offset: Offset(12 * _ctrl1.value, -8 * _ctrl1.value),
              child: DecoratedBox(
                decoration: const BoxDecoration(
                  gradient: AppGradients.meshBlob1,
                ),
              ),
            ),
          ),
        ),
        // Blob 2 — bottom-left, translates 0→-8dp X, 0→10dp Y
        AnimatedBuilder(
          animation: _ctrl2,
          builder: (_, __) => Positioned.fill(
            child: Transform.translate(
              offset: Offset(-8 * _ctrl2.value, 10 * _ctrl2.value),
              child: DecoratedBox(
                decoration: const BoxDecoration(
                  gradient: AppGradients.meshBlob2,
                ),
              ),
            ),
          ),
        ),
        // Content on top
        widget.child,
      ],
    );
  }
}

import 'dart:ui';
import 'package:flutter/material.dart';

import '../design/tokens.dart';

// ─────────────────────────────────────────────
//  PREMIUM CARD
//  Base card — uses Level-1 elevation by default.
//  Elevates to Level-2 on press via PressScaleWidget.
// ─────────────────────────────────────────────
class PremiumCard extends StatefulWidget {
  const PremiumCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(20),
    this.radius = AppRadius.xl,
    this.shadows,           // null → use elevation1 for brightness
    this.margin = EdgeInsets.zero,
    this.onTap,
    this.onLongPress,
    this.topAccentColor,    // optional 2-px top border accent
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final double radius;
  final List<BoxShadow>? shadows;
  final EdgeInsetsGeometry margin;
  final VoidCallback? onTap;
  final VoidCallback? onLongPress;

  /// When set, draws a 2-px accent line along the top edge in this color.
  final Color? topAccentColor;

  @override
  State<PremiumCard> createState() => _PremiumCardState();
}

class _PremiumCardState extends State<PremiumCard> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final t         = context.tokens;
    final brightness = Theme.of(context).brightness;
    final shadows   = widget.shadows ??
        (_pressed
            ? AppElevation.level2(brightness)
            : AppElevation.level1(brightness));

    final card = AnimatedContainer(
      duration: const Duration(milliseconds: 150),
      margin:       widget.margin,
      decoration: BoxDecoration(
        color:        t.cardBg,
        borderRadius: BorderRadius.circular(widget.radius),
        border:       Border.all(color: t.cardBorder),
        boxShadow:    shadows,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(widget.radius),
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
                      top: Radius.circular(widget.radius)),
                ),
              ),
            ),
            // Top accent bar
            if (widget.topAccentColor != null)
              Positioned(
                top: 0, left: 0, right: 0,
                child: Container(
                  height: 2,
                  decoration: BoxDecoration(
                    color: widget.topAccentColor,
                    borderRadius: BorderRadius.vertical(
                        top: Radius.circular(widget.radius)),
                  ),
                ),
              ),
            // Content
            Padding(padding: widget.padding, child: widget.child),
          ],
        ),
      ),
    );

    if (widget.onTap == null && widget.onLongPress == null) return card;

    return GestureDetector(
      onTap:       widget.onTap,
      onLongPress: widget.onLongPress,
      onTapDown:   (_) => setState(() => _pressed = true),
      onTapUp:     (_) => setState(() => _pressed = false),
      onTapCancel: ()  => setState(() => _pressed = false),
      child: AnimatedScale(
        scale:    _pressed ? 0.97 : 1.0,
        duration: const Duration(milliseconds: 120),
        curve:    Curves.easeOut,
        child:    card,
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
    final t    = context.tokens;
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
            // Radial glow in the top-right corner for depth
            Positioned(
              top: -60, right: -60,
              child: SizedBox(
                width: 200, height: 200,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [
                        t.primary.withValues(alpha: 0.15),
                        Colors.transparent,
                      ],
                    ),
                  ),
                ),
              ),
            ),
            // Noise texture overlay (4 % white)
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
    final bgColor    = isDark
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
//  STATUS BADGE  (with soft glow)
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
        // Soft glow matching the badge's own color
        boxShadow: [
          BoxShadow(
            color:      fg.withValues(alpha: 0.20),
            blurRadius: 8,
            offset:     Offset.zero,
          ),
        ],
      ),
      child: Text(
        status,
        style: TextStyle(
          color:         fg,
          fontSize:      11,
          fontWeight:    FontWeight.w700,
          letterSpacing: 0.3,
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
        border: Border.all(color: fg.withValues(alpha: 0.25)),
      ),
      child: Text(
        priority.toUpperCase(),
        style: TextStyle(
          color:         fg,
          fontSize:      9,
          fontWeight:    FontWeight.w800,
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
        border:       Border.all(color: c.withValues(alpha: 0.25)),
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
        color:         t.textMuted,
        fontSize:      10,
        fontWeight:    FontWeight.w800,
        letterSpacing: 1.2,
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  SQUIRCLE ICON CONTAINER
//  Replaces plain square icon containers with a
//  continuous-curve squircle shape and tinted bg.
// ─────────────────────────────────────────────
class SquircleIcon extends StatelessWidget {
  const SquircleIcon({
    super.key,
    required this.icon,
    required this.color,
    required this.background,
    this.size = 48,
    this.iconSize = 22,
  });

  final IconData icon;
  final Color color;
  final Color background;
  final double size;
  final double iconSize;

  @override
  Widget build(BuildContext context) {
    // Simulate squircle via a high borderRadius (~40% of size)
    final radius = size * 0.38;
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color:        background,
        borderRadius: BorderRadius.circular(radius),
      ),
      child: Icon(icon, color: color, size: iconSize),
    );
  }
}

// ─────────────────────────────────────────────
//  PREMIUM PROGRESS BAR — gradient fill + spring
// ─────────────────────────────────────────────
class PremiumProgressBar extends StatelessWidget {
  const PremiumProgressBar({
    super.key,
    required this.value,
    this.height = 6,
    this.animate = true,
    this.color,           // override gradient start color
  });

  final double value;      // 0.0 – 1.0
  final double height;
  final bool animate;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final fillColor = color ?? t.primary;

    return ClipRRect(
      borderRadius: BorderRadius.circular(AppRadius.full),
      child: Container(
        height: height,
        color: t.backgroundSubtle,
        child: LayoutBuilder(
          builder: (_, constraints) {
            final targetWidth =
                constraints.maxWidth * value.clamp(0.0, 1.0);
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
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        fillColor,
                        fillColor.withValues(alpha: 0.6),
                      ],
                    ),
                    borderRadius:
                        BorderRadius.circular(AppRadius.full),
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
        // Blob 1 — Positioned.fill must be a direct Stack child.
        // AnimatedBuilder sits inside it, not the other way around.
        Positioned.fill(
          child: AnimatedBuilder(
            animation: _ctrl1,
            builder: (_, __) => Transform.translate(
              offset: Offset(12 * _ctrl1.value, -8 * _ctrl1.value),
              child: const DecoratedBox(
                decoration: BoxDecoration(
                  gradient: AppGradients.meshBlob1,
                ),
              ),
            ),
          ),
        ),
        // Blob 2
        Positioned.fill(
          child: AnimatedBuilder(
            animation: _ctrl2,
            builder: (_, __) => Transform.translate(
              offset: Offset(-8 * _ctrl2.value, 10 * _ctrl2.value),
              child: const DecoratedBox(
                decoration: BoxDecoration(
                  gradient: AppGradients.meshBlob2,
                ),
              ),
            ),
          ),
        ),
        widget.child,
      ],
    );
  }
}

// ─────────────────────────────────────────────
//  PULSING EMPTY-STATE ORB
//  72×72 circular container with radial gradient
//  background that gently pulses (scale 1.0 → 1.06).
// EmptyStateOrb — pulsing 72x72 circular container.
// Uses an explicit AnimationController so the repeating scale animation is
// safely stopped in dispose(). DO NOT use .animate(onPlay:) — flutter_animate
// creates an internal GlobalKey for onPlay which causes "Duplicate GlobalKey"
// crashes on rebuild.
class EmptyStateOrb extends StatefulWidget {
  const EmptyStateOrb({
    super.key,
    required this.icon,
    this.size = 72,
    this.iconSize = 32,
  });

  final IconData icon;
  final double size;
  final double iconSize;

  @override
  State<EmptyStateOrb> createState() => _EmptyStateOrbState();
}

class _EmptyStateOrbState extends State<EmptyStateOrb>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1800),
  )..repeat(reverse: true);

  late final Animation<double> _scale = Tween<double>(
    begin: 1.0,
    end:   1.06,
  ).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut));

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return AnimatedBuilder(
      animation: _scale,
      builder: (_, child) => Transform.scale(
        scale: _scale.value,
        child: child,
      ),
      child: Container(
        width: widget.size,
        height: widget.size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: RadialGradient(
            colors: [t.primarySurface, t.primarySurface.withValues(alpha: 0)],
          ),
          border: Border.all(
            color: t.primary.withValues(alpha: 0.18),
            width: 1.5,
          ),
        ),
        child: Icon(widget.icon, size: widget.iconSize, color: t.primary),
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  SHEET DRAG HANDLE  (reusable)
// ─────────────────────────────────────────────
class SheetHandle extends StatelessWidget {
  const SheetHandle({super.key});

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Center(
      child: Container(
        width: 40,
        height: 4,
        decoration: BoxDecoration(
          color:        t.border,
          borderRadius: BorderRadius.circular(AppRadius.full),
        ),
      ),
    );
  }
}

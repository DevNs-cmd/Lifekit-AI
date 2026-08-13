import 'dart:ui';
import 'package:flutter/material.dart';

import '../design/tokens.dart';

// ─────────────────────────────────────────────
//  PREMIUM CARD
//  Base card with:
//  • Level-1 elevation using primary-tinted shadows
//  • 3-layer sheen: glassy highlight + soft inner gradient
//  • Press: scale 0.97 + Level-2 shadow
//  • Optional 2px top accent bar
//  • Optional ambient green ambient glow via AppShadows.green
// ─────────────────────────────────────────────
class PremiumCard extends StatefulWidget {
  const PremiumCard({
    super.key,
    required this.child,
    this.padding      = const EdgeInsets.all(20),
    this.radius       = AppRadius.xl,
    this.shadows,
    this.margin       = EdgeInsets.zero,
    this.onTap,
    this.onLongPress,
    this.topAccentColor,
    this.glowColor,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final double radius;

  /// Override the shadow list. Defaults to brightness-aware elevation1.
  final List<BoxShadow>? shadows;
  final EdgeInsetsGeometry margin;
  final VoidCallback? onTap;
  final VoidCallback? onLongPress;

  /// Optional 2px accent line along the top edge.
  final Color? topAccentColor;

  /// Optional ambient glow color (used for highlighted cards).
  /// When set, an extra large blurred glow is added below the card.
  final Color? glowColor;

  @override
  State<PremiumCard> createState() => _PremiumCardState();
}

class _PremiumCardState extends State<PremiumCard> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final t          = context.tokens;
    final brightness = Theme.of(context).brightness;

    // Shadow logic: pressed → level2, normal → level1 (or custom)
    final shadows = widget.shadows ??
        (_pressed
            ? AppElevation.level2(brightness)
            : AppElevation.level1(brightness));

    // If a glowColor is provided, append an ambient spread shadow
    final effectiveShadows = widget.glowColor != null
        ? [
            ...shadows,
            BoxShadow(
              color:      widget.glowColor!.withValues(alpha: 0.18),
              blurRadius: 28,
              spreadRadius: 0,
              offset:     const Offset(0, 8),
            ),
          ]
        : shadows;

    final card = AnimatedContainer(
      duration: const Duration(milliseconds: 150),
      margin:   widget.margin,
      decoration: BoxDecoration(
        color:        t.cardBg,
        borderRadius: BorderRadius.circular(widget.radius),
        border: Border.all(
          color: _pressed && widget.onTap != null
              ? (widget.topAccentColor ?? t.primary).withValues(alpha: 0.35)
              : t.cardBorder,
        ),
        boxShadow: effectiveShadows,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(widget.radius),
        child: Stack(
          children: [
            // Layer 1: full card inner gradient (subtle top bloom)
            Positioned.fill(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(widget.radius),
                  gradient: LinearGradient(
                    begin:  Alignment.topCenter,
                    end:    Alignment.bottomCenter,
                    colors: [
                      t.primarySurface.withValues(alpha: 0.12),
                      Colors.transparent,
                    ],
                    stops: const [0.0, 0.55],
                  ),
                ),
              ),
            ),

            // Layer 2: glassy sheen — top 56dp highlight
            Positioned(
              top:   0,
              left:  0,
              right: 0,
              child: Container(
                height: 56,
                decoration: BoxDecoration(
                  gradient: AppGradients.cardSheen,
                  borderRadius: BorderRadius.vertical(
                    top: Radius.circular(widget.radius),
                  ),
                ),
              ),
            ),

            // Layer 3: top accent bar
            if (widget.topAccentColor != null)
              Positioned(
                top:   0,
                left:  0,
                right: 0,
                child: Container(
                  height: 2,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        widget.topAccentColor!,
                        widget.topAccentColor!.withValues(alpha: 0.5),
                      ],
                    ),
                    borderRadius: BorderRadius.vertical(
                      top: Radius.circular(widget.radius),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color:      widget.topAccentColor!.withValues(alpha: 0.4),
                        blurRadius: 6,
                        offset:     Offset.zero,
                      ),
                    ],
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
      onTapCancel: () => setState(() => _pressed = false),
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
//  GRADIENT CARD  — hero / highlighted panels
//  Matches website's `.marketing-story-hero`
//  and `.auth-brand-panel` gradient design.
// ─────────────────────────────────────────────
class GradientCard extends StatelessWidget {
  const GradientCard({
    super.key,
    required this.child,
    this.padding  = const EdgeInsets.all(24),
    this.radius   = AppRadius.x3l,
    this.gradient,
    this.shadows  = AppShadows.lg,
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
            // Radial glow in the top-right (matches website hero)
            Positioned(
              top:   -70,
              right: -70,
              child: Container(
                width:  220,
                height: 220,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      Colors.white.withValues(alpha: 0.12),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),
            // Dot-grid texture (matches website `.marketing-story-hero::after`)
            Positioned.fill(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: RadialGradient(
                    center: Alignment.topLeft,
                    radius: 2.2,
                    colors: [
                      Colors.white.withValues(alpha: 0.06),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),
            // Bottom-left warm orb (matches website accent gradient)
            Positioned(
              bottom: -40,
              left:   -40,
              child: Container(
                width:  140,
                height: 140,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      t.accent.withValues(alpha: 0.18),
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
//  GLASS CARD  — modals, overlays, floating UI
//  Matches website's `.glass` utility class.
// ─────────────────────────────────────────────
class GlassCard extends StatelessWidget {
  const GlassCard({
    super.key,
    required this.child,
    this.padding  = const EdgeInsets.all(16),
    this.radius   = AppRadius.xl,
    this.sigmaX   = 16,
    this.sigmaY   = 16,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final double radius;
  final double sigmaX;
  final double sigmaY;

  @override
  Widget build(BuildContext context) {
    final isDark    = Theme.of(context).brightness == Brightness.dark;
    final bgColor   = isDark ? const Color(0xCC1C1C1C) : const Color(0xCCFFFFFF);
    final bordColor = isDark ? const Color(0x22FFFFFF) : const Color(0x40FFFFFF);

    return ClipRRect(
      borderRadius: BorderRadius.circular(radius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: sigmaX, sigmaY: sigmaY),
        child: Container(
          decoration: BoxDecoration(
            color:        bgColor,
            borderRadius: BorderRadius.circular(radius),
            border:       Border.all(color: bordColor),
            boxShadow:    AppShadows.xl,
          ),
          child: Padding(padding: padding, child: child),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  STATUS BADGE  (with soft glow dot)
// ─────────────────────────────────────────────
class StatusBadge extends StatelessWidget {
  const StatusBadge(this.status, {super.key});
  final String status;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final (bg, fg, border) = switch (status.toLowerCase()) {
      'active' || 'in progress' || 'in_progress' => (
          t.statusActiveBg,
          t.statusActiveFg,
          t.statusActiveBorder,
        ),
      'paused' => (t.statusPausedBg, t.statusPausedFg, t.statusPausedBorder),
      _ => (t.statusDraftBg, t.statusDraftFg, t.statusDraftBorder),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color:        bg,
        borderRadius: BorderRadius.circular(AppRadius.full),
        border:       Border.all(color: border),
        boxShadow: [
          BoxShadow(
            color:      fg.withValues(alpha: 0.18),
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
//  CATEGORY CHIP  — inline label
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
        color:        c.withValues(alpha: 0.1),
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
//  SECTION LABEL  — uppercase spaced label
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
//  Continuous-curve squircle with tinted bg.
// ─────────────────────────────────────────────
class SquircleIcon extends StatelessWidget {
  const SquircleIcon({
    super.key,
    required this.icon,
    required this.color,
    required this.background,
    this.size     = 48,
    this.iconSize = 22,
  });

  final IconData icon;
  final Color color;
  final Color background;
  final double size;
  final double iconSize;

  @override
  Widget build(BuildContext context) {
    final radius = size * 0.38;
    return Container(
      width:  size,
      height: size,
      decoration: BoxDecoration(
        color:        background,
        borderRadius: BorderRadius.circular(radius),
        boxShadow: [
          BoxShadow(
            color:      color.withValues(alpha: 0.15),
            blurRadius: 8,
            offset:     const Offset(0, 2),
          ),
        ],
      ),
      child: Icon(icon, color: color, size: iconSize),
    );
  }
}

// ─────────────────────────────────────────────
//  PREMIUM PROGRESS BAR  — gradient fill + spring
// ─────────────────────────────────────────────
class PremiumProgressBar extends StatelessWidget {
  const PremiumProgressBar({
    super.key,
    required this.value,
    this.height  = 6,
    this.animate = true,
    this.color,
  });

  final double value;
  final double height;
  final bool animate;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final t         = context.tokens;
    final fillColor = color ?? t.primary;

    return ClipRRect(
      borderRadius: BorderRadius.circular(AppRadius.full),
      child: Container(
        height: height,
        color:  t.backgroundSubtle,
        child:  LayoutBuilder(
          builder: (_, constraints) {
            final targetWidth =
                constraints.maxWidth * value.clamp(0.0, 1.0);
            return TweenAnimationBuilder<double>(
              tween:    Tween(begin: 0, end: targetWidth),
              duration: animate
                  ? const Duration(milliseconds: 900)
                  : Duration.zero,
              curve: Curves.easeOutCubic,
              builder: (_, w, __) => Stack(
                children: [
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Container(
                      width:  w,
                      height: height,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            fillColor,
                            fillColor.withValues(alpha: 0.55),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(AppRadius.full),
                      ),
                    ),
                  ),
                  // Sheen highlight
                  if (w > 8)
                    Positioned(
                      left:  0,
                      top:   0,
                      width: w,
                      height: height,
                      child: DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin:  Alignment.topCenter,
                            end:    Alignment.bottomCenter,
                            colors: [
                              Colors.white.withValues(alpha: 0.18),
                              Colors.transparent,
                            ],
                          ),
                          borderRadius:
                              BorderRadius.circular(AppRadius.full),
                        ),
                      ),
                    ),
                ],
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
//  Animated radial blobs mimicking the website's
//  `.app-canvas` layered radial-gradient design.
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
    vsync:    this,
    duration: const Duration(seconds: 9),
  )..repeat(reverse: true);

  late final AnimationController _ctrl2 = AnimationController(
    vsync:    this,
    duration: const Duration(seconds: 12),
  )..repeat(reverse: true);

  late final AnimationController _ctrl3 = AnimationController(
    vsync:    this,
    duration: const Duration(seconds: 15),
  )..repeat(reverse: true);

  @override
  void dispose() {
    _ctrl1.dispose();
    _ctrl2.dispose();
    _ctrl3.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Stack(
      children: [
        // Base background
        Positioned.fill(child: ColoredBox(color: t.background)),

        // Blob 1 — top-right primary green
        Positioned.fill(
          child: AnimatedBuilder(
            animation: _ctrl1,
            builder: (_, __) => Transform.translate(
              offset: Offset(14 * _ctrl1.value, -10 * _ctrl1.value),
              child: const DecoratedBox(
                decoration: BoxDecoration(
                  gradient: AppGradients.meshBlob1,
                ),
              ),
            ),
          ),
        ),

        // Blob 2 — bottom-left warm accent
        Positioned.fill(
          child: AnimatedBuilder(
            animation: _ctrl2,
            builder: (_, __) => Transform.translate(
              offset: Offset(-10 * _ctrl2.value, 12 * _ctrl2.value),
              child: const DecoratedBox(
                decoration: BoxDecoration(
                  gradient: AppGradients.meshBlob2,
                ),
              ),
            ),
          ),
        ),

        // Blob 3 — centre subtle top bloom (matches website `ambient-drift`)
        Positioned.fill(
          child: AnimatedBuilder(
            animation: _ctrl3,
            builder: (_, __) => Transform.translate(
              offset: Offset(6 * _ctrl3.value, -6 * _ctrl3.value),
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: RadialGradient(
                    center: const Alignment(0.1, -0.6),
                    radius: 0.8,
                    colors: [
                      t.primary.withValues(alpha: 0.06),
                      Colors.transparent,
                    ],
                  ),
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
//  Gently pulses scale 1.0 → 1.06.
//  Uses explicit AnimationController.
// ─────────────────────────────────────────────
class EmptyStateOrb extends StatefulWidget {
  const EmptyStateOrb({
    super.key,
    required this.icon,
    this.size     = 72,
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
    vsync:    this,
    duration: const Duration(milliseconds: 1800),
  )..repeat(reverse: true);

  late final Animation<double> _scale = Tween<double>(
    begin: 1.0,
    end:   1.07,
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
        width:  widget.size,
        height: widget.size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: RadialGradient(
            colors: [
              t.primarySurface,
              t.primarySurface.withValues(alpha: 0),
            ],
          ),
          border: Border.all(
            color: t.primary.withValues(alpha: 0.2),
            width: 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color:      t.primary.withValues(alpha: 0.12),
              blurRadius: 18,
              spreadRadius: 2,
            ),
          ],
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
        width:  40,
        height: 4,
        decoration: BoxDecoration(
          color:        t.border,
          borderRadius: BorderRadius.circular(AppRadius.full),
        ),
      ),
    );
  }
}

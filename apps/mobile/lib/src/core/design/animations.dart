import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

// ─────────────────────────────────────────────
//  DURATION CONSTANTS
// ─────────────────────────────────────────────
abstract final class AppDurations {
  static const Duration micro    = Duration(milliseconds: 100);
  static const Duration fast     = Duration(milliseconds: 180);
  static const Duration normal   = Duration(milliseconds: 280);
  static const Duration medium   = Duration(milliseconds: 320);
  static const Duration slow     = Duration(milliseconds: 400);
  static const Duration verySlow = Duration(milliseconds: 600);
  static const Duration counter  = Duration(milliseconds: 900);
  static const Duration blob     = Duration(seconds: 8);
}

// ─────────────────────────────────────────────
//  ENTRANCE ANIMATION EXTENSIONS
// ─────────────────────────────────────────────

/// Standard page entrance: fade + subtle slide-up.
/// Matches website's `slide-up-fade` CSS animation.
extension PageEntranceAnimExt on Widget {
  Widget pageEntrance({Duration delay = Duration.zero}) =>
      animate(delay: delay)
          .fadeIn(duration: AppDurations.normal, curve: Curves.easeOut)
          .slideY(
            begin: 0.04,
            end:   0,
            duration: AppDurations.normal,
            curve:    Curves.easeOut,
          );
}

/// Staggered list item: (n × 55ms) delay, capped at 360ms.
/// Matches website's `nth-child` stagger animation delays.
extension StaggeredListAnimExt on Widget {
  Widget staggered(int index) {
    final delay = Duration(milliseconds: (index * 55).clamp(0, 360));
    return animate(delay: delay)
        .fadeIn(duration: 280.ms, curve: Curves.easeOut)
        .slideY(
          begin:    0.06,
          end:      0,
          duration: 280.ms,
          curve:    Curves.easeOutCubic,
        );
  }
}

/// Hero card entrance: fade + scale from 97% → 100%.
/// Matches website's `scale-in` CSS animation.
extension HeroCardAnimExt on Widget {
  Widget heroEntrance({Duration delay = Duration.zero}) =>
      animate(delay: delay)
          .fadeIn(duration: AppDurations.slow, curve: Curves.easeOut)
          .scale(
            begin:    const Offset(0.97, 0.97),
            end:      const Offset(1.0, 1.0),
            duration: AppDurations.slow,
            curve:    Curves.easeOutCubic,
          );
}

/// Pop entrance for badges and completion indicators.
/// Matches website's `badge-pop` / `celebrate-pop` CSS keyframes.
extension PopEntranceAnimExt on Widget {
  Widget popEntrance({Duration delay = Duration.zero}) =>
      animate(delay: delay)
          .fadeIn(duration: 200.ms)
          .scale(
            begin:    const Offset(0.7, 0.7),
            end:      const Offset(1.0, 1.0),
            duration: 300.ms,
            curve:    Curves.elasticOut,
          );
}

/// Slide in from trailing edge (used by action sheets / side panels).
extension SlideInTrailingExt on Widget {
  Widget slideInTrailing({Duration delay = Duration.zero}) =>
      animate(delay: delay)
          .fadeIn(duration: AppDurations.normal)
          .slideX(
            begin:    0.12,
            end:      0,
            duration: AppDurations.normal,
            curve:    Curves.easeOutCubic,
          );
}

/// Shimmer reveal — used on skeleton → real content transitions.
extension ShimmerRevealExt on Widget {
  Widget shimmerReveal({Duration delay = Duration.zero}) =>
      animate(delay: delay)
          .fadeIn(duration: AppDurations.slow, curve: Curves.easeOut)
          .scale(
            begin:    const Offset(0.98, 0.98),
            end:      const Offset(1.0, 1.0),
            duration: AppDurations.slow,
            curve:    Curves.easeOutCubic,
          );
}

// ─────────────────────────────────────────────
//  METRIC COUNTER WIDGET
//  Animates 0 → value with easeOutExpo curve.
//  Matches website's animated number roll.
// ─────────────────────────────────────────────
class AnimatedMetric extends StatelessWidget {
  const AnimatedMetric({
    super.key,
    required this.value,
    required this.style,
    this.suffix         = '',
    this.prefix         = '',
    this.fractionDigits = 0,
  });

  final double value;
  final TextStyle style;
  final String suffix;
  final String prefix;
  final int fractionDigits;

  @override
  Widget build(BuildContext context) => TweenAnimationBuilder<double>(
        tween:    Tween(begin: 0, end: value),
        duration: AppDurations.counter,
        curve:    Curves.easeOutExpo,
        builder:  (_, v, __) => Text(
          '$prefix${v.toStringAsFixed(fractionDigits)}$suffix',
          style: style,
        ),
      );
}

// ─────────────────────────────────────────────
//  PRESS-SCALE WIDGET
//  Tactile shrink (scale 0.96) on tap-down,
//  spring-back on release.
// ─────────────────────────────────────────────
class PressScaleWidget extends StatefulWidget {
  const PressScaleWidget({
    super.key,
    required this.child,
    required this.onTap,
    this.scaleFactor = 0.96,
  });

  final Widget child;
  final VoidCallback? onTap;
  final double scaleFactor;

  @override
  State<PressScaleWidget> createState() => _PressScaleWidgetState();
}

class _PressScaleWidgetState extends State<PressScaleWidget>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl = AnimationController(
    vsync:           this,
    duration:        AppDurations.micro,
    reverseDuration: const Duration(milliseconds: 220),
    lowerBound:      0.0,
    upperBound:      1.0,
    value:           0.0,
  );

  late final Animation<double> _scale = Tween<double>(
    begin: 1.0,
    end:   widget.scaleFactor,
  ).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOut));

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => GestureDetector(
        behavior:   HitTestBehavior.opaque,
        onTapDown:  (_) => _ctrl.forward(),
        onTapUp:    (_) {
          _ctrl.reverse();
          widget.onTap?.call();
        },
        onTapCancel: () => _ctrl.reverse(),
        child: AnimatedBuilder(
          animation: _scale,
          builder:   (_, child) => Transform.scale(
            scale: _scale.value,
            child: child,
          ),
          child: widget.child,
        ),
      );
}

// ─────────────────────────────────────────────
//  BOUNCING DOTS LOADER
//  Three dots that bounce in staggered sequence.
// ─────────────────────────────────────────────
class BouncingDots extends StatelessWidget {
  const BouncingDots({super.key, required this.color, this.size = 7});
  final Color color;
  final double size;

  @override
  Widget build(BuildContext context) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _Dot(color: color, size: size, delay: Duration.zero),
          SizedBox(width: size * 0.7),
          _Dot(color: color, size: size, delay: const Duration(milliseconds: 160)),
          SizedBox(width: size * 0.7),
          _Dot(color: color, size: size, delay: const Duration(milliseconds: 320)),
        ],
      );
}

class _Dot extends StatefulWidget {
  const _Dot({required this.color, required this.size, required this.delay});
  final Color color;
  final double size;
  final Duration delay;

  @override
  State<_Dot> createState() => _DotState();
}

class _DotState extends State<_Dot> with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl = AnimationController(
    vsync:    this,
    duration: const Duration(milliseconds: 400),
  );
  late final Animation<double> _anim = Tween<double>(begin: 0, end: 1).animate(
    CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut),
  );

  @override
  void initState() {
    super.initState();
    Future.delayed(widget.delay, () {
      if (mounted) _ctrl.repeat(reverse: true);
    });
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => AnimatedBuilder(
        animation: _anim,
        builder:   (_, __) => Transform.translate(
          offset: Offset(0, -widget.size * 1.14 * _anim.value),
          child:  Container(
            width:  widget.size,
            height: widget.size,
            decoration: BoxDecoration(
              color: widget.color,
              shape: BoxShape.circle,
            ),
          ),
        ),
      );
}

// ─────────────────────────────────────────────
//  PULSE GLOW WRAPPER
//  Gently pulses opacity 0.6 → 1.0.
//  Used on AI Coach avatar and active indicators.
// ─────────────────────────────────────────────
class PulseGlow extends StatefulWidget {
  const PulseGlow({super.key, required this.child});
  final Widget child;

  @override
  State<PulseGlow> createState() => _PulseGlowState();
}

class _PulseGlowState extends State<PulseGlow>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl = AnimationController(
    vsync:    this,
    duration: const Duration(milliseconds: 1200),
  )..repeat(reverse: true);

  late final Animation<double> _opacity = Tween<double>(
    begin: 0.65,
    end:   1.0,
  ).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut));

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => AnimatedBuilder(
        animation: _opacity,
        builder:   (_, child) => Opacity(opacity: _opacity.value, child: child),
        child:     widget.child,
      );
}

// ─────────────────────────────────────────────
//  SHIMMER BOX
//  Self-contained shimmer skeleton element.
//  Uses explicit AnimationController — never
//  .animate(onPlay:) to avoid GlobalKey issues.
// ─────────────────────────────────────────────
class ShimmerBox extends StatefulWidget {
  const ShimmerBox({
    super.key,
    this.width,
    required this.height,
    this.borderRadius = 8,
  });
  final double? width;
  final double height;
  final double borderRadius;

  @override
  State<ShimmerBox> createState() => _ShimmerBoxState();
}

class _ShimmerBoxState extends State<ShimmerBox>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl = AnimationController(
    vsync:    this,
    duration: const Duration(milliseconds: 1200),
  )..repeat();

  late final Animation<double> _anim =
      Tween<double>(begin: -2.0, end: 2.0).animate(
    CurvedAnimation(parent: _ctrl, curve: Curves.linear),
  );

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final base   = isDark ? const Color(0xFF2A2A2A) : const Color(0xFFEEEEEE);
    final shine  = isDark ? const Color(0xFF3A3A3A) : const Color(0xFFF8F8F8);

    return AnimatedBuilder(
      animation: _anim,
      builder:   (_, __) => Container(
        width:  widget.width,
        height: widget.height,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(widget.borderRadius),
          gradient: LinearGradient(
            begin:  Alignment(_anim.value - 1, 0),
            end:    Alignment(_anim.value, 0),
            colors: [base, shine, base],
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  AMBIENT ORBIT ANIMATION
//  A slow rotation used behind hero sections.
//  Matches website's ambient-drift keyframe.
// ─────────────────────────────────────────────
class AmbientOrbit extends StatefulWidget {
  const AmbientOrbit({super.key, required this.child, this.duration});
  final Widget child;
  final Duration? duration;

  @override
  State<AmbientOrbit> createState() => _AmbientOrbitState();
}

class _AmbientOrbitState extends State<AmbientOrbit>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl = AnimationController(
    vsync:    this,
    duration: widget.duration ?? const Duration(seconds: 12),
  )..repeat();

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => RotationTransition(
        turns: _ctrl,
        child: widget.child,
      );
}

// ─────────────────────────────────────────────
//  STAGGERED COLUMN
//  Convenience widget that applies staggered
//  entrance animations to a list of children.
// ─────────────────────────────────────────────
class StaggeredColumn extends StatelessWidget {
  const StaggeredColumn({
    super.key,
    required this.children,
    this.crossAxisAlignment = CrossAxisAlignment.start,
    this.mainAxisSize       = MainAxisSize.min,
    this.gap                = 0.0,
    this.initialDelay       = Duration.zero,
    this.stepDelay          = const Duration(milliseconds: 55),
  });

  final List<Widget> children;
  final CrossAxisAlignment crossAxisAlignment;
  final MainAxisSize mainAxisSize;
  final double gap;
  final Duration initialDelay;
  final Duration stepDelay;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: crossAxisAlignment,
      mainAxisSize:       mainAxisSize,
      children: children.indexed.expand((item) {
        final delay =
            Duration(milliseconds: initialDelay.inMilliseconds + item.$1 * stepDelay.inMilliseconds);
        final animated = item.$2
            .animate(delay: delay)
            .fadeIn(duration: 280.ms, curve: Curves.easeOut)
            .slideY(begin: 0.06, end: 0, duration: 280.ms, curve: Curves.easeOutCubic);
        if (gap > 0 && item.$1 < children.length - 1) {
          return [animated, SizedBox(height: gap)];
        }
        return [animated];
      }).toList(),
    );
  }
}

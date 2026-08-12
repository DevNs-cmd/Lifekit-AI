import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

// ─────────────────────────────────────────────
//  DURATION CONSTANTS
// ─────────────────────────────────────────────
abstract final class AppDurations {
  static const Duration micro     = Duration(milliseconds: 100);
  static const Duration fast      = Duration(milliseconds: 180);
  static const Duration normal    = Duration(milliseconds: 280);
  static const Duration medium    = Duration(milliseconds: 320);
  static const Duration slow      = Duration(milliseconds: 400);
  static const Duration verySlow  = Duration(milliseconds: 600);
  static const Duration counter   = Duration(milliseconds: 900);
  static const Duration blob      = Duration(seconds: 8);
}

// ─────────────────────────────────────────────
//  ENTRANCE ANIMATION EXTENSIONS
// ─────────────────────────────────────────────

/// Applies the standard page entrance: fade + subtle slide-up.
extension PageEntranceAnimExt on Widget {
  Widget pageEntrance({Duration delay = Duration.zero}) =>
      animate(delay: delay)
          .fadeIn(duration: AppDurations.normal, curve: Curves.easeOut)
          .slideY(
            begin: 0.04,
            end: 0,
            duration: AppDurations.normal,
            curve: Curves.easeOut,
          );
}

/// Staggered list item: nth child gets (n * 60ms) delay, capped at 360ms.
extension StaggeredListAnimExt on Widget {
  Widget staggered(int index) {
    final delay = Duration(milliseconds: (index * 60).clamp(0, 360));
    return animate(delay: delay)
        .fadeIn(duration: 280.ms)
        .slideY(begin: 0.06, end: 0, duration: 280.ms);
  }
}

/// Hero card entrance: fade + subtle scale from 97 % → 100 %.
extension HeroCardAnimExt on Widget {
  Widget heroEntrance({Duration delay = Duration.zero}) =>
      animate(delay: delay)
          .fadeIn(duration: AppDurations.slow)
          .scale(
            begin: const Offset(0.97, 0.97),
            end: const Offset(1.0, 1.0),
            duration: AppDurations.slow,
            curve: Curves.easeOutCubic,
          );
}

// ─────────────────────────────────────────────
//  METRIC COUNTER WIDGET
// ─────────────────────────────────────────────

/// Animates a numeric value from 0 → [value] with an easeOutExpo curve.
class AnimatedMetric extends StatelessWidget {
  const AnimatedMetric({
    super.key,
    required this.value,
    required this.style,
    this.suffix = '',
    this.prefix = '',
    this.fractionDigits = 0,
  });

  final double value;
  final TextStyle style;
  final String suffix;
  final String prefix;
  final int fractionDigits;

  @override
  Widget build(BuildContext context) => TweenAnimationBuilder<double>(
        tween: Tween(begin: 0, end: value),
        duration: AppDurations.counter,
        curve: Curves.easeOutExpo,
        builder: (_, v, __) => Text(
          '$prefix${v.toStringAsFixed(fractionDigits)}$suffix',
          style: style,
        ),
      );
}

// ─────────────────────────────────────────────
//  PRESS-SCALE WIDGET — button micro-interaction
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
    vsync: this,
    duration: AppDurations.micro,
    reverseDuration: const Duration(milliseconds: 200),
    lowerBound: 0.0,
    upperBound: 1.0,
    value: 0.0,
  );

  late final Animation<double> _scale = Tween<double>(
    begin: 1.0,
    end: widget.scaleFactor,
  ).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOut));

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTapDown: (_) => _ctrl.forward(),
        onTapUp: (_) {
          _ctrl.reverse();
          widget.onTap?.call();
        },
        onTapCancel: () => _ctrl.reverse(),
        child: AnimatedBuilder(
          animation: _scale,
          builder: (_, child) => Transform.scale(
            scale: _scale.value,
            child: child,
          ),
          child: widget.child,
        ),
      );
}

// ─────────────────────────────────────────────
//  BOUNCING DOTS LOADER
//  Uses an explicit AnimationController so the
//  animation is properly stopped in dispose()
//  and never fires on a deactivated element.
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
    vsync: this,
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
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _anim,
      builder: (_, __) => Transform.translate(
        offset: Offset(0, -widget.size * 1.14 * _anim.value),
        child: Container(
          width: widget.size,
          height: widget.size,
          decoration: BoxDecoration(
            color: widget.color,
            shape: BoxShape.circle,
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  PULSE GLOW ANIMATION WRAPPER
//  Uses an explicit AnimationController so the
//  animation is properly stopped in dispose()
//  and never fires on a deactivated element.
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
    vsync: this,
    duration: const Duration(milliseconds: 1200),
  )..repeat(reverse: true);

  late final Animation<double> _opacity = Tween<double>(
    begin: 0.6,
    end: 1.0,
  ).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut));

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => AnimatedBuilder(
        animation: _opacity,
        builder: (_, child) => Opacity(
          opacity: _opacity.value,
          child: child,
        ),
        child: widget.child,
      );
}

// ─────────────────────────────────────────────
//  SHIMMER SKELETON HELPER
// ─────────────────────────────────────────────
class ShimmerBox extends StatelessWidget {
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
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF2A2A2A) : const Color(0xFFEEEEEE),
        borderRadius: BorderRadius.circular(borderRadius),
      ),
    )
        .animate(onPlay: (c) => c.repeat())
        .shimmer(
          duration: 1200.ms,
          color: isDark ? const Color(0xFF3A3A3A) : const Color(0xFFF8F8F8),
        );
  }
}

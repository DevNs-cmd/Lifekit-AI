import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../design/tokens.dart';
import '../design/animations.dart';

// ─────────────────────────────────────────────
//  NAV ITEM DESCRIPTOR
// ─────────────────────────────────────────────
class NavItem {
  const NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    this.isCenter = false,
  });
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final bool isCenter;
}

const List<NavItem> kNavItems = [
  NavItem(icon: LucideIcons.house,        activeIcon: LucideIcons.house,       label: 'Home'),
  NavItem(icon: LucideIcons.target,       activeIcon: LucideIcons.target,      label: 'Missions'),
  NavItem(icon: LucideIcons.bot,          activeIcon: LucideIcons.bot,         label: 'AI Coach', isCenter: true),
  NavItem(icon: LucideIcons.squareCheck,  activeIcon: LucideIcons.checkSquare, label: 'Tasks'),
  NavItem(icon: LucideIcons.user,         activeIcon: LucideIcons.userCheck,   label: 'Profile'),
];

// ─────────────────────────────────────────────
//  PREMIUM BOTTOM NAV BAR
//  • Full glassmorphism surface
//  • Active tab: pill indicator with green glow
//  • Center AI Coach tab: elevated floating FAB
//  • Press tactile: scale 0.95 on tap-down
//  • Entrance: slides up with fade
// ─────────────────────────────────────────────
class PremiumBottomNav extends StatefulWidget {
  const PremiumBottomNav({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  final int currentIndex;
  final ValueChanged<int> onTap;

  @override
  State<PremiumBottomNav> createState() => _PremiumBottomNavState();
}

class _PremiumBottomNavState extends State<PremiumBottomNav>
    with TickerProviderStateMixin {
  // Per-tab press controllers
  late final List<AnimationController> _pressCtrl = List.generate(
    kNavItems.length,
    (_) => AnimationController(
      vsync:           this,
      duration:        const Duration(milliseconds: 90),
      reverseDuration: const Duration(milliseconds: 200),
      lowerBound:      0.0,
      upperBound:      1.0,
    ),
  );

  // Center FAB pulse
  late final AnimationController _fabPulse = AnimationController(
    vsync:    this,
    duration: const Duration(milliseconds: 220),
    lowerBound: 0.0,
    upperBound: 1.0,
  );

  @override
  void dispose() {
    for (final c in _pressCtrl) {
      c.dispose();
    }
    _fabPulse.dispose();
    super.dispose();
  }

  void _handleTap(int index) {
    if (index == 2) {
      _fabPulse.forward().then((_) => _fabPulse.reverse());
    } else {
      _pressCtrl[index].forward().then((_) => _pressCtrl[index].reverse());
    }
    widget.onTap(index);
  }

  @override
  Widget build(BuildContext context) {
    final t         = context.tokens;
    final bottomPad = MediaQuery.of(context).padding.bottom;
    final brightness = Theme.of(context).brightness;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Gradient fade above bar
        IgnorePointer(
          child: Container(
            height: 20,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin:  Alignment.topCenter,
                end:    Alignment.bottomCenter,
                colors: [
                  t.background.withValues(alpha: 0),
                  t.background,
                ],
              ),
            ),
          ),
        ),

        // Glassmorphism bar
        ClipRect(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
            child: Container(
              height: 72 + bottomPad,
              decoration: BoxDecoration(
                color: brightness == Brightness.dark
                    ? t.surface.withValues(alpha: 0.88)
                    : t.surface.withValues(alpha: 0.94),
                border: Border(
                  top: BorderSide(
                    color: t.border.withValues(alpha: 0.8),
                    width: 0.5,
                  ),
                ),
                boxShadow: [
                  BoxShadow(
                    color:      t.primary.withValues(alpha: 0.04),
                    blurRadius: 24,
                    offset:     const Offset(0, -4),
                  ),
                ],
              ),
              child: Padding(
                padding: EdgeInsets.only(bottom: bottomPad),
                child: Row(
                  children: List.generate(kNavItems.length, (i) {
                    final item     = kNavItems[i];
                    final isActive = widget.currentIndex == i;

                    if (item.isCenter) {
                      return Expanded(
                        child: _CenterTab(
                          isActive:  isActive,
                          pulseCtrl: _fabPulse,
                          onTap:     () => _handleTap(i),
                          tokens:    t,
                        ),
                      );
                    }

                    return Expanded(
                      child: _RegularTab(
                        item:      item,
                        isActive:  isActive,
                        pressCtrl: _pressCtrl[i],
                        onTap:     () => _handleTap(i),
                        tokens:    t,
                      ),
                    );
                  }),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────
//  REGULAR TAB
// ─────────────────────────────────────────────
class _RegularTab extends StatelessWidget {
  const _RegularTab({
    required this.item,
    required this.isActive,
    required this.pressCtrl,
    required this.onTap,
    required this.tokens,
  });

  final NavItem item;
  final bool isActive;
  final AnimationController pressCtrl;
  final VoidCallback onTap;
  final AppTokens tokens;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTapDown: (_) => pressCtrl.forward(),
      onTapUp: (_) {
        pressCtrl.reverse();
        onTap();
      },
      onTapCancel: () => pressCtrl.reverse(),
      child: AnimatedBuilder(
        animation: pressCtrl,
        builder: (_, child) => Transform.scale(
          scale: 1.0 - 0.05 * pressCtrl.value,
          child: child,
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // ── Active pill indicator ──────────────────────
            AnimatedContainer(
              duration: AppDurations.fast,
              curve:    Curves.easeOutCubic,
              width:    isActive ? 44 : 0,
              height:   30,
              decoration: isActive
                  ? BoxDecoration(
                      color:        tokens.primarySurface,
                      borderRadius: BorderRadius.circular(AppRadius.full),
                      boxShadow: [
                        BoxShadow(
                          color:      tokens.primary.withValues(alpha: 0.25),
                          blurRadius: 10,
                          offset:     const Offset(0, 2),
                        ),
                      ],
                    )
                  : null,
              child: Center(
                child: Icon(
                  isActive ? item.activeIcon : item.icon,
                  size:  isActive ? 18 : 22,
                  color: isActive ? tokens.primary : tokens.textMuted,
                ),
              ),
            ),
            if (!isActive)
              const SizedBox(height: 30, child: SizedBox.shrink()),
            const SizedBox(height: 3),

            // ── Label ──────────────────────────────────────
            AnimatedDefaultTextStyle(
              duration: AppDurations.fast,
              style: TextStyle(
                fontSize:      isActive ? 10 : 10,
                fontWeight:    isActive ? FontWeight.w700 : FontWeight.w500,
                letterSpacing: isActive ? 0.2 : 0.3,
                color: isActive ? tokens.primary : tokens.textMuted,
              ),
              child: Text(item.label),
            ),

            // ── Active dot ─────────────────────────────────
            const SizedBox(height: 2),
            AnimatedContainer(
              duration: AppDurations.fast,
              width:    isActive ? 4 : 0,
              height:   isActive ? 4 : 0,
              decoration: BoxDecoration(
                color:  tokens.primary,
                shape:  BoxShape.circle,
                boxShadow: isActive
                    ? [
                        BoxShadow(
                          color:      tokens.primary.withValues(alpha: 0.6),
                          blurRadius: 4,
                        ),
                      ]
                    : null,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  CENTER TAB — AI Coach floating FAB
// ─────────────────────────────────────────────
class _CenterTab extends StatelessWidget {
  const _CenterTab({
    required this.isActive,
    required this.pulseCtrl,
    required this.onTap,
    required this.tokens,
  });

  final bool isActive;
  final AnimationController pulseCtrl;
  final VoidCallback onTap;
  final AppTokens tokens;

  @override
  Widget build(BuildContext context) {
    final scaleAnim = Tween<double>(begin: 1.0, end: 1.14).animate(
      CurvedAnimation(parent: pulseCtrl, curve: Curves.easeOut),
    );

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap:    onTap,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          // Elevated FAB — floats 8dp above the bar baseline
          Transform.translate(
            offset: const Offset(0, -8),
            child:  AnimatedBuilder(
              animation: scaleAnim,
              builder:   (_, child) => Transform.scale(
                scale: scaleAnim.value,
                child: child,
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Outer glow ring (active only)
                  if (isActive)
                    AnimatedContainer(
                      duration: AppDurations.fast,
                      width:    64,
                      height:   64,
                      decoration: BoxDecoration(
                        shape:     BoxShape.circle,
                        color:     tokens.primary.withValues(alpha: 0.12),
                        boxShadow: AppShadows.green,
                      ),
                    ),
                  // FAB itself
                  Container(
                    width:  54,
                    height: 54,
                    decoration: BoxDecoration(
                      gradient: AppGradients.lifekit,
                      shape:    BoxShape.circle,
                      boxShadow: isActive
                          ? AppShadows.green
                          : AppShadows.greenSm,
                    ),
                    child: Icon(
                      isActive ? LucideIcons.botMessageSquare : LucideIcons.bot,
                      size:  24,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),
          // Label — offset to compensate for FAB float
          Transform.translate(
            offset: const Offset(0, -4),
            child:  Text(
              'AI Coach',
              style: TextStyle(
                fontSize:   10,
                fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                color:      isActive ? tokens.primary : tokens.textMuted,
                letterSpacing: 0.2,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

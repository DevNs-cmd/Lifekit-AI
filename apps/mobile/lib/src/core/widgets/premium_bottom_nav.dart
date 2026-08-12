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
    required this.label,
    this.isCenter = false,
  });
  final IconData icon;
  final String label;
  final bool isCenter;
}

const List<NavItem> kNavItems = [
  NavItem(icon: LucideIcons.house,       label: 'Home'),
  NavItem(icon: LucideIcons.target,      label: 'Missions'),
  NavItem(icon: LucideIcons.bot,         label: 'AI Coach', isCenter: true),
  NavItem(icon: LucideIcons.squareCheck, label: 'Tasks'),
  NavItem(icon: LucideIcons.user,        label: 'Profile'),
];

// ─────────────────────────────────────────────
//  PREMIUM BOTTOM NAV BAR
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
  // Per-tab scale controllers for press animations
  late final List<AnimationController> _scaleCtrl = List.generate(
    kNavItems.length,
    (_) => AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 100),
      reverseDuration: const Duration(milliseconds: 200),
      lowerBound: 0.0,
      upperBound: 1.0,
    ),
  );

  // Center FAB pulse controller
  late final AnimationController _fabPulse = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 220),
    lowerBound: 0.0,
    upperBound: 1.0,
  );

  @override
  void dispose() {
    for (final c in _scaleCtrl) {
      c.dispose();
    }
    _fabPulse.dispose();
    super.dispose();
  }

  void _handleTap(int index) {
    if (index == 2) {
      // Center AI Coach — pulse animation
      _fabPulse.forward().then((_) => _fabPulse.reverse());
    } else {
      _scaleCtrl[index].forward().then((_) => _scaleCtrl[index].reverse());
    }
    widget.onTap(index);
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final bottomPad = MediaQuery.of(context).padding.bottom;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Gradient fade above bar — 16dp
        IgnorePointer(
          child: Container(
            height: 16,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  t.background.withValues(alpha: 0),
                  t.background,
                ],
              ),
            ),
          ),
        ),
        ClipRect(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
            child: Container(
              height: 72 + bottomPad,
              decoration: BoxDecoration(
                color: t.surface.withValues(alpha: 0.92),
                border: Border(
                  top: BorderSide(color: t.border, width: 1),
                ),
              ),
              child: Padding(
                padding: EdgeInsets.only(bottom: bottomPad),
                child: Row(
                  children: List.generate(kNavItems.length, (i) {
                    final item = kNavItems[i];
                    final isActive = widget.currentIndex == i;

                    if (item.isCenter) {
                      return Expanded(
                        child: _CenterTab(
                          isActive: isActive,
                          pulseCtrl: _fabPulse,
                          onTap: () => _handleTap(i),
                          tokens: t,
                        ),
                      );
                    }

                    return Expanded(
                      child: _RegularTab(
                        item: item,
                        isActive: isActive,
                        scaleCtrl: _scaleCtrl[i],
                        onTap: () => _handleTap(i),
                        tokens: t,
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
    required this.scaleCtrl,
    required this.onTap,
    required this.tokens,
  });

  final NavItem item;
  final bool isActive;
  final AnimationController scaleCtrl;
  final VoidCallback onTap;
  final AppTokens tokens;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTapDown: (_) => scaleCtrl.forward(),
      onTapUp: (_) {
        scaleCtrl.reverse();
        onTap();
      },
      onTapCancel: () => scaleCtrl.reverse(),
      child: AnimatedBuilder(
        animation: scaleCtrl,
        builder: (_, child) => Transform.scale(
          scale: 1.0 - 0.04 * scaleCtrl.value,
          child: child,
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Icon container
            AnimatedContainer(
              duration: AppDurations.fast,
              curve: Curves.easeInOutCubic,
              width: isActive ? 36 : 0,
              height: 36,
              decoration: isActive
                  ? BoxDecoration(
                      color:        tokens.primarySurface,
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      boxShadow:    AppShadows.greenSm,
                    )
                  : null,
              child: AnimatedOpacity(
                duration: AppDurations.fast,
                opacity: isActive ? 1.0 : 0.0,
                child: Center(
                  child: Icon(item.icon,
                      size: 20, color: tokens.primary),
                ),
              ),
            ),
            if (!isActive) ...[
              Icon(item.icon, size: 22, color: tokens.textMuted),
            ],
            const SizedBox(height: 4),
            Text(
              item.label,
              style: TextStyle(
                fontSize:   10,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.4,
                color: isActive ? tokens.primary : tokens.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  CENTER TAB — AI Coach elevated button
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
    final scaleAnim = Tween<double>(begin: 1.0, end: 1.12).animate(
      CurvedAnimation(parent: pulseCtrl, curve: Curves.easeOut),
    );

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onTap,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Elevated circle sits 10dp above baseline
          Transform.translate(
            offset: const Offset(0, -10),
            child: AnimatedBuilder(
              animation: scaleAnim,
              builder: (_, child) => Transform.scale(
                scale: scaleAnim.value,
                child: child,
              ),
              child: Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  gradient:    AppGradients.lifekit,
                  shape:       BoxShape.circle,
                  boxShadow:   AppShadows.green,
                ),
                child: const Icon(LucideIcons.bot,
                    size: 26, color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

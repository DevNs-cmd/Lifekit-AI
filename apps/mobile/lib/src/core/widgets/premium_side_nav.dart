import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../design/tokens.dart';
import '../design/animations.dart';

// ─────────────────────────────────────────────
//  NAV ITEM DESCRIPTOR
// ─────────────────────────────────────────────
class SideNavItem {
  const SideNavItem({
    required this.icon,
    required this.label,
    this.isHighlight = false,
  });
  final IconData icon;
  final String label;
  final bool isHighlight;
}

// Primary tabs (map 1:1 with StatefulShellRoute branches)
const List<SideNavItem> kSideNavItems = [
  SideNavItem(icon: LucideIcons.house,       label: 'Home'),
  SideNavItem(icon: LucideIcons.target,      label: 'Missions'),
  SideNavItem(icon: LucideIcons.bot,         label: 'AI Coach', isHighlight: true),
  SideNavItem(icon: LucideIcons.squareCheck, label: 'Tasks'),
  SideNavItem(icon: LucideIcons.user,        label: 'Profile'),
];

// Secondary / feature pages reachable via side nav
class SideNavSecondaryItem {
  const SideNavSecondaryItem({
    required this.icon,
    required this.label,
    required this.route,
  });
  final IconData icon;
  final String label;
  final String route;
}

const List<SideNavSecondaryItem> kSideNavSecondaryItems = [
  SideNavSecondaryItem(icon: LucideIcons.calendarRange, label: 'Planner',       route: '/planner'),
  SideNavSecondaryItem(icon: LucideIcons.users,         label: 'Agents',        route: '/agents'),
  SideNavSecondaryItem(icon: LucideIcons.brain,         label: 'Memory',        route: '/memory'),
  SideNavSecondaryItem(icon: LucideIcons.telescope,     label: 'Opportunities', route: '/opportunities'),
  SideNavSecondaryItem(icon: LucideIcons.store,         label: 'Marketplace',   route: '/marketplace'),
  SideNavSecondaryItem(icon: LucideIcons.barChart2,     label: 'Analytics',     route: '/analytics'),
  SideNavSecondaryItem(icon: LucideIcons.bell,          label: 'Notifications', route: '/notifications'),
  SideNavSecondaryItem(icon: LucideIcons.settings,      label: 'Settings',      route: '/settings'),
];

// ─────────────────────────────────────────────
//  PREMIUM SIDE NAV DRAWER
// ─────────────────────────────────────────────
class PremiumSideNav extends StatefulWidget {
  const PremiumSideNav({
    super.key,
    required this.currentIndex,
    required this.onTabTap,
    required this.onSecondaryTap,
    this.userName = '',
    this.userInitials = 'U',
  });

  final int currentIndex;
  final ValueChanged<int> onTabTap;
  final ValueChanged<String> onSecondaryTap;
  final String userName;
  final String userInitials;

  @override
  State<PremiumSideNav> createState() => _PremiumSideNavState();
}

class _PremiumSideNavState extends State<PremiumSideNav>
    with SingleTickerProviderStateMixin {
  late final AnimationController _highlightCtrl = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 120),
    lowerBound: 0.0,
    upperBound: 1.0,
  );

  @override
  void dispose() {
    _highlightCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final topPad = MediaQuery.of(context).padding.top;
    final bottomPad = MediaQuery.of(context).padding.bottom;

    return ClipRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
        child: Container(
          width: 260,
          decoration: BoxDecoration(
            color: t.surface.withValues(alpha: 0.96),
            border: Border(
              right: BorderSide(color: t.border, width: 1),
            ),
          ),
          child: Column(
            children: [
              SizedBox(height: topPad + 8),

              // ── Brand header ──────────────────────
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
                child: Row(children: [
                  Container(
                    width: 34, height: 34,
                    decoration: BoxDecoration(
                      gradient:     AppGradients.lifekit,
                      borderRadius: BorderRadius.circular(AppRadius.sm),
                    ),
                    child: const Icon(LucideIcons.leaf,
                        size: 18, color: Colors.white),
                  ),
                  const SizedBox(width: 10),
                  Text('LifeKit',
                      style: TextStyle(
                        fontSize:    20,
                        fontWeight:  FontWeight.w900,
                        color:       t.textPrimary,
                        letterSpacing: -0.6,
                      )),
                ]),
              ),

              Divider(color: t.border, height: 1),
              const SizedBox(height: 10),

              // ── Primary nav items ─────────────────
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: List.generate(kSideNavItems.length, (i) {
                    final item = kSideNavItems[i];
                    final isActive = widget.currentIndex == i;
                    return _SideNavTile(
                      icon:       item.icon,
                      label:      item.label,
                      isActive:   isActive,
                      isHighlight: item.isHighlight,
                      onTap:      () => widget.onTabTap(i),
                      tokens:     t,
                    );
                  }),
                ),
              ),

              const SizedBox(height: 12),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(children: [
                  Text('MORE',
                      style: TextStyle(
                        fontSize:    10,
                        fontWeight:  FontWeight.w700,
                        color:       t.textMuted,
                        letterSpacing: 1.2,
                      )),
                  const SizedBox(width: 8),
                  Expanded(child: Divider(color: t.border, height: 1)),
                ]),
              ),
              const SizedBox(height: 6),

              // ── Secondary nav items ───────────────
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: kSideNavSecondaryItems.map((item) =>
                      _SideNavTile(
                        icon:     item.icon,
                        label:    item.label,
                        isActive: false,
                        onTap:    () => widget.onSecondaryTap(item.route),
                        tokens:   t,
                      ),
                    ).toList(),
                  ),
                ),
              ),

              // ── User footer ───────────────────────
              Divider(color: t.border, height: 1),
              Padding(
                padding: EdgeInsets.fromLTRB(12, 10, 12, bottomPad + 10),
                child: Row(children: [
                  Container(
                    width: 34, height: 34,
                    decoration: BoxDecoration(
                      gradient: AppGradients.lifekit,
                      shape:    BoxShape.circle,
                    ),
                    child: Center(
                      child: Text(widget.userInitials,
                          style: const TextStyle(
                            color: Colors.white, fontSize: 13,
                            fontWeight: FontWeight.w700,
                          )),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      widget.userName.isEmpty ? 'My Account' : widget.userName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color:      t.textPrimary,
                        fontWeight: FontWeight.w600,
                        fontSize:   13,
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: () => widget.onSecondaryTap('/settings'),
                    icon: Icon(LucideIcons.settings,
                        size: 16, color: t.textMuted),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(
                        minWidth: 28, minHeight: 28),
                  ),
                ]),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  SIDE NAV TILE
// ─────────────────────────────────────────────
class _SideNavTile extends StatelessWidget {
  const _SideNavTile({
    required this.icon,
    required this.label,
    required this.isActive,
    required this.onTap,
    required this.tokens,
    this.isHighlight = false,
  });

  final IconData icon;
  final String label;
  final bool isActive;
  final bool isHighlight;
  final VoidCallback onTap;
  final AppTokens tokens;

  @override
  Widget build(BuildContext context) {
    final bg = isActive
        ? tokens.primarySurface
        : isHighlight
            ? AppGradients.lifekit.colors.first.withValues(alpha: 0.08)
            : Colors.transparent;

    final iconColor = isActive
        ? tokens.primary
        : isHighlight
            ? tokens.primary
            : tokens.textSecondary;

    final textColor = isActive
        ? tokens.primary
        : isHighlight
            ? tokens.primary
            : tokens.textPrimary;

    return Padding(
      padding: const EdgeInsets.only(bottom: 2),
      child: AnimatedContainer(
        duration: AppDurations.fast,
        curve: Curves.easeInOutCubic,
        decoration: BoxDecoration(
          color:        bg,
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: isActive
              ? Border.all(
                  color: tokens.primary.withValues(alpha: 0.25), width: 1)
              : null,
          boxShadow: isActive ? AppShadows.greenSm : null,
        ),
        child: Material(
          color:        Colors.transparent,
          borderRadius: BorderRadius.circular(AppRadius.md),
          child: InkWell(
            borderRadius: BorderRadius.circular(AppRadius.md),
            onTap: onTap,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              child: Row(children: [
                Icon(icon, size: 18, color: iconColor),
                const SizedBox(width: 12),
                Text(label,
                    style: TextStyle(
                      color:      textColor,
                      fontWeight: isActive
                          ? FontWeight.w700 : FontWeight.w500,
                      fontSize:   14,
                    )),
                if (isHighlight && !isActive) ...[
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      gradient:     AppGradients.lifekit,
                      borderRadius: BorderRadius.circular(AppRadius.full),
                    ),
                    child: const Text('AI',
                        style: TextStyle(
                          color: Colors.white, fontSize: 9,
                          fontWeight: FontWeight.w700,
                        )),
                  ),
                ],
              ]),
            ),
          ),
        ),
      ),
    );
  }
}

// ignore_for_file: use_build_context_synchronously
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/design/animations.dart';
import '../../core/design/tokens.dart';
import '../../core/repository.dart';
import '../../core/widgets/premium_card.dart';
import '../../core/widgets/premium_side_nav.dart';

// ─────────────────────────────────────────────
//  CATEGORY META
// ─────────────────────────────────────────────
class _CategoryMeta {
  const _CategoryMeta(this.label, this.icon, this.color);
  final String label;
  final IconData icon;
  final Color color;
}

const _kCategories = [
  _CategoryMeta('All',           LucideIcons.grid3x3,       Color(0xFF217C45)),
  _CategoryMeta('Career & Code', LucideIcons.briefcase,     Color(0xFF2563EB)),
  _CategoryMeta('Finance',       LucideIcons.indianRupee,   Color(0xFFD97706)),
  _CategoryMeta('Health',        LucideIcons.heart,         Color(0xFF16A34A)),
  _CategoryMeta('Education',     LucideIcons.bookOpen,      Color(0xFF7C3AED)),
  _CategoryMeta('Productivity',  LucideIcons.zap,           Color(0xFF0891B2)),
];

// ─────────────────────────────────────────────
//  PROVIDERS
// ─────────────────────────────────────────────
final _marketplaceCategoryProvider = StateProvider<String>((ref) => 'All');
final _marketplaceSearchProvider   = StateProvider<String>((ref) => '');

// ─────────────────────────────────────────────
//  MARKETPLACE SCREEN
// ─────────────────────────────────────────────
class MarketplaceScreen extends ConsumerStatefulWidget {
  const MarketplaceScreen({super.key});

  @override
  ConsumerState<MarketplaceScreen> createState() => _MarketplaceScreenState();
}

class _MarketplaceScreenState extends ConsumerState<MarketplaceScreen> {
  List<Map<String, dynamic>> _items = [];
  bool _loading = true;
  String? _error;
  bool _searchOpen = false;
  final _searchCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  final _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final cat = ref.read(_marketplaceCategoryProvider);
      final res = await ref
          .read(repositoryProvider)
          .marketplace(category: cat == 'All' ? null : cat);
      if (!mounted) return;
      setState(() {
        _items = res;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  List<Map<String, dynamic>> get _filtered {
    final q = ref.read(_marketplaceSearchProvider).toLowerCase().trim();
    if (q.isEmpty) return _items;
    return _items.where((item) {
      final title = (item['title'] ?? '').toString().toLowerCase();
      final desc  = (item['description'] ?? '').toString().toLowerCase();
      final auth  = (item['author'] ?? '').toString().toLowerCase();
      return title.contains(q) || desc.contains(q) || auth.contains(q);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final t        = context.tokens;
    final category = ref.watch(_marketplaceCategoryProvider);
    final query    = ref.watch(_marketplaceSearchProvider);
    final filtered = _filtered;

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: t.background,
      drawer: PremiumSideNav(
        currentIndex: -1, // no tab is "active" — this is a feature page
        userInitials: 'U',
        userName: '',
        onTabTap: (index) {
          _scaffoldKey.currentState?.closeDrawer();
          const routes = ['/home', '/missions', '/ai-coach', '/tasks', '/profile'];
          if (index >= 0 && index < routes.length) {
            context.go(routes[index]);
          }
        },
        onSecondaryTap: (route) {
          _scaffoldKey.currentState?.closeDrawer();
          if (route == '/marketplace') return; // already here
          context.push(route);
        },
      ),
      body: SafeArea(
        child: Stack(children: [
          Column(children: [
            // ── Header ────────────────────────────────────────
            _MarketplaceHeader(
              searchOpen:     _searchOpen,
              onMenuTap:      () => _scaffoldKey.currentState?.openDrawer(),
              onSearchToggle: () {
                setState(() => _searchOpen = !_searchOpen);
                if (!_searchOpen) {
                  _searchCtrl.clear();
                  ref.read(_marketplaceSearchProvider.notifier).state = '';
                }
              },
              onRefresh: _load,
            ),

            // ── Search bar ────────────────────────────────────
            _AnimatedSearchBar(
              visible:    _searchOpen,
              controller: _searchCtrl,
              hint:       'Search marketplace…',
              onChanged: (v) =>
                  ref.read(_marketplaceSearchProvider.notifier).state = v,
              onDismiss: () {
                setState(() => _searchOpen = false);
                _searchCtrl.clear();
                ref.read(_marketplaceSearchProvider.notifier).state = '';
              },
            ),

            // ── Category chips ────────────────────────────────
            if (!_searchOpen)
              _CategoryChips(
                categories:       _kCategories,
                selectedCategory: category,
                onSelect: (cat) {
                  ref.read(_marketplaceCategoryProvider.notifier).state = cat;
                  _load();
                },
              ).animate(delay: 60.ms).fadeIn(duration: 250.ms),

            const SizedBox(height: 4),

            // ── Loading bar ───────────────────────────────────
            if (_loading)
              LinearProgressIndicator(
                color:           t.primary,
                minHeight:       2,
                backgroundColor: t.backgroundSubtle,
              ),

            // ── Body ──────────────────────────────────────────
            Expanded(
              child: _loading
                  ? _SkeletonGrid()
                  : _error != null && _items.isEmpty
                      ? _ErrorState(error: _error!, onRetry: _load)
                      : filtered.isEmpty
                          ? _EmptyMarketplace(
                              hasQuery: query.isNotEmpty,
                              query:    query,
                            )
                          : RefreshIndicator(
                              onRefresh: _load,
                              color:     t.primary,
                              child: GridView.builder(
                                controller: _scrollCtrl,
                                padding: const EdgeInsets.fromLTRB(16, 8, 16, 120),
                                gridDelegate:
                                    const SliverGridDelegateWithFixedCrossAxisCount(
                                  crossAxisCount:   2,
                                  crossAxisSpacing: 12,
                                  mainAxisSpacing:  12,
                                  childAspectRatio: 0.65,
                                ),
                                itemCount: filtered.length,
                                itemBuilder: (_, i) => _MarketplaceCard(
                                  item:  filtered[i],
                                  index: i,
                                  onTap: () => context.push(
                                    '/marketplace/${filtered[i]['id']}',
                                    extra: filtered[i],
                                  ),
                                ),
                              ),
                            ),
            ),
          ]),

          // ── Floating shortcut bar ──────────────────────────
          _MarketplaceFloatingBar(),
        ]),
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  HEADER
// ─────────────────────────────────────────────
class _MarketplaceHeader extends ConsumerWidget {
  const _MarketplaceHeader({
    required this.searchOpen,
    required this.onMenuTap,
    required this.onSearchToggle,
    required this.onRefresh,
  });
  final bool searchOpen;
  final VoidCallback onMenuTap;
  final VoidCallback onSearchToggle;
  final VoidCallback onRefresh;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.tokens;
    return Padding(
      padding: const EdgeInsets.fromLTRB(8, 10, 12, 10),
      child: Row(children: [
        // ── Hamburger / back button ───────────────────────
        _GlassNavButton(
          icon: LucideIcons.menu,
          onTap: onMenuTap,
          tokens: t,
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(
              'Marketplace',
              style: Theme.of(context).textTheme.displaySmall?.copyWith(
                    color:         t.textPrimary,
                    fontWeight:    FontWeight.w900,
                    letterSpacing: -1.0,
                  ),
            ),
            const SizedBox(height: 2),
            Text(
              'Execution tools, plans & expertise',
              style: TextStyle(color: t.textMuted, fontSize: 12, height: 1.3),
            ),
          ]),
        ),
        IconButton(
          onPressed: onSearchToggle,
          icon: Icon(
            searchOpen ? LucideIcons.x : LucideIcons.search,
            size: 18, color: t.textSecondary,
          ),
        ),
        IconButton(
          onPressed: onRefresh,
          icon: Icon(LucideIcons.refreshCw, size: 18, color: t.textSecondary),
        ),
      ]).pageEntrance(),
    );
  }
}

// ─────────────────────────────────────────────
//  GLASS NAV BUTTON  (hamburger / back)
// ─────────────────────────────────────────────
class _GlassNavButton extends StatelessWidget {
  const _GlassNavButton({
    required this.icon,
    required this.onTap,
    required this.tokens,
  });
  final IconData icon;
  final VoidCallback onTap;
  final AppTokens tokens;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(AppRadius.md),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
          child: Container(
            width:  38,
            height: 38,
            decoration: BoxDecoration(
              color:        tokens.surface.withValues(alpha: 0.88),
              borderRadius: BorderRadius.circular(AppRadius.md),
              border:       Border.all(color: tokens.border),
              boxShadow:    AppShadows.xs,
            ),
            child: Icon(icon, size: 18, color: tokens.textPrimary),
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  ANIMATED SEARCH BAR
// ─────────────────────────────────────────────
class _AnimatedSearchBar extends StatelessWidget {
  const _AnimatedSearchBar({
    required this.visible,
    required this.controller,
    required this.hint,
    required this.onChanged,
    required this.onDismiss,
  });
  final bool visible;
  final TextEditingController controller;
  final String hint;
  final ValueChanged<String> onChanged;
  final VoidCallback onDismiss;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return AnimatedSize(
      duration: const Duration(milliseconds: 280),
      curve: Curves.easeOutCubic,
      child: visible
          ? Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
              child: Container(
                height: 44,
                decoration: BoxDecoration(
                  color:        t.surface,
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  border:       Border.all(color: t.primary, width: 1.5),
                  boxShadow: [
                    BoxShadow(
                      color:      t.primary.withValues(alpha: 0.15),
                      blurRadius: 8,
                    ),
                  ],
                ),
                child: Row(children: [
                  const SizedBox(width: 12),
                  Icon(LucideIcons.search, size: 16, color: t.textMuted),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: controller,
                      onChanged:  onChanged,
                      autofocus:  true,
                      textInputAction: TextInputAction.search,
                      style: TextStyle(fontSize: 14, color: t.textPrimary),
                      decoration: InputDecoration(
                        hintText:         hint,
                        border:           InputBorder.none,
                        enabledBorder:    InputBorder.none,
                        focusedBorder:    InputBorder.none,
                        contentPadding:   EdgeInsets.zero,
                        isDense:          true,
                        hintStyle:        TextStyle(color: t.textMuted, fontSize: 14),
                      ),
                    ),
                  ),
                  GestureDetector(
                    onTap: onDismiss,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: Text(
                        'Cancel',
                        style: TextStyle(
                          color:      t.primary,
                          fontSize:   12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ]),
              ),
            )
          : const SizedBox.shrink(),
    );
  }
}

// ─────────────────────────────────────────────
//  CATEGORY CHIPS
// ─────────────────────────────────────────────
class _CategoryChips extends StatelessWidget {
  const _CategoryChips({
    required this.categories,
    required this.selectedCategory,
    required this.onSelect,
  });
  final List<_CategoryMeta> categories;
  final String selectedCategory;
  final ValueChanged<String> onSelect;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return SizedBox(
      height: 44,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        children: categories.map((cat) {
          final selected = selectedCategory == cat.label;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: GestureDetector(
              onTap: () => onSelect(cat.label),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                height: 34,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color:        selected ? cat.color.withValues(alpha: 0.12) : t.backgroundSubtle,
                  borderRadius: BorderRadius.circular(AppRadius.full),
                  border:       Border.all(
                    color: selected ? cat.color : t.border,
                    width: selected ? 1.5 : 1.0,
                  ),
                  boxShadow: selected
                      ? [
                          BoxShadow(
                            color:      cat.color.withValues(alpha: 0.2),
                            blurRadius: 8,
                            offset:     const Offset(0, 2),
                          ),
                        ]
                      : null,
                ),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  Icon(cat.icon, size: 12, color: selected ? cat.color : t.textSecondary),
                  const SizedBox(width: 5),
                  Text(
                    cat.label,
                    style: TextStyle(
                      color:      selected ? cat.color : t.textSecondary,
                      fontSize:   12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ]),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  MARKETPLACE CARD
// ─────────────────────────────────────────────
class _MarketplaceCard extends StatefulWidget {
  const _MarketplaceCard({
    required this.item,
    required this.index,
    required this.onTap,
  });
  final Map<String, dynamic> item;
  final int index;
  final VoidCallback onTap;

  @override
  State<_MarketplaceCard> createState() => _MarketplaceCardState();
}

class _MarketplaceCardState extends State<_MarketplaceCard> {
  bool _pressed = false;

  Color _categoryColor(AppTokens t) {
    final cat = (widget.item['category'] ?? '').toString().toLowerCase();
    for (final m in _kCategories) {
      if (cat.contains(m.label.toLowerCase().split(' ').first)) return m.color;
    }
    return t.primary;
  }

  @override
  Widget build(BuildContext context) {
    final t         = context.tokens;
    final brightness = Theme.of(context).brightness;
    final price      = (widget.item['price'] ?? 'Free').toString();
    final isFree     = price.toLowerCase() == 'free' || price == '0';
    final rating     = (widget.item['rating'] as num?)?.toDouble() ?? 4.8;
    final title      = (widget.item['title'] ?? 'Item').toString();
    final author     = (widget.item['author'] ?? 'Verified Creator').toString();
    final desc       = (widget.item['description'] ?? '').toString();
    final catColor   = _categoryColor(t);
    final delay      = Duration(milliseconds: (widget.index * 50).clamp(0, 300));

    return GestureDetector(
      onTapDown:  (_) => setState(() => _pressed = true),
      onTapUp:    (_) { setState(() => _pressed = false); widget.onTap(); },
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedScale(
        scale:    _pressed ? 0.96 : 1.0,
        duration: const Duration(milliseconds: 120),
        curve:    Curves.easeOut,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          decoration: BoxDecoration(
            color:        t.cardBg,
            borderRadius: BorderRadius.circular(AppRadius.x2l),
            border:       Border.all(
              color: _pressed ? catColor.withValues(alpha: 0.4) : t.cardBorder,
            ),
            boxShadow: _pressed
                ? [
                    BoxShadow(
                      color:      catColor.withValues(alpha: 0.25),
                      blurRadius: 20,
                      offset:     const Offset(0, 8),
                    ),
                  ]
                : AppElevation.level1(brightness),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(AppRadius.x2l),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Coloured header band ──────────────────────
                Container(
                  height: 70,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end:   Alignment.bottomRight,
                      colors: [
                        catColor.withValues(alpha: 0.18),
                        catColor.withValues(alpha: 0.06),
                      ],
                    ),
                  ),
                  child: Stack(children: [
                    // Background pattern circle
                    Positioned(
                      top:   -18,
                      right: -18,
                      child: Container(
                        width:  70,
                        height: 70,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: catColor.withValues(alpha: 0.08),
                        ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(12, 12, 12, 0),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Icon squircle
                          Container(
                            width:  40,
                            height: 40,
                            decoration: BoxDecoration(
                              color:        catColor.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(AppRadius.md),
                              border:       Border.all(
                                color: catColor.withValues(alpha: 0.3),
                              ),
                            ),
                            child: Icon(
                              _iconForItem(widget.item),
                              color: catColor,
                              size:  18,
                            ),
                          ),
                          const Spacer(),
                          // Price badge
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color:        isFree
                                  ? t.successSurface
                                  : t.primarySurface,
                              borderRadius: BorderRadius.circular(AppRadius.full),
                              border: Border.all(
                                color: isFree
                                    ? t.success.withValues(alpha: 0.35)
                                    : t.primary.withValues(alpha: 0.35),
                              ),
                            ),
                            child: Text(
                              isFree ? 'FREE' : price,
                              style: TextStyle(
                                color:      isFree ? t.success : t.primary,
                                fontSize:   9,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ]),
                ),

                // ── Content ─────────────────────────────────
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          maxLines:  2,
                          overflow:  TextOverflow.ellipsis,
                          style: TextStyle(
                            fontWeight:    FontWeight.w700,
                            fontSize:      13,
                            color:         t.textPrimary,
                            letterSpacing: -0.3,
                            height:        1.3,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          author,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color:    t.textMuted,
                            fontSize: 10,
                          ),
                        ),
                        const SizedBox(height: 6),
                        if (desc.isNotEmpty)
                          Text(
                            desc,
                            maxLines:  2,
                            overflow:  TextOverflow.ellipsis,
                            style: TextStyle(
                              color:  t.textSecondary,
                              fontSize: 11,
                              height: 1.45,
                            ),
                          ),
                        const Spacer(),
                        // ── Rating + CTA row ───────────────────
                        Row(
                          children: [
                            Icon(LucideIcons.star,
                                size: 11, color: Colors.amber.shade600),
                            const SizedBox(width: 3),
                            Text(
                              rating.toStringAsFixed(1),
                              style: TextStyle(
                                fontSize:   11,
                                fontWeight: FontWeight.w700,
                                color:      t.textSecondary,
                              ),
                            ),
                            const Spacer(),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color:        catColor.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(AppRadius.full),
                                border: Border.all(
                                  color: catColor.withValues(alpha: 0.25),
                                ),
                              ),
                              child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                Text(
                                  'View',
                                  style: TextStyle(
                                    color:      catColor,
                                    fontSize:   10,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                const SizedBox(width: 2),
                                Icon(LucideIcons.arrowRight,
                                    size: 9, color: catColor),
                              ]),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ).animate(delay: delay).fadeIn(duration: 280.ms).slideY(
              begin: 0.06,
              end:   0,
              duration: 280.ms,
            ),
      ),
    );
  }

  IconData _iconForItem(Map<String, dynamic> item) {
    final cat = (item['category'] ?? item['type'] ?? '').toString().toLowerCase();
    if (cat.contains('career') || cat.contains('code')) return LucideIcons.briefcase;
    if (cat.contains('finance'))   return LucideIcons.indianRupee;
    if (cat.contains('health'))    return LucideIcons.heart;
    if (cat.contains('education')) return LucideIcons.bookOpen;
    if (cat.contains('product'))   return LucideIcons.zap;
    return LucideIcons.package;
  }
}

// ─────────────────────────────────────────────
//  SKELETON GRID  (shimmer loading state)
// ─────────────────────────────────────────────
class _SkeletonGrid extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return GridView.builder(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount:   2,
        crossAxisSpacing: 12,
        mainAxisSpacing:  12,
        childAspectRatio: 0.72,
      ),
      itemCount: 6,
      itemBuilder: (_, i) => Container(
        decoration: BoxDecoration(
          color:        t.cardBg,
          borderRadius: BorderRadius.circular(AppRadius.x2l),
          border:       Border.all(color: t.cardBorder),
        ),
        // ignore: prefer_const_literals_to_create_immutables
        child: Column(children: [
          _ShimmerBox(height: 70, borderRadius: 0),
          const SizedBox(height: 12),
          // ignore: prefer_const_literals_to_create_immutables
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                // ignore: prefer_const_literals_to_create_immutables
                children: [
              _ShimmerBox(height: 13),
              const SizedBox(height: 6),
              _ShimmerBox(width: 80, height: 10),
              const SizedBox(height: 10),
              _ShimmerBox(height: 10),
              const SizedBox(height: 4),
              _ShimmerBox(width: 100, height: 10),
            ]),
          ),
        ]),
      ).animate(delay: Duration(milliseconds: i * 40)).fadeIn(),
    );
  }
}

// ─────────────────────────────────────────────
//  SHIMMER BOX  (self-contained shimmer)
// ─────────────────────────────────────────────
class _ShimmerBox extends StatefulWidget {
  const _ShimmerBox({this.width, required this.height, this.borderRadius = 8});
  final double? width;
  final double height;
  final double borderRadius;

  @override
  State<_ShimmerBox> createState() => _ShimmerBoxState();
}

class _ShimmerBoxState extends State<_ShimmerBox>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl = AnimationController(
    vsync: this,
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
    final base   = isDark ? const Color(0xFF252525) : const Color(0xFFEEEEEE);
    final shine  = isDark ? const Color(0xFF333333) : const Color(0xFFF8F8F8);

    return AnimatedBuilder(
      animation: _anim,
      builder: (_, __) => Container(
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
//  EMPTY STATE
// ─────────────────────────────────────────────
class _EmptyMarketplace extends StatelessWidget {
  const _EmptyMarketplace({required this.hasQuery, required this.query});
  final bool hasQuery;
  final String query;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 48),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          EmptyStateOrb(icon: LucideIcons.shoppingBag, size: 72, iconSize: 32),
          const SizedBox(height: 20),
          Text(
            hasQuery ? 'No results for "$query"' : 'Marketplace is empty',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  fontSize:   17,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            hasQuery
                ? 'Try a different search term or clear filters.'
                : 'Check back soon — new tools and plans are added regularly.',
            textAlign: TextAlign.center,
            style: TextStyle(color: t.textMuted, fontSize: 13, height: 1.6),
          ),
        ]).animate().fadeIn(duration: 300.ms),
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  ERROR STATE
// ─────────────────────────────────────────────
class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.error, required this.onRetry});
  final String error;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final t   = context.tokens;
    final msg = error.replaceFirst('Exception:', '').trim();
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(
            width:  64,
            height: 64,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color:  t.destructiveSurface,
              border: Border.all(color: t.destructive.withValues(alpha: 0.3)),
            ),
            child: Icon(LucideIcons.wifiOff, size: 26, color: t.destructive),
          ),
          const SizedBox(height: 18),
          Text(
            msg.length > 100 ? '${msg.substring(0, 100)}…' : msg,
            textAlign: TextAlign.center,
            style: TextStyle(color: t.textMuted, fontSize: 13, height: 1.5),
          ),
          const SizedBox(height: 20),
          FilledButton.icon(
            onPressed: onRetry,
            icon:  const Icon(LucideIcons.refreshCw, size: 16),
            label: const Text('Try again'),
          ),
        ]).animate().fadeIn(duration: 280.ms),
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  MARKETPLACE FLOATING BAR
//  Minimal glass pill with Home / AI Coach
//  shortcuts — sits above the system nav bar.
// ─────────────────────────────────────────────
class _MarketplaceFloatingBar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Positioned(
      left:   24,
      right:  24,
      bottom: 16 + MediaQuery.of(context).padding.bottom,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(AppRadius.full),
        child: Container(
          height: 52,
          decoration: BoxDecoration(
            color:        t.surface.withValues(alpha: 0.92),
            borderRadius: BorderRadius.circular(AppRadius.full),
            border:       Border.all(color: t.border),
            boxShadow:    AppShadows.lg,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _FloatBtn(
                icon:  LucideIcons.house,
                label: 'Home',
                color: t.primary,
                onTap: () => context.go('/home'),
              ),
              Container(width: 1, height: 22, color: t.border),
              _FloatBtn(
                icon:  LucideIcons.bot,
                label: 'AI Coach',
                color: t.info,
                onTap: () => context.go('/ai-coach'),
              ),
              Container(width: 1, height: 22, color: t.border),
              _FloatBtn(
                icon:  LucideIcons.target,
                label: 'Missions',
                color: t.warning,
                onTap: () => context.go('/missions'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _FloatBtn extends StatefulWidget {
  const _FloatBtn({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  @override
  State<_FloatBtn> createState() => _FloatBtnState();
}

class _FloatBtnState extends State<_FloatBtn> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return GestureDetector(
      onTapDown:   (_) => setState(() => _pressed = true),
      onTapUp:     (_) { setState(() => _pressed = false); widget.onTap(); },
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedScale(
        scale:    _pressed ? 0.88 : 1.0,
        duration: const Duration(milliseconds: 100),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Icon(widget.icon, size: 17, color: widget.color),
            const SizedBox(height: 2),
            Text(
              widget.label,
              style: TextStyle(
                color:      t.textSecondary,
                fontSize:   9,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.3,
              ),
            ),
          ]),
        ),
      ),
    );
  }
}

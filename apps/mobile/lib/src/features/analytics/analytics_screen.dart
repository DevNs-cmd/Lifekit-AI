// ignore_for_file: use_build_context_synchronously
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/design/animations.dart';
import '../../core/design/tokens.dart';
import '../../core/repository.dart';
import '../../core/widgets/empty_state_view.dart';
import '../../core/widgets/premium_card.dart';

// ─────────────────────────────────────────────
//  ANALYTICS SCREEN
//  Progress & Analytics + AI Insight section
// ─────────────────────────────────────────────
class AnalyticsScreen extends ConsumerStatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  ConsumerState<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends ConsumerState<AnalyticsScreen> {
  Map<String, dynamic> _analytics = {};
  Map<String, dynamic> _insight   = {};
  bool _loadingAnalytics = true;
  bool _loadingInsight   = false;
  bool _insightFetched   = false;
  String? _insightError;

  @override
  void initState() {
    super.initState();
    _loadAnalytics();
  }

  Future<void> _loadAnalytics() async {
    setState(() => _loadingAnalytics = true);
    try {
      final repo = ref.read(repositoryProvider);
      final res  = await repo.analytics();
      if (!mounted) return;
      setState(() {
        _analytics      = res;
        _loadingAnalytics = false;
      });
      // Auto-fetch insights once analytics data is ready
      _loadInsight();
    } catch (_) {
      if (!mounted) return;
      setState(() => _loadingAnalytics = false);
    }
  }

  Future<void> _loadInsight({bool manual = false}) async {
    if (_loadingInsight) return;
    setState(() {
      _loadingInsight = true;
      _insightError   = null;
    });
    try {
      final repo   = ref.read(repositoryProvider);
      // Build context from already-loaded analytics + missions
      final missionsData = await repo.missions();
      final missionTitles = missionsData
          .take(5)
          .map((m) => (m['title'] ?? '').toString())
          .where((s) => s.isNotEmpty)
          .toList();

      final res = await repo.generateInsight(
        missions:       missionTitles,
        tasksCompleted: ((_analytics['taskCompletionCount']
                ?? _analytics['tasksCompleted']) as num?)?.toInt() ?? 0,
        tasksPending:   (_analytics['tasksPending'] as num?)?.toInt() ?? 0,
        streakDays:     (_analytics['currentStreak'] as num?)?.toInt() ?? 0,
        topCategory:    (_analytics['topCategory'] ?? 'General').toString(),
      );
      if (!mounted) return;
      setState(() {
        _insight        = res;
        _loadingInsight = false;
        _insightFetched = true;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _insightError   = e.toString().replaceFirst('Exception:', '').trim();
        _loadingInsight = false;
        _insightFetched = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final t      = context.tokens;
    final weeklyRaw = (_analytics['weeklyProductivity'] as List? ?? []);
    final weekly = weeklyRaw.isNotEmpty
        ? weeklyRaw
        : const [
            {'day': 'Mon', 'tasksCompleted': 0},
            {'day': 'Tue', 'tasksCompleted': 0},
            {'day': 'Wed', 'tasksCompleted': 0},
            {'day': 'Thu', 'tasksCompleted': 0},
            {'day': 'Fri', 'tasksCompleted': 0},
            {'day': 'Sat', 'tasksCompleted': 0},
            {'day': 'Sun', 'tasksCompleted': 0},
          ];

    final maxCount = weekly
        .map((item) => ((item['tasksCompleted'] ?? item['count']) as num? ?? 0).toDouble())
        .fold(0.0, (a, b) => a > b ? a : b);

    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(
        title: const Text('Progress & Analytics'),
        centerTitle: false,
        actions: [
          IconButton(
            tooltip: 'Refresh',
            onPressed: _loadingAnalytics ? null : _loadAnalytics,
            icon: Icon(LucideIcons.refreshCw,
                size: 18, color: t.textSecondary),
          ),
        ],
      ),
      body: _loadingAnalytics
          ? Center(child: CircularProgressIndicator(color: t.primary))
          : RefreshIndicator(
              onRefresh: _loadAnalytics,
              color: t.primary,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 48),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // ── Metric cards grid ──────────────────
                    Row(children: [
                      _MetricCard(
                        title: 'Task Completion',
                        val:   '${_analytics['taskCompletionRate'] ?? 0}%',
                        icon:  LucideIcons.checkSquare,
                      ),
                      const SizedBox(width: 12),
                      _MetricCard(
                        title: 'Current Streak',
                        val:   '${_analytics['currentStreak'] ?? 0} Days',
                        icon:  LucideIcons.flame,
                      ),
                    ]).animate().fadeIn(duration: 280.ms),

                    const SizedBox(height: 12),

                    Row(children: [
                      _MetricCard(
                        title: 'Active Missions',
                        val:   '${_analytics['activeMissions'] ?? 0}',
                        icon:  LucideIcons.target,
                      ),
                      const SizedBox(width: 12),
                      _MetricCard(
                        title: 'Tasks Done',
                        val:   '${_analytics['tasksCompleted'] ?? _analytics['taskCompletionCount'] ?? 0}',
                        icon:  LucideIcons.award,
                      ),
                    ]).animate().fadeIn(duration: 320.ms),

                    const SizedBox(height: 24),

                    // ── Weekly bar chart ──────────────────
                    Text(
                      'Weekly Focus Activity',
                      style: TextStyle(
                        fontSize:      16,
                        fontWeight:    FontWeight.w800,
                        color:         t.textPrimary,
                        letterSpacing: -0.4,
                      ),
                    ),
                    const SizedBox(height: 12),
                    PremiumCard(
                      padding: const EdgeInsets.all(20),
                      child: SizedBox(
                        height: 200,
                        child: BarChart(
                          BarChartData(
                            maxY: maxCount > 3 ? maxCount + 1 : 5,
                            minY: 0,
                            borderData: FlBorderData(show: false),
                            gridData: FlGridData(
                              show: true,
                              drawVerticalLine: false,
                              getDrawingHorizontalLine: (val) => FlLine(
                                color: t.border.withValues(alpha: 0.5),
                                strokeWidth: 1,
                              ),
                            ),
                            titlesData: FlTitlesData(
                              rightTitles: const AxisTitles(
                                  sideTitles:
                                      SideTitles(showTitles: false)),
                              topTitles: const AxisTitles(
                                  sideTitles:
                                      SideTitles(showTitles: false)),
                              leftTitles: AxisTitles(
                                sideTitles: SideTitles(
                                  showTitles: true,
                                  reservedSize: 28,
                                  interval: (maxCount > 8) ? 4 : 2,
                                  getTitlesWidget: (val, idx) {
                                    if (val == 0) return const SizedBox.shrink();
                                    return Text(
                                      val.toInt().toString(),
                                      style: TextStyle(
                                        fontSize: 10,
                                        color: t.textMuted,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    );
                                  },
                                ),
                              ),
                              bottomTitles: AxisTitles(
                                sideTitles: SideTitles(
                                  showTitles: true,
                                  getTitlesWidget: (val, idx) {
                                    final i = val.toInt();
                                    if (i >= 0 && i < weekly.length) {
                                      return Padding(
                                        padding: const EdgeInsets.only(
                                            top: 8),
                                        child: Text(
                                          weekly[i]['day'].toString(),
                                          style: TextStyle(
                                            fontSize:   11,
                                            color:      t.textMuted,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                      );
                                    }
                                    return const SizedBox.shrink();
                                  },
                                ),
                              ),
                            ),
                            barGroups: weekly.indexed.map((item) {
                              final count = ((item.$2['tasksCompleted'] ??
                                          item.$2['count']) as num? ??
                                      0)
                                  .toDouble();
                              return BarChartGroupData(
                                x: item.$1,
                                barRods: [
                                  BarChartRodData(
                                    toY:    count,
                                    color:  t.primary,
                                    width:  16,
                                    borderRadius: BorderRadius.circular(
                                        AppRadius.xs),
                                  ),
                                ],
                              );
                            }).toList(),
                          ),
                        ),
                      ),
                    ).animate().fadeIn(duration: 250.ms),

                    const SizedBox(height: 28),

                    // ── AI Insight section ────────────────
                    _InsightSection(
                      loading:  _loadingInsight,
                      fetched:  _insightFetched,
                      error:    _insightError,
                      data:     _insight,
                      onRetry:  () => _loadInsight(manual: true),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}

// ─────────────────────────────────────────────
//  METRIC CARD
// ─────────────────────────────────────────────
class _MetricCard extends StatelessWidget {
  const _MetricCard({
    required this.title,
    required this.val,
    required this.icon,
  });
  final String title, val;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Expanded(
      child: PremiumCard(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              Container(
                padding:     const EdgeInsets.all(6),
                decoration:  BoxDecoration(
                  color:        t.primarySurface,
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
                child: Icon(icon, size: 16, color: t.primary),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  title,
                  maxLines:  1,
                  overflow:  TextOverflow.ellipsis,
                  style: TextStyle(
                    color:      t.textMuted,
                    fontSize:   11,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ]),
            const SizedBox(height: 12),
            Text(
              val,
              style: TextStyle(
                fontSize:      24,
                fontWeight:    FontWeight.w900,
                color:         t.textPrimary,
                letterSpacing: -0.8,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  AI INSIGHT SECTION
//  Shown below the bar chart. Calls the existing
//  backend insight engine and renders a rich
//  weekly coaching report inline.
// ─────────────────────────────────────────────
class _InsightSection extends StatelessWidget {
  const _InsightSection({
    required this.loading,
    required this.fetched,
    required this.error,
    required this.data,
    required this.onRetry,
  });
  final bool    loading;
  final bool    fetched;
  final String? error;
  final Map<String, dynamic> data;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // ── Section header ────────────────────
        Row(children: [
          Container(
            padding:    const EdgeInsets.all(6),
            decoration: BoxDecoration(
              gradient:     AppGradients.lifekit,
              borderRadius: BorderRadius.circular(AppRadius.sm),
            ),
            child: const Icon(LucideIcons.sparkles,
                size: 12, color: Colors.white),
          ),
          const SizedBox(width: 8),
          Text(
            'AI Weekly Insights',
            style: TextStyle(
              fontSize:      16,
              fontWeight:    FontWeight.w800,
              color:         t.textPrimary,
              letterSpacing: -0.4,
            ),
          ),
          const Spacer(),
          if (!loading && fetched)
            GestureDetector(
              onTap: onRetry,
              child: Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color:        t.backgroundSubtle,
                  borderRadius: BorderRadius.circular(AppRadius.full),
                  border:       Border.all(color: t.border),
                ),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  Icon(LucideIcons.refreshCw,
                      size: 10, color: t.textMuted),
                  const SizedBox(width: 4),
                  Text('Refresh',
                      style: TextStyle(
                          color:    t.textMuted,
                          fontSize: 10,
                          fontWeight: FontWeight.w600)),
                ]),
              ),
            ),
        ]),
        const SizedBox(height: 14),

        // ── Body ─────────────────────────────
        if (loading)
          _InsightLoadingCard()
        else if (error != null && data.isEmpty)
          _InsightRetryCard(error: error!, onRetry: onRetry)
        else if (!fetched || data.isEmpty)
          _InsightEmptyCard()
        else
          _InsightCards(data: data),
      ],
    );
  }
}

// ─────────────────────────────────────────────
//  INSIGHT CARDS  (the actual content)
// ─────────────────────────────────────────────
class _InsightCards extends StatelessWidget {
  const _InsightCards({required this.data});
  final Map<String, dynamic> data;

  Color _trendColor(AppTokens t, String trend) => switch (trend) {
        'up'    => t.success,
        'down'  => t.destructive,
        _       => t.warning,
      };

  IconData _trendIcon(String trend) => switch (trend) {
        'up'   => LucideIcons.trendingUp,
        'down' => LucideIcons.trendingDown,
        _      => LucideIcons.minus,
      };

  @override
  Widget build(BuildContext context) {
    final t          = context.tokens;
    final headline   = (data['headline'] ?? 'Your Weekly Insight').toString();
    final summary    = (data['summary'] ?? '').toString();
    final score      = (data['momentum_score'] as num?)?.toInt() ?? 60;
    final trend      = (data['trend'] ?? 'steady').toString();
    final focusArea  = (data['focus_area'] ?? '').toString();
    final nudges     = (data['nudges'] as List?)
            ?.map((n) => n.toString())
            .toList() ??
        [];
    final highlights = (data['highlights'] as List?)
            ?.map((h) => h.toString())
            .toList() ??
        [];
    final trendColor = _trendColor(t, trend);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // ── Headline + summary card ───────────
        GradientCard(
          radius:  AppRadius.x2l,
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(children: [
                Expanded(
                  child: Text(
                    headline,
                    style: const TextStyle(
                      color:         Colors.white,
                      fontWeight:    FontWeight.w900,
                      fontSize:      17,
                      letterSpacing: -0.5,
                      height:        1.3,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color:        Colors.white.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(AppRadius.full),
                    border: Border.all(
                        color: Colors.white.withValues(alpha: 0.3)),
                  ),
                  child: Row(mainAxisSize: MainAxisSize.min, children: [
                    Icon(_trendIcon(trend), size: 11, color: Colors.white),
                    const SizedBox(width: 3),
                    Text(
                      trend.toUpperCase(),
                      style: const TextStyle(
                        color:         Colors.white,
                        fontSize:      9,
                        fontWeight:    FontWeight.w800,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ]),
                ),
              ]),
              if (summary.isNotEmpty) ...[
                const SizedBox(height: 10),
                Text(
                  summary,
                  style: const TextStyle(
                    color:    Colors.white70,
                    height:   1.6,
                    fontSize: 12,
                  ),
                ),
              ],
            ],
          ),
        ).animate().fadeIn(duration: 300.ms).slideY(
              begin: 0.04,
              end:   0,
              duration: 300.ms,
              curve:    Curves.easeOut,
            ),

        const SizedBox(height: 12),

        // ── Momentum score card ───────────────
        PremiumCard(
          topAccentColor: trendColor,
          child: Row(children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'MOMENTUM SCORE',
                    style: TextStyle(
                      color:         t.textMuted,
                      fontSize:      10,
                      fontWeight:    FontWeight.w800,
                      letterSpacing: 1.1,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      AnimatedMetric(
                        value:  score.toDouble(),
                        style:  TextStyle(
                          fontSize:      38,
                          fontWeight:    FontWeight.w900,
                          color:         t.textPrimary,
                          letterSpacing: -1.5,
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.only(bottom: 5),
                        child: Text(
                          ' / 100',
                          style: TextStyle(
                            color:      t.textMuted,
                            fontSize:   14,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  PremiumProgressBar(
                    value:  score / 100,
                    height: 6,
                    color:  _scoreColor(t, score),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 16),
            Container(
              width:  52,
              height: 52,
              decoration: BoxDecoration(
                color:        trendColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(AppRadius.md),
                border:       Border.all(
                    color: trendColor.withValues(alpha: 0.25)),
              ),
              child: Icon(_trendIcon(trend),
                  size: 24, color: trendColor),
            ),
          ]),
        ).staggered(1),

        const SizedBox(height: 12),

        // ── Focus area ────────────────────────
        if (focusArea.isNotEmpty)
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [t.primarySurface, t.surface],
              ),
              borderRadius: BorderRadius.circular(AppRadius.xl),
              border:       Border.all(
                  color: t.primary.withValues(alpha: 0.25)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width:  34,
                  height: 34,
                  decoration: BoxDecoration(
                    gradient:     AppGradients.lifekit,
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                    boxShadow:    AppShadows.greenSm,
                  ),
                  child: const Icon(LucideIcons.target,
                      color: Colors.white, size: 16),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'THIS WEEK\'S FOCUS',
                        style: TextStyle(
                          color:         t.primary,
                          fontSize:      9,
                          fontWeight:    FontWeight.w800,
                          letterSpacing: 1.0,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        focusArea,
                        style: TextStyle(
                          color:      t.textPrimary,
                          fontWeight: FontWeight.w600,
                          fontSize:   12,
                          height:     1.4,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ).staggered(2),

        if (focusArea.isNotEmpty) const SizedBox(height: 12),

        // ── Highlights ────────────────────────
        if (highlights.isNotEmpty) ...[
          ...highlights.indexed.map((item) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    color:        t.surface,
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                    border:       Border.all(color: t.cardBorder),
                  ),
                  child: Row(children: [
                    Container(
                      width:  26,
                      height: 26,
                      decoration: BoxDecoration(
                        gradient:     AppGradients.lifekit,
                        borderRadius: BorderRadius.circular(AppRadius.sm),
                      ),
                      child: Center(
                        child: Text(
                          '${item.$1 + 1}',
                          style: const TextStyle(
                            color:      Colors.white,
                            fontWeight: FontWeight.w800,
                            fontSize:   11,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        item.$2,
                        style: TextStyle(
                          color:      t.textPrimary,
                          fontSize:   13,
                          fontWeight: FontWeight.w600,
                          height:     1.4,
                        ),
                      ),
                    ),
                  ]),
                ).staggered(3 + item.$1),
              )),
          const SizedBox(height: 8),
        ],

        // ── AI nudges ─────────────────────────
        if (nudges.isNotEmpty) ...[
          Text(
            'AI COACHING NUDGES',
            style: TextStyle(
              color:         t.textMuted,
              fontSize:      10,
              fontWeight:    FontWeight.w800,
              letterSpacing: 1.1,
            ),
          ),
          const SizedBox(height: 8),
          ...nudges.indexed.map((item) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color:        t.backgroundSubtle,
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                    border:       Border.all(color: t.border),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width:  24,
                        height: 24,
                        decoration: BoxDecoration(
                          color:        t.primarySurface,
                          borderRadius: BorderRadius.circular(AppRadius.full),
                          border: Border.all(
                              color: t.primary.withValues(alpha: 0.25)),
                        ),
                        child: Center(
                          child: Text(
                            '${item.$1 + 1}',
                            style: TextStyle(
                              color:      t.primary,
                              fontWeight: FontWeight.w800,
                              fontSize:   10,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          item.$2,
                          style: TextStyle(
                            color:    t.textPrimary,
                            fontSize: 12,
                            height:   1.5,
                          ),
                        ),
                      ),
                    ],
                  ),
                ).staggered(5 + item.$1),
              )),
        ],
      ],
    );
  }

  Color _scoreColor(AppTokens t, int score) {
    if (score >= 75) return t.success;
    if (score >= 50) return t.warning;
    return t.destructive;
  }
}

// ─────────────────────────────────────────────
//  LOADING STATE  (shimmer skeleton)
// ─────────────────────────────────────────────
class _InsightLoadingCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Container(
      padding:     const EdgeInsets.all(20),
      decoration:  BoxDecoration(
        color:        t.surface,
        borderRadius: BorderRadius.circular(AppRadius.x2l),
        border:       Border.all(color: t.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            PulseGlow(
              child: Container(
                width:  32,
                height: 32,
                decoration: BoxDecoration(
                  gradient:     AppGradients.lifekit,
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                  boxShadow:    AppShadows.greenSm,
                ),
                child: const Icon(LucideIcons.wandSparkles,
                    color: Colors.white, size: 14),
              ),
            ),
            const SizedBox(width: 10),
            Text(
              'Generating your insights…',
              style: TextStyle(
                color:      t.textSecondary,
                fontWeight: FontWeight.w600,
                fontSize:   13,
              ),
            ),
          ]),
          const SizedBox(height: 16),
          ShimmerBox(height: 14, borderRadius: AppRadius.sm),
          const SizedBox(height: 8),
          ShimmerBox(height: 14, borderRadius: AppRadius.sm),
          const SizedBox(height: 8),
          ShimmerBox(width: 160, height: 14, borderRadius: AppRadius.sm),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  RETRY CARD
// ─────────────────────────────────────────────
class _InsightRetryCard extends StatelessWidget {
  const _InsightRetryCard({required this.error, required this.onRetry});
  final String error;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final msg = error.length > 120 ? '${error.substring(0, 120)}…' : error;
    return InlineRetryBanner(message: msg, onRetry: onRetry);
  }
}

// ─────────────────────────────────────────────
//  EMPTY CARD  (not yet fetched)
// ─────────────────────────────────────────────
class _InsightEmptyCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Container(
      padding:     const EdgeInsets.all(20),
      decoration:  BoxDecoration(
        color:        t.backgroundSubtle,
        borderRadius: BorderRadius.circular(AppRadius.x2l),
        border:       Border.all(color: t.border),
      ),
      child: Row(children: [
        Icon(LucideIcons.sparkles, size: 20, color: t.textMuted),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            'AI insights are being prepared for your data.',
            style: TextStyle(
                color: t.textMuted, fontSize: 13, height: 1.5),
          ),
        ),
      ]),
    );
  }
}

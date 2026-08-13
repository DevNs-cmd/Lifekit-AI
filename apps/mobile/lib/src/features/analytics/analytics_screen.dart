import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/design/tokens.dart';
import '../../core/repository.dart';

import '../../core/widgets/premium_card.dart';

class AnalyticsScreen extends ConsumerStatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  ConsumerState<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends ConsumerState<AnalyticsScreen> {
  Map<String, dynamic> _data = {};
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadAnalytics();
  }

  Future<void> _loadAnalytics() async {
    try {
      final repo = ref.read(repositoryProvider);
      final res = await repo.analytics();
      if (!mounted) return;
      setState(() {
        _data = res;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final weekly = (_data['weeklyProductivity'] as List? ?? []);

    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(
        title: const Text('Progress & Analytics'),
        centerTitle: false,
      ),
      body: _loading
          ? Center(child: CircularProgressIndicator(color: t.primary))
          : SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 40),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      _metricCard(
                        t: t,
                        title: 'Task Completion Rate',
                        val: '${_data['taskCompletionRate'] ?? 68}%',
                        icon: LucideIcons.checkSquare,
                      ),
                      const SizedBox(width: 12),
                      _metricCard(
                        t: t,
                        title: 'Current Streak',
                        val: '${_data['currentStreak'] ?? 5} Days',
                        icon: LucideIcons.flame,
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Weekly Focus Activity',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: t.textPrimary,
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
                                sideTitles: SideTitles(showTitles: false)),
                            topTitles: const AxisTitles(
                                sideTitles: SideTitles(showTitles: false)),
                            leftTitles: const AxisTitles(
                                sideTitles: SideTitles(showTitles: false)),
                            bottomTitles: AxisTitles(
                              sideTitles: SideTitles(
                                showTitles: true,
                                getTitlesWidget: (val, idx) {
                                  final i = val.toInt();
                                  if (i >= 0 && i < weekly.length) {
                                    return Padding(
                                      padding: const EdgeInsets.only(top: 8),
                                      child: Text(
                                        weekly[i]['day'].toString(),
                                        style: TextStyle(
                                          fontSize: 11,
                                          color: t.textMuted,
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
                            final idx = item.$1;
                            final map = item.$2;
                            final count =
                                (map['tasksCompleted'] as num? ?? 0).toDouble();
                            return BarChartGroupData(
                              x: idx,
                              barRods: [
                                BarChartRodData(
                                  toY: count,
                                  color: t.primary,
                                  width: 16,
                                  borderRadius:
                                      BorderRadius.circular(AppRadius.xs),
                                ),
                              ],
                            );
                          }).toList(),
                        ),
                      ),
                    ),
                  ).animate().fadeIn(duration: 250.ms),
                ],
              ),
            ),
    );
  }

  Widget _metricCard({
    required AppTokens t,
    required String title,
    required String val,
    required IconData icon,
  }) {
    return Expanded(
      child: PremiumCard(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: t.primarySurface,
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                  ),
                  child: Icon(icon, size: 16, color: t.primary),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: t.textMuted,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              val,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w900,
                color: t.textPrimary,
                letterSpacing: -0.8,
              ),
            ),
          ],
        ),
      ),
    );
  }
}


import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/design/tokens.dart';
import '../../core/repository.dart';

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
      ),
      body: _loading
          ? Center(child: CircularProgressIndicator(color: t.primary))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      _metricCard(
                          t,
                          'Task Rate',
                          '${_data['taskCompletionRate'] ?? 68}%',
                          LucideIcons.checkSquare),
                      const SizedBox(width: 12),
                      _metricCard(
                          t,
                          'Current Streak',
                          '${_data['currentStreak'] ?? 5} Days',
                          LucideIcons.flame),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Text('Weekly Focus Activity',
                      style: Theme.of(context)
                          .textTheme
                          .titleMedium
                          ?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  Container(
                    height: 220,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: t.surface,
                      borderRadius: BorderRadius.circular(AppRadius.xl),
                      border: Border.all(color: t.border),
                    ),
                    child: BarChart(
                      BarChartData(
                        borderData: FlBorderData(show: false),
                        titlesData: FlTitlesData(
                          rightTitles: const AxisTitles(
                              sideTitles: SideTitles(showTitles: false)),
                          topTitles: const AxisTitles(
                              sideTitles: SideTitles(showTitles: false)),
                          bottomTitles: AxisTitles(
                            sideTitles: SideTitles(
                              showTitles: true,
                              getTitlesWidget: (val, idx) {
                                final i = val.toInt();
                                if (i >= 0 && i < weekly.length) {
                                  return Padding(
                                    padding: const EdgeInsets.only(top: 6),
                                    child: Text(weekly[i]['day'].toString(),
                                        style: const TextStyle(fontSize: 10)),
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
                                width: 14,
                                borderRadius: BorderRadius.circular(4),
                              ),
                            ],
                          );
                        }).toList(),
                      ),
                    ),
                  ).animate().fadeIn(),
                ],
              ),
            ),
    );
  }

  Widget _metricCard(AppTokens t, String title, String val, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: t.surface,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(color: t.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, size: 18, color: t.primary),
                const SizedBox(width: 8),
                Text(title, style: TextStyle(color: t.textMuted, fontSize: 12)),
              ],
            ),
            const SizedBox(height: 8),
            Text(val,
                style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: t.textPrimary)),
          ],
        ),
      ),
    );
  }
}

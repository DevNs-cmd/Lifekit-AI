import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:percent_indicator/linear_percent_indicator.dart';
import '../../../core/constants.dart';
import '../../models/mission_model.dart';

class ActiveMissionCard extends StatelessWidget {
  final MissionModel mission;

  const ActiveMissionCard({
    Key? key,
    required this.mission,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Material(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: () => context.go('/mission/${mission.id}'),
          borderRadius: BorderRadius.circular(16),
          splashColor: AppColors.accentPurple.withOpacity(0.2),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.borderSubtle),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppColors.surfaceLight,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(
                            Icons.rocket_launch_rounded,
                            color: AppColors.accentGlow,
                            size: 20,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              mission.title,
                              style: const TextStyle(
                                color: AppColors.textHigh,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Row(
                              children: [
                                Builder(
                                  builder: (context) {
                                    final catColors = AppColors.getCategoryColors(mission.category);
                                    return Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: catColors.backgroundColor,
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        mission.category,
                                        style: TextStyle(
                                          color: catColors.textColor,
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    );
                                  },
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  mission.duration,
                                  style: const TextStyle(
                                    color: AppColors.textMuted,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceLight,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.borderSubtle),
                      ),
                      child: Text(
                        '${mission.progressPercentInt}%',
                        style: const TextStyle(
                          color: AppColors.textHigh,
                          fontWeight: FontWeight.w800,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                LinearPercentIndicator(
                  lineHeight: 8.0,
                  percent: mission.progressPercentage.clamp(0.0, 1.0),
                  backgroundColor: AppColors.surfaceLight,
                  progressColor: AppColors.accentGlow,
                  barRadius: const Radius.circular(4),
                  padding: EdgeInsets.zero,
                  animation: true,
                  animationDuration: 600,
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${mission.completedTaskCount} of ${mission.tasks.length} tasks completed',
                      style: const TextStyle(
                        color: AppColors.textMedium,
                        fontSize: 12,
                      ),
                    ),
                    const Row(
                      children: [
                        Text(
                          'Execute',
                          style: TextStyle(
                            color: AppColors.accentGlow,
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        SizedBox(width: 4),
                        Icon(
                          Icons.arrow_forward_ios_rounded,
                          color: AppColors.accentGlow,
                          size: 10,
                        )
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

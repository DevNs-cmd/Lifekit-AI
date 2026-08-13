import 'package:flutter/material.dart';
import '../design/tokens.dart';

class StatusBadge extends StatelessWidget {
  const StatusBadge({
    required this.status,
    this.compact = false,
    super.key,
  });

  final String status;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final (bg, fg, label) = _badgeStyle(t, status);

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: compact ? 8 : 10,
        vertical: compact ? 3 : 4,
      ),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(AppRadius.full),
        border: Border.all(color: fg.withValues(alpha: 0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(
              color: fg,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              color: fg,
              fontSize: compact ? 10 : 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.2,
            ),
          ),
        ],
      ),
    );
  }

  (Color, Color, String) _badgeStyle(AppTokens t, String rawStatus) {
    final s = rawStatus.toUpperCase();
    return switch (s) {
      'ACTIVE' || 'IN_PROGRESS' => (t.primarySurface, t.primary, 'Active'),
      'COMPLETED' || 'DONE' => (
          const Color(0xFFECFDF5),
          const Color(0xFF059669),
          'Completed'
        ),
      'PAUSED' => (const Color(0xFFFEF3C7), const Color(0xFFD97706), 'Paused'),
      'URGENT' || 'HIGH' || 'AT_RISK' => (
          t.destructiveSurface,
          t.destructive,
          s == 'AT_RISK' ? 'At Risk' : rawStatus
        ),
      'MEDIUM' => (t.backgroundSubtle, t.textSecondary, 'Medium'),
      _ => (t.backgroundSubtle, t.textMuted, rawStatus),
    };
  }
}

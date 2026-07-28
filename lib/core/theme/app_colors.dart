import 'package:flutter/material.dart';

/// Helper class for badge colors (background and text)
class BadgeColors {
  final Color backgroundColor;
  final Color textColor;

  const BadgeColors({
    required this.backgroundColor,
    required this.textColor,
  });
}

/// Helper class for match score colors (border, text, background)
class MatchScoreColors {
  final Color borderColor;
  final Color textColor;
  final Color backgroundColor;

  const MatchScoreColors({
    required this.borderColor,
    required this.textColor,
    required this.backgroundColor,
  });
}

class AppColors {
  AppColors._();

  // --- 1. CORE BRAND HEX VALUES ---
  // Brand Primary
  static const Color brandPrimaryLight = Color(0xFF4C0FBD);
  static const Color brandPrimaryDark = Color(0xFF7C3AED);

  // Brand Accent
  static const Color brandAccentLight = Color(0xFF7C3AED);
  static const Color brandAccentDark = Color(0xFF9D6EFF);

  // Page Background
  static const Color pageBackgroundLight = Color(0xFFFFFFFF);
  static const Color pageBackgroundDark = Color(0xFF0D0B1A);

  // Subtle Background
  static const Color subtleBackgroundLight = Color(0xFFF5F3FF);
  static const Color subtleBackgroundDark = Color(0xFF141122);

  // Card Surface
  static const Color cardSurfaceLight = Color(0xFFFFFFFF);
  static const Color cardSurfaceDark = Color(0xFF131027);

  // Hover / Secondary
  static const Color hoverSecondaryLight = Color(0xFFEDE9FF);
  static const Color hoverSecondaryDark = Color(0xFF1E1B33);

  // Border
  static const Color borderLight = Color(0xFFC9C0F0);
  static const Color borderDark = Color(0xFF2C2845);

  // Body Text (Primary)
  static const Color bodyTextLight = Color(0xFF120D2B);
  static const Color bodyTextDark = Color(0xFFEDE9FF);

  // Muted Text (Secondary)
  static const Color mutedTextLight = Color(0xFF6B60A0);
  static const Color mutedTextDark = Color(0xFF8A82B8);

  // Success Green
  static const Color successGreen = Color(0xFF22C55E);

  // Warning Amber
  static const Color warningAmber = Color(0xFFF59E0B);

  // Error Red
  static const Color errorRedLight = Color(0xFFEF3333);
  static const Color errorRedDark = Color(0xFFDC2626);

  // Info Blue
  static const Color infoBlue = Color(0xFF3B82F6);

  // Legacy/Default Aliases for backward compatibility
  static const Color primaryBg = pageBackgroundDark;
  static const Color cardBg = cardSurfaceDark;
  static const Color surfaceLight = hoverSecondaryDark;
  static const Color accentPurple = brandPrimaryDark;
  static const Color accentGlow = brandAccentDark;
  static const Color borderSubtle = borderDark;
  static const Color textHigh = bodyTextDark;
  static const Color textMedium = mutedTextDark;
  static const Color textMuted = Color(0xFF6E6589);
  static const Color warningOrange = warningAmber;

  // --- 2. BRAND GRADIENT ---
  static const LinearGradient lifekitGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      Color(0xFF4C0FBD),
      Color(0xFF7C3AED),
    ],
  );

  // --- 3. CATEGORY BADGE HELPER ---
  static BadgeColors getCategoryColors(String category) {
    switch (category.trim().toLowerCase()) {
      case 'career':
        return const BadgeColors(
          backgroundColor: Color(0xFFE0F2FE), // blue-100
          textColor: Color(0xFF1D4ED8), // blue-700
        );
      case 'finance':
        return const BadgeColors(
          backgroundColor: Color(0xFFDCFCE7), // green-100
          textColor: Color(0xFF15803D), // green-700
        );
      case 'health':
        return const BadgeColors(
          backgroundColor: Color(0xFFFEE2E2), // red-100
          textColor: Color(0xFFB91C1C), // red-700
        );
      case 'travel':
        return const BadgeColors(
          backgroundColor: Color(0xFFCFFAFE), // cyan-100
          textColor: Color(0xFF0E7490), // cyan-700
        );
      case 'business':
        return const BadgeColors(
          backgroundColor: Color(0xFFFFEDD5), // orange-100
          textColor: Color(0xFFC2410C), // orange-700
        );
      case 'education':
        return const BadgeColors(
          backgroundColor: Color(0xFFEDE9FE), // violet-100
          textColor: Color(0xFF6D28D9), // violet-700
        );
      case 'productivity':
        return const BadgeColors(
          backgroundColor: Color(0xFFFEF9C3), // yellow-100
          textColor: Color(0xFFA16207), // yellow-700
        );
      case 'personal growth':
      case 'personalgrowth':
        return const BadgeColors(
          backgroundColor: Color(0xFFF3E8FF), // purple-100
          textColor: Color(0xFF7E22CE), // purple-700
        );
      case 'lifestyle':
        return const BadgeColors(
          backgroundColor: Color(0xFFFCE7F3), // pink-100
          textColor: Color(0xFFBE185D), // pink-700
        );
      case 'family':
        return const BadgeColors(
          backgroundColor: Color(0xFFCCFBF1), // teal-100
          textColor: Color(0xFF0F766E), // teal-700
        );
      default:
        return const BadgeColors(
          backgroundColor: Color(0xFFEDE9FE),
          textColor: Color(0xFF6D28D9),
        );
    }
  }

  // --- 4. STATUS BADGE HELPER ---
  static BadgeColors getStatusColors(String status, {bool isDark = true}) {
    switch (status.trim().toLowerCase()) {
      case 'active':
        return const BadgeColors(
          backgroundColor: Color(0x2622C55E), // 15% opacity
          textColor: Color(0xFF16A34A),
        );
      case 'paused':
      case 'at risk':
      case 'atrisk':
        return const BadgeColors(
          backgroundColor: Color(0x26F59E0B), // 15% opacity
          textColor: Color(0xFFB45309),
        );
      case 'completed':
        return const BadgeColors(
          backgroundColor: Color(0xFFF3E8FF),
          textColor: Color(0xFF7E22CE),
        );
      case 'cancelled':
      case 'blocked':
        return const BadgeColors(
          backgroundColor: Color(0x26EF3333), // 15% opacity
          textColor: Color(0xFFDC2626),
        );
      case 'in progress':
      case 'inprogress':
        return const BadgeColors(
          backgroundColor: Color(0x263B82F6), // 15% opacity
          textColor: Color(0xFF2563EB),
        );
      case 'draft':
      case 'not started':
      case 'notstarted':
      default:
        return BadgeColors(
          backgroundColor: isDark ? borderDark : borderLight,
          textColor: isDark ? mutedTextDark : mutedTextLight,
        );
    }
  }

  // --- 5. TASK PRIORITY HELPER ---
  static BadgeColors getPriorityColors(String priority) {
    switch (priority.trim().toLowerCase()) {
      case 'low':
        return const BadgeColors(
          backgroundColor: Color(0xFFF3F4F6),
          textColor: Color(0xFF4B5563),
        );
      case 'medium':
        return const BadgeColors(
          backgroundColor: Color(0xFFDBEAFE),
          textColor: Color(0xFF2563EB),
        );
      case 'high':
        return const BadgeColors(
          backgroundColor: Color(0xFFFEF3C7),
          textColor: Color(0xFFB45309),
        );
      case 'urgent':
        return const BadgeColors(
          backgroundColor: Color(0xFFFEE2E2),
          textColor: Color(0xFFB91C1C),
        );
      default:
        return const BadgeColors(
          backgroundColor: Color(0xFFDBEAFE),
          textColor: Color(0xFF2563EB),
        );
    }
  }

  // --- 6. OPPORTUNITY MATCH SCORE HELPER ---
  static MatchScoreColors getMatchScoreColors(double percentage, {bool isDark = true}) {
    if (percentage >= 85) {
      return const MatchScoreColors(
        borderColor: Color(0xFF4ADE80),
        textColor: Color(0xFF16A34A),
        backgroundColor: Color(0xFFF0FDF4),
      );
    } else if (percentage >= 70) {
      return const MatchScoreColors(
        borderColor: Color(0xFF60A5FA),
        textColor: Color(0xFF2563EB),
        backgroundColor: Color(0xFFEFF6FF),
      );
    } else {
      return MatchScoreColors(
        borderColor: isDark ? borderDark : borderLight,
        textColor: isDark ? mutedTextDark : mutedTextLight,
        backgroundColor: isDark ? cardSurfaceDark : cardSurfaceLight,
      );
    }
  }
}

// ignore_for_file: non_constant_identifier_names
// LifeKit Mobile Design System Tokens
// Adheres to 80% neutral, 15% structure, 5% organic forest green (#217C45) ratio.
library;

import 'package:flutter/material.dart';

// ─────────────────────────────────────────────
//  RADIUS CONSTANTS
// ─────────────────────────────────────────────
abstract final class AppRadius {
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 20;
  static const double x2l = 24;
  static const double x3l = 28;
  static const double full = 999;

  static BorderRadius get rxs => BorderRadius.circular(xs);
  static BorderRadius get rsm => BorderRadius.circular(sm);
  static BorderRadius get rmd => BorderRadius.circular(md);
  static BorderRadius get rlg => BorderRadius.circular(lg);
  static BorderRadius get rxl => BorderRadius.circular(xl);
  static BorderRadius get rx2l => BorderRadius.circular(x2l);
  static BorderRadius get rx3l => BorderRadius.circular(x3l);
  static BorderRadius get rfull => BorderRadius.circular(full);
}

// ─────────────────────────────────────────────
//  SHADOW SYSTEM
// ─────────────────────────────────────────────
abstract final class AppShadows {
  static const List<BoxShadow> xs = [
    BoxShadow(color: Color(0x08000000), blurRadius: 2, offset: Offset(0, 1)),
  ];
  static const List<BoxShadow> sm = [
    BoxShadow(color: Color(0x0C000000), blurRadius: 4, offset: Offset(0, 2)),
  ];
  static const List<BoxShadow> md = [
    BoxShadow(color: Color(0x10000000), blurRadius: 8, offset: Offset(0, 4)),
    BoxShadow(color: Color(0x06000000), blurRadius: 2, offset: Offset(0, 1)),
  ];
  static const List<BoxShadow> lg = [
    BoxShadow(color: Color(0x12000000), blurRadius: 16, offset: Offset(0, 8)),
    BoxShadow(color: Color(0x08000000), blurRadius: 4, offset: Offset(0, 2)),
  ];
  static const List<BoxShadow> xl = [
    BoxShadow(color: Color(0x16000000), blurRadius: 24, offset: Offset(0, 12)),
    BoxShadow(color: Color(0x0A000000), blurRadius: 8, offset: Offset(0, 4)),
  ];
  static const List<BoxShadow> green = [
    BoxShadow(color: Color(0x40217C45), blurRadius: 20, offset: Offset(0, 8)),
    BoxShadow(color: Color(0x20217C45), blurRadius: 40, offset: Offset(0, 16)),
  ];
  static const List<BoxShadow> greenSm = [
    BoxShadow(color: Color(0x30217C45), blurRadius: 10, offset: Offset(0, 4)),
  ];
  static const List<BoxShadow> card = [
    BoxShadow(color: Color(0x0A000000), blurRadius: 12, offset: Offset(0, 4)),
    BoxShadow(color: Color(0x05000000), blurRadius: 2, offset: Offset(0, 1)),
    BoxShadow(
      color: Color(0x04FFFFFF),
      blurRadius: 1,
      offset: Offset(0, -1),
      spreadRadius: 0,
    ),
  ];

  // ── Elevation tiers (primary-tinted) ────────
  // Level 0 — flat: no shadow, border only (use [] or omit)
  static const List<BoxShadow> elevation0 = [];

  // Level 1 — card: soft primary-tinted shadow
  // Uses the light-mode primary green (0xFF217C45) at 6% opacity
  static const List<BoxShadow> elevation1Light = [
    BoxShadow(
      color: Color(0x0F217C45), // primary.withOpacity(0.06)
      blurRadius: 16,
      offset: Offset(0, 4),
    ),
    BoxShadow(color: Color(0x06000000), blurRadius: 2, offset: Offset(0, 1)),
  ];
  // Dark-mode variant uses dark primary (0xFF66BB6A)
  static const List<BoxShadow> elevation1Dark = [
    BoxShadow(
      color: Color(0x0F66BB6A), // primary.withOpacity(0.06)
      blurRadius: 16,
      offset: Offset(0, 4),
    ),
    BoxShadow(color: Color(0x08000000), blurRadius: 2, offset: Offset(0, 1)),
  ];

  // Level 2 — raised/interactive: stronger primary-tinted shadow
  static const List<BoxShadow> elevation2Light = [
    BoxShadow(
      color: Color(0x1F217C45), // primary.withOpacity(0.12)
      blurRadius: 32,
      offset: Offset(0, 8),
    ),
    BoxShadow(color: Color(0x08000000), blurRadius: 4, offset: Offset(0, 2)),
  ];
  static const List<BoxShadow> elevation2Dark = [
    BoxShadow(
      color: Color(0x1F66BB6A), // primary.withOpacity(0.12)
      blurRadius: 32,
      offset: Offset(0, 8),
    ),
    BoxShadow(color: Color(0x0A000000), blurRadius: 4, offset: Offset(0, 2)),
  ];

  // ── Progress ring glow (around circular indicators) ──
  static const List<BoxShadow> ringGlowLight = [
    BoxShadow(
      color: Color(0x59217C45), // primary.withOpacity(0.35)
      blurRadius: 20,
      spreadRadius: 2,
    ),
  ];
  static const List<BoxShadow> ringGlowDark = [
    BoxShadow(
      color: Color(0x5966BB6A),
      blurRadius: 20,
      spreadRadius: 2,
    ),
  ];
}

// ─────────────────────────────────────────────
//  ELEVATION HELPER — picks light or dark shadow
//  based on the current Brightness.
// ─────────────────────────────────────────────
abstract final class AppElevation {
  /// Returns the correct Level-1 shadow list for the given brightness.
  static List<BoxShadow> level1(Brightness b) => b == Brightness.light
      ? AppShadows.elevation1Light
      : AppShadows.elevation1Dark;

  /// Returns the correct Level-2 shadow list for the given brightness.
  static List<BoxShadow> level2(Brightness b) => b == Brightness.light
      ? AppShadows.elevation2Light
      : AppShadows.elevation2Dark;

  /// Returns the progress-ring glow for the given brightness.
  static List<BoxShadow> ringGlow(Brightness b) => b == Brightness.light
      ? AppShadows.ringGlowLight
      : AppShadows.ringGlowDark;
}

// ─────────────────────────────────────────────
//  GRADIENT CONSTANTS
// ─────────────────────────────────────────────
abstract final class AppGradients {
  static const heroLight = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF153F27), Color(0xFF1D6A38), Color(0xFF3B9848)],
    stops: [0.0, 0.52, 1.0],
  );
  static const heroDark = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF0D2B18), Color(0xFF143D22), Color(0xFF1D5C30)],
  );
  static const lifekit = LinearGradient(
    begin: Alignment(-0.5, -0.5),
    end: Alignment(0.5, 0.5),
    colors: [Color(0xFF2E7D32), Color(0xFF4CAF50)],
  );
  static const cardSheen = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0x08FFFFFF), Color(0x00FFFFFF)],
  );

  /// Two radial blobs stacked — used as the mesh background on Home / AI Coach.
  static const meshBlob1 = RadialGradient(
    center: Alignment(0.9, -0.8),
    radius: 1.4,
    colors: [Color(0x1A217C45), Color(0x00217C45)],
  );
  static const meshBlob2 = RadialGradient(
    center: Alignment(-0.8, 0.9),
    radius: 1.0,
    colors: [Color(0x0DFFD54F), Color(0x00FFD54F)],
  );
}

// ─────────────────────────────────────────────
//  THEME EXTENSION — LifeKit Design Tokens
// ─────────────────────────────────────────────
@immutable
class AppTokens extends ThemeExtension<AppTokens> {
  const AppTokens({
    // Primary
    required this.primary,
    required this.primaryHover,
    required this.primaryGlow,
    required this.primarySurface,
    required this.primarySurfaceFg,
    // Accent
    required this.accent,
    required this.accentFg,
    // Backgrounds
    required this.background,
    required this.backgroundSubtle,
    required this.surface,
    required this.surfaceSecondary,
    required this.cardBg,
    required this.cardBorder,
    // Text
    required this.textPrimary,
    required this.textSecondary,
    required this.textMuted,
    required this.textInverse,
    // Borders
    required this.border,
    required this.borderStrong,
    // Semantic
    required this.destructive,
    required this.destructiveSurface,
    required this.warning,
    required this.warningSurface,
    required this.success,
    required this.successSurface,
    required this.info,
    required this.infoSurface,
    // Priority colours
    required this.priorityLowBg,
    required this.priorityLowFg,
    required this.priorityMedBg,
    required this.priorityMedFg,
    required this.priorityHighBg,
    required this.priorityHighFg,
    required this.priorityUrgentBg,
    required this.priorityUrgentFg,
    // Status colours
    required this.statusActiveBg,
    required this.statusActiveFg,
    required this.statusActiveBorder,
    required this.statusPausedBg,
    required this.statusPausedFg,
    required this.statusPausedBorder,
    required this.statusDraftBg,
    required this.statusDraftFg,
    required this.statusDraftBorder,
    // Hero gradient (brightness-dependent)
    required this.heroGradient,
  });

  final Color primary;
  final Color primaryHover;
  final Color primaryGlow;
  final Color primarySurface;
  final Color primarySurfaceFg;

  final Color accent;
  final Color accentFg;

  final Color background;
  final Color backgroundSubtle;
  final Color surface;
  final Color surfaceSecondary;
  final Color cardBg;
  final Color cardBorder;

  final Color textPrimary;
  final Color textSecondary;
  final Color textMuted;
  final Color textInverse;

  final Color border;
  final Color borderStrong;

  final Color destructive;
  final Color destructiveSurface;
  final Color warning;
  final Color warningSurface;
  final Color success;
  final Color successSurface;
  final Color info;
  final Color infoSurface;

  final Color priorityLowBg;
  final Color priorityLowFg;
  final Color priorityMedBg;
  final Color priorityMedFg;
  final Color priorityHighBg;
  final Color priorityHighFg;
  final Color priorityUrgentBg;
  final Color priorityUrgentFg;

  final Color statusActiveBg;
  final Color statusActiveFg;
  final Color statusActiveBorder;
  final Color statusPausedBg;
  final Color statusPausedFg;
  final Color statusPausedBorder;
  final Color statusDraftBg;
  final Color statusDraftFg;
  final Color statusDraftBorder;

  final LinearGradient heroGradient;

  // ── Light ──────────────────────────────────
  static const light = AppTokens(
    primary: Color(0xFF217C45),
    primaryHover: Color(0xFF1A623B),
    primaryGlow: Color(0x33217C45),
    primarySurface: Color(0xFFE6F0EB),
    primarySurfaceFg: Color(0xFF1E6B34),
    accent: Color(0xFFEDE8D9),
    accentFg: Color(0xFF6B5E3A),
    background: Color(0xFFF8F8F6),
    backgroundSubtle: Color(0xFFEFF0ED),
    surface: Color(0xFFFFFFFF),
    surfaceSecondary: Color(0xFFEFF0ED),
    cardBg: Color(0xFFFFFFFF),
    cardBorder: Color(0xFFD9DDD6),
    textPrimary: Color(0xFF1E2620),
    textSecondary: Color(0xFF626D66),
    textMuted: Color(0xFF969E98),
    textInverse: Color(0xFFFFFFFF),
    border: Color(0xFFD9DDD6),
    borderStrong: Color(0xFFB8BEB9),
    destructive: Color(0xFFB33030),
    destructiveSurface: Color(0xFFFDE8E8),
    warning: Color(0xFFA0621A),
    warningSurface: Color(0xFFFFF0D9),
    success: Color(0xFF217C45),
    successSurface: Color(0xFFE4F3EB),
    info: Color(0xFF2563EB),
    infoSurface: Color(0xFFE8EFFC),
    priorityLowBg: Color(0xFFF1F2EF),
    priorityLowFg: Color(0xFF545B57),
    priorityMedBg: Color(0xFFE8EFFC),
    priorityMedFg: Color(0xFF315A9B),
    priorityHighBg: Color(0xFFFFF0D9),
    priorityHighFg: Color(0xFF925A2F),
    priorityUrgentBg: Color(0xFFFDE8E8),
    priorityUrgentFg: Color(0xFFA23D3D),
    statusActiveBg: Color(0xFFE4F3EB),
    statusActiveFg: Color(0xFF267052),
    statusActiveBorder: Color(0xFFC6DFD0),
    statusPausedBg: Color(0xFFFFF0D9),
    statusPausedFg: Color(0xFF925A2F),
    statusPausedBorder: Color(0xFFEAD1B9),
    statusDraftBg: Color(0xFFF1F2EF),
    statusDraftFg: Color(0xFF545B57),
    statusDraftBorder: Color(0xFFD8DCD8),
    heroGradient: AppGradients.heroLight,
  );

  // ── Dark ───────────────────────────────────
  static const dark = AppTokens(
    primary: Color(0xFF66BB6A),
    primaryHover: Color(0xFF57A85B),
    primaryGlow: Color(0x3366BB6A),
    primarySurface: Color(0xFF1E3628),
    primarySurfaceFg: Color(0xFF66BB6A),
    accent: Color(0xFF2A2A1E),
    accentFg: Color(0xFFD4C89A),
    background: Color(0xFF0F0F0F),
    backgroundSubtle: Color(0xFF161616),
    surface: Color(0xFF1C1C1C),
    surfaceSecondary: Color(0xFF232323),
    cardBg: Color(0xFF1C1C1C),
    cardBorder: Color(0xFF2E2E2E),
    textPrimary: Color(0xFFF2F2F2),
    textSecondary: Color(0xFF9A9A9A),
    textMuted: Color(0xFF5E5E5E),
    textInverse: Color(0xFF0F0F0F),
    border: Color(0xFF2E2E2E),
    borderStrong: Color(0xFF404040),
    destructive: Color(0xFFEF5350),
    destructiveSurface: Color(0xFF2C1A1A),
    warning: Color(0xFFFFB74D),
    warningSurface: Color(0xFF2C2210),
    success: Color(0xFF66BB6A),
    successSurface: Color(0xFF1A2E1E),
    info: Color(0xFF60A5FA),
    infoSurface: Color(0xFF1A2035),
    priorityLowBg: Color(0xFF232323),
    priorityLowFg: Color(0xFF9A9A9A),
    priorityMedBg: Color(0xFF1A2035),
    priorityMedFg: Color(0xFF60A5FA),
    priorityHighBg: Color(0xFF2C2210),
    priorityHighFg: Color(0xFFFFB74D),
    priorityUrgentBg: Color(0xFF2C1A1A),
    priorityUrgentFg: Color(0xFFEF5350),
    statusActiveBg: Color(0xFF1A2E1E),
    statusActiveFg: Color(0xFF66BB6A),
    statusActiveBorder: Color(0xFF2A4A2E),
    statusPausedBg: Color(0xFF2C2210),
    statusPausedFg: Color(0xFFFFB74D),
    statusPausedBorder: Color(0xFF4A3820),
    statusDraftBg: Color(0xFF232323),
    statusDraftFg: Color(0xFF9A9A9A),
    statusDraftBorder: Color(0xFF2E2E2E),
    heroGradient: AppGradients.heroDark,
  );

  // ── ThemeExtension boilerplate ─────────────
  @override
  AppTokens copyWith({
    Color? primary,
    Color? primaryHover,
    Color? primaryGlow,
    Color? primarySurface,
    Color? primarySurfaceFg,
    Color? accent,
    Color? accentFg,
    Color? background,
    Color? backgroundSubtle,
    Color? surface,
    Color? surfaceSecondary,
    Color? cardBg,
    Color? cardBorder,
    Color? textPrimary,
    Color? textSecondary,
    Color? textMuted,
    Color? textInverse,
    Color? border,
    Color? borderStrong,
    Color? destructive,
    Color? destructiveSurface,
    Color? warning,
    Color? warningSurface,
    Color? success,
    Color? successSurface,
    Color? info,
    Color? infoSurface,
    Color? priorityLowBg,
    Color? priorityLowFg,
    Color? priorityMedBg,
    Color? priorityMedFg,
    Color? priorityHighBg,
    Color? priorityHighFg,
    Color? priorityUrgentBg,
    Color? priorityUrgentFg,
    Color? statusActiveBg,
    Color? statusActiveFg,
    Color? statusActiveBorder,
    Color? statusPausedBg,
    Color? statusPausedFg,
    Color? statusPausedBorder,
    Color? statusDraftBg,
    Color? statusDraftFg,
    Color? statusDraftBorder,
    LinearGradient? heroGradient,
  }) =>
      AppTokens(
        primary: primary ?? this.primary,
        primaryHover: primaryHover ?? this.primaryHover,
        primaryGlow: primaryGlow ?? this.primaryGlow,
        primarySurface: primarySurface ?? this.primarySurface,
        primarySurfaceFg: primarySurfaceFg ?? this.primarySurfaceFg,
        accent: accent ?? this.accent,
        accentFg: accentFg ?? this.accentFg,
        background: background ?? this.background,
        backgroundSubtle: backgroundSubtle ?? this.backgroundSubtle,
        surface: surface ?? this.surface,
        surfaceSecondary: surfaceSecondary ?? this.surfaceSecondary,
        cardBg: cardBg ?? this.cardBg,
        cardBorder: cardBorder ?? this.cardBorder,
        textPrimary: textPrimary ?? this.textPrimary,
        textSecondary: textSecondary ?? this.textSecondary,
        textMuted: textMuted ?? this.textMuted,
        textInverse: textInverse ?? this.textInverse,
        border: border ?? this.border,
        borderStrong: borderStrong ?? this.borderStrong,
        destructive: destructive ?? this.destructive,
        destructiveSurface: destructiveSurface ?? this.destructiveSurface,
        warning: warning ?? this.warning,
        warningSurface: warningSurface ?? this.warningSurface,
        success: success ?? this.success,
        successSurface: successSurface ?? this.successSurface,
        info: info ?? this.info,
        infoSurface: infoSurface ?? this.infoSurface,
        priorityLowBg: priorityLowBg ?? this.priorityLowBg,
        priorityLowFg: priorityLowFg ?? this.priorityLowFg,
        priorityMedBg: priorityMedBg ?? this.priorityMedBg,
        priorityMedFg: priorityMedFg ?? this.priorityMedFg,
        priorityHighBg: priorityHighBg ?? this.priorityHighBg,
        priorityHighFg: priorityHighFg ?? this.priorityHighFg,
        priorityUrgentBg: priorityUrgentBg ?? this.priorityUrgentBg,
        priorityUrgentFg: priorityUrgentFg ?? this.priorityUrgentFg,
        statusActiveBg: statusActiveBg ?? this.statusActiveBg,
        statusActiveFg: statusActiveFg ?? this.statusActiveFg,
        statusActiveBorder: statusActiveBorder ?? this.statusActiveBorder,
        statusPausedBg: statusPausedBg ?? this.statusPausedBg,
        statusPausedFg: statusPausedFg ?? this.statusPausedFg,
        statusPausedBorder: statusPausedBorder ?? this.statusPausedBorder,
        statusDraftBg: statusDraftBg ?? this.statusDraftBg,
        statusDraftFg: statusDraftFg ?? this.statusDraftFg,
        statusDraftBorder: statusDraftBorder ?? this.statusDraftBorder,
        heroGradient: heroGradient ?? this.heroGradient,
      );

  @override
  AppTokens lerp(AppTokens? other, double t) {
    if (other == null) return this;
    return AppTokens(
      primary: Color.lerp(primary, other.primary, t)!,
      primaryHover: Color.lerp(primaryHover, other.primaryHover, t)!,
      primaryGlow: Color.lerp(primaryGlow, other.primaryGlow, t)!,
      primarySurface: Color.lerp(primarySurface, other.primarySurface, t)!,
      primarySurfaceFg:
          Color.lerp(primarySurfaceFg, other.primarySurfaceFg, t)!,
      accent: Color.lerp(accent, other.accent, t)!,
      accentFg: Color.lerp(accentFg, other.accentFg, t)!,
      background: Color.lerp(background, other.background, t)!,
      backgroundSubtle:
          Color.lerp(backgroundSubtle, other.backgroundSubtle, t)!,
      surface: Color.lerp(surface, other.surface, t)!,
      surfaceSecondary:
          Color.lerp(surfaceSecondary, other.surfaceSecondary, t)!,
      cardBg: Color.lerp(cardBg, other.cardBg, t)!,
      cardBorder: Color.lerp(cardBorder, other.cardBorder, t)!,
      textPrimary: Color.lerp(textPrimary, other.textPrimary, t)!,
      textSecondary: Color.lerp(textSecondary, other.textSecondary, t)!,
      textMuted: Color.lerp(textMuted, other.textMuted, t)!,
      textInverse: Color.lerp(textInverse, other.textInverse, t)!,
      border: Color.lerp(border, other.border, t)!,
      borderStrong: Color.lerp(borderStrong, other.borderStrong, t)!,
      destructive: Color.lerp(destructive, other.destructive, t)!,
      destructiveSurface:
          Color.lerp(destructiveSurface, other.destructiveSurface, t)!,
      warning: Color.lerp(warning, other.warning, t)!,
      warningSurface: Color.lerp(warningSurface, other.warningSurface, t)!,
      success: Color.lerp(success, other.success, t)!,
      successSurface: Color.lerp(successSurface, other.successSurface, t)!,
      info: Color.lerp(info, other.info, t)!,
      infoSurface: Color.lerp(infoSurface, other.infoSurface, t)!,
      priorityLowBg: Color.lerp(priorityLowBg, other.priorityLowBg, t)!,
      priorityLowFg: Color.lerp(priorityLowFg, other.priorityLowFg, t)!,
      priorityMedBg: Color.lerp(priorityMedBg, other.priorityMedBg, t)!,
      priorityMedFg: Color.lerp(priorityMedFg, other.priorityMedFg, t)!,
      priorityHighBg: Color.lerp(priorityHighBg, other.priorityHighBg, t)!,
      priorityHighFg: Color.lerp(priorityHighFg, other.priorityHighFg, t)!,
      priorityUrgentBg:
          Color.lerp(priorityUrgentBg, other.priorityUrgentBg, t)!,
      priorityUrgentFg:
          Color.lerp(priorityUrgentFg, other.priorityUrgentFg, t)!,
      statusActiveBg: Color.lerp(statusActiveBg, other.statusActiveBg, t)!,
      statusActiveFg: Color.lerp(statusActiveFg, other.statusActiveFg, t)!,
      statusActiveBorder:
          Color.lerp(statusActiveBorder, other.statusActiveBorder, t)!,
      statusPausedBg: Color.lerp(statusPausedBg, other.statusPausedBg, t)!,
      statusPausedFg: Color.lerp(statusPausedFg, other.statusPausedFg, t)!,
      statusPausedBorder:
          Color.lerp(statusPausedBorder, other.statusPausedBorder, t)!,
      statusDraftBg: Color.lerp(statusDraftBg, other.statusDraftBg, t)!,
      statusDraftFg: Color.lerp(statusDraftFg, other.statusDraftFg, t)!,
      statusDraftBorder:
          Color.lerp(statusDraftBorder, other.statusDraftBorder, t)!,
      heroGradient: LinearGradient.lerp(heroGradient, other.heroGradient, t)!,
    );
  }
}

// ─────────────────────────────────────────────
//  CONVENIENCE EXTENSION on BuildContext
// ─────────────────────────────────────────────
extension AppTokensContext on BuildContext {
  AppTokens get tokens =>
      Theme.of(this).extension<AppTokens>() ?? AppTokens.light;
}

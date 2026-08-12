import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

abstract final class AppTypography {
  // ── Raw Inter style factory ────────────────
  static TextStyle _inter({
    required double size,
    required FontWeight weight,
    double? letterSpacing,
    double? height,
    Color? color,
  }) =>
      GoogleFonts.inter(
        fontSize: size,
        fontWeight: weight,
        letterSpacing: letterSpacing,
        height: height,
        color: color,
      );

  // ── Full TextTheme ─────────────────────────
  static TextTheme textTheme([Color? baseColor]) => TextTheme(
        // Display
        displayLarge: _inter(
          size: 32, weight: FontWeight.w900,
          letterSpacing: -1.5, height: 1.1, color: baseColor,
        ),
        displayMedium: _inter(
          size: 26, weight: FontWeight.w800,
          letterSpacing: -1.0, height: 1.15, color: baseColor,
        ),
        displaySmall: _inter(
          size: 22, weight: FontWeight.w700,
          letterSpacing: -0.8, height: 1.2, color: baseColor,
        ),
        // Headline
        headlineLarge: _inter(
          size: 20, weight: FontWeight.w700,
          letterSpacing: -0.6, color: baseColor,
        ),
        headlineMedium: _inter(
          size: 18, weight: FontWeight.w700,
          letterSpacing: -0.4, color: baseColor,
        ),
        headlineSmall: _inter(
          size: 16, weight: FontWeight.w600,
          letterSpacing: -0.3, color: baseColor,
        ),
        // Title
        titleLarge: _inter(
          size: 16, weight: FontWeight.w600,
          letterSpacing: -0.2, color: baseColor,
        ),
        titleMedium: _inter(
          size: 14, weight: FontWeight.w600,
          letterSpacing: -0.1, color: baseColor,
        ),
        titleSmall: _inter(
          size: 13, weight: FontWeight.w500,
          color: baseColor,
        ),
        // Body
        bodyLarge: _inter(
          size: 15, weight: FontWeight.w400,
          height: 1.6, color: baseColor,
        ),
        bodyMedium: _inter(
          size: 14, weight: FontWeight.w400,
          height: 1.55, color: baseColor,
        ),
        bodySmall: _inter(
          size: 13, weight: FontWeight.w400,
          height: 1.5, color: baseColor,
        ),
        // Label
        labelLarge: _inter(
          size: 12, weight: FontWeight.w700,
          letterSpacing: 0.8, color: baseColor,
        ),
        labelMedium: _inter(
          size: 11, weight: FontWeight.w600,
          letterSpacing: 0.6, color: baseColor,
        ),
        labelSmall: _inter(
          size: 10, weight: FontWeight.w600,
          letterSpacing: 0.4, color: baseColor,
        ),
      );

  // ── Convenience named styles ───────────────
  static TextStyle inter(
    double size,
    FontWeight weight, {
    double? letterSpacing,
    double? height,
    Color? color,
  }) =>
      _inter(
        size: size,
        weight: weight,
        letterSpacing: letterSpacing,
        height: height,
        color: color,
      );

  // Pre-baked common styles
  static TextStyle get sectionLabel => _inter(
        size: 11, weight: FontWeight.w700, letterSpacing: 1.0,
      );
}

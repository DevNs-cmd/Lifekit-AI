import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'design/tokens.dart';
import 'design/typography.dart';

// ─────────────────────────────────────────────
//  PUBLIC BUILDERS
// ─────────────────────────────────────────────

ThemeData lifeKitTheme(Brightness brightness) {
  final t = brightness == Brightness.light ? AppTokens.light : AppTokens.dark;
  final tt = AppTypography.textTheme(t.textPrimary);

  final colorScheme = brightness == Brightness.light
      ? ColorScheme.light(
          primary: t.primary,
          onPrimary: t.textInverse,
          primaryContainer: t.primarySurface,
          onPrimaryContainer: t.primarySurfaceFg,
          secondary: t.primarySurface,
          onSecondary: t.primarySurfaceFg,
          surface: t.surface,
          onSurface: t.textPrimary,
          surfaceContainerLow: t.backgroundSubtle,
          surfaceContainerHigh: t.surfaceSecondary,
          error: t.destructive,
          onError: t.textInverse,
          outline: t.border,
          outlineVariant: t.borderStrong,
        )
      : ColorScheme.dark(
          primary: t.primary,
          onPrimary: t.textInverse,
          primaryContainer: t.primarySurface,
          onPrimaryContainer: t.primarySurfaceFg,
          secondary: t.primarySurface,
          onSecondary: t.primarySurfaceFg,
          surface: t.surface,
          onSurface: t.textPrimary,
          surfaceContainerLow: t.backgroundSubtle,
          surfaceContainerHigh: t.surfaceSecondary,
          error: t.destructive,
          onError: t.textInverse,
          outline: t.border,
          outlineVariant: t.borderStrong,
        );

  return ThemeData(
    useMaterial3: true,
    brightness: brightness,
    colorScheme: colorScheme,
    scaffoldBackgroundColor: t.background,

    // ── Typography ───────────────────────────
    textTheme: tt,
    primaryTextTheme: tt,

    // ── Extensions ───────────────────────────
    extensions: [t],

    // ── Shape system ─────────────────────────
    cardTheme: CardThemeData(
      color: t.cardBg,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.xl),
        side: BorderSide(color: t.cardBorder),
      ),
      margin: EdgeInsets.zero,
    ),

    // ── AppBar ───────────────────────────────
    appBarTheme: AppBarTheme(
      backgroundColor: t.surface,
      foregroundColor: t.textPrimary,
      elevation: 0,
      scrolledUnderElevation: 0,
      centerTitle: false,
      // Headline-level title with tighter tracking
      titleTextStyle: tt.titleLarge?.copyWith(
        fontWeight: FontWeight.w800,
        letterSpacing: -0.4,
        color: t.textPrimary,
      ),
      iconTheme: IconThemeData(color: t.textSecondary, size: 22),
      systemOverlayStyle: brightness == Brightness.light
          ? SystemUiOverlayStyle.dark
          : SystemUiOverlayStyle.light,
    ),

    // ── Inputs ───────────────────────────────
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: t.surface,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      hintStyle: TextStyle(color: t.textMuted, fontSize: 14),
      labelStyle: TextStyle(color: t.textSecondary, fontSize: 14),
      floatingLabelStyle: TextStyle(color: t.primary, fontSize: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
        borderSide: BorderSide(color: t.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
        borderSide: BorderSide(color: t.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
        borderSide: BorderSide(color: t.primary, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
        borderSide: BorderSide(color: t.destructive),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
        borderSide: BorderSide(color: t.destructive, width: 2),
      ),
    ),

    // ── Buttons ──────────────────────────────
    filledButtonTheme: FilledButtonThemeData(
      style: ButtonStyle(
        backgroundColor: WidgetStateProperty.resolveWith(
            (s) => s.contains(WidgetState.disabled) ? t.border : t.primary),
        foregroundColor: WidgetStateProperty.all(t.textInverse),
        textStyle: WidgetStateProperty.all(
          tt.labelLarge?.copyWith(letterSpacing: 0.5),
        ),
        minimumSize: WidgetStateProperty.all(const Size(double.infinity, 52)),
        shape: WidgetStateProperty.all(
          RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppRadius.full)),
        ),
        elevation: WidgetStateProperty.all(0),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: ButtonStyle(
        foregroundColor: WidgetStateProperty.all(t.primary),
        side: WidgetStateProperty.all(BorderSide(color: t.border)),
        textStyle: WidgetStateProperty.all(
          tt.labelLarge?.copyWith(letterSpacing: 0.3),
        ),
        minimumSize: WidgetStateProperty.all(const Size(0, 48)),
        shape: WidgetStateProperty.all(
          RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppRadius.md)),
        ),
        elevation: WidgetStateProperty.all(0),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: ButtonStyle(
        foregroundColor: WidgetStateProperty.all(t.primary),
        textStyle: WidgetStateProperty.all(
          tt.labelLarge?.copyWith(letterSpacing: 0.2),
        ),
      ),
    ),

    // ── FAB ──────────────────────────────────
    floatingActionButtonTheme: FloatingActionButtonThemeData(
      backgroundColor: t.primary,
      foregroundColor: t.textInverse,
      elevation: 0,
      focusElevation: 0,
      hoverElevation: 0,
      shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.full)),
    ),

    // ── Chips ────────────────────────────────
    chipTheme: ChipThemeData(
      backgroundColor: t.backgroundSubtle,
      selectedColor: t.primarySurface,
      labelStyle: tt.labelMedium?.copyWith(color: t.textSecondary),
      side: BorderSide(color: t.border),
      shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.full)),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
    ),

    // ── Bottom sheet ─────────────────────────
    // Larger top radius (x2l) + more pronounced shape
    bottomSheetTheme: BottomSheetThemeData(
      backgroundColor: t.surface,
      surfaceTintColor: Colors.transparent,
      dragHandleColor: t.border,
      dragHandleSize: const Size(40, 4),
      showDragHandle: false, // we add our own SheetHandle widget
      shape: const RoundedRectangleBorder(
        borderRadius:
            BorderRadius.vertical(top: Radius.circular(AppRadius.x2l)),
      ),
      elevation: 0,
    ),

    // ── Dialog ───────────────────────────────
    dialogTheme: DialogThemeData(
      backgroundColor: t.surface,
      elevation: 0,
      shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.xl)),
      titleTextStyle: tt.headlineMedium?.copyWith(
        fontWeight: FontWeight.w800,
        letterSpacing: -0.5,
      ),
    ),

    // ── Divider ──────────────────────────────
    dividerTheme: DividerThemeData(
      color: t.border,
      thickness: 1,
      space: 1,
    ),

    // ── Icon ─────────────────────────────────
    iconTheme: IconThemeData(color: t.textSecondary, size: 20),
    primaryIconTheme: IconThemeData(color: t.primary, size: 20),

    // ── List tile ────────────────────────────
    listTileTheme: ListTileThemeData(
      titleTextStyle: tt.bodyMedium?.copyWith(
        color: t.textPrimary,
        fontWeight: FontWeight.w500,
      ),
      subtitleTextStyle: tt.bodySmall?.copyWith(color: t.textMuted),
      iconColor: t.textSecondary,
      minVerticalPadding: 14,
    ),

    // ── Tab bar — segmented pill style ───────
    // The indicator is hidden here; screens that want the segmented
    // look wrap their TabBar in a _SegmentedTabBar widget (screens.dart).
    // We still set sensible defaults for any plain TabBar usages.
    tabBarTheme: TabBarThemeData(
      labelColor: t.primary,
      unselectedLabelColor: t.textMuted,
      labelStyle: tt.titleSmall?.copyWith(
        fontWeight: FontWeight.w700,
        letterSpacing: -0.1,
      ),
      unselectedLabelStyle: tt.titleSmall?.copyWith(
        fontWeight: FontWeight.w500,
      ),
      overlayColor: WidgetStateProperty.all(Colors.transparent),
      // Underline indicator kept thin and crisp
      indicator: UnderlineTabIndicator(
        borderSide: BorderSide(color: t.primary, width: 2),
        borderRadius: BorderRadius.circular(AppRadius.full),
      ),
      indicatorSize: TabBarIndicatorSize.label,
      dividerColor: Colors.transparent,
    ),

    // ── Progress indicator ───────────────────
    progressIndicatorTheme: ProgressIndicatorThemeData(
      color: t.primary,
      linearTrackColor: t.backgroundSubtle,
      circularTrackColor: t.backgroundSubtle,
    ),

    // ── Checkbox ─────────────────────────────
    checkboxTheme: CheckboxThemeData(
      fillColor: WidgetStateProperty.resolveWith((s) =>
          s.contains(WidgetState.selected) ? t.primary : Colors.transparent),
      side: BorderSide(color: t.border, width: 1.5),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
    ),

    // ── Switch ───────────────────────────────
    switchTheme: SwitchThemeData(
      thumbColor: WidgetStateProperty.resolveWith(
          (s) => s.contains(WidgetState.selected) ? t.primary : t.textMuted),
      trackColor: WidgetStateProperty.resolveWith((s) =>
          s.contains(WidgetState.selected)
              ? t.primarySurface
              : t.backgroundSubtle),
    ),
  );
}

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

class AppTheme {
  AppTheme._();

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: AppColors.pageBackgroundLight,
      colorScheme: const ColorScheme.light(
        primary: AppColors.brandPrimaryLight,
        secondary: AppColors.brandAccentLight,
        surface: AppColors.cardSurfaceLight,
        background: AppColors.pageBackgroundLight,
        onSurface: AppColors.bodyTextLight,
        error: AppColors.errorRedLight,
      ),
      textTheme: GoogleFonts.plusJakartaSansTextTheme(ThemeData.light().textTheme).copyWith(
        displayLarge: GoogleFonts.plusJakartaSans(color: AppColors.bodyTextLight, fontWeight: FontWeight.bold),
        titleLarge: GoogleFonts.plusJakartaSans(color: AppColors.bodyTextLight, fontWeight: FontWeight.w700),
        titleMedium: GoogleFonts.plusJakartaSans(color: AppColors.bodyTextLight, fontWeight: FontWeight.w600),
        bodyLarge: GoogleFonts.plusJakartaSans(color: AppColors.bodyTextLight),
        bodyMedium: GoogleFonts.plusJakartaSans(color: AppColors.mutedTextLight),
        bodySmall: GoogleFonts.plusJakartaSans(color: AppColors.mutedTextLight),
      ),
      cardTheme: CardTheme(
        color: AppColors.cardSurfaceLight,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.borderLight, width: 1),
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.cardSurfaceLight,
        selectedItemColor: AppColors.brandPrimaryLight,
        unselectedItemColor: AppColors.mutedTextLight,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.subtleBackgroundLight,
        selectedColor: AppColors.hoverSecondaryLight,
        labelStyle: const TextStyle(color: AppColors.bodyTextLight, fontSize: 13),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.pageBackgroundLight,
        foregroundColor: AppColors.bodyTextLight,
        elevation: 0,
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.pageBackgroundDark,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.brandPrimaryDark,
        secondary: AppColors.brandAccentDark,
        surface: AppColors.cardSurfaceDark,
        background: AppColors.pageBackgroundDark,
        onSurface: AppColors.bodyTextDark,
        error: AppColors.errorRedDark,
      ),
      textTheme: GoogleFonts.plusJakartaSansTextTheme(ThemeData.dark().textTheme).copyWith(
        displayLarge: GoogleFonts.plusJakartaSans(color: AppColors.bodyTextDark, fontWeight: FontWeight.bold),
        titleLarge: GoogleFonts.plusJakartaSans(color: AppColors.bodyTextDark, fontWeight: FontWeight.w700),
        titleMedium: GoogleFonts.plusJakartaSans(color: AppColors.bodyTextDark, fontWeight: FontWeight.w600),
        bodyLarge: GoogleFonts.plusJakartaSans(color: AppColors.bodyTextDark),
        bodyMedium: GoogleFonts.plusJakartaSans(color: AppColors.mutedTextDark),
        bodySmall: GoogleFonts.plusJakartaSans(color: AppColors.mutedTextDark),
      ),
      cardTheme: CardTheme(
        color: AppColors.cardSurfaceDark,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.borderDark, width: 1),
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.cardSurfaceDark,
        selectedItemColor: AppColors.brandAccentDark,
        unselectedItemColor: AppColors.mutedTextDark,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.subtleBackgroundDark,
        selectedColor: AppColors.hoverSecondaryDark,
        labelStyle: const TextStyle(color: AppColors.bodyTextDark, fontSize: 13),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.pageBackgroundDark,
        foregroundColor: AppColors.bodyTextDark,
        elevation: 0,
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../design/tokens.dart';

// ─────────────────────────────────────────────
//  PREMIUM INPUT FIELD
// ─────────────────────────────────────────────
class PremiumInputField extends StatefulWidget {
  const PremiumInputField({
    super.key,
    this.controller,
    this.label,
    this.hint,
    this.prefixIcon,
    this.suffixIcon,
    this.obscureText = false,
    this.keyboardType,
    this.textInputAction,
    this.onSubmitted,
    this.onChanged,
    this.focusNode,
    this.errorText,
    this.autofocus = false,
    this.maxLines = 1,
    this.minLines,
    this.enabled = true,
  });

  final TextEditingController? controller;
  final String? label;
  final String? hint;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final bool obscureText;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final ValueChanged<String>? onSubmitted;
  final ValueChanged<String>? onChanged;
  final FocusNode? focusNode;
  final String? errorText;
  final bool autofocus;
  final int? maxLines;
  final int? minLines;
  final bool enabled;

  @override
  State<PremiumInputField> createState() => _PremiumInputFieldState();
}

class _PremiumInputFieldState extends State<PremiumInputField>
    with SingleTickerProviderStateMixin {
  late final FocusNode _focus = widget.focusNode ?? FocusNode();
  bool _isFocused = false;

  late final AnimationController _borderCtrl = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 200),
  );

  @override
  void initState() {
    super.initState();
    _focus.addListener(_onFocusChange);
  }

  void _onFocusChange() {
    setState(() => _isFocused = _focus.hasFocus);
    if (_focus.hasFocus) {
      _borderCtrl.forward();
    } else {
      _borderCtrl.reverse();
    }
  }

  @override
  void dispose() {
    if (widget.focusNode == null) _focus.dispose();
    _borderCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final hasError = widget.errorText != null;

    final borderColor = hasError
        ? t.destructive
        : _isFocused
            ? t.primary
            : t.border;
    final borderWidth = _isFocused || hasError ? 2.0 : 1.0;
    final fillColor = _isFocused ? t.primarySurface : t.surface;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          decoration: BoxDecoration(
            color:        fillColor,
            borderRadius: BorderRadius.circular(AppRadius.md),
            border:       Border.all(color: borderColor, width: borderWidth),
          ),
          child: TextField(
            controller:      widget.controller,
            focusNode:       _focus,
            obscureText:     widget.obscureText,
            keyboardType:    widget.keyboardType,
            textInputAction: widget.textInputAction,
            onSubmitted:     widget.onSubmitted,
            onChanged:       widget.onChanged,
            autofocus:       widget.autofocus,
            maxLines:        widget.maxLines,
            minLines:        widget.minLines,
            enabled:         widget.enabled,
            style: TextStyle(
              fontSize:   14,
              color:      t.textPrimary,
              fontWeight: FontWeight.w500,
            ),
            decoration: InputDecoration(
              hintText:        widget.hint,
              labelText:       widget.label,
              prefixIcon:      widget.prefixIcon != null
                  ? IconTheme(
                      data: IconThemeData(color: t.textMuted, size: 18),
                      child: widget.prefixIcon!,
                    )
                  : null,
              suffixIcon: widget.suffixIcon,
              border:         InputBorder.none,
              enabledBorder:  InputBorder.none,
              focusedBorder:  InputBorder.none,
              errorBorder:    InputBorder.none,
              disabledBorder: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16, vertical: 14),
              hintStyle: TextStyle(color: t.textMuted, fontSize: 14),
              labelStyle: TextStyle(color: t.textSecondary, fontSize: 14),
              floatingLabelStyle: TextStyle(
                color: hasError ? t.destructive : t.primary,
                fontSize: 12,
              ),
              isDense: false,
            ),
          ),
        ),
        // Error text — fades in
        if (widget.errorText != null)
          Padding(
            padding: const EdgeInsets.only(top: 6, left: 4),
            child: Text(
              widget.errorText!,
              style: TextStyle(
                color: t.destructive,
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ).animate().fadeIn(duration: 200.ms),
      ],
    );
  }
}

// ─────────────────────────────────────────────
//  PREMIUM BUTTON — gradient fill + shadowGreen
// ─────────────────────────────────────────────
class PremiumButton extends StatelessWidget {
  const PremiumButton({
    super.key,
    required this.label,
    this.onPressed,
    this.loading = false,
    this.icon,
    this.height = 52,
    this.gradient = AppGradients.lifekit,
    this.shadows = AppShadows.green,
    this.textColor = Colors.white,
    this.borderRadius = AppRadius.full,
    this.minWidth = double.infinity,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool loading;
  final Widget? icon;
  final double height;
  final LinearGradient gradient;
  final List<BoxShadow> shadows;
  final Color textColor;
  final double borderRadius;
  final double minWidth;

  @override
  Widget build(BuildContext context) {
    final isDisabled = onPressed == null || loading;

    return MouseRegion(
      cursor: isDisabled
          ? SystemMouseCursors.basic
          : SystemMouseCursors.click,
      child: GestureDetector(
        onTap: isDisabled ? null : onPressed,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          height: height,
          constraints: BoxConstraints(minWidth: minWidth),
          decoration: BoxDecoration(
            gradient:     isDisabled ? null : gradient,
            color:        isDisabled ? const Color(0xFFD9DDD6) : null,
            borderRadius: BorderRadius.circular(borderRadius),
            boxShadow:    isDisabled ? [] : shadows,
          ),
          child: Center(
            child: loading
                ? SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: textColor.withValues(alpha: 0.8),
                    ),
                  )
                : Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (icon != null) ...[
                        IconTheme(
                          data: IconThemeData(color: textColor, size: 18),
                          child: icon!,
                        ),
                        const SizedBox(width: 8),
                      ],
                      Text(
                        label.toUpperCase(),
                        style: TextStyle(
                          color:         textColor,
                          fontSize:      12,
                          fontWeight:    FontWeight.w700,
                          letterSpacing: 1.2,
                        ),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  SOCIAL BUTTON
// ─────────────────────────────────────────────
class SocialButton extends StatefulWidget {
  const SocialButton({
    super.key,
    required this.label,
    required this.logoWidget,
    required this.onTap,
    this.loading = false,
  });

  final String label;
  final Widget logoWidget;
  final VoidCallback onTap;
  final bool loading;

  @override
  State<SocialButton> createState() => _SocialButtonState();
}

class _SocialButtonState extends State<SocialButton> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) {
        setState(() => _pressed = false);
        widget.onTap();
      },
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 120),
        height: 48,
        decoration: BoxDecoration(
          color: _pressed ? t.backgroundSubtle : t.surface,
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(color: t.border),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            widget.loading
                ? SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                      strokeWidth: 2, color: t.primary),
                  )
                : widget.logoWidget,
            const SizedBox(width: 8),
            Text(
              widget.label,
              style: TextStyle(
                color:      t.textPrimary,
                fontSize:   13,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

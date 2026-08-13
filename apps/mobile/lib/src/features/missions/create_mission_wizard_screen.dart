// ignore_for_file: use_build_context_synchronously
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/design/animations.dart';
import '../../core/design/tokens.dart';
import '../../core/repository.dart';
import '../../core/widgets/premium_card.dart';
import '../../core/widgets/premium_input.dart';
import '../dashboard/screens.dart';

// ─────────────────────────────────────────────
//  CREATE MISSION WIZARD SCREEN
//  A premium, breathing 2-step wizard that
//  matches the website's mission-creation flow.
// ─────────────────────────────────────────────
class CreateMissionWizardScreen extends ConsumerStatefulWidget {
  const CreateMissionWizardScreen({super.key});

  @override
  ConsumerState<CreateMissionWizardScreen> createState() =>
      _CreateMissionWizardScreenState();
}

class _CreateMissionWizardScreenState
    extends ConsumerState<CreateMissionWizardScreen> {
  final _titleCtrl    = TextEditingController();
  final _descCtrl     = TextEditingController();
  String  _category   = 'Career';
  DateTime _targetDate = DateTime.now().add(const Duration(days: 90));
  bool _submitting    = false;
  bool _titleTouched  = false;

  // Category metadata
  static const _categories = [
    ('Career',        LucideIcons.briefcase,    Color(0xFF2563EB)),
    ('Finance',       LucideIcons.indianRupee,  Color(0xFFD97706)),
    ('Health',        LucideIcons.heart,         Color(0xFF16A34A)),
    ('Lifestyle',     LucideIcons.coffee,        Color(0xFF7C3AED)),
    ('Education',     LucideIcons.bookOpen,      Color(0xFF0891B2)),
    ('Business',      LucideIcons.building2,     Color(0xFFEA580C)),
    ('Productivity',  LucideIcons.zap,           Color(0xFF4F46E5)),
    ('Family',        LucideIcons.users,         Color(0xFFDB2777)),
  ];

  Color get _selectedCatColor {
    for (final c in _categories) {
      if (c.$1 == _category) return c.$3;
    }
    return const Color(0xFF217C45);
  }

  @override
  void dispose() {
    _titleCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() => _titleTouched = true);
    if (_titleCtrl.text.trim().isEmpty) return;
    setState(() => _submitting = true);
    try {
      final repo = ref.read(repositoryProvider);
      await repo.createMission(
        title:       _titleCtrl.text.trim(),
        description: _descCtrl.text.trim(),
        category:    _category,
        targetDate:  _targetDate.toIso8601String(),
      );
      final updated = await repo.missions();
      ref.read(missionsProvider.notifier).state =
          updated.map((m) => MissionData.fromJson(m)).toList();
    } catch (_) {}
    if (!mounted) return;
    setState(() => _submitting = false);
    context.pop();
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Scaffold(
      backgroundColor: t.background,
      body: SafeArea(
        child: Column(children: [
          // ── App bar ────────────────────────────────────────
          _WizardAppBar(
            onSave:      _submit,
            submitting:  _submitting,
            catColor:    _selectedCatColor,
          ),

          // ── Progress strip ─────────────────────────────────
          _ProgressStrip(catColor: _selectedCatColor),

          // ── Scrollable form ────────────────────────────────
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 40),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // ── Step 1: Core details ──────────────────
                  _SectionHeader(
                    step:  1,
                    label: 'Mission Details',
                    color: _selectedCatColor,
                  ).staggered(0),
                  const SizedBox(height: 16),

                  PremiumCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _FieldLabel('Mission Title *'),
                        const SizedBox(height: 8),
                        PremiumInputField(
                          controller: _titleCtrl,
                          hint:       'e.g. Master AI & System Design',
                          errorText:  _titleTouched &&
                                  _titleCtrl.text.trim().isEmpty
                              ? 'Title is required'
                              : null,
                          onChanged: (_) => setState(() {}),
                          textInputAction: TextInputAction.next,
                        ),
                        const SizedBox(height: 16),
                        _FieldLabel('Description & Objective'),
                        const SizedBox(height: 8),
                        PremiumInputField(
                          controller: _descCtrl,
                          hint:       'Describe the core outcome and success criteria…',
                          maxLines:   4,
                          minLines:   3,
                          textInputAction: TextInputAction.done,
                        ),
                      ],
                    ),
                  ).staggered(1),

                  const SizedBox(height: 24),

                  // ── Step 2: Category ──────────────────────
                  _SectionHeader(
                    step:  2,
                    label: 'Category',
                    color: _selectedCatColor,
                  ).staggered(2),
                  const SizedBox(height: 16),

                  GridView.count(
                    shrinkWrap:   true,
                    physics:      const NeverScrollableScrollPhysics(),
                    crossAxisCount:   4,
                    mainAxisSpacing:  10,
                    crossAxisSpacing: 10,
                    childAspectRatio: 0.85,
                    children: _categories.indexed.map((item) {
                      final (label, icon, color) = item.$2;
                      final selected = _category == label;
                      return GestureDetector(
                        onTap: () => setState(() => _category = label),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          decoration: BoxDecoration(
                            color: selected
                                ? color.withValues(alpha: 0.12)
                                : t.surface,
                            borderRadius:
                                BorderRadius.circular(AppRadius.xl),
                            border: Border.all(
                              color: selected ? color : t.border,
                              width: selected ? 2.0 : 1.0,
                            ),
                            boxShadow: selected
                                ? [
                                    BoxShadow(
                                      color:      color.withValues(alpha: 0.2),
                                      blurRadius: 10,
                                      offset: const Offset(0, 4),
                                    ),
                                  ]
                                : AppShadows.xs,
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(icon,
                                  size:  20,
                                  color: selected ? color : t.textMuted),
                              const SizedBox(height: 4),
                              Text(
                                label,
                                textAlign: TextAlign.center,
                                maxLines:  1,
                                overflow:  TextOverflow.ellipsis,
                                style: TextStyle(
                                  fontSize:   9,
                                  fontWeight: FontWeight.w700,
                                  color: selected ? color : t.textSecondary,
                                  letterSpacing: 0.2,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ).animate(
                              delay: Duration(
                                  milliseconds: 120 + item.$1 * 30))
                          .fadeIn(duration: 220.ms)
                          .scale(
                            begin: const Offset(0.92, 0.92),
                            duration: 220.ms,
                            curve: Curves.easeOutBack,
                          );
                    }).toList(),
                  ),

                  const SizedBox(height: 24),

                  // ── Step 3: Target date ───────────────────
                  _SectionHeader(
                    step:  3,
                    label: 'Timeline',
                    color: _selectedCatColor,
                  ).staggered(3),
                  const SizedBox(height: 16),

                  GestureDetector(
                    onTap: () async {
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: _targetDate,
                        firstDate:   DateTime.now(),
                        lastDate:
                            DateTime.now().add(const Duration(days: 3650)),
                        builder: (ctx, child) => Theme(
                          data: Theme.of(ctx).copyWith(
                            colorScheme: ColorScheme.light(
                              primary: _selectedCatColor,
                            ),
                          ),
                          child: child!,
                        ),
                      );
                      if (picked != null) {
                        setState(() => _targetDate = picked);
                      }
                    },
                    child: PremiumCard(
                      padding: const EdgeInsets.all(18),
                      child: Row(children: [
                        Container(
                          width:  44,
                          height: 44,
                          decoration: BoxDecoration(
                            color:        _selectedCatColor.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(AppRadius.md),
                            border: Border.all(
                              color: _selectedCatColor.withValues(alpha: 0.25),
                            ),
                          ),
                          child: Icon(LucideIcons.calendarDays,
                              size: 20, color: _selectedCatColor),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Target Completion Date',
                                style: TextStyle(
                                  color:      t.textPrimary,
                                  fontWeight: FontWeight.w600,
                                  fontSize:   14,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '${_targetDate.day} / ${_targetDate.month} / ${_targetDate.year}',
                                style: TextStyle(
                                  color:   _selectedCatColor,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Icon(LucideIcons.chevronRight,
                            size: 16, color: t.textMuted),
                      ]),
                    ),
                  ).staggered(4),

                  const SizedBox(height: 32),

                  // ── CTA ───────────────────────────────────
                  PremiumButton(
                    label:     'Create Mission Blueprint',
                    loading:   _submitting,
                    icon:      const Icon(LucideIcons.target, size: 18),
                    gradient:  LinearGradient(
                      colors: [
                        _selectedCatColor,
                        _selectedCatColor.withValues(alpha: 0.75),
                      ],
                    ),
                    onPressed: _submitting ? null : _submit,
                  ).staggered(5),
                ],
              ),
            ),
          ),
        ]),
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  WIZARD APP BAR
// ─────────────────────────────────────────────
class _WizardAppBar extends StatelessWidget {
  const _WizardAppBar({
    required this.onSave,
    required this.submitting,
    required this.catColor,
  });
  final VoidCallback onSave;
  final bool submitting;
  final Color catColor;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      decoration: BoxDecoration(
        color:  t.surface,
        border: Border(bottom: BorderSide(color: t.border)),
      ),
      child: Row(children: [
        IconButton(
          onPressed: () => Navigator.of(context).maybePop(),
          icon:      Icon(LucideIcons.x, color: t.textPrimary, size: 20),
        ),
        const SizedBox(width: 4),
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color:        catColor.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(AppRadius.sm),
          ),
          child: Icon(LucideIcons.target, color: catColor, size: 16),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            'Create New Mission',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight:    FontWeight.w800,
                  letterSpacing: -0.3,
                ),
          ),
        ),
        if (submitting)
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: SizedBox(
              width:  18,
              height: 18,
              child: CircularProgressIndicator(
                  strokeWidth: 2, color: catColor),
            ),
          )
        else
          TextButton(
            onPressed: onSave,
            child: Text(
              'Save',
              style: TextStyle(
                color:      catColor,
                fontWeight: FontWeight.w700,
                fontSize:   14,
              ),
            ),
          ),
      ]),
    );
  }
}

// ─────────────────────────────────────────────
//  PROGRESS STRIP
// ─────────────────────────────────────────────
class _ProgressStrip extends StatelessWidget {
  const _ProgressStrip({required this.catColor});
  final Color catColor;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Container(
      height: 3,
      margin: const EdgeInsets.symmetric(horizontal: 20),
      decoration: BoxDecoration(
        color:        t.backgroundSubtle,
        borderRadius: BorderRadius.circular(AppRadius.full),
      ),
      child: FractionallySizedBox(
        alignment: Alignment.centerLeft,
        widthFactor: 0.6,
        child: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [catColor, catColor.withValues(alpha: 0.5)],
            ),
            borderRadius: BorderRadius.circular(AppRadius.full),
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  SECTION HEADER
// ─────────────────────────────────────────────
class _SectionHeader extends StatelessWidget {
  const _SectionHeader({
    required this.step,
    required this.label,
    required this.color,
  });
  final int step;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Row(children: [
      Container(
        width:  22,
        height: 22,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: color,
        ),
        child: Center(
          child: Text(
            '$step',
            style: const TextStyle(
              color:      Colors.white,
              fontSize:   11,
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
      ),
      const SizedBox(width: 8),
      Text(
        label,
        style: TextStyle(
          color:      t.textPrimary,
          fontSize:   14,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.2,
        ),
      ),
    ]);
  }
}

// ─────────────────────────────────────────────
//  FIELD LABEL
// ─────────────────────────────────────────────
class _FieldLabel extends StatelessWidget {
  const _FieldLabel(this.text);
  final String text;

  @override
  Widget build(BuildContext context) => Text(
        text,
        style: TextStyle(
          fontSize:   12,
          fontWeight: FontWeight.w700,
          color:      context.tokens.textSecondary,
          letterSpacing: 0.1,
        ),
      );
}

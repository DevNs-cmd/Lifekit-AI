// ignore_for_file: use_build_context_synchronously
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/design/animations.dart';
import '../../core/design/tokens.dart';
import '../../core/repository.dart';

// ─────────────────────────────────────────────
//  PLAN DATA  (mirrors website exactly)
// ─────────────────────────────────────────────
class _Plan {
  const _Plan({
    required this.id,
    required this.name,
    required this.price,
    required this.period,
    required this.features,
    this.popular    = false,
    this.enterprise = false,
    this.color      = const Color(0xFF217C45),
  });
  final String id, name, price, period;
  final List<String> features;
  final bool popular, enterprise;
  final Color color;
}

const _kPlans = [
  _Plan(
    id:    'free',
    name:  'Free',
    price: '₹0',
    period: '',
    features: [
      '3 active missions',
      'Basic AI planning',
      'Marketplace access',
      '5 AI Coach messages/day',
    ],
    color: Color(0xFF6B7280),
  ),
  _Plan(
    id:      'plus',
    name:    'LifeKit Plus',
    price:   '₹499',
    period:  '/month',
    features: [
      '10 active missions',
      'Advanced AI planning',
      'All 5 AI Agents',
      'Unlimited AI Coach',
      'Memory & personalisation',
      'Priority support',
    ],
    popular: true,
    color:   Color(0xFF217C45),
  ),
  _Plan(
    id:    'pro',
    name:  'LifeKit Pro',
    price: '₹999',
    period: '/month',
    features: [
      'Unlimited missions',
      'Deep AI planning',
      'All AI Agents + custom',
      'Unlimited AI Coach + voice',
      'Extended memory',
      'Advanced analytics',
      'API access',
    ],
    color: Color(0xFF7C3AED),
  ),
  _Plan(
    id:         'enterprise',
    name:       'Enterprise',
    price:      'Custom',
    period:     '',
    features: [
      'Everything in Pro',
      'Team workspaces',
      'SSO & compliance',
      'Custom integrations',
      'SLA guarantee',
      'Dedicated manager',
    ],
    enterprise: true,
    color:      Color(0xFF0891B2),
  ),
];

// ─────────────────────────────────────────────
//  SUBSCRIPTION SCREEN
// ─────────────────────────────────────────────
class SubscriptionScreen extends ConsumerStatefulWidget {
  const SubscriptionScreen({super.key});

  @override
  ConsumerState<SubscriptionScreen> createState() => _SubscriptionScreenState();
}

class _SubscriptionScreenState extends ConsumerState<SubscriptionScreen> {
  String  _currentPlan = 'free';
  bool    _loadingPlan = true;
  bool    _upgrading   = false;
  bool    _cancelling  = false;
  String? _actionPlanId;

  // Sandbox modal state
  bool                    _sandboxOpen = false;
  Map<String, dynamic>?   _sandboxData;
  bool                    _sandboxProcessing = false;

  @override
  void initState() {
    super.initState();
    _fetchPlan();
  }

  Future<void> _fetchPlan() async {
    try {
      final sub = await ref.read(repositoryProvider).subscription();
      if (!mounted) return;
      setState(() {
        _currentPlan = (sub['plan'] ?? 'free').toString().toLowerCase();
        _loadingPlan = false;
      });
    } catch (_) {
      if (mounted) setState(() => _loadingPlan = false);
    }
  }

  int _planIndex(String id) =>
      _kPlans.indexWhere((p) => p.id == id);

  Future<void> _handleUpgrade(String planId) async {
    setState(() { _upgrading = true; _actionPlanId = planId; });
    try {
      final order = await ref.read(repositoryProvider).createOrder(planId);
      if (!mounted) return;
      if (order['isMock'] == true) {
        setState(() {
          _sandboxData = {
            'orderId': order['orderId'],
            'amount':  order['amount'],
            'planId':  planId,
          };
          _sandboxOpen = true;
        });
      } else {
        // Real Razorpay — deep-link to payment URL
        _showSnack('Real Razorpay checkout: open ${order['orderId']}');
      }
    } catch (e) {
      _showSnack('Checkout failed: ${e.toString().replaceFirst('Exception:', '').trim()}', error: true);
    } finally {
      if (mounted) setState(() { _upgrading = false; _actionPlanId = null; });
    }
  }

  Future<void> _handleSandboxSuccess() async {
    if (_sandboxData == null) return;
    setState(() => _sandboxProcessing = true);
    try {
      final rng = Random();
      final mockPayId =
          'pay_mock_${rng.nextInt(0xFFFFFF).toRadixString(16).padLeft(6, '0')}';
      await ref.read(repositoryProvider).verifyPayment(
        orderId:  _sandboxData!['orderId'].toString(),
        paymentId: mockPayId,
        planId:   _sandboxData!['planId'].toString(),
        isMock:   true,
      );
      if (!mounted) return;
      setState(() {
        _currentPlan    = _sandboxData!['planId'].toString();
        _sandboxOpen    = false;
        _sandboxData    = null;
      });
      _showSnack('Successfully upgraded to ${_currentPlan.toUpperCase()} ✓');
    } catch (e) {
      _showSnack('Verification failed: ${e.toString().replaceFirst('Exception:', '').trim()}', error: true);
    } finally {
      if (mounted) setState(() => _sandboxProcessing = false);
    }
  }

  Future<void> _handleCancel() async {
    setState(() => _cancelling = true);
    try {
      await ref.read(repositoryProvider).cancelSubscription();
      if (!mounted) return;
      setState(() => _currentPlan = 'free');
      _showSnack('Subscription cancelled. You\'re now on Free.');
    } catch (e) {
      _showSnack('Failed to cancel: ${e.toString().replaceFirst('Exception:', '').trim()}', error: true);
    } finally {
      if (mounted) setState(() => _cancelling = false);
    }
  }

  void _showSnack(String msg, {bool error = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content:         Text(msg),
      backgroundColor: error ? context.tokens.destructive : const Color(0xFF217C45),
      behavior:        SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.md)),
    ));
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final currentMeta = _kPlans.firstWhere(
      (p) => p.id == _currentPlan,
      orElse: () => _kPlans.first,
    );

    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, size: 20),
          onPressed: () => context.pop(),
        ),
        title: Row(children: [
          Icon(LucideIcons.crown, size: 18, color: t.primary),
          const SizedBox(width: 8),
          const Text('Subscription'),
        ]),
        centerTitle: false,
      ),
      body: _loadingPlan
          ? Center(child: CircularProgressIndicator(color: t.primary))
          : Stack(children: [
              SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 120),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // ── Current plan banner ─────────────────
                    _CurrentPlanBanner(
                      plan:         currentMeta,
                      onCancel:     _currentPlan != 'free' ? _handleCancel : null,
                      cancelling:   _cancelling,
                    ).staggered(0),

                    const SizedBox(height: 24),

                    Text(
                      'CHOOSE YOUR PLAN',
                      style: TextStyle(
                        color:         t.textMuted,
                        fontSize:      10,
                        fontWeight:    FontWeight.w800,
                        letterSpacing: 1.4,
                      ),
                    ),
                    const SizedBox(height: 12),

                    // ── Plan cards ──────────────────────────
                    ..._kPlans.indexed.map((item) {
                      final plan    = item.$2;
                      final isCurrent = _currentPlan == plan.id;
                      final isDown  = _planIndex(_currentPlan) >
                          _planIndex(plan.id);
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: _PlanCard(
                          plan:        plan,
                          isCurrent:   isCurrent,
                          isDowngrade: isDown,
                          loading:     _upgrading && _actionPlanId == plan.id,
                          onTap: isCurrent || plan.enterprise
                              ? null
                              : () => _handleUpgrade(plan.id),
                          onEnterpriseTap: plan.enterprise
                              ? () => _showSnack('Contact sales@lifekit.ai')
                              : null,
                        ).staggered(item.$1 + 1),
                      );
                    }),

                    const SizedBox(height: 16),

                    // ── Footer note ─────────────────────────
                    Center(
                      child: Text(
                        'All prices in INR. GST applicable.\nCancel anytime — no lock-in.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color:    t.textMuted,
                          fontSize: 11,
                          height:   1.6,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // ── Sandbox payment modal ─────────────────────
              if (_sandboxOpen && _sandboxData != null)
                _SandboxModal(
                  data:       _sandboxData!,
                  processing: _sandboxProcessing,
                  onConfirm:  _handleSandboxSuccess,
                  onDismiss: () {
                    if (!_sandboxProcessing) {
                      setState(() {
                        _sandboxOpen = false;
                        _sandboxData = null;
                      });
                    }
                  },
                ),
            ]),
    );
  }
}

// ─────────────────────────────────────────────
//  CURRENT PLAN BANNER
// ─────────────────────────────────────────────
class _CurrentPlanBanner extends StatelessWidget {
  const _CurrentPlanBanner({
    required this.plan,
    required this.onCancel,
    required this.cancelling,
  });
  final _Plan plan;
  final VoidCallback? onCancel;
  final bool cancelling;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            plan.color.withValues(alpha: 0.12),
            plan.color.withValues(alpha: 0.04),
          ],
        ),
        borderRadius: BorderRadius.circular(AppRadius.x2l),
        border:       Border.all(color: plan.color.withValues(alpha: 0.35)),
      ),
      child: Row(children: [
        Container(
          width:  48,
          height: 48,
          decoration: BoxDecoration(
            gradient:     AppGradients.lifekit,
            borderRadius: BorderRadius.circular(AppRadius.md),
            boxShadow:    AppShadows.greenSm,
          ),
          child: const Icon(LucideIcons.zap, color: Colors.white, size: 22),
        ),
        const SizedBox(width: 14),
        Expanded(child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${plan.name} Plan',
              style: TextStyle(
                color:      t.textPrimary,
                fontWeight: FontWeight.w800,
                fontSize:   15,
                letterSpacing: -0.3,
              ),
            ),
            Text(
              plan.id == 'free'
                  ? 'Upgrade to unlock more power'
                  : 'Active subscription',
              style: TextStyle(color: t.textMuted, fontSize: 12),
            ),
          ],
        )),
        if (onCancel != null)
          cancelling
              ? SizedBox(
                  width:  22,
                  height: 22,
                  child: CircularProgressIndicator(
                      strokeWidth: 2, color: t.destructive),
                )
              : TextButton(
                  onPressed: onCancel,
                  child: Text(
                    'Cancel plan',
                    style: TextStyle(
                      color:      t.destructive,
                      fontSize:   12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
      ]),
    );
  }
}

// ─────────────────────────────────────────────
//  PLAN CARD
// ─────────────────────────────────────────────
class _PlanCard extends StatefulWidget {
  const _PlanCard({
    required this.plan,
    required this.isCurrent,
    required this.isDowngrade,
    required this.loading,
    this.onTap,
    this.onEnterpriseTap,
  });
  final _Plan plan;
  final bool isCurrent, isDowngrade, loading;
  final VoidCallback? onTap;
  final VoidCallback? onEnterpriseTap;

  @override
  State<_PlanCard> createState() => _PlanCardState();
}

class _PlanCardState extends State<_PlanCard> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final t      = context.tokens;
    final color  = widget.plan.color;
    final bright = Theme.of(context).brightness;

    return GestureDetector(
      onTapDown:  (_) => setState(() => _pressed = true),
      onTapUp:    (_) { setState(() => _pressed = false); widget.onTap?.call(); },
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedScale(
        scale:    _pressed ? 0.97 : 1.0,
        duration: const Duration(milliseconds: 100),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          decoration: BoxDecoration(
            color:        t.cardBg,
            borderRadius: BorderRadius.circular(AppRadius.x2l),
            border:       Border.all(
              color: widget.isCurrent
                  ? color
                  : widget.plan.popular
                      ? color.withValues(alpha: 0.5)
                      : t.cardBorder,
              width: widget.isCurrent ? 2.0 : 1.0,
            ),
            boxShadow: widget.plan.popular
                ? [
                    BoxShadow(
                      color:      color.withValues(alpha: 0.2),
                      blurRadius: 20,
                      offset:     const Offset(0, 6),
                    ),
                  ]
                : AppElevation.level1(bright),
          ),
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              // Top-left color accent bar
              Positioned(
                top:   0, left: 0, right: 0,
                child: Container(
                  height: 3,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                        colors: [color, color.withValues(alpha: 0.4)]),
                    borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(AppRadius.x2l)),
                  ),
                ),
              ),

              // Popular badge
              if (widget.plan.popular && !widget.isCurrent)
                Positioned(
                  top:  -10,
                  left: 0,
                  right: 0,
                  child: Center(
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 3),
                      decoration: BoxDecoration(
                        gradient:     AppGradients.lifekit,
                        borderRadius: BorderRadius.circular(AppRadius.full),
                        boxShadow:    AppShadows.greenSm,
                      ),
                      child: const Text(
                        'Most Popular',
                        style: TextStyle(
                          color:         Colors.white,
                          fontSize:      10,
                          fontWeight:    FontWeight.w800,
                          letterSpacing: 0.4,
                        ),
                      ),
                    ),
                  ),
                ),

              // Current plan badge
              if (widget.isCurrent)
                Positioned(
                  top:  -10,
                  left: 0,
                  right: 0,
                  child: Center(
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 3),
                      decoration: BoxDecoration(
                        color:        color.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(AppRadius.full),
                        border:       Border.all(color: color),
                      ),
                      child: Text(
                        'Current Plan',
                        style: TextStyle(
                          color:      color,
                          fontSize:   10,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ),
                ),

              Padding(
                padding: const EdgeInsets.fromLTRB(20, 22, 20, 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Name + price
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width:  38,
                          height: 38,
                          decoration: BoxDecoration(
                            color:        color.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(AppRadius.sm),
                            border: Border.all(
                                color: color.withValues(alpha: 0.25)),
                          ),
                          child: Icon(
                            _iconForPlan(widget.plan.id),
                            color: color,
                            size: 18,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              widget.plan.name,
                              style: TextStyle(
                                color:      t.textPrimary,
                                fontWeight: FontWeight.w800,
                                fontSize:   15,
                                letterSpacing: -0.3,
                              ),
                            ),
                            Row(children: [
                              Text(
                                widget.plan.price,
                                style: TextStyle(
                                  color:      color,
                                  fontWeight: FontWeight.w900,
                                  fontSize:   22,
                                  letterSpacing: -0.5,
                                ),
                              ),
                              if (widget.plan.period.isNotEmpty)
                                Text(
                                  widget.plan.period,
                                  style: TextStyle(
                                    color:    t.textMuted,
                                    fontSize: 12,
                                  ),
                                ),
                            ]),
                          ],
                        )),
                      ],
                    ),

                    const SizedBox(height: 16),

                    // Features
                    ...widget.plan.features.map((f) => Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Icon(LucideIcons.circleCheck,
                                  size: 14, color: color),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  f,
                                  style: TextStyle(
                                    color:    t.textSecondary,
                                    fontSize: 12,
                                    height:   1.4,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        )),

                    const SizedBox(height: 16),

                    // CTA button
                    _PlanCTA(
                      plan:        widget.plan,
                      isCurrent:   widget.isCurrent,
                      isDowngrade: widget.isDowngrade,
                      loading:     widget.loading,
                      onTap:       widget.onTap,
                      onEnterprise: widget.onEnterpriseTap,
                      color:       color,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  IconData _iconForPlan(String id) {
    return switch (id) {
      'plus'       => LucideIcons.zap,
      'pro'        => LucideIcons.crown,
      'enterprise' => LucideIcons.building2,
      _            => LucideIcons.gift,
    };
  }
}

// ─────────────────────────────────────────────
//  PLAN CTA BUTTON
// ─────────────────────────────────────────────
class _PlanCTA extends StatelessWidget {
  const _PlanCTA({
    required this.plan,
    required this.isCurrent,
    required this.isDowngrade,
    required this.loading,
    required this.color,
    this.onTap,
    this.onEnterprise,
  });
  final _Plan plan;
  final bool isCurrent, isDowngrade, loading;
  final Color color;
  final VoidCallback? onTap;
  final VoidCallback? onEnterprise;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;

    if (isCurrent) {
      return Container(
        width:   double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color:        t.backgroundSubtle,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border:       Border.all(color: t.border),
        ),
        child: Center(
          child: Text(
            'Current Plan',
            style: TextStyle(
              color:      t.textMuted,
              fontWeight: FontWeight.w700,
              fontSize:   13,
            ),
          ),
        ),
      );
    }

    if (plan.enterprise) {
      return SizedBox(
        width: double.infinity,
        child: OutlinedButton(
          onPressed: onEnterprise,
          style: OutlinedButton.styleFrom(
            side:  BorderSide(color: color),
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppRadius.lg)),
            padding: const EdgeInsets.symmetric(vertical: 14),
          ),
          child: Text(
            'Contact Sales',
            style: TextStyle(color: color, fontWeight: FontWeight.w700),
          ),
        ),
      );
    }

    return SizedBox(
      width: double.infinity,
      child: loading
          ? Container(
              height:     48,
              decoration: BoxDecoration(
                color:        color.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(AppRadius.lg),
              ),
              child: Center(
                child: SizedBox(
                  width:  20,
                  height: 20,
                  child:  CircularProgressIndicator(
                      strokeWidth: 2.5, color: color),
                ),
              ),
            )
          : FilledButton(
              onPressed: onTap,
              style: FilledButton.styleFrom(
                backgroundColor: plan.popular ? color : null,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppRadius.lg)),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    isDowngrade
                        ? LucideIcons.arrowDown
                        : LucideIcons.arrowUp,
                    size: 16,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    isDowngrade ? 'Downgrade' : 'Upgrade',
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize:   14,
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}

// ─────────────────────────────────────────────
//  SANDBOX PAYMENT MODAL
//  Full-screen overlay matching the website's
//  Sandbox Payment Modal design exactly.
// ─────────────────────────────────────────────
class _SandboxModal extends StatelessWidget {
  const _SandboxModal({
    required this.data,
    required this.processing,
    required this.onConfirm,
    required this.onDismiss,
  });
  final Map<String, dynamic> data;
  final bool processing;
  final VoidCallback onConfirm;
  final VoidCallback onDismiss;

  String _formatAmount(dynamic raw) {
    final paise = (raw as num?)?.toInt() ?? 0;
    final rupees = paise / 100;
    return '₹${rupees.toStringAsFixed(0)}';
  }

  @override
  Widget build(BuildContext context) {
    final t       = context.tokens;
    final planId  = data['planId'].toString();
    final amount  = _formatAmount(data['amount']);
    final orderId = data['orderId'].toString();

    return Material(
      color: Colors.black.withValues(alpha: 0.6),
      child: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Container(
            constraints: const BoxConstraints(maxWidth: 380),
            decoration: BoxDecoration(
              color:        t.surface,
              borderRadius: BorderRadius.circular(AppRadius.x3l),
              boxShadow:    AppShadows.xl,
              border:       Border.all(color: t.border),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Header
                Container(
                  width:  double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        t.primary.withValues(alpha: 0.12),
                        t.primary.withValues(alpha: 0.04),
                      ],
                    ),
                    borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(AppRadius.x3l)),
                  ),
                  child: Column(children: [
                    Container(
                      width:  56,
                      height: 56,
                      decoration: BoxDecoration(
                        gradient:     AppGradients.lifekit,
                        borderRadius: BorderRadius.circular(AppRadius.xl),
                        boxShadow:    AppShadows.green,
                      ),
                      child: const Icon(LucideIcons.creditCard,
                          color: Colors.white, size: 26),
                    ).animate().scale(
                          begin:    const Offset(0.7, 0.7),
                          duration: 300.ms,
                          curve:    Curves.easeOutBack,
                        ),
                    const SizedBox(height: 12),
                    Text(
                      'Sandbox Payment',
                      style: TextStyle(
                        color:      t.textPrimary,
                        fontWeight: FontWeight.w900,
                        fontSize:   18,
                        letterSpacing: -0.4,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Simulated Razorpay — no real money is charged',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                          color: t.textMuted, fontSize: 12, height: 1.5),
                    ),
                  ]),
                ),

                // Body
                Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(children: [
                    // Order details row
                    _DetailRow(
                      label: 'Plan',
                      value: planId.toUpperCase(),
                      color: t.primary,
                    ),
                    const SizedBox(height: 10),
                    _DetailRow(
                      label:     'Amount',
                      value:     amount,
                      color:     t.textPrimary,
                      valueBold: true,
                    ),
                    const SizedBox(height: 10),
                    _DetailRow(
                      label: 'Order ID',
                      value: orderId.length > 20
                          ? '${orderId.substring(0, 20)}…'
                          : orderId,
                      color: t.textSecondary,
                    ),

                    const SizedBox(height: 20),

                    // Warning banner
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color:        t.warningSurface,
                        borderRadius: BorderRadius.circular(AppRadius.md),
                        border: Border.all(
                            color: t.warning.withValues(alpha: 0.35)),
                      ),
                      child: Row(children: [
                        Icon(LucideIcons.alertTriangle,
                            size: 14, color: t.warning),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Razorpay keys not configured. This is a simulated sandbox payment.',
                            style: TextStyle(
                                color: t.warning, fontSize: 11, height: 1.4),
                          ),
                        ),
                      ]),
                    ),

                    const SizedBox(height: 20),

                    // Confirm button
                    SizedBox(
                      width: double.infinity,
                      child: processing
                          ? Container(
                              height: 50,
                              decoration: BoxDecoration(
                                color:        t.primarySurface,
                                borderRadius: BorderRadius.circular(AppRadius.lg),
                              ),
                              child: Center(
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    SizedBox(
                                      width:  18,
                                      height: 18,
                                      child: CircularProgressIndicator(
                                          strokeWidth: 2, color: t.primary),
                                    ),
                                    const SizedBox(width: 10),
                                    Text(
                                      'Verifying…',
                                      style: TextStyle(
                                          color: t.primary,
                                          fontWeight: FontWeight.w700),
                                    ),
                                  ],
                                ),
                              ),
                            )
                          : FilledButton(
                              onPressed: onConfirm,
                              style: FilledButton.styleFrom(
                                shape: RoundedRectangleBorder(
                                  borderRadius:
                                      BorderRadius.circular(AppRadius.lg),
                                ),
                                padding: const EdgeInsets.symmetric(
                                    vertical: 14),
                              ),
                              child: const Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.center,
                                children: [
                                  Icon(LucideIcons.check, size: 16),
                                  SizedBox(width: 8),
                                  Text(
                                    'Simulate Successful Payment',
                                    style: TextStyle(
                                      fontWeight: FontWeight.w700,
                                      fontSize:   14,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                    ),

                    const SizedBox(height: 10),

                    // Cancel
                    if (!processing)
                      SizedBox(
                        width: double.infinity,
                        child: TextButton(
                          onPressed: onDismiss,
                          child: Text(
                            'Cancel',
                            style: TextStyle(
                              color:    t.textMuted,
                              fontSize: 13,
                            ),
                          ),
                        ),
                      ),
                  ]),
                ),
              ],
            ),
          ).animate().fadeIn(duration: 200.ms).scale(
                begin:    const Offset(0.95, 0.95),
                duration: 200.ms,
                curve:    Curves.easeOutCubic,
              ),
        ),
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  const _DetailRow({
    required this.label,
    required this.value,
    required this.color,
    this.valueBold = false,
  });
  final String label, value;
  final Color color;
  final bool valueBold;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Row(children: [
      Text(label,
          style: TextStyle(color: t.textMuted, fontSize: 13)),
      const Spacer(),
      Text(
        value,
        style: TextStyle(
          color:      color,
          fontSize:   13,
          fontWeight: valueBold ? FontWeight.w800 : FontWeight.w600,
        ),
      ),
    ]);
  }
}

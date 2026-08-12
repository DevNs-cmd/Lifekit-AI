import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/design/tokens.dart';
import '../../core/widgets/premium_card.dart';
import '../../core/widgets/premium_input.dart';

class LandingScreen extends StatefulWidget {
  const LandingScreen({super.key});

  @override
  State<LandingScreen> createState() => _LandingScreenState();
}

class _LandingScreenState extends State<LandingScreen>
    with TickerProviderStateMixin {
  late final AnimationController _blob1 = AnimationController(
    vsync: this, duration: const Duration(seconds: 8),
  )..repeat(reverse: true);
  late final AnimationController _blob2 = AnimationController(
    vsync: this, duration: const Duration(seconds: 11),
  )..repeat(reverse: true);

  @override
  void dispose() {
    _blob1.dispose();
    _blob2.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final reduceMotion = MediaQuery.of(context).disableAnimations;

    return Scaffold(
      backgroundColor: t.background,
      body: CustomScrollView(
        slivers: [
          // ── Hero ────────────────────────────────────
          SliverToBoxAdapter(
            child: SizedBox(
              height: 580,
              child: Stack(
                children: [
                  // Hero gradient base — non-interactive
                  Positioned.fill(
                    child: IgnorePointer(
                      child: DecoratedBox(
                        decoration: BoxDecoration(gradient: t.heroGradient),
                      ),
                    ),
                  ),

                  // Animated blobs — non-interactive
                  // Animated blobs — non-interactive
                  // Positioned.fill must be a direct Stack child.
                  // AnimatedBuilder goes INSIDE Positioned.fill, not the other way around.
                  if (!reduceMotion) ...[
                    Positioned.fill(
                      child: IgnorePointer(
                        child: AnimatedBuilder(
                          animation: _blob1,
                          builder: (_, __) => Transform.translate(
                            offset: Offset(14 * _blob1.value, -10 * _blob1.value),
                            child: const DecoratedBox(
                              decoration: BoxDecoration(
                                gradient: AppGradients.meshBlob1,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    Positioned.fill(
                      child: IgnorePointer(
                        child: AnimatedBuilder(
                          animation: _blob2,
                          builder: (_, __) => Transform.translate(
                            offset: Offset(-10 * _blob2.value, 12 * _blob2.value),
                            child: const DecoratedBox(
                              decoration: BoxDecoration(
                                gradient: AppGradients.meshBlob2,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],

                  // Content — on top, fully interactive
                  SafeArea(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Top row: logo + sign in
                          Row(
                            children: [
                              const Icon(LucideIcons.leaf,
                                  color: Colors.white, size: 26),
                              const SizedBox(width: 9),
                              const Text(
                                'LifeKit',
                                style: TextStyle(
                                  color:         Colors.white,
                                  fontSize:      22,
                                  fontWeight:    FontWeight.w900,
                                  letterSpacing: -0.5,
                                ),
                              ),
                              const Spacer(),
                              TextButton(
                                onPressed: () => context.push('/auth/sign-in'),
                                style: TextButton.styleFrom(
                                  foregroundColor: Colors.white,
                                  textStyle: const TextStyle(
                                    fontWeight: FontWeight.w600,
                                    fontSize: 14,
                                  ),
                                ),
                                child: const Text('Sign in'),
                              ),
                            ],
                          ),

                          const Spacer(),

                          // Badge pill
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 11, vertical: 7),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.12),
                              borderRadius:
                                  BorderRadius.circular(AppRadius.full),
                              border: Border.all(
                                  color: Colors.white.withValues(alpha: 0.2)),
                            ),
                            child: const Text(
                              'THE AI-POWERED LIFE OS',
                              style: TextStyle(
                                color:         Color(0xFFD8FFB9),
                                fontSize:      10,
                                fontWeight:    FontWeight.w800,
                                letterSpacing: 1.2,
                              ),
                            ),
                          ),

                          const SizedBox(height: 18),

                          // Main headline
                          const Text(
                            'From ambition\nto measurable\noutcome.',
                            style: TextStyle(
                              color:         Colors.white,
                              fontSize:      40,
                              height:        1.05,
                              fontWeight:    FontWeight.w900,
                              letterSpacing: -1.5,
                            ),
                          ),

                          const SizedBox(height: 18),

                          // Subtext
                          Text(
                            'LifeKit turns your goals into structured missions, '
                            'intelligent plans, and the right next action — '
                            'powered by specialist AI agents.',
                            style: TextStyle(
                              color:    Colors.white.withValues(alpha: 0.75),
                              height:   1.55,
                              fontSize: 15,
                            ),
                          ),

                          const SizedBox(height: 28),

                          // CTA button
                          PremiumButton(
                            label:     'Start building your life',
                            icon:      const Icon(LucideIcons.arrowRight),
                            onPressed: () => context.push('/auth/sign-up'),
                            minWidth:  double.infinity,
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Feature cards ────────────────────────────
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(18, 28, 18, 50),
            sliver: SliverList.list(
              children: [
                Text(
                  'One system. Every part of life.',
                  style: Theme.of(context).textTheme.displaySmall?.copyWith(
                        color: context.tokens.textPrimary,
                      ),
                ),

                const SizedBox(height: 8),

                Text(
                  'A complete execution platform — not another disconnected productivity tool.',
                  style: TextStyle(
                      color: context.tokens.textMuted, height: 1.5),
                ),

                const SizedBox(height: 24),

                ...(_kFeatures.indexed.map(
                  (item) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: PremiumCard(
                      onTap: () {},
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: context.tokens.primarySurface,
                              borderRadius:
                                  BorderRadius.circular(AppRadius.md),
                            ),
                            child: Icon(item.$2.icon,
                                color: context.tokens.primary, size: 20),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item.$2.title,
                                  style: Theme.of(context).textTheme.titleLarge,
                                ),
                                const SizedBox(height: 5),
                                Text(
                                  item.$2.desc,
                                  style: TextStyle(
                                    color:    context.tokens.textMuted,
                                    height:   1.5,
                                    fontSize: 13,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                )),

                const SizedBox(height: 28),

                // Secondary CTA
                PremiumButton(
                  label:     'Get started free',
                  onPressed: () => context.push('/auth/sign-up'),
                ),

                const SizedBox(height: 16),

                Center(
                  child: TextButton(
                    onPressed: () => context.push('/auth/sign-in'),
                    child: Text(
                      'Already have an account? Sign in',
                      style: TextStyle(
                          color:      context.tokens.primary,
                          fontWeight: FontWeight.w600),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  FEATURE DATA
// ─────────────────────────────────────────────
class _Feature {
  const _Feature(this.icon, this.title, this.desc);
  final IconData icon;
  final String title, desc;
}

const _kFeatures = [
  _Feature(
    LucideIcons.target,
    'Life Mission Engine',
    'Goals become milestones, metrics, risks, and a roadmap.',
  ),
  _Feature(
    LucideIcons.map,
    'AI Life Planner',
    'Schedules that adapt when your life changes.',
  ),
  _Feature(
    LucideIcons.bot,
    'Specialist AI Agents',
    'Career, finance, health, travel, and business guidance.',
  ),
  _Feature(
    LucideIcons.brain,
    'Life Memory',
    'Persistent context across every plan and conversation.',
  ),
  _Feature(
    LucideIcons.telescope,
    'Opportunity Engine',
    'Proactively surfaces jobs, scholarships and grants matched to your mission.',
  ),
];

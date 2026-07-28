import 'package:flutter/material.dart';
import '../../core/constants.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  String _selectedTier = 'LifeKit Pro';
  bool _enableAIMemory = true;
  bool _enableDailyFocusReminders = true;
  bool _enableAutoSubtaskGeneration = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primaryBg,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Profile Header Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppColors.cardBg,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.borderSubtle),
                ),
                child: Row(
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: AppColors.accentGlow, width: 2),
                      ),
                      child: const CircleAvatar(
                        radius: 28,
                        backgroundColor: AppColors.surfaceLight,
                        child: Text(
                          'AK',
                          style: TextStyle(
                            color: AppColors.textHigh,
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Aditya Kumar',
                            style: TextStyle(
                              color: AppColors.textHigh,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 2),
                          const Text(
                            'aditya.k@lifekit.ai',
                            style: TextStyle(color: AppColors.textMuted, fontSize: 13),
                          ),
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [AppColors.accentPurple, AppColors.accentGlow],
                              ),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.star, size: 12, color: Colors.white),
                                const SizedBox(width: 4),
                                Text(
                                  _selectedTier,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Subscription Plan Badges Selection
              const Text(
                'Subscription Plan Tiers',
                style: TextStyle(
                  color: AppColors.textHigh,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: AppConstants.subscriptionTiers.map((tier) {
                  final isCurrent = _selectedTier == tier;
                  return Expanded(
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      child: InkWell(
                        onTap: () {
                          setState(() => _selectedTier = tier);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Switched to $tier plan')),
                          );
                        },
                        borderRadius: BorderRadius.circular(14),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
                          decoration: BoxDecoration(
                            color: isCurrent ? AppColors.surfaceLight : AppColors.cardBg,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: isCurrent ? AppColors.accentGlow : AppColors.borderSubtle,
                              width: isCurrent ? 2 : 1,
                            ),
                          ),
                          child: Column(
                            children: [
                              Icon(
                                tier == 'LifeKit Pro'
                                    ? Icons.bolt
                                    : (tier == 'LifeKit Plus' ? Icons.workspace_premium : Icons.person_outline),
                                color: isCurrent ? AppColors.accentGlow : AppColors.textMuted,
                                size: 22,
                              ),
                              const SizedBox(height: 6),
                              Text(
                                tier,
                                style: TextStyle(
                                  color: isCurrent ? AppColors.textHigh : AppColors.textMedium,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 11,
                                ),
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                tier == 'Free Tier'
                                    ? '₹0/mo'
                                    : (tier == 'LifeKit Plus' ? '₹499/mo' : '₹999/mo'),
                                style: const TextStyle(
                                  color: AppColors.textMuted,
                                  fontSize: 10,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 28),

              // AI Memory & Preference Controls
              const Text(
                'AI Memory & Execution Preferences',
                style: TextStyle(
                  color: AppColors.textHigh,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              Container(
                decoration: BoxDecoration(
                  color: AppColors.cardBg,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderSubtle),
                ),
                child: Column(
                  children: [
                    SwitchListTile(
                      value: _enableAIMemory,
                      onChanged: (val) => setState(() => _enableAIMemory = val),
                      activeColor: AppColors.accentGlow,
                      title: const Text(
                        'Persistent Goal Context Memory',
                        style: TextStyle(color: AppColors.textHigh, fontSize: 14, fontWeight: FontWeight.w600),
                      ),
                      subtitle: const Text(
                        'Allow AI Coach to retain cross-mission context for personalized coaching.',
                        style: TextStyle(color: AppColors.textMuted, fontSize: 12),
                      ),
                    ),
                    const Divider(color: AppColors.borderSubtle, height: 1),
                    SwitchListTile(
                      value: _enableDailyFocusReminders,
                      onChanged: (val) => setState(() => _enableDailyFocusReminders = val),
                      activeColor: AppColors.accentGlow,
                      title: const Text(
                        'Smart Daily Focus Nudges',
                        style: TextStyle(color: AppColors.textHigh, fontSize: 14, fontWeight: FontWeight.w600),
                      ),
                      subtitle: const Text(
                        'Receive morning AI notifications with your highest impact task.',
                        style: TextStyle(color: AppColors.textMuted, fontSize: 12),
                      ),
                    ),
                    const Divider(color: AppColors.borderSubtle, height: 1),
                    SwitchListTile(
                      value: _enableAutoSubtaskGeneration,
                      onChanged: (val) => setState(() => _enableAutoSubtaskGeneration = val),
                      activeColor: AppColors.accentGlow,
                      title: const Text(
                        'Auto Goal Decomposition',
                        style: TextStyle(color: AppColors.textHigh, fontSize: 14, fontWeight: FontWeight.w600),
                      ),
                      subtitle: const Text(
                        'Automatically convert high-level goals into tactical checklist steps.',
                        style: TextStyle(color: AppColors.textMuted, fontSize: 12),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),

              // Account Actions
              OutlinedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('AI Goal Context synchronized securely!')),
                  );
                },
                icon: const Icon(Icons.sync_rounded, color: AppColors.accentGlow),
                label: const Text(
                  'Sync LifeKit AI Cloud State',
                  style: TextStyle(color: AppColors.accentGlow, fontWeight: FontWeight.bold),
                ),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 48),
                  side: const BorderSide(color: AppColors.borderSubtle),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

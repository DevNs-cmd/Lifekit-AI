import 'package:flutter/material.dart';
import '../../core/constants.dart';
import '../models/marketplace_model.dart';
import 'widgets/service_card.dart';

class MarketplaceScreen extends StatefulWidget {
  const MarketplaceScreen({Key? key}) : super(key: key);

  @override
  State<MarketplaceScreen> createState() => _MarketplaceScreenState();
}

class _MarketplaceScreenState extends State<MarketplaceScreen> {
  String _selectedCategory = 'All';
  String _searchQuery = '';

  final List<MarketplaceItemModel> _allServices = [
    MarketplaceItemModel(
      id: 's1',
      title: '1-on-1 Y-Combinator Startup Pitch Review & Strategy',
      providerName: 'Vikram Sharma',
      providerAvatar: 'VS',
      category: 'Business',
      price: '₹2,499 / session',
      rating: 4.9,
      reviewsCount: 128,
      badgeText: 'Top Expert',
      description: 'Get your pitch deck, unit economics, and go-to-market strategy audited by a 2x YC founder.',
    ),
    MarketplaceItemModel(
      id: 's2',
      title: 'Full-Stack System Design & Mock Tech Interview',
      providerName: 'Ananya Roy',
      providerAvatar: 'AR',
      category: 'Career',
      price: '₹1,999 / session',
      rating: 4.8,
      reviewsCount: 94,
      badgeText: 'FAANG Staff Eng',
      description: 'Practice high-throughput system design, load balancing, microservices, and database scaling.',
    ),
    MarketplaceItemModel(
      id: 's3',
      title: 'Personal Tax & Automated Index Portfolio Structuring',
      providerName: 'Rohan Mehta, CFA',
      providerAvatar: 'RM',
      category: 'Finance',
      price: '₹3,500 / audit',
      rating: 5.0,
      reviewsCount: 210,
      badgeText: 'Certified Financial Expert',
      description: 'Maximize tax efficiency, automate SIP allocations, and structure high-return long-term wealth.',
    ),
    MarketplaceItemModel(
      id: 's4',
      title: 'Marathon Endurance Protocol & Customized Nutrition Plan',
      providerName: 'Coach Dev',
      providerAvatar: 'CD',
      category: 'Health',
      price: '₹1,499 / month',
      rating: 4.7,
      reviewsCount: 52,
      badgeText: 'Pro Runner',
      description: 'Weekly mileage progression, heart-rate zone training, recovery protocols, and race nutrition.',
    ),
    MarketplaceItemModel(
      id: 's5',
      title: 'Digital Nomad Tech Work Visa & Remote Setup Kit',
      providerName: 'Elena Rostova',
      providerAvatar: 'ER',
      category: 'Travel',
      price: '₹1,200 / guide',
      rating: 4.9,
      reviewsCount: 88,
      badgeText: 'Global Nomad',
      description: 'Seamless visa application strategies, tax residency guidance, and top coworking hubs.',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final filteredServices = _allServices.where((item) {
      final matchesCategory = _selectedCategory == 'All' || item.category == _selectedCategory;
      final matchesSearch = _searchQuery.isEmpty ||
          item.title.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          item.providerName.toLowerCase().contains(_searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.primaryBg,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              const Text(
                'Execution Marketplace',
                style: TextStyle(
                  color: AppColors.textHigh,
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Hire verified human experts & automated execution services',
                style: TextStyle(color: AppColors.textMuted, fontSize: 13),
              ),
              const SizedBox(height: 16),

              // Search Input Bar
              TextField(
                onChanged: (val) {
                  setState(() => _searchQuery = val);
                },
                style: const TextStyle(color: AppColors.textHigh),
                decoration: InputDecoration(
                  hintText: 'Search experts, strategies, or pitch reviews...',
                  hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 13),
                  prefixIcon: const Icon(Icons.search_rounded, color: AppColors.accentGlow),
                  filled: true,
                  fillColor: AppColors.cardBg,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: const BorderSide(color: AppColors.borderSubtle),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: const BorderSide(color: AppColors.borderSubtle),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: const BorderSide(color: AppColors.accentPurple),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Category Filter Chips
              SizedBox(
                height: 38,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: AppConstants.categories.length,
                  itemBuilder: (context, idx) {
                    final cat = AppConstants.categories[idx];
                    final isSelected = cat == _selectedCategory;

                    return Container(
                      margin: const EdgeInsets.only(right: 8),
                      child: FilterChip(
                        selected: isSelected,
                        label: Text(cat),
                        labelStyle: TextStyle(
                          color: isSelected ? Colors.white : AppColors.textMedium,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          fontSize: 12,
                        ),
                        backgroundColor: AppColors.cardBg,
                        selectedColor: AppColors.accentPurple,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                          side: BorderSide(
                            color: isSelected ? AppColors.accentGlow : AppColors.borderSubtle,
                          ),
                        ),
                        onSelected: (selected) {
                          setState(() {
                            _selectedCategory = cat;
                          });
                        },
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 18),

              // Service Cards List
              Expanded(
                child: filteredServices.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.search_off_rounded, color: AppColors.textMuted, size: 48),
                            const SizedBox(height: 12),
                            Text(
                              'No services found for "$_searchQuery"',
                              style: const TextStyle(color: AppColors.textMuted),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        itemCount: filteredServices.length,
                        itemBuilder: (context, idx) {
                          final item = filteredServices[idx];
                          return ServiceCard(
                            item: item,
                            onBook: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('Connected with ${item.providerName} for "${item.title}"!'),
                                  backgroundColor: AppColors.accentPurple,
                                ),
                              );
                            },
                          );
                        },
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

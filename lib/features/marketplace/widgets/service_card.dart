import 'package:flutter/material.dart';
import '../../../core/constants.dart';
import '../../models/marketplace_model.dart';

class ServiceCard extends StatelessWidget {
  final MarketplaceItemModel item;
  final VoidCallback onBook;

  const ServiceCard({
    Key? key,
    required this.item,
    required this.onBook,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: AppColors.surfaceLight,
                child: Text(
                  item.providerAvatar,
                  style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.accentGlow, fontSize: 12),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.providerName,
                      style: const TextStyle(
                        color: AppColors.textMedium,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      item.title,
                      style: const TextStyle(
                        color: AppColors.textHigh,
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              Builder(
                builder: (context) {
                  if (item.badgeText.contains('%')) {
                    final cleanNum = double.tryParse(item.badgeText.replaceAll(RegExp(r'[^0-9.]'), '')) ?? 85.0;
                    final matchColors = AppColors.getMatchScoreColors(cleanNum);
                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: matchColors.backgroundColor,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: matchColors.borderColor),
                      ),
                      child: Text(
                        item.badgeText,
                        style: TextStyle(
                          color: matchColors.textColor,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    );
                  }
                  final catColors = AppColors.getCategoryColors(item.category);
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: catColors.backgroundColor,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      item.badgeText,
                      style: TextStyle(
                        color: catColors.textColor,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            item.description,
            style: const TextStyle(
              color: AppColors.textMedium,
              fontSize: 12,
              height: 1.3,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 14),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.star_rounded, color: Colors.amber, size: 16),
                  const SizedBox(width: 4),
                  Text(
                    '${item.rating}',
                    style: const TextStyle(
                      color: AppColors.textHigh,
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '(${item.reviewsCount})',
                    style: const TextStyle(
                      color: AppColors.textMuted,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
              Text(
                item.price,
                style: const TextStyle(
                  color: AppColors.textHigh,
                  fontWeight: FontWeight.w800,
                  fontSize: 16,
                ),
              ),
              ElevatedButton(
                onPressed: onBook,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.accentPurple,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  elevation: 0,
                ),
                child: const Text('Connect', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

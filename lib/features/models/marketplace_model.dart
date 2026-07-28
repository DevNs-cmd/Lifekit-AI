class MarketplaceItemModel {
  final String id;
  final String title;
  final String providerName;
  final String providerAvatar;
  final String category;
  final String price;
  final double rating;
  final int reviewsCount;
  final String badgeText;
  final String description;

  MarketplaceItemModel({
    required this.id,
    required this.title,
    required this.providerName,
    required this.providerAvatar,
    required this.category,
    required this.price,
    required this.rating,
    required this.reviewsCount,
    required this.badgeText,
    required this.description,
  });

  factory MarketplaceItemModel.fromJson(Map<String, dynamic> json) =>
      MarketplaceItemModel(
        id: json['id'],
        title: json['title'],
        providerName: json['providerName'],
        providerAvatar: json['providerAvatar'],
        category: json['category'],
        price: json['price'],
        rating: (json['rating'] as num).toDouble(),
        reviewsCount: json['reviewsCount'],
        badgeText: json['badgeText'],
        description: json['description'],
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'providerName': providerName,
        'providerAvatar': providerAvatar,
        'category': category,
        'price': price,
        'rating': rating,
        'reviewsCount': reviewsCount,
        'badgeText': badgeText,
        'description': description,
      };
}

export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate?: string;
  difficulty?: 'Low' | 'Medium' | 'High' | 'Extreme';
}

export interface Mission {
  id: string;
  title: string;
  category: 'Career' | 'Finance' | 'Health' | 'Business' | 'Education' | 'Travel';
  duration: string;
  iconName: string;
  tasks: Task[];
}

export interface MarketplaceItem {
  id: string;
  title: string;
  providerName: string;
  providerAvatar: string;
  category: string;
  price: string;
  rating: number;
  reviewsCount: number;
  badgeText: string;
  description: string;
}

export interface CodeFile {
  path: string;
  filename: string;
  language: string;
  code: string;
}

export type TabType = 'home' | 'mission' | 'marketplace' | 'profile' | 'auth';
export type DeviceFrame = 'iphone16' | 'pixel9' | 'ipad' | 'fullscreen';

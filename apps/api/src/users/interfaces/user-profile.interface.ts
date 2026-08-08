export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  profession: string | null;
  profilePhoto: string | null;
  preferences: any;
  createdAt: Date;
  subscriptionPlan?: string;
}

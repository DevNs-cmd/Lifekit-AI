export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  profession: string | null;
  profilePhoto: string | null;
  preferences: any;
  createdAt: Date;
}

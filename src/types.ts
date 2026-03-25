export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LAPSED = 'lapsed',
}

export enum DrawStatus {
  SIMULATED = 'simulated',
  PUBLISHED = 'published',
}

export enum WinnerStatus {
  PENDING = 'pending',
  PAID = 'paid',
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  subscriptionStatus: SubscriptionStatus;
  renewalDate?: string;
  selectedCharityId?: string;
  charityContributionPercentage?: number;
  totalWinnings?: number;
}

export interface GolfScore {
  id?: string;
  uid: string;
  score: number; // 1-45 Stableford
  date: string; // ISO string
}

export interface Charity {
  id: string;
  name: string;
  description: string;
  image_url: string;
  upcoming_events?: Array<{
    name: string;
    date: string;
    description: string;
  }>;
}

export interface Draw {
  id: string;
  date: string; // ISO string
  winning_numbers: number[];
  status: DrawStatus;
  jackpot_amount: number;
}

export interface Winner {
  id: string;
  draw_id: string;
  uid: string;
  match_type: 3 | 4 | 5;
  prize_amount: number;
  proof_url?: string;
  status: WinnerStatus;
}

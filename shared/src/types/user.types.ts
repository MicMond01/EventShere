export type UserRole = 'venue_owner' | 'planner' | 'guest' | 'vendor' | 'admin';

export type UserStatus = 'active' | 'suspended' | 'banned' | 'pending_verification';

export type ScoreTier = 'platinum' | 'gold' | 'standard' | 'low_rated' | 'flagged';

export interface IUser {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserProfile {
  userId: string;
  displayName: string;
  photoUrl?: string;
  bio?: string;
  phone?: string;
  socialScore: number;
  scoreTier: ScoreTier;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISocialScore {
  userId: string;
  currentScore: number;
  tier: ScoreTier;
  lastCalculatedAt: Date;
  scoreHistory: IScoreHistoryEntry[];
}

export interface IScoreHistoryEntry {
  score: number;
  tier: ScoreTier;
  calculatedAt: string;
}

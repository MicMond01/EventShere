export interface IRating {
  id: string;
  raterId: string;
  rateeId: string;
  eventId: string;
  conductScore: number;
  socialScore: number;
  punctualityScore: number;
  attireScore: number;
  overallScore: number;
  comment?: string;
  isFlagged: boolean;
  createdAt: Date;
}

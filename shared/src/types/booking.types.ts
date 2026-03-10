export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'counter_offered'
  | 'confirmed'
  | 'cancelled'
  | 'completed';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded';

export interface IBooking {
  id: string;
  venueId: string;
  eventId: string;
  plannerId: string;
  status: BookingStatus;
  totalAmount: number;
  platformFee: number;
  paymentStatus: PaymentStatus;
  eventDate: string;
  message?: string;
  specialRequirements?: string;
  paystackRef?: string;
  createdAt: Date;
  updatedAt: Date;
}

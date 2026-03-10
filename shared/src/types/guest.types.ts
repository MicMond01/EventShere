export type GuestCategory =
  | 'vip'
  | 'dignitary'
  | 'family'
  | 'general'
  | 'press'
  | 'vendor_staff';

export type RsvpStatus =
  | 'pending'
  | 'confirmed'
  | 'declined'
  | 'tentative'
  | 'waitlisted';

export interface IGuest {
  id: string;
  eventId: string;
  userId?: string;
  name: string;
  email?: string;
  phone?: string;
  category: GuestCategory;
  rsvpStatus: RsvpStatus;
  checkedIn: boolean;
  checkedInAt?: Date;
  qrCode?: string;
  notes?: string;
  dietaryReq?: string;
  accessibilityReq?: string;
  createdAt: Date;
}

export interface ISeatAssignment {
  id: string;
  guestId: string;
  eventId: string;
  seatLabel: string;
  zoneName?: string;
  assignedBy: 'algorithm' | 'manual';
  assignedAt: Date;
}

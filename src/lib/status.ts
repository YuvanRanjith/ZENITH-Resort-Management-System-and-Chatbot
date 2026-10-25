import type { ReservationStatus, RoomStatus, StaffRole } from './types';

export const roomStatusTone: Record<RoomStatus, 'emerald' | 'red' | 'champagne'> = {
  available: 'emerald',
  occupied: 'red',
  maintenance: 'champagne',
};

export const roomStatusLabel: Record<RoomStatus, string> = {
  available: 'Available',
  occupied: 'Occupied',
  maintenance: 'Maintenance',
};

export const reservationStatusTone: Record<
  ReservationStatus,
  'emerald' | 'champagne' | 'midnight' | 'red' | 'blue' | 'stone'
> = {
  pending: 'champagne',
  confirmed: 'blue',
  checked_in: 'emerald',
  checked_out: 'stone',
  cancelled: 'red',
};

export const reservationStatusLabel: Record<ReservationStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  checked_in: 'Checked In',
  checked_out: 'Checked Out',
  cancelled: 'Cancelled',
};

export const staffRoleLabel: Record<StaffRole, string> = {
  manager: 'Manager',
  assistant_manager: 'Assistant Manager',
  receptionist: 'Receptionist',
  clerk: 'Clerk',
  room_service: 'Room Service',
};

export const serviceStatusTone = {
  open: 'champagne',
  in_progress: 'blue',
  resolved: 'emerald',
  closed: 'stone',
} as const;

export const serviceStatusLabel = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
} as const;

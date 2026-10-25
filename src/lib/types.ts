export type RoomType =
  | 'Standard Room'
  | 'Deluxe Room'
  | 'Premium Suite'
  | 'Executive Suite'
  | 'Presidential Suite';

export type RoomStatus = 'available' | 'occupied' | 'maintenance';

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled';

export type StaffRole =
  | 'manager'
  | 'assistant_manager'
  | 'receptionist'
  | 'clerk'
  | 'room_service';

export interface Room {
  id: string;
  room_number: string;
  room_type: RoomType;
  description: string | null;
  nightly_price: number;
  capacity: number;
  amenities: string[];
  image_url: string | null;
  operational_status: RoomStatus;
  created_at: string;
}

export interface Customer {
  id: string;
  customer_id: string;
  auth_user_id: string | null;
  name: string;
  email: string;
  phone_no: string | null;
  id_proof_reference: string | null;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  employee_id: string;
  auth_user_id: string | null;
  name: string;
  department: StaffRole;
  salary: number;
  date_of_join: string;
  gender: 'M' | 'F' | 'O' | null;
  phone_no: string | null;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: string;
  customer_id: string;
  room_id: string;
  check_in: string;
  check_out: string;
  total_days: number;
  base_amount: number;
  tax_amount: number;
  total_amount: number;
  status: ReservationStatus;
  created_at: string;
  updated_at: string;
}

export interface ReservationWithDetails extends Reservation {
  rooms?: Pick<Room, 'room_number' | 'room_type' | 'image_url' | 'capacity' | 'nightly_price'>;
  customers?: Pick<Customer, 'customer_id' | 'name' | 'email' | 'phone_no'>;
}

export interface Payment {
  id: string;
  reservation_id: string;
  amount: number;
  payment_status: 'recorded' | 'refunded' | 'failed';
  payment_method: string | null;
  payment_reference: string | null;
  created_at: string;
}

export interface ServiceRequest {
  id: string;
  customer_id: string;
  reservation_id: string | null;
  request_type: string;
  description: string | null;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
}

export interface ExportLog {
  id: string;
  employee_id: string | null;
  export_type: string;
  record_count: number;
  exported_at: string;
}

export interface DashboardStats {
  total_rooms: number;
  available_rooms: number;
  occupied_rooms: number;
  total_customers: number;
  total_employees: number;
  active_reservations: number;
  revenue: number;
  pending_payments: number;
}

export const ROOM_TYPES: RoomType[] = [
  'Standard Room',
  'Deluxe Room',
  'Premium Suite',
  'Executive Suite',
  'Presidential Suite',
];

export const RESERVATION_STATUSES: ReservationStatus[] = [
  'pending',
  'confirmed',
  'checked_in',
  'checked_out',
  'cancelled',
];

export const TAX_RATE = 0.03;

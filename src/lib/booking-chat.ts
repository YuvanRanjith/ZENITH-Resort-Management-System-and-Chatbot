import type { RoomType } from './types';

export interface StayDetails {
  checkIn: string;
  checkOut: string;
  guests: number;
  category: RoomType | '';
}

export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function validateStay(stay: StayDetails, today = localDate()): string | null {
  if (!validDate(stay.checkIn) || !validDate(stay.checkOut)) return 'Use real dates in YYYY-MM-DD format.';
  if (stay.checkIn < today) return 'Check-in must be today or later.';
  if (stay.checkOut <= stay.checkIn) return 'Check-out must be after check-in.';
  if (!Number.isInteger(stay.guests) || stay.guests < 1 || stay.guests > 20) return 'Choose a whole guest count between 1 and 20.';
  return null;
}

export function stayEstimate(stay: StayDetails, nightlyPrice: number) {
  const nights = Math.round((Date.parse(`${stay.checkOut}T00:00:00Z`) - Date.parse(`${stay.checkIn}T00:00:00Z`)) / 86400000);
  const basePaise = Math.round(Number(nightlyPrice) * 100) * nights;
  const taxPaise = Math.round(basePaise * 0.03);
  return { nights, base: basePaise / 100, tax: taxPaise / 100, total: (basePaise + taxPaise) / 100 };
}

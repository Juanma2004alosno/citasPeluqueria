export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number; // duration in minutes
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: number;
}

export enum UserRole {
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN'
}
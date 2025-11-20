import { Appointment, Service } from '../types';
import { SALON_SERVICES, OPENING_HOUR, CLOSING_HOUR } from '../constants';

// Key for localStorage
const APPOINTMENTS_KEY = 'luxe_cuts_appointments';

// Simulate fetching all services (Service Repository)
export const getAllServices = (): Service[] => {
  return SALON_SERVICES;
};

export const getServiceById = (id: string): Service | undefined => {
  return SALON_SERVICES.find(s => s.id === id);
};

// Simulate Appointment Repository methods
export const getAppointments = (): Appointment[] => {
  const data = localStorage.getItem(APPOINTMENTS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveAppointments = (appointments: Appointment[]) => {
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
};

export const createAppointment = (appointment: Appointment): void => {
  const current = getAppointments();
  current.push(appointment);
  saveAppointments(current);
};

export const cancelAppointment = (id: string): void => {
  const current = getAppointments();
  const updated = current.map(app => 
    app.id === id ? { ...app, status: 'cancelled' as const } : app
  );
  saveAppointments(updated);
};

// Business Logic Service (Spring Service Layer equivalent)

export const getAvailableTimeSlots = (date: string, serviceId: string): string[] => {
  const service = getServiceById(serviceId);
  if (!service) return [];

  const allAppointments = getAppointments();
  
  // Filter appointments for the specific date and active status
  const dayAppointments = allAppointments.filter(
    app => app.date === date && app.status !== 'cancelled'
  );

  const slots: string[] = [];
  const duration = service.durationMinutes;

  // Generate all possible start times
  for (let hour = OPENING_HOUR; hour < CLOSING_HOUR; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      // Convert current slot check to minutes from start of day
      const slotStartMinutes = hour * 60 + minute;
      const slotEndMinutes = slotStartMinutes + duration;
      
      // Check if this slot exceeds closing time
      if (slotEndMinutes > CLOSING_HOUR * 60) continue;

      // Format time string HH:mm
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

      // COLLISION DETECTION (The logic you had in Java)
      const isConflict = dayAppointments.some(existingApp => {
        const existingService = getServiceById(existingApp.serviceId);
        if (!existingService) return false;

        const [existH, existM] = existingApp.time.split(':').map(Number);
        const existingStart = existH * 60 + existM;
        const existingEnd = existingStart + existingService.durationMinutes;

        // Check overlap: (StartA < EndB) and (EndA > StartB)
        return slotStartMinutes < existingEnd && slotEndMinutes > existingStart;
      });

      if (!isConflict) {
        slots.push(timeString);
      }
    }
  }

  return slots;
};
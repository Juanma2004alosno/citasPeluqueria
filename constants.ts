import { Service } from './types';

export const SALON_SERVICES: Service[] = [
  {
    id: 'svc_1',
    name: 'Corte de Caballero',
    description: 'Corte clásico o moderno con lavado y peinado incluido.',
    price: 25,
    durationMinutes: 45
  },
  {
    id: 'svc_2',
    name: 'Corte de Dama',
    description: 'Asesoramiento de estilo, lavado, masaje capilar y corte.',
    price: 45,
    durationMinutes: 60
  },
  {
    id: 'svc_3',
    name: 'Tinte Completo',
    description: 'Coloración completa con productos premium sin amoniaco.',
    price: 70,
    durationMinutes: 120
  },
  {
    id: 'svc_4',
    name: 'Mechas Balayage',
    description: 'Técnica de barrido para un efecto natural y luminoso.',
    price: 120,
    durationMinutes: 180
  },
  {
    id: 'svc_5',
    name: 'Tratamiento de Keratina',
    description: 'Alisado y restauración profunda de la fibra capilar.',
    price: 150,
    durationMinutes: 150
  },
  {
    id: 'svc_6',
    name: 'Barba y Ritual',
    description: 'Perfilado de barba con toalla caliente y aceites esenciales.',
    price: 20,
    durationMinutes: 30
  }
];

export const OPENING_HOUR = 9; // 9 AM
export const CLOSING_HOUR = 19; // 7 PM
export const SLOT_INTERVAL = 30; // Minutes
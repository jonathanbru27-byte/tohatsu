import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return `$${(value || 0).toLocaleString('en-US')}`;
}

export function cleanPhone(phone: string): string {
  return (phone || '').replace(/[^0-9]/g, '');
}

export const PROVINCIAS = [
  'Manabí',
  'Guayas',
  'El Oro',
  'Esmeraldas',
  'Santa Elena',
  'Los Ríos',
  'Sucumbíos',
  'Orellana',
  'Napo',
  'Pastaza',
  'Morona Santiago',
  'Zamora Chinchipe',
] as const;

export const CATEGORIAS_REPUESTO = [
  'Filtros',
  'Encendido',
  'Refrigeración',
  'Lubricantes',
  'Hélices',
  'Protección',
  'Combustible',
  'Mandos',
  'General',
] as const;

export const MES_NAMES_SHORT = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];

export const LOGO_URL =
  'https://customer-assets.emergentagent.com/job_outboard-dealer-app/artifacts/xhb5qngr_images.jpg';

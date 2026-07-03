import axios, { AxiosInstance } from 'axios';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  '';

// When deployed to Vercel (or any external host), always use the full backend URL
// since there's no local backend to proxy to. In development with the full stack,
// use relative /api paths that get proxied by Next.js rewrites.
const isExternalDeployment = typeof window !== 'undefined' && 
  !window.location.hostname.includes('preview.emergentagent.com') &&
  !window.location.hostname.includes('localhost');

const API_URL = isExternalDeployment && BACKEND_URL
  ? `${BACKEND_URL}/api`
  : (typeof window === 'undefined' ? `${BACKEND_URL}/api` : '/api');

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('tohatsu_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('tohatsu_token');
    }
    return Promise.reject(error);
  }
);

// ===================== TYPES =====================
export interface Motor {
  id?: string;
  modelo: string;
  potencia: string;
  hp_value?: number;
  tipo?: string;
  cilindrada?: string;
  peso_seco?: string;
  sistema?: string;
  badge_text?: string;
  caracteristicas?: string;
  precio: number;
  imagen: string;
  financiamiento_entrada: number;
  financiamiento_cuotas: number;
}

export interface Repuesto {
  id?: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen?: string;
  categoria?: string;
  stock?: number;
  modelos_compatibles?: string;
}

export interface CalendarioEvento {
  id?: string;
  titulo?: string;
  fecha: string;
  hora?: string;
  localidad: string;
  descripcion: string;
}

export interface Configuracion {
  whatsapp_ventas: string;
  whatsapp_repuestos: string;
  whatsapp_servicio: string;
}

export interface Asesor {
  id?: string;
  nombre: string;
  whatsapp: string;
  provincia: string;
}

export interface AsesorAsignado {
  nombre: string;
  whatsapp: string;
  provincia: string;
  is_general: boolean;
}

export interface LeadCreate {
  nombre: string;
  telefono: string;
  provincia: string;
  interes: string;
  detalle?: string;
}

// ===================== AUTH =====================
export const login = async (username: string, password: string) => {
  const { data } = await api.post('/auth/login', { username, password });
  return data;
};

// ===================== MOTORS =====================
export const getMotors = async (): Promise<Motor[]> => (await api.get('/motors')).data;
export const getMotor = async (id: string): Promise<Motor> => (await api.get(`/motors/${id}`)).data;
export const createMotor = async (m: Omit<Motor, 'id'>): Promise<Motor> => (await api.post('/motors', m)).data;
export const updateMotor = async (id: string, m: Omit<Motor, 'id'>): Promise<Motor> => (await api.put(`/motors/${id}`, m)).data;
export const deleteMotor = async (id: string) => (await api.delete(`/motors/${id}`)).data;

// ===================== REPUESTOS =====================
export const getRepuestos = async (): Promise<Repuesto[]> => (await api.get('/repuestos')).data;
export const createRepuesto = async (r: Omit<Repuesto, 'id'>): Promise<Repuesto> => (await api.post('/repuestos', r)).data;
export const updateRepuesto = async (id: string, r: Omit<Repuesto, 'id'>): Promise<Repuesto> => (await api.put(`/repuestos/${id}`, r)).data;
export const deleteRepuesto = async (id: string) => (await api.delete(`/repuestos/${id}`)).data;

// ===================== CALENDAR =====================
export const getCalendar = async (): Promise<CalendarioEvento[]> => (await api.get('/calendar')).data;
export const createEvento = async (e: Omit<CalendarioEvento, 'id'>): Promise<CalendarioEvento> => (await api.post('/calendar', e)).data;
export const updateEvento = async (id: string, e: Omit<CalendarioEvento, 'id'>): Promise<CalendarioEvento> => (await api.put(`/calendar/${id}`, e)).data;
export const deleteEvento = async (id: string) => (await api.delete(`/calendar/${id}`)).data;

// ===================== CONFIG =====================
export const getConfig = async (): Promise<Configuracion> => (await api.get('/config')).data;
export const updateConfig = async (c: Configuracion): Promise<Configuracion> => (await api.put('/config', c)).data;

// ===================== ASESORES =====================
export const getAsesores = async (): Promise<Asesor[]> => (await api.get('/asesores')).data;
export const createAsesor = async (a: Omit<Asesor, 'id'>): Promise<Asesor> => (await api.post('/asesores', a)).data;
export const updateAsesor = async (id: string, a: Omit<Asesor, 'id'>): Promise<Asesor> => (await api.put(`/asesores/${id}`, a)).data;
export const deleteAsesor = async (id: string) => (await api.delete(`/asesores/${id}`)).data;
export const getAsesorByProvincia = async (provincia: string): Promise<AsesorAsignado> =>
  (await api.get(`/asesores/by-provincia/${encodeURIComponent(provincia)}`)).data;

// ===================== LEADS =====================
export const createLead = async (lead: LeadCreate) => (await api.post('/leads', lead)).data;
export const downloadLeadsExcel = async () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('tohatsu_token') : null;
  // Use the same API_URL logic for consistency
  const baseUrl = isExternalDeployment && BACKEND_URL ? `${BACKEND_URL}/api` : '/api';
  const url = `${baseUrl}/leads/export/xlsx`;
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = `leads_tohatsu_${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
};

export default api;

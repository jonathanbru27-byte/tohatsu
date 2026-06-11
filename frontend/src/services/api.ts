import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL + '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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

export interface CalendarioEvento {
  id?: string;
  fecha: string;
  localidad: string;
  descripcion: string;
}

export interface Configuracion {
  whatsapp_ventas: string;
  whatsapp_repuestos: string;
  whatsapp_servicio: string;
}

export interface ContactForm {
  nombre: string;
  telefono: string;
  localidad: string;
}

// Auth
export const login = async (username: string, password: string) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

// Motors
export const getMotors = async (): Promise<Motor[]> => {
  const response = await api.get('/motors');
  return response.data;
};

export const getMotor = async (id: string): Promise<Motor> => {
  const response = await api.get(`/motors/${id}`);
  return response.data;
};

export const createMotor = async (motor: Omit<Motor, 'id'>): Promise<Motor> => {
  const response = await api.post('/motors', motor);
  return response.data;
};

export const updateMotor = async (id: string, motor: Omit<Motor, 'id'>): Promise<Motor> => {
  const response = await api.put(`/motors/${id}`, motor);
  return response.data;
};

export const deleteMotor = async (id: string) => {
  const response = await api.delete(`/motors/${id}`);
  return response.data;
};

// Calendar
export const getCalendar = async (): Promise<CalendarioEvento[]> => {
  const response = await api.get('/calendar');
  return response.data;
};

export const createEvento = async (evento: Omit<CalendarioEvento, 'id'>): Promise<CalendarioEvento> => {
  const response = await api.post('/calendar', evento);
  return response.data;
};

export const updateEvento = async (id: string, evento: Omit<CalendarioEvento, 'id'>): Promise<CalendarioEvento> => {
  const response = await api.put(`/calendar/${id}`, evento);
  return response.data;
};

export const deleteEvento = async (id: string) => {
  const response = await api.delete(`/calendar/${id}`);
  return response.data;
};

// Configuration
export const getConfig = async (): Promise<Configuracion> => {
  const response = await api.get('/config');
  return response.data;
};

export const updateConfig = async (config: Configuracion): Promise<Configuracion> => {
  const response = await api.put('/config', config);
  return response.data;
};

export default api;

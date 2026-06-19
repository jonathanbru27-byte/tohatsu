'use client';
import { RepuestoFormPage } from '../_form';
import { AdminGuard } from '@/components/AdminGuard';

export default function AddRepuestoPage() {
  return <AdminGuard><RepuestoFormPage mode="add" /></AdminGuard>;
}

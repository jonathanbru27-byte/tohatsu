'use client';
import { RepuestoFormPage } from '../../_form';
import { AdminGuard } from '@/components/AdminGuard';

export default function EditRepuestoPage() {
  return <AdminGuard><RepuestoFormPage mode="edit" /></AdminGuard>;
}

'use client';
import { AsesorFormPage } from '../../_form';
import { AdminGuard } from '@/components/AdminGuard';

export default function EditAsesorPage() {
  return <AdminGuard><AsesorFormPage mode="edit" /></AdminGuard>;
}

'use client';
import { AsesorFormPage } from '../_form';
import { AdminGuard } from '@/components/AdminGuard';

export default function AddAsesorPage() {
  return <AdminGuard><AsesorFormPage mode="add" /></AdminGuard>;
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, User, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Ingresa usuario y contraseña');
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
      router.replace('/admin/dashboard');
    } catch {
      toast.error('Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-[#0066cc] to-[#004999] text-white">
      <div className="flex min-h-[100dvh] flex-col px-6 pt-12">
        <button onClick={() => router.back()} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 self-start">
          <ArrowLeft size={22} />
        </button>

        <div className="mt-10 flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15">
            <Lock size={42} />
          </div>
          <h1 className="mt-5 text-[26px] font-black">Acceso Administrador</h1>
          <p className="mt-2 text-sm opacity-90">Ingrese sus credenciales</p>
        </div>

        <form onSubmit={submit} className="mt-10 space-y-3">
          <label className="flex items-center gap-3 rounded-2xl bg-white px-4 text-slate-800">
            <User size={20} className="text-slate-500" />
            <input
              className="flex-1 bg-transparent py-4 outline-none"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoCapitalize="none"
              autoComplete="username"
              data-testid="login-username"
            />
          </label>
          <label className="flex items-center gap-3 rounded-2xl bg-white px-4 text-slate-800">
            <Lock size={20} className="text-slate-500" />
            <input
              className="flex-1 bg-transparent py-4 outline-none"
              placeholder="Contraseña"
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              data-testid="login-password"
            />
            <button type="button" onClick={() => setShow(!show)} className="text-slate-500">
              {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </label>
          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-4 text-[16px] font-bold text-[#0066cc] disabled:opacity-70"
            data-testid="login-submit"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (<><span>Iniciar Sesión</span><ArrowRight size={20} /></>)}
          </button>
        </form>
      </div>
    </div>
  );
}

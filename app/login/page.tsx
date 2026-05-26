'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import NeonIllustration from '@/components/NeonIllustration';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      await login(email, password);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al iniciar sesión');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
      <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-[var(--neon-cyan)] opacity-10 blur-[120px]" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-[var(--neon-magenta)] opacity-10 blur-[120px]" />

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 max-w-5xl w-full relative z-10 items-center">
        <div className="hidden lg:block animate-float">
          <NeonIllustration variant="cubes" className="w-full max-w-md mx-auto" />
        </div>

        <div className="max-w-md w-full mx-auto space-y-6">
          <div className="text-center">
            <div className="inline-grid place-items-center h-20 w-20 rounded-2xl bg-[var(--bg-card)] border border-[rgba(0,240,255,0.4)] shadow-[0_0_30px_rgba(0,240,255,0.3)] mb-4">
              <Image src="/logo.png" alt="Logo ImpresoGT" width={50} height={50} className="rounded-xl" />
            </div>
            <h1 className="text-4xl font-bold neon-text-cyan tracking-wide">ImpresoGT</h1>
            <p className="text-sm text-[var(--text-muted)] uppercase tracking-[0.3em] mt-2">Sistema de Inventario</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 neon-card neon-card-cyan p-7"
          >
            {error && (
              <div className="rounded-lg border border-[rgba(255,64,96,0.4)] bg-[rgba(255,64,96,0.08)] px-4 py-3 text-sm neon-text-red">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="neon-input"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="neon-input pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-2 flex items-center px-2 text-[var(--text-muted)] hover:text-[var(--neon-cyan)] transition"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="neon-btn-cyan w-full flex items-center justify-center gap-2 py-2.5"
            >
              <LogIn size={18} />
              {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

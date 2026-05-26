'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { usuario, cargando } = useAuth();

  useEffect(() => {
    if (!cargando && !usuario) {
      router.push('/login');
    }
  }, [usuario, cargando, router]);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="neon-spinner h-14 w-14 mx-auto"></div>
          <p className="mt-4 text-[var(--text-secondary)] tracking-widest text-sm uppercase">Cargando</p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return null;
  }

  return <>{children}</>;
}

'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, Role, ROLE_LABELS } from '@/lib/auth';

export default function ProtectedLayout({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles: Role[];
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !allowedRoles.includes(user.role))) {
      router.push('/login');
    }
  }, [loading, user, allowedRoles, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Chargement...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-primary-700 text-white flex flex-col p-6">
        <h1 className="text-xl font-bold mb-1">Clinique</h1>
        <p className="text-primary-100 text-sm mb-8">{ROLE_LABELS[user.role]}</p>
        <nav className="flex-1 space-y-2 text-sm">
          <p className="text-primary-100">{user.email}</p>
        </nav>
        <button
          onClick={logout}
          className="mt-auto bg-primary-600 hover:bg-primary-500 rounded-lg py-2 text-sm transition"
        >
          Déconnexion
        </button>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}

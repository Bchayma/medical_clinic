'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { useAuth, ROLE_LABELS } from '@/lib/auth';

type NavItem = {
  href: string;
  label: string;
  description: string;
};

const navItems: NavItem[] = [
  { href: '/dashboard/admin', label: 'Vue générale', description: 'Synthèse de la clinique' },
  { href: '/dashboard/admin/doctors', label: 'Médecins', description: 'Équipe médicale' },
  { href: '/dashboard/admin/patients', label: 'Patients', description: 'Dossiers et suivi' },
  { href: '/dashboard/admin/appointments', label: 'Rendez-vous', description: 'Planning et statuts' },
  { href: '/dashboard/admin/prescriptions', label: 'Ordonnances', description: 'Archivage et contrôle' },
  { href: '/dashboard/admin/pharmacies', label: 'Pharmacies', description: 'Réseau et stock' },
  { href: '/dashboard/admin/cabinets', label: 'Cabinets', description: 'Espaces médicaux' },
];

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== '/dashboard/admin' && pathname.startsWith(href));
}

export default function AdminDashboardClient({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f1eb] text-slate-500">
        Chargement...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#eef3f9_0%,#f8f5ef_52%,#eef7f4_100%)] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-[300px] shrink-0 border-r border-white/50 bg-[#10263f] text-white shadow-[18px_0_40px_rgba(15,23,42,0.08)] lg:flex lg:flex-col">
          <div className="border-b border-white/10 px-8 py-7">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.28em] text-sky-100">
              Medical Clinic
            </div>
            <h1 className="mt-6 text-3xl font-semibold leading-tight">Admin Dashboard</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Centralisez la gestion des médecins, patients, rendez-vous et stocks depuis un seul espace.
            </p>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-6">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-start gap-4 rounded-2xl px-4 py-3 transition ${
                    active ? 'bg-white text-[#10263f] shadow-lg shadow-sky-950/20' : 'text-slate-200 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  <span
                    className={`mt-1 h-2.5 w-2.5 rounded-full ${
                      active ? 'bg-emerald-500' : 'bg-sky-300/60 group-hover:bg-sky-200'
                    }`}
                  />
                  <span>
                    <span className="block text-sm font-semibold">{item.label}</span>
                    <span className={`block text-xs leading-5 ${active ? 'text-slate-500' : 'text-slate-400'}`}>
                      {item.description}
                    </span>
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 px-6 py-6">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Compte connecté</p>
            <p className="mt-2 text-sm font-medium text-white">{user.email}</p>
            <p className="mt-1 text-xs text-slate-300">{ROLE_LABELS[user.role]}</p>
            <button
              onClick={logout}
              className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#10263f] transition hover:bg-slate-100"
            >
              Déconnexion
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-white/60 bg-white/75 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Admin workspace</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">
                  Gestion de la clinique
                </h2>
              </div>

              <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#10263f] text-sm font-semibold text-white">
                  {user.email.slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900">{user.email}</p>
                  <p className="text-xs text-slate-500">{ROLE_LABELS[user.role]}</p>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
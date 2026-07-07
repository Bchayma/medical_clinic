'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from './api';

export type Role =
  | 'admin'
  | 'doctor_internal'
  | 'doctor_external'
  | 'patient'
  | 'pharmacy_central'
  | 'pharmacy_partner';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const stored = localStorage.getItem('user');
    if (token && stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    setTimeout(() => router.push(dashboardPathForRole(data.user.role)), 0);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
}

export function dashboardPathForRole(role: Role): string {
  switch (role) {
    case 'admin':
      return '/dashboard/admin';
    case 'doctor_internal':
    case 'doctor_external':
      return '/dashboard/doctor';
    case 'patient':
      return '/dashboard/patient';
    case 'pharmacy_central':
    case 'pharmacy_partner':
      return '/dashboard/pharmacy';
    default:
      return '/login';
  }
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrateur',
  doctor_internal: 'Médecin interne',
  doctor_external: 'Médecin externe',
  patient: 'Patient',
  pharmacy_central: 'Pharmacie centrale',
  pharmacy_partner: 'Pharmacie partenaire',
};

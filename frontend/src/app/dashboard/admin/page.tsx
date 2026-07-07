'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

type StatCardProps = {
  label: string;
  value: string;
  detail: string;
  accent: string;
};

function StatCard({ label, value, detail, accent }: StatCardProps) {
  return (
    <div className="rounded-[28px] border border-white/80 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
      <div className={`mb-5 h-3 w-20 rounded-full ${accent}`} />
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-500">{detail}</p>
    </div>
  );
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({
    doctors: 0,
    patients: 0,
    appointments: 0,
    prescriptions: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [recentPatients, setRecentPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [doctors, patients, appointments, prescriptions] = await Promise.all([
          api.get('/doctors'),
          api.get('/patients'),
          api.get('/appointments'),
          api.get('/prescriptions'),
        ]);

        setStats({
          doctors: doctors.data.length,
          patients: patients.data.length,
          appointments: appointments.data.length,
          prescriptions: prescriptions.data.length,
        });
        setRecentAppointments(appointments.data.slice(0, 4));
        setRecentPatients(patients.data.slice(0, 4));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <div className="text-sm text-slate-500">Chargement du tableau de bord...</div>;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[34px] border border-slate-200 bg-[#10263f] p-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.32em] text-sky-200/80">Clinic control room</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              Une vue claire sur toute l’activité de la clinique.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Surveillez les équipes, les rendez-vous et les ressources depuis une interface sobre, hiérarchisée et rapide à lire.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-3xl bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Médecins</p>
              <p className="mt-2 text-3xl font-semibold">{stats.doctors}</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Patients</p>
              <p className="mt-2 text-3xl font-semibold">{stats.patients}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <a href="/dashboard/admin/doctors" className="rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(15,23,42,0.1)]">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Créer</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Médecin</p>
          <p className="mt-1 text-sm text-slate-500">Ajouter un nouveau profil médical.</p>
        </a>
        <a href="/dashboard/admin/patients" className="rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(15,23,42,0.1)]">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Créer</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Patient</p>
          <p className="mt-1 text-sm text-slate-500">Ouvrir un dossier patient.</p>
        </a>
        <a href="/dashboard/admin/pharmacies" className="rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(15,23,42,0.1)]">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Créer</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Pharmacie</p>
          <p className="mt-1 text-sm text-slate-500">Ajouter une pharmacie centrale ou partenaire.</p>
        </a>
        <a href="/dashboard/admin/cabinets" className="rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(15,23,42,0.1)]">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Créer</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Cabinet</p>
          <p className="mt-1 text-sm text-slate-500">Organiser les espaces médicaux.</p>
        </a>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Médecins actifs"
          value={String(stats.doctors).padStart(2, '0')}
          detail="Répartition des équipes internes et externes."
          accent="bg-emerald-500"
        />
        <StatCard
          label="Patients inscrits"
          value={String(stats.patients).padStart(2, '0')}
          detail="Dossiers patients disponibles pour le suivi."
          accent="bg-sky-500"
        />
        <StatCard
          label="Rendez-vous"
          value={String(stats.appointments).padStart(2, '0')}
          detail="Planning global de la clinique."
          accent="bg-amber-400"
        />
        <StatCard
          label="Ordonnances"
          value={String(stats.prescriptions).padStart(2, '0')}
          detail="Ordonnances archivées et consultables."
          accent="bg-rose-500"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Rendez-vous récents</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900">Dernières activités</h2>
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">{recentAppointments.length} éléments</div>
          </div>

          <div className="mt-6 space-y-4">
            {recentAppointments.map((appointment) => (
              <div key={appointment._id} className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {appointment.patientId?.userId?.firstName} {appointment.patientId?.userId?.lastName}
                    </p>
                    <p className="text-sm text-slate-500">
                      Dr. {appointment.doctorId?.userId?.firstName} {appointment.doctorId?.userId?.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">
                      {new Date(appointment.date).toLocaleString('fr-FR')}
                    </p>
                    <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium capitalize text-slate-600 shadow-sm">
                      {appointment.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {recentAppointments.length === 0 && <p className="text-sm text-slate-500">Aucun rendez-vous trouvé.</p>}
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Nouveaux patients</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">Dossiers récents</h2>

          <div className="mt-6 space-y-4">
            {recentPatients.map((patient) => (
              <div key={patient._id} className="rounded-3xl border border-slate-100 bg-[#f8fafc] p-4">
                <p className="font-semibold text-slate-900">
                  {patient.userId?.firstName} {patient.userId?.lastName}
                </p>
                <p className="text-sm text-slate-500">{patient.userId?.email}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                  <span className="rounded-full bg-white px-3 py-1 shadow-sm">Groupe sanguin: {patient.bloodType || '—'}</span>
                  <span className="rounded-full bg-white px-3 py-1 shadow-sm">Allergies: {patient.allergies?.length || 0}</span>
                </div>
              </div>
            ))}
            {recentPatients.length === 0 && <p className="text-sm text-slate-500">Aucun patient trouvé.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
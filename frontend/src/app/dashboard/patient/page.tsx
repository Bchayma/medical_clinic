'use client';

import { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import api from '@/lib/api';

export default function PatientDashboard() {
  const [patient, setPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [medQuery, setMedQuery] = useState('');
  const [medResults, setMedResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: p } = await api.get('/patients/me/profile');
        setPatient(p);
        if (p?._id) {
          const [a, pr] = await Promise.all([
            api.get(`/appointments/by-patient/${p._id}`),
            api.get(`/prescriptions/by-patient/${p._id}`),
          ]);
          setAppointments(a.data);
          const enriched = await Promise.all(
            pr.data.map(async (prescription: any) => {
              try {
                const { data } = await api.get(`/prescriptions/${prescription._id}/with-pharmacy-stocks`);
                return data;
              } catch (error) {
                console.error(error);
                return prescription;
              }
            }),
          );
          setPrescriptions(enriched);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const searchMedication = async () => {
    if (!medQuery) return;
    const { data } = await api.get(`/medications/search?name=${encodeURIComponent(medQuery)}`);
    setMedResults(data);
  };

  const cancelAppointment = async (id: string) => {
    await api.patch(`/appointments/${id}/status`, { status: 'cancelled' });
    setAppointments((prev) => prev.map((a) => (a._id === id ? { ...a, status: 'cancelled' } : a)));
  };

  if (loading) {
    return (
      <ProtectedLayout allowedRoles={['patient']}>
        <p className="text-slate-500">Chargement...</p>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout allowedRoles={['patient']}>
      <h2 className="text-2xl font-bold mb-1">
        Bonjour {patient?.userId?.firstName} {patient?.userId?.lastName}
      </h2>
      <p className="text-slate-500 mb-6">Votre espace patient</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <section className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold mb-4">Mes rendez-vous</h3>
          <div className="space-y-3">
            {appointments.map((a) => (
              <div key={a._id} className="border border-slate-100 rounded-lg p-3 text-sm">
                <p className="font-medium">
                  Dr. {a.doctorId?.userId?.firstName} {a.doctorId?.userId?.lastName}
                </p>
                <p className="text-slate-500">{new Date(a.date).toLocaleString('fr-FR')}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-1 rounded bg-slate-100 capitalize">{a.status}</span>
                  {['pending', 'confirmed'].includes(a.status) && (
                    <button
                      onClick={() => cancelAppointment(a._id)}
                      className="text-xs px-2 py-1 rounded bg-red-100 text-red-700"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </div>
            ))}
            {appointments.length === 0 && <p className="text-slate-400 text-sm">Aucun rendez-vous.</p>}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold mb-4">Mes ordonnances</h3>
          <div className="space-y-3">
            {prescriptions.map((p) => (
              <div key={p._id} className="border border-slate-100 rounded-lg p-3 text-sm">
                <p className="font-medium">
                  Dr. {p.doctorId?.userId?.firstName} {p.doctorId?.userId?.lastName}
                </p>
                <p className="text-slate-500 mb-1">{new Date(p.date).toLocaleDateString('fr-FR')}</p>
                <div className="space-y-3 text-slate-600">
                  {p.medications?.map((m: any, idx: number) => (
                    <div key={idx} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <p className="font-medium text-slate-800">
                        {m.name} — {m.dosage} ({m.frequency})
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">Disponible dans</p>
                      {m.availablePharmacies?.length ? (
                        <ul className="mt-2 space-y-1 text-sm">
                          {m.availablePharmacies.map((pharmacy: any) => (
                            <li key={pharmacy.pharmacyId} className="flex flex-col rounded-md bg-white px-3 py-2 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                              <span className="font-medium text-slate-900">
                                {pharmacy.name} <span className="text-slate-500">— {pharmacy.type}</span>
                              </span>
                              <span className="text-slate-600">
                                {pharmacy.quantity} unités{pharmacy.address ? ` · ${pharmacy.address}` : ''}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm text-slate-500">Aucune pharmacie disponible.</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {prescriptions.length === 0 && <p className="text-slate-400 text-sm">Aucune ordonnance.</p>}
          </div>
        </section>
      </div>

      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold mb-4">Rechercher un médicament</h3>
        <div className="flex gap-2 mb-4">
          <input
            value={medQuery}
            onChange={(e) => setMedQuery(e.target.value)}
            placeholder="Nom du médicament..."
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            onClick={searchMedication}
            className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm"
          >
            Rechercher
          </button>
        </div>
        <div className="space-y-2">
          {medResults.map((m) => (
            <div key={m._id} className="border border-slate-100 rounded-lg p-3 text-sm flex justify-between">
              <div>
                <p className="font-medium">{m.name}</p>
                <p className="text-slate-500">
                  {m.pharmacyId?.name} — {m.pharmacyId?.address || 'Adresse non renseignée'}
                </p>
              </div>
              <p className="text-slate-600">Qté : {m.quantity}</p>
            </div>
          ))}
          {medResults.length === 0 && (
            <p className="text-slate-400 text-sm">Lancez une recherche pour voir les résultats.</p>
          )}
        </div>
      </section>
    </ProtectedLayout>
  );
}

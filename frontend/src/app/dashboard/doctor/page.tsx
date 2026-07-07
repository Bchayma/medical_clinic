'use client';

import { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState<{ [id: string]: string }>({});

  useEffect(() => {
    const load = async () => {
      try {
        const { data: doc } = await api.get('/doctors/me/profile');
        setDoctor(doc);
        if (doc?._id) {
          const [p, a] = await Promise.all([
            api.get(`/patients/by-doctor/${doc._id}`),
            api.get(`/appointments/by-doctor/${doc._id}`),
          ]);
          setPatients(p.data);
          setAppointments(a.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await api.patch(`/appointments/${id}/status`, { status });
    setAppointments((prev) => prev.map((a) => (a._id === id ? { ...a, status } : a)));
  };

  const addNote = async (patientId: string) => {
    const text = note[patientId];
    if (!text) return;
    await api.post(`/patients/${patientId}/notes`, { doctorId: doctor._id, note: text });
    setNote({ ...note, [patientId]: '' });
    alert('Note médicale ajoutée');
  };

  if (loading) {
    return (
      <ProtectedLayout allowedRoles={['doctor_internal', 'doctor_external']}>
        <p className="text-slate-500">Chargement...</p>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout allowedRoles={['doctor_internal', 'doctor_external']}>
      <h2 className="text-2xl font-bold mb-1">
        {doctor?.type === 'internal' ? 'Espace médecin interne' : 'Espace médecin externe'}
      </h2>
      <p className="text-slate-500 mb-6">
        Spécialité : {doctor?.speciality} {doctor?.cabinetId ? `— Cabinet : ${doctor.cabinetId.name}` : ''}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold mb-4">Mes rendez-vous ({appointments.length})</h3>
          <div className="space-y-3">
            {appointments.map((a) => (
              <div key={a._id} className="border border-slate-100 rounded-lg p-3 text-sm">
                <p className="font-medium">
                  {a.patientId?.userId?.firstName} {a.patientId?.userId?.lastName}
                </p>
                <p className="text-slate-500">{new Date(a.date).toLocaleString('fr-FR')}</p>
                <p className="text-slate-500 mb-2">Motif : {a.reason || '—'}</p>
                <div className="flex gap-2">
                  <span className="text-xs px-2 py-1 rounded bg-slate-100 capitalize">{a.status}</span>
                  {a.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(a._id, 'confirmed')}
                        className="text-xs px-2 py-1 rounded bg-green-100 text-green-700"
                      >
                        Accepter
                      </button>
                      <button
                        onClick={() => updateStatus(a._id, 'refused')}
                        className="text-xs px-2 py-1 rounded bg-red-100 text-red-700"
                      >
                        Refuser
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {appointments.length === 0 && <p className="text-slate-400 text-sm">Aucun rendez-vous.</p>}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold mb-4">Mes patients ({patients.length})</h3>
          <div className="space-y-3">
            {patients.map((p) => (
              <div key={p._id} className="border border-slate-100 rounded-lg p-3 text-sm">
                <p className="font-medium">
                  {p.userId?.firstName} {p.userId?.lastName}
                </p>
                <p className="text-slate-500 mb-2">{p.userId?.email}</p>
                <div className="flex gap-2">
                  <input
                    value={note[p._id] || ''}
                    onChange={(e) => setNote({ ...note, [p._id]: e.target.value })}
                    placeholder="Ajouter une note médicale..."
                    className="flex-1 rounded border border-slate-300 px-2 py-1 text-xs"
                  />
                  <button
                    onClick={() => addNote(p._id)}
                    className="text-xs px-3 py-1 rounded bg-primary-600 text-white"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            ))}
            {patients.length === 0 && <p className="text-slate-400 text-sm">Aucun patient suivi.</p>}
          </div>
        </section>
      </div>
    </ProtectedLayout>
  );
}

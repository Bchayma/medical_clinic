'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Modal from '@/components/Modal';

export default function AdminCabinetsPage() {
  const [cabinets, setCabinets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    location: '',
    floor: '',
    doctorId: '',
    schedule: '',
  });

  const loadCabinets = async () => {
    const { data } = await api.get('/cabinets');
    setCabinets(data);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [cabinetResponse, doctorResponse] = await Promise.all([api.get('/cabinets'), api.get('/doctors')]);
        setCabinets(cabinetResponse.data);
        setDoctors(doctorResponse.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const createCabinet = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const schedule = form.schedule
        ? JSON.parse(form.schedule)
        : undefined;

      await api.post('/cabinets', {
        name: form.name,
        location: form.location,
        floor: form.floor,
        doctorId: form.doctorId || undefined,
        schedule,
      });
      setForm({ name: '', location: '', floor: '', doctorId: '', schedule: '' });
      await loadCabinets();
      setOpen(false);
    } catch (error) {
      console.error(error);
      alert('Impossible de créer le cabinet. Vérifiez le JSON du planning si vous en avez fourni un.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between gap-4 rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Cabinets</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-900">Espaces médicaux</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Gérez les cabinets, leur emplacement, leur organisation et les médecins qui y sont affectés.
          </p>
        </div>
        <button onClick={() => setOpen(true)} className="rounded-2xl bg-[#10263f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d1f34]">
          Ajouter
        </button>
      </section>

      <Modal open={open} title="Ajouter un cabinet" onClose={() => setOpen(false)}>
        <form onSubmit={createCabinet} className="grid gap-3 sm:grid-cols-2">
          <input required placeholder="Nom du cabinet" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400" />
          <input placeholder="Emplacement" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400" />
          <input placeholder="Étage" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400" />
          <select value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400">
            <option value="">Médecin affecté (optionnel)</option>
            {doctors.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                {doctor.userId?.firstName} {doctor.userId?.lastName}
              </option>
            ))}
          </select>
          <textarea
            placeholder='Planning JSON ex: [{"day":"Mon","startTime":"08:00","endTime":"12:00"}]'
            value={form.schedule}
            onChange={(e) => setForm({ ...form, schedule: e.target.value })}
            className="min-h-[120px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 sm:col-span-2"
          />
          <button disabled={saving} className="rounded-2xl bg-[#10263f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0d1f34] disabled:opacity-60 sm:col-span-2">
            {saving ? 'Création...' : 'Ajouter le cabinet'}
          </button>
        </form>
      </Modal>

      {loading ? (
        <p className="text-sm text-slate-500">Chargement...</p>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {cabinets.map((cabinet) => (
            <article key={cabinet._id} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{cabinet.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{cabinet.location || 'Emplacement non défini'}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  Étage {cabinet.floor || '—'}
                </span>
              </div>

              <div className="mt-5 rounded-2xl bg-[#f8fafc] p-4 text-sm text-slate-700">
                <p>Médecin affecté: {cabinet.doctorId?.userId?.firstName ? `${cabinet.doctorId.userId.firstName} ${cabinet.doctorId.userId.lastName}` : 'Aucun'}</p>
                <p className="mt-1">Créneaux planifiés: {cabinet.schedule?.length || 0}</p>
              </div>
            </article>
          ))}
          {cabinets.length === 0 && <p className="text-sm text-slate-500">Aucun cabinet trouvé.</p>}
        </div>
      )}
    </div>
  );
}
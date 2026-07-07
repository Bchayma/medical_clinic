'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Modal from '@/components/Modal';
import AppointmentsCalendar from '@/components/AppointmentsCalendar';

const STATUSES = ['pending', 'confirmed', 'refused', 'cancelled', 'completed'];

const emptyForm = { patientId: '', doctorId: '', cabinetId: '', date: '', reason: '', status: 'pending' };

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [cabinets, setCabinets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const load = async () => {
    const [a, p, d, c] = await Promise.all([
      api.get('/appointments'), api.get('/patients'), api.get('/doctors'), api.get('/cabinets'),
    ]);
    setAppointments(a.data); setPatients(p.data); setDoctors(d.data); setCabinets(c.data);
  };

  useEffect(() => { load().catch(console.error).finally(() => setLoading(false)); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true); };

  const openEdit = (a: any) => {
    setEditing(a);
    setForm({
      patientId: a.patientId?._id || a.patientId || '',
      doctorId: a.doctorId?._id || a.doctorId || '',
      cabinetId: a.cabinetId?._id || a.cabinetId || '',
      date: a.date ? new Date(a.date).toISOString().slice(0, 16) : '',
      reason: a.reason || '',
      status: a.status || 'pending',
    });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, cabinetId: form.cabinetId || undefined };
      if (editing) await api.patch(`/appointments/${editing._id}`, payload);
      else await api.post('/appointments', payload);
      await load(); setOpen(false);
    } catch (err) { console.error(err); alert('Erreur lors de l\'enregistrement'); }
    finally { setSaving(false); }
  };

  const remove = async (a: any) => {
    if (!window.confirm('Supprimer ce rendez-vous ?')) return;
    try { await api.delete(`/appointments/${a._id}`); await load(); }
    catch { alert('Impossible de supprimer'); }
  };

  const f = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const cls = 'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400';

  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between gap-4 rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Rendez-vous</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-900">Planning global</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">Visualisez et gérez les créneaux, statuts et motifs de consultation.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setCalendarOpen(true)} className="rounded-2xl border border-[#10263f] px-5 py-3 text-sm font-semibold text-[#10263f] transition hover:bg-slate-50">Calendrier</button>
          <button onClick={openCreate} className="rounded-2xl bg-[#10263f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d1f34]">Ajouter</button>
        </div>
      </section>

      <Modal open={open} title={editing ? 'Modifier le rendez-vous' : 'Ajouter un rendez-vous'} onClose={() => setOpen(false)}>
        <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
          <select required className={cls} value={form.patientId} onChange={(e) => f('patientId', e.target.value)}>
            <option value="">Patient</option>
            {patients.map((p) => <option key={p._id} value={p._id}>{p.userId?.firstName} {p.userId?.lastName}</option>)}
          </select>
          <select required className={cls} value={form.doctorId} onChange={(e) => f('doctorId', e.target.value)}>
            <option value="">Médecin</option>
            {doctors.map((d) => <option key={d._id} value={d._id}>Dr. {d.userId?.firstName} {d.userId?.lastName}</option>)}
          </select>
          <select className={cls} value={form.cabinetId} onChange={(e) => f('cabinetId', e.target.value)}>
            <option value="">Cabinet (optionnel)</option>
            {cabinets.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <input required type="datetime-local" className={cls} value={form.date} onChange={(e) => f('date', e.target.value)} />
          <input placeholder="Motif" className={`${cls} sm:col-span-2`} value={form.reason} onChange={(e) => f('reason', e.target.value)} />
          <select className={`${cls} sm:col-span-2`} value={form.status} onChange={(e) => f('status', e.target.value)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button disabled={saving} className="rounded-2xl bg-[#10263f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0d1f34] disabled:opacity-60 sm:col-span-2">
            {saving ? 'Enregistrement...' : editing ? 'Modifier' : 'Ajouter'}
          </button>
        </form>
      </Modal>

      <div className="flex flex-wrap gap-3">
        <input placeholder="Rechercher par patient, médecin, motif..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 min-w-[200px] rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-400" />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-400">
          <option value="">Tous les statuts</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? <p className="text-sm text-slate-500">Chargement...</p> : (
        <div className="space-y-4">
          {appointments.filter((a) => {
            const q = search.toLowerCase();
            const matchSearch = !q || `${a.patientId?.userId?.firstName} ${a.patientId?.userId?.lastName}`.toLowerCase().includes(q) || `${a.doctorId?.userId?.firstName} ${a.doctorId?.userId?.lastName}`.toLowerCase().includes(q) || a.reason?.toLowerCase().includes(q);
            const matchStatus = !filterStatus || a.status === filterStatus;
            return matchSearch && matchStatus;
          }).map((a) => (
            <article key={a._id} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{a.patientId?.userId?.firstName} {a.patientId?.userId?.lastName}</p>
                  <p className="mt-1 text-sm text-slate-500">Dr. {a.doctorId?.userId?.firstName} {a.doctorId?.userId?.lastName}</p>
                  <p className="mt-2 text-sm text-slate-500">Motif: {a.reason || '—'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-[#f8fafc] px-4 py-3 text-right">
                    <p className="text-sm font-medium text-slate-900">{new Date(a.date).toLocaleString('fr-FR')}</p>
                    <span className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium capitalize text-slate-600 shadow-sm">{a.status}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => openEdit(a)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Modifier</button>
                    <button onClick={() => remove(a)} className="rounded-2xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100">Supprimer</button>
                  </div>
                </div>
              </div>
            </article>
          ))}
          {appointments.length === 0 && <p className="text-sm text-slate-500">Aucun rendez-vous trouvé.</p>}
        </div>
      )}
      {calendarOpen && <AppointmentsCalendar appointments={appointments} onClose={() => setCalendarOpen(false)} />}
    </div>
  );
}

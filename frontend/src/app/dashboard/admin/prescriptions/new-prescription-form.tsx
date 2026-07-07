'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function NewPrescriptionForm({ onCreated }: { onCreated: () => Promise<void> | void }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ patientId: '', doctorId: '', notes: '', medications: '' });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post('/prescriptions', {
        patientId: form.patientId,
        doctorId: form.doctorId,
        notes: form.notes,
        medications: form.medications ? JSON.parse(form.medications) : [],
      });
      setForm({ patientId: '', doctorId: '', notes: '', medications: '' });
      await onCreated();
    } catch (error) {
      console.error(error);
      alert('Impossible de créer l’ordonnance. Vérifiez le JSON des médicaments.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] lg:grid-cols-2">
      <div className="lg:col-span-2">
        <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Créer une ordonnance</p>
        <h3 className="mt-1 text-2xl font-semibold text-slate-900">Ajouter une prescription</h3>
      </div>
      <input required placeholder="ID patient" value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400" />
      <input required placeholder="ID médecin" value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400" />
      <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="min-h-[100px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 lg:col-span-2" />
      <textarea placeholder='Médicaments JSON ex: [{"name":"Doliprane","dosage":"500mg","frequency":"2/j","duration":"5j"}]' value={form.medications} onChange={(e) => setForm({ ...form, medications: e.target.value })} className="min-h-[120px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 lg:col-span-2" />
      <button disabled={saving} className="rounded-2xl bg-[#10263f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0d1f34] disabled:opacity-60 lg:col-span-2">
        {saving ? 'Création...' : 'Ajouter l’ordonnance'}
      </button>
    </form>
  );
}
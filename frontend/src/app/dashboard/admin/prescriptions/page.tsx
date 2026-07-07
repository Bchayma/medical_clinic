'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Modal from '@/components/Modal';

type Medication = { name: string; dosage: string; frequency: string; duration: string };
type AvailabilityPharmacy = {
  pharmacyId: string;
  name: string;
  type: string;
  address?: string;
  quantity: number;
  minimumQuantity: number;
};

const emptyMed = (): Medication => ({ name: '', dosage: '', frequency: '', duration: '' });
const emptyForm = () => ({ patientId: '', doctorId: '', date: '', notes: '', archived: false, medications: [emptyMed()] });

export default function AdminPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterArchived, setFilterArchived] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState<{
    medicationName: string;
    pharmacies: AvailabilityPharmacy[];
  } | null>(null);
  const [availabilityCache, setAvailabilityCache] = useState<Record<string, any>>({});

  const load = async () => {
    const [pr, p, d] = await Promise.all([api.get('/prescriptions'), api.get('/patients'), api.get('/doctors')]);
    setPrescriptions(pr.data); setPatients(p.data); setDoctors(d.data);
  };

  useEffect(() => { load().catch(console.error).finally(() => setLoading(false)); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setOpen(true); };

  const openEdit = (pr: any) => {
    setEditing(pr);
    setForm({
      patientId: pr.patientId?._id || pr.patientId || '',
      doctorId: pr.doctorId?._id || pr.doctorId || '',
      date: pr.date ? new Date(pr.date).toISOString().slice(0, 10) : '',
      notes: pr.notes || '',
      archived: pr.archived || false,
      medications: pr.medications?.length ? pr.medications : [emptyMed()],
    });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) await api.patch(`/prescriptions/${editing._id}`, form);
      else await api.post('/prescriptions', form);
      await load(); setOpen(false);
    } catch (err) { console.error(err); alert('Erreur lors de l\'enregistrement'); }
    finally { setSaving(false); }
  };

  const setMed = (i: number, k: keyof Medication, v: string) =>
    setForm((f) => { const meds = [...f.medications]; meds[i] = { ...meds[i], [k]: v }; return { ...f, medications: meds }; });

  const addMed = () => setForm((f) => ({ ...f, medications: [...f.medications, emptyMed()] }));
  const removeMed = (i: number) => setForm((f) => ({ ...f, medications: f.medications.filter((_, idx) => idx !== i) }));

  const openAvailability = async (prescription: any, medicationIndex: number) => {
    const medication = prescription.medications?.[medicationIndex];
    if (!medication) return;

    setAvailabilityOpen(true);
    setAvailabilityLoading(true);
    setSelectedAvailability({ medicationName: medication.name, pharmacies: [] });

    try {
      const enrichedPrescription = availabilityCache[prescription._id]
        || (await api.get(`/prescriptions/${prescription._id}/with-pharmacy-stocks`)).data;

      if (!availabilityCache[prescription._id]) {
        setAvailabilityCache((prev) => ({ ...prev, [prescription._id]: enrichedPrescription }));
      }

      const enrichedMedication = enrichedPrescription.medications?.[medicationIndex] ?? medication;
      setSelectedAvailability({
        medicationName: enrichedMedication.name,
        pharmacies: enrichedMedication.availablePharmacies || [],
      });
    } catch (error) {
      console.error(error);
      alert('Impossible de charger la disponibilité de ce médicament.');
      setAvailabilityOpen(false);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const cls = 'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400';
  

  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between gap-4 rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Ordonnances</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-900">Archivage clinique</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">Contrôlez les ordonnances émises, les prescriptions archivées et les médicaments associés.</p>
        </div>
        <button onClick={openCreate} className="rounded-2xl bg-[#10263f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d1f34]">Ajouter</button>
      </section>

      <Modal open={open} title={editing ? 'Modifier l\'ordonnance' : 'Ajouter une ordonnance'} onClose={() => setOpen(false)}>
        <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
          <select required className={cls} value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
            <option value="">Patient</option>
            {patients.map((p) => <option key={p._id} value={p._id}>{p.userId?.firstName} {p.userId?.lastName}</option>)}
          </select>
          <select required className={cls} value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })}>
            <option value="">Médecin</option>
            {doctors.map((d) => <option key={d._id} value={d._id}>Dr. {d.userId?.firstName} {d.userId?.lastName}</option>)}
          </select>
          <input type="date" className={cls} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <label className="flex items-center gap-2 text-sm text-slate-700 px-1">
            <input type="checkbox" checked={form.archived} onChange={(e) => setForm({ ...form, archived: e.target.checked })} />
            Archivée
          </label>
          <textarea placeholder="Notes" className={`${cls} sm:col-span-2 min-h-[80px]`} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

          <div className="sm:col-span-2 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">Médicaments</p>
              <button type="button" onClick={addMed} className="text-xs text-primary-600 hover:underline">+ Ajouter</button>
            </div>
            {form.medications.map((med, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <input placeholder="Nom" className={cls} value={med.name} onChange={(e) => setMed(i, 'name', e.target.value)} />
                <input placeholder="Dosage" className={cls} value={med.dosage} onChange={(e) => setMed(i, 'dosage', e.target.value)} />
                <input placeholder="Fréquence" className={cls} value={med.frequency} onChange={(e) => setMed(i, 'frequency', e.target.value)} />
                <input placeholder="Durée" className={cls} value={med.duration} onChange={(e) => setMed(i, 'duration', e.target.value)} />
                {form.medications.length > 1 && (
                  <button type="button" onClick={() => removeMed(i)} className="col-span-2 text-xs text-rose-500 hover:underline text-right">Supprimer</button>
                )}
              </div>
            ))}
          </div>

          <button disabled={saving} className="rounded-2xl bg-[#10263f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0d1f34] disabled:opacity-60 sm:col-span-2">
            {saving ? 'Enregistrement...' : editing ? 'Modifier' : 'Ajouter'}
          </button>
        </form>
      </Modal>

      <Modal
        open={availabilityOpen}
        title={selectedAvailability ? `Disponibilité de ${selectedAvailability.medicationName}` : 'Disponibilité du médicament'}
        eyebrow="Voir disponibilité"
        onClose={() => setAvailabilityOpen(false)}
      >
        {availabilityLoading ? (
          <p className="text-sm text-slate-500">Chargement des pharmacies...</p>
        ) : selectedAvailability?.pharmacies?.length ? (
          <div className="space-y-3">
            {selectedAvailability.pharmacies.map((pharmacy) => (
              <div key={pharmacy.pharmacyId} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{pharmacy.name}</p>
                    <p className="text-sm text-slate-500">{pharmacy.type}</p>
                    <p className="mt-1 text-sm text-slate-600">{pharmacy.address || 'Adresse non renseignée'}</p>
                  </div>
                  <div className="rounded-2xl bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
                    <p className="font-medium">{pharmacy.quantity} unités</p>
                    <p className="text-xs text-slate-500">Seuil min. {pharmacy.minimumQuantity}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Aucune pharmacie ne dispose actuellement de ce médicament.</p>
        )}
      </Modal>

      <div className="flex flex-wrap gap-3">
        <input placeholder="Rechercher par patient, médecin..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 min-w-[200px] rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-400" />
        <select value={filterArchived} onChange={(e) => setFilterArchived(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-400">
          <option value="">Toutes</option>
          <option value="false">Actives</option>
          <option value="true">Archivées</option>
        </select>
      </div>

      {loading ? <p className="text-sm text-slate-500">Chargement...</p> : (
        <div className="grid gap-5 xl:grid-cols-2">
          {prescriptions.filter((pr) => {
            const q = search.toLowerCase();
            const matchSearch = !q || `${pr.patientId?.userId?.firstName} ${pr.patientId?.userId?.lastName}`.toLowerCase().includes(q) || `${pr.doctorId?.userId?.firstName} ${pr.doctorId?.userId?.lastName}`.toLowerCase().includes(q);
            const matchArchived = filterArchived === '' || String(pr.archived) === filterArchived;
            return matchSearch && matchArchived;
          }).map((pr) => (
            <article key={pr._id} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{pr.patientId?.userId?.firstName} {pr.patientId?.userId?.lastName}</p>
                  <p className="mt-1 text-sm text-slate-500">Dr. {pr.doctorId?.userId?.firstName} {pr.doctorId?.userId?.lastName}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${pr.archived ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {pr.archived ? 'Archivée' : 'Active'}
                </span>
              </div>
              <div className="mt-5 rounded-2xl bg-[#f8fafc] p-4 text-sm text-slate-700">
                <p>Date: {new Date(pr.date).toLocaleDateString('fr-FR')}</p>
                <p className="mt-2">Notes: {pr.notes || '—'}</p>
                <p className="mt-2 font-medium text-slate-900">Médicaments</p>
                <ul className="mt-2 space-y-2">
                  {pr.medications?.map((m: any, i: number) => (
                    <li key={i} className="flex flex-col gap-3 rounded-xl bg-white px-3 py-2 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{m.name}</p>
                        <p className="text-sm text-slate-500">{m.dosage} ({m.frequency})</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openAvailability(pr, i)}
                        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Voir disponibilité
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-5 flex justify-end gap-3">
                <button onClick={() => openEdit(pr)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Modifier</button>
              </div>
            </article>
          ))}
          {prescriptions.length === 0 && <p className="text-sm text-slate-500">Aucune ordonnance trouvée.</p>}
        </div>
      )}
    </div>
  );
}

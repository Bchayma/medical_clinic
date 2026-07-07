'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Modal from '@/components/Modal';
import AppointmentsCalendar from '@/components/AppointmentsCalendar';

const emptyForm = {
  firstName: '', lastName: '', email: '', password: '', phone: '',
  type: 'internal', speciality: '', licenseNumber: '',
};

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [patients, setPatients] = useState<any[]>([]);
  const [cabinets, setCabinets] = useState<any[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  const [doctorAppointments, setDoctorAppointments] = useState<any[]>([]);
  const [doctorPrescriptions, setDoctorPrescriptions] = useState<any[]>([]);
  const [appointmentSaving, setAppointmentSaving] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({ patientId: '', cabinetId: '', date: '', reason: '', status: 'pending' });
  const [editingPrescription, setEditingPrescription] = useState<any | null>(null);
  const [prescriptionSaving, setPrescriptionSaving] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({
    patientId: '', doctorId: '', date: '', notes: '', archived: false,
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
  });
  const [calendarOpen, setCalendarOpen] = useState(false);

  const loadDoctors = async () => { const { data } = await api.get('/doctors'); setDoctors(data); };
  const loadLookups = async () => {
    const [p, c] = await Promise.all([api.get('/patients'), api.get('/cabinets')]);
    setPatients(p.data); setCabinets(c.data);
  };

  useEffect(() => {
    Promise.all([loadDoctors(), loadLookups()]).catch(console.error).finally(() => setLoading(false));
  }, []);

  const openCreateModal = () => { setEditingDoctor(null); setForm(emptyForm); setOpen(true); };

  const openEditModal = (doctor: any) => {
    setEditingDoctor(doctor);
    setForm({
      ...emptyForm,
      firstName: doctor.userId?.firstName || '',
      lastName: doctor.userId?.lastName || '',
      email: doctor.userId?.email || '',
      phone: doctor.userId?.phone || '',
      type: doctor.type || 'internal',
      speciality: doctor.speciality || '',
      licenseNumber: doctor.licenseNumber || '',
    });
    setOpen(true);
  };

  const openDetailModal = async (doctor: any) => {
    setSelectedDoctor(doctor);
    setDetailOpen(true);
    setDetailLoading(true);
    setDoctorAppointments([]);
    setDoctorPrescriptions([]);
    setEditingPrescription(null);
    setAppointmentForm({ patientId: '', cabinetId: doctor.cabinetId?._id || '', date: '', reason: '', status: 'pending' });
    try {
      const [a, pr] = await Promise.all([
        api.get(`/appointments/by-doctor/${doctor._id}`),
        api.get(`/prescriptions/by-doctor/${doctor._id}`),
      ]);
      setDoctorAppointments(a.data);
      setDoctorPrescriptions(pr.data);
    } catch (e) { console.error(e); }
    finally { setDetailLoading(false); }
  };

  const closeModal = () => { setOpen(false); setEditingDoctor(null); setForm(emptyForm); };

  const saveDoctor = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editingDoctor) {
        await api.patch(`/doctors/${editingDoctor._id}`, {
          firstName: form.firstName, lastName: form.lastName, email: form.email,
          phone: form.phone, type: form.type, speciality: form.speciality, licenseNumber: form.licenseNumber,
        });
      } else {
        await api.post('/doctors', form);
      }
      await loadDoctors(); closeModal();
    } catch { alert(editingDoctor ? 'Impossible de modifier le medecin' : 'Impossible de creer le medecin'); }
    finally { setSaving(false); }
  };

  const deleteDoctor = async (doctor: any) => {
    if (!window.confirm('Supprimer ce medecin ?')) return;
    try { await api.delete(`/doctors/${doctor._id}`); await loadDoctors(); }
    catch { alert('Impossible de supprimer le medecin'); }
  };

  const saveAppointment = async (e: React.FormEvent) => {
    e.preventDefault(); if (!selectedDoctor) return;
    setAppointmentSaving(true);
    try {
      await api.post('/appointments', { ...appointmentForm, doctorId: selectedDoctor._id, cabinetId: appointmentForm.cabinetId || undefined });
      const { data } = await api.get(`/appointments/by-doctor/${selectedDoctor._id}`);
      setDoctorAppointments(data);
      setAppointmentForm((p) => ({ ...p, patientId: '', date: '', reason: '', status: 'pending' }));
    } catch { alert('Impossible d\'ajouter le rendez-vous'); }
    finally { setAppointmentSaving(false); }
  };

  const openPrescriptionEditor = (prescription: any) => {
    setEditingPrescription(prescription);
    setPrescriptionForm({
      patientId: prescription.patientId?._id || prescription.patientId || '',
      doctorId: selectedDoctor?._id || prescription.doctorId?._id || '',
      date: prescription.date ? new Date(prescription.date).toISOString().slice(0, 10) : '',
      notes: prescription.notes || '',
      archived: prescription.archived || false,
      medications: prescription.medications?.length ? prescription.medications : [{ name: '', dosage: '', frequency: '', duration: '' }],
    });
  };

  const setPrescriptionMed = (i: number, field: 'name' | 'dosage' | 'frequency' | 'duration', value: string) => {
    setPrescriptionForm((cur) => {
      const meds = [...cur.medications];
      meds[i] = { ...meds[i], [field]: value };
      return { ...cur, medications: meds };
    });
  };

  const addPrescriptionMed = () => setPrescriptionForm((cur) => ({ ...cur, medications: [...cur.medications, { name: '', dosage: '', frequency: '', duration: '' }] }));
  const removePrescriptionMed = (i: number) => setPrescriptionForm((cur) => ({ ...cur, medications: cur.medications.filter((_, idx) => idx !== i) }));

  const savePrescription = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editingPrescription || !selectedDoctor) return;
    setPrescriptionSaving(true);
    try {
      await api.patch(`/prescriptions/${editingPrescription._id}`, { ...prescriptionForm, doctorId: selectedDoctor._id });
      const { data } = await api.get(`/prescriptions/by-doctor/${selectedDoctor._id}`);
      setDoctorPrescriptions(data);
      setEditingPrescription(null);
    } catch { alert('Impossible de modifier l\'ordonnance'); }
    finally { setPrescriptionSaving(false); }
  };

  const cls = 'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400';

  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between gap-4 rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Medecins</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-900">Equipe medicale</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">L'administration peut ajouter un medecin interne ou externe et creer automatiquement son compte.</p>
        </div>
        <button onClick={openCreateModal} className="rounded-2xl bg-[#10263f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d1f34]">Ajouter</button>
      </section>

      <Modal open={open} title={editingDoctor ? 'Modifier un medecin' : 'Ajouter un medecin'} onClose={closeModal}>
        <form onSubmit={saveDoctor} className="grid gap-3 sm:grid-cols-2">
          <input required placeholder="Prenom" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={cls} />
          <input required placeholder="Nom" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={cls} />
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={cls} />
          {!editingDoctor && <input required type="password" placeholder="Mot de passe" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={cls} />}
          <input placeholder="Telephone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={cls} />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={cls}>
            <option value="internal">Interne</option>
            <option value="external">Externe</option>
          </select>
          <input required placeholder="Specialite" value={form.speciality} onChange={(e) => setForm({ ...form, speciality: e.target.value })} className={`${cls} sm:col-span-2`} />
          <input placeholder="Numero de licence" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} className={`${cls} sm:col-span-2`} />
          <button disabled={saving} className="rounded-2xl bg-[#10263f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0d1f34] disabled:opacity-60 sm:col-span-2">
            {saving ? 'Enregistrement...' : editingDoctor ? 'Modifier le medecin' : 'Ajouter le medecin'}
          </button>
        </form>
      </Modal>

      <div className="flex flex-wrap gap-3">
        <input placeholder="Rechercher par nom, email, specialite..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 min-w-[200px] rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-400" />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-400">
          <option value="">Tous les types</option>
          <option value="internal">Interne</option>
          <option value="external">Externe</option>
        </select>
      </div>

      {loading ? <p className="text-sm text-slate-500">Chargement...</p> : (
        <div className="grid gap-5 xl:grid-cols-2">
          {doctors.filter((doctor) => {
            const q = search.toLowerCase();
            const matchSearch = !q || `${doctor.userId?.firstName} ${doctor.userId?.lastName}`.toLowerCase().includes(q) || doctor.userId?.email?.toLowerCase().includes(q) || doctor.speciality?.toLowerCase().includes(q) || doctor.licenseNumber?.toLowerCase().includes(q);
            const matchType = !filterType || doctor.type === filterType;
            return matchSearch && matchType;
          }).map((doctor) => (
            <article key={doctor._id} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{doctor.userId?.firstName} {doctor.userId?.lastName}</p>
                  <p className="mt-1 text-sm text-slate-500">{doctor.userId?.email}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">{doctor.type}</span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Specialite</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{doctor.speciality || '-'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">N licence</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{doctor.licenseNumber || '-'}</p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-[#f8fafc] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Cabinet et disponibilite</p>
                <p className="mt-2 text-sm text-slate-700">Cabinet: {doctor.cabinetId?.name || 'Aucun cabinet affecte'}</p>
                <p className="mt-1 text-sm text-slate-700">Creneaux: {doctor.availability?.length || 0}</p>
              </div>
              <div className="mt-5 flex flex-wrap justify-end gap-3">
                <button onClick={() => openEditModal(doctor)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Modifier</button>
                <button onClick={() => openDetailModal(doctor)} className="rounded-2xl border border-[#10263f] px-4 py-2 text-sm font-semibold text-[#10263f] transition hover:bg-slate-50">Voir detail</button>
                <button onClick={() => deleteDoctor(doctor)} className="rounded-2xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100">Supprimer</button>
              </div>
            </article>
          ))}
          {doctors.length === 0 && <p className="text-sm text-slate-500">Aucun medecin enregistre.</p>}
        </div>
      )}

      {/* Detail modal */}
      <Modal open={detailOpen} title={selectedDoctor ? `Detail de Dr. ${selectedDoctor.userId?.firstName} ${selectedDoctor.userId?.lastName}` : 'Detail du medecin'} eyebrow="Voir detail" onClose={() => { setDetailOpen(false); setSelectedDoctor(null); setEditingPrescription(null); }}>
        {detailLoading ? <p className="text-sm text-slate-500">Chargement...</p> : (
          <div className="space-y-6">
            <section className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Ajouter un rendez-vous</p>
                <form onSubmit={saveAppointment} className="mt-4 grid gap-3">
                  <select required className={cls} value={appointmentForm.patientId} onChange={(e) => setAppointmentForm({ ...appointmentForm, patientId: e.target.value })}>
                    <option value="">Patient</option>
                    {patients.map((p) => <option key={p._id} value={p._id}>{p.userId?.firstName} {p.userId?.lastName}</option>)}
                  </select>
                  <select className={cls} value={appointmentForm.cabinetId} onChange={(e) => setAppointmentForm({ ...appointmentForm, cabinetId: e.target.value })}>
                    <option value="">Cabinet (optionnel)</option>
                    {cabinets.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                  <input required type="datetime-local" className={cls} value={appointmentForm.date} onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })} />
                  <input placeholder="Motif" className={cls} value={appointmentForm.reason} onChange={(e) => setAppointmentForm({ ...appointmentForm, reason: e.target.value })} />
                  <select className={cls} value={appointmentForm.status} onChange={(e) => setAppointmentForm({ ...appointmentForm, status: e.target.value })}>
                    {['pending','confirmed','refused','cancelled','completed'].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button disabled={appointmentSaving} className="rounded-2xl bg-[#10263f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0d1f34] disabled:opacity-60">
                    {appointmentSaving ? 'Enregistrement...' : 'Ajouter le rendez-vous'}
                  </button>
                </form>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Ordonnances associees</p>
                <p className="mt-1 text-sm text-slate-500">Patients ayant une ordonnance avec ce medecin.</p>
                <div className="mt-4 space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {doctorPrescriptions.map((pr) => (
                    <div key={pr._id} className="rounded-2xl bg-white p-4 shadow-sm">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{pr.patientId?.userId?.firstName} {pr.patientId?.userId?.lastName}</p>
                          <p className="text-sm text-slate-500">{pr.patientId?.userId?.email || 'Patient'}</p>
                          <p className="mt-1 text-sm text-slate-600">{pr.notes || 'Aucune note'}</p>
                        </div>
                        <button onClick={() => openPrescriptionEditor(pr)} className="rounded-2xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                          Modifier
                        </button>
                      </div>
                      <div className="mt-3 text-xs text-slate-500">
                        {new Date(pr.date).toLocaleDateString('fr-FR')} {pr.archived ? '· Archivee' : '· Active'}
                      </div>
                    </div>
                  ))}
                  {doctorPrescriptions.length === 0 && <p className="text-sm text-slate-500">Aucune ordonnance trouvee.</p>}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">Rendez-vous de ce medecin</p>
                <button onClick={() => setCalendarOpen(true)} className="rounded-2xl border border-[#10263f] px-3 py-1.5 text-xs font-semibold text-[#10263f] transition hover:bg-slate-50">Voir calendrier</button>
              </div>
              <div className="mt-4 space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {doctorAppointments.map((a) => (
                  <div key={a._id} className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{a.patientId?.userId?.firstName} {a.patientId?.userId?.lastName}</p>
                        <p className="text-sm text-slate-500">{a.cabinetId?.name || 'Cabinet non renseigne'}</p>
                        <p className="mt-1 text-sm text-slate-600">{a.reason || 'Aucun motif'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-900">{new Date(a.date).toLocaleString('fr-FR')}</p>
                        <span className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium capitalize text-slate-600 shadow-sm">{a.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {doctorAppointments.length === 0 && <p className="text-sm text-slate-500">Aucun rendez-vous trouve.</p>}
              </div>
            </section>
          </div>
        )}
      </Modal>

      {calendarOpen && <AppointmentsCalendar appointments={doctorAppointments} onClose={() => setCalendarOpen(false)} />}

      {/* Prescription edit popup — z-[60] to appear above the detail modal */}
      {editingPrescription && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm" onMouseDown={() => setEditingPrescription(null)}>
          <div className="w-full max-w-xl rounded-[30px] border border-white/20 bg-white p-6 shadow-[0_30px_100px_rgba(15,23,42,0.35)] overflow-y-auto max-h-[90vh]" onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Modifier l'ordonnance</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">
                  {editingPrescription.patientId?.userId?.firstName} {editingPrescription.patientId?.userId?.lastName}
                </h2>
              </div>
              <button onClick={() => setEditingPrescription(null)} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600 transition hover:bg-slate-200">Fermer</button>
            </div>
            <form onSubmit={savePrescription} className="mt-4 grid gap-3 sm:grid-cols-2">
              <input type="date" className={cls} value={prescriptionForm.date} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, date: e.target.value })} />
              <label className={`flex items-center gap-2 ${cls}`}>
                <input type="checkbox" checked={prescriptionForm.archived} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, archived: e.target.checked })} />
                Archivee
              </label>
              <textarea placeholder="Notes" className={`min-h-[80px] ${cls} sm:col-span-2`} value={prescriptionForm.notes} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, notes: e.target.value })} />
              <div className="sm:col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700">Medicaments</p>
                  <button type="button" onClick={addPrescriptionMed} className="text-xs text-[#10263f] hover:underline">+ Ajouter</button>
                </div>
                {prescriptionForm.medications.map((med, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <input placeholder="Nom" className={cls} value={med.name} onChange={(e) => setPrescriptionMed(i, 'name', e.target.value)} />
                    <input placeholder="Dosage" className={cls} value={med.dosage} onChange={(e) => setPrescriptionMed(i, 'dosage', e.target.value)} />
                    <input placeholder="Frequence" className={cls} value={med.frequency} onChange={(e) => setPrescriptionMed(i, 'frequency', e.target.value)} />
                    <input placeholder="Duree" className={cls} value={med.duration} onChange={(e) => setPrescriptionMed(i, 'duration', e.target.value)} />
                    {prescriptionForm.medications.length > 1 && (
                      <button type="button" onClick={() => removePrescriptionMed(i)} className="col-span-2 text-right text-xs text-rose-500 hover:underline">Supprimer</button>
                    )}
                  </div>
                ))}
              </div>
              <button disabled={prescriptionSaving} className="rounded-2xl bg-[#10263f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0d1f34] disabled:opacity-60 sm:col-span-2">
                {prescriptionSaving ? 'Enregistrement...' : "Modifier l'ordonnance"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

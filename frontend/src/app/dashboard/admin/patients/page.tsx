'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Modal from '@/components/Modal';
import AppointmentsCalendar from '@/components/AppointmentsCalendar';

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  bloodType: '',
  allergies: '',
  chronicConditions: '',
  doctorId: '',
};

const toCsv = (value?: string[]) => value?.join(', ') || '';
const fromCsv = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean);

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any | null>(null);
  const [form, setForm] = useState(emptyForm);


const [detailOpen, setDetailOpen] = useState(false);
const [detailLoading, setDetailLoading] = useState(false);
const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

const [patientAppointments, setPatientAppointments] = useState<any[]>([]);
const [patientPrescriptions, setPatientPrescriptions] = useState<any[]>([]);

const [appointmentSaving, setAppointmentSaving] = useState(false);

const [doctorsList, setDoctorsList] = useState<any[]>([]);

const [editingPrescription, setEditingPrescription] = useState<any | null>(null);
const [prescriptionSaving, setPrescriptionSaving] = useState(false);
const [prescriptionForm, setPrescriptionForm] = useState({
  date: '', notes: '', archived: false,
  medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
});
const [calendarOpen, setCalendarOpen] = useState(false);

const [appointmentForm, setAppointmentForm] = useState({
  doctorId: '',
  cabinetId: '',
  date: '',
  reason: '',
  status: 'pending',
});

  const loadPatients = async () => {
    const { data } = await api.get('/patients');
    setPatients(data);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [patientsResponse, doctorsResponse] = await Promise.all([api.get('/patients'), api.get('/doctors')]);
        setPatients(patientsResponse.data);
        setDoctors(doctorsResponse.data);
        setDoctorsList(doctorsResponse.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const openCreateModal = () => {
    setEditingPatient(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEditModal = (patient: any) => {
    setEditingPatient(patient);
    setForm({
      ...emptyForm,
      firstName: patient.userId?.firstName || '',
      lastName: patient.userId?.lastName || '',
      email: patient.userId?.email || '',
      phone: patient.userId?.phone || '',
      dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().slice(0, 10) : '',
      gender: patient.gender || '',
      address: patient.address || '',
      bloodType: patient.bloodType || '',
      allergies: toCsv(patient.allergies),
      chronicConditions: toCsv(patient.chronicConditions),
      doctorId: patient.followedByDoctors?.[0]?._id || patient.followedByDoctors?.[0] || '',
    });
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditingPatient(null);
    setForm(emptyForm);
  };

  const savePatient = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingPatient) {
        await api.patch(`/patients/${editingPatient._id}`, {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          dateOfBirth: form.dateOfBirth || undefined,
          gender: form.gender,
          address: form.address,
          bloodType: form.bloodType,
          allergies: fromCsv(form.allergies),
          chronicConditions: fromCsv(form.chronicConditions),
          followedByDoctors: form.doctorId ? [form.doctorId] : [],
        });
      } else {
        await api.post('/patients', {
          ...form,
          dateOfBirth: form.dateOfBirth || undefined,
          doctorId: form.doctorId || undefined,
        });
      }
      await loadPatients();
      closeModal();
    } catch (error) {
      console.error(error);
      alert(editingPatient ? 'Impossible de modifier le patient' : 'Impossible de creer le patient');
    } finally {
      setSaving(false);
    }
  };

  const deletePatient = async (patient: any) => {
    if (!window.confirm('Supprimer ce patient ?')) return;
    try {
      await api.delete(`/patients/${patient._id}`);
      await loadPatients();
    } catch (error) {
      console.error(error);
      alert('Impossible de supprimer le patient');
    }
  };




  const openDetailModal = async (patient: any) => {
  setSelectedPatient(patient);
  setDetailOpen(true);
  setDetailLoading(true);

  setPatientAppointments([]);
  setPatientPrescriptions([]);

  try {

    const [
      appointmentsResponse,
      prescriptionsResponse
    ] = await Promise.all([
      api.get(`/appointments/by-patient/${patient._id}`),
      api.get(`/prescriptions/by-patient/${patient._id}`)
    ]);

    setPatientAppointments(appointmentsResponse.data);
    setPatientPrescriptions(prescriptionsResponse.data);

  } catch(error){
    console.error(error);
    alert("Impossible de charger les détails du patient");
  }
  finally{
    setDetailLoading(false);
  }
};



const saveAppointment = async(e: React.FormEvent)=>{

e.preventDefault();

if(!selectedPatient) return;

setAppointmentSaving(true);

try{

// await api.post('/appointments',{
//   ...appointmentForm,
//   patientId:selectedPatient._id
// });
await api.post('/appointments',{
  patientId: selectedPatient._id,
  doctorId: appointmentForm.doctorId,
  cabinetId: appointmentForm.cabinetId || undefined,
  date: appointmentForm.date,
  reason: appointmentForm.reason,
  status: appointmentForm.status,
});


const {data}=await api.get(
 `/appointments/by-patient/${selectedPatient._id}`
);

setPatientAppointments(data);


setAppointmentForm({
 doctorId:'',
 cabinetId:'',
 date:'',
 reason:'',
 status:'pending'
});


}catch(error){

console.error(error);
alert("Impossible de créer le rendez-vous");

}
finally{
setAppointmentSaving(false);
}

};

  const openPrescriptionEditor = (prescription: any) => {
    setEditingPrescription(prescription);
    setPrescriptionForm({
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
    e.preventDefault(); if (!editingPrescription || !selectedPatient) return;
    setPrescriptionSaving(true);
    try {
      await api.patch(`/prescriptions/${editingPrescription._id}`, prescriptionForm);
      const { data } = await api.get(`/prescriptions/by-patient/${selectedPatient._id}`);
      setPatientPrescriptions(data);
      setEditingPrescription(null);
    } catch { alert("Impossible de modifier l'ordonnance"); }
    finally { setPrescriptionSaving(false); }
  };

  const cls = 'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400';

  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between gap-4 rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Patients</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-900">Dossiers patients</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Consultez les informations cliniques essentielles, les allergies, les antecedents et le suivi des patients.
          </p>
        </div>
        <button onClick={openCreateModal} className="rounded-2xl bg-[#10263f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d1f34]">
          Ajouter
        </button>
      </section>

      <Modal open={open} title={editingPatient ? 'Modifier un patient' : 'Ajouter un patient'} onClose={closeModal}>
        <form onSubmit={savePatient} className="grid gap-3 sm:grid-cols-2">
          <input required placeholder="Prenom" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400" />
          <input required placeholder="Nom" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400" />
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400" />
          {!editingPatient && (
            <input required type="password" placeholder="Mot de passe" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400" />
          )}
          <input placeholder="Telephone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400" />
          <input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400" />
          <input placeholder="Genre" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400" />
          <input placeholder="Groupe sanguin" value={form.bloodType} onChange={(e) => setForm({ ...form, bloodType: e.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400" />
          <select value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 sm:col-span-2">
            <option value="">Medecin suivi (optionnel)</option>
            {doctors.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                {doctor.userId?.firstName} {doctor.userId?.lastName} - {doctor.speciality}
              </option>
            ))}
          </select>
          <input placeholder="Allergies separees par virgule" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 sm:col-span-2" />
          <input placeholder="Conditions chroniques separees par virgule" value={form.chronicConditions} onChange={(e) => setForm({ ...form, chronicConditions: e.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 sm:col-span-2" />
          <textarea placeholder="Adresse" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="min-h-[100px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 sm:col-span-2" />
          <button disabled={saving} className="rounded-2xl bg-[#10263f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0d1f34] disabled:opacity-60 sm:col-span-2">
            {saving ? 'Enregistrement...' : editingPatient ? 'Modifier le patient' : 'Ajouter le patient'}
          </button>
        </form>
      </Modal>

      <div className="flex flex-wrap gap-3">
        <input placeholder="Rechercher par nom, email, adresse..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 min-w-[200px] rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-400" />
        <select value={filterGender} onChange={(e) => setFilterGender(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-400">
          <option value="">Tous les genres</option>
          <option value="male">Homme</option>
          <option value="female">Femme</option>
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Chargement...</p>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {patients.filter((patient) => {
            const q = search.toLowerCase();
            const matchSearch = !q || `${patient.userId?.firstName} ${patient.userId?.lastName}`.toLowerCase().includes(q) || patient.userId?.email?.toLowerCase().includes(q) || patient.address?.toLowerCase().includes(q) || patient.bloodType?.toLowerCase().includes(q);
            const matchGender = !filterGender || patient.gender === filterGender;
            return matchSearch && matchGender;
          }).map((patient) => (
            <article key={patient._id} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {patient.userId?.firstName} {patient.userId?.lastName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{patient.userId?.email}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {patient.gender || '-'}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Naissance</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('fr-FR') : '-'}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Groupe sanguin</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{patient.bloodType || '-'}</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-[#f8fafc] p-4 text-sm text-slate-700">
                <p>Adresse: {patient.address || '-'}</p>
                <p className="mt-1">Allergies: {patient.allergies?.join(', ') || 'Aucune'}</p>
                <p className="mt-1">Conditions chroniques: {patient.chronicConditions?.join(', ') || 'Aucune'}</p>
                <p className="mt-1">Notes medicales: {patient.medicalNotes?.length || 0}</p>
              </div>

              <div className="mt-5 flex flex-wrap justify-end gap-3">
                <button 
                onClick={()=>openDetailModal(patient)}
                className="rounded-2xl border border-[#10263f] px-4 py-2 text-sm font-semibold text-[#10263f] transition hover:bg-slate-50">
                Voir détail
                </button>
                <button onClick={() => openEditModal(patient)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  Modifier
                </button>
                <button onClick={() => deletePatient(patient)} className="rounded-2xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100">
                  Supprimer
                </button>
              </div>
            </article>
          ))}
          {patients.length === 0 && <p className="text-sm text-slate-500">Aucun patient trouve.</p>}
        </div>
      )}

                    <Modal
              open={detailOpen}
              title={
              selectedPatient 
              ? `Détail de ${selectedPatient.userId?.firstName} ${selectedPatient.userId?.lastName}`
              :'Détail patient'
              }
              eyebrow="Voir détail"
              onClose={()=>setDetailOpen(false)}
              >

              {
              detailLoading ? (

              <p className="text-sm text-slate-500">
              Chargement...
              </p>

              ):

              (
              <div className="space-y-6">


              <section className="grid gap-4 lg:grid-cols-2">


              <div className="rounded-2xl border bg-slate-50 p-4">

              <p className="font-semibold">
              Effectuer un rendez-vous
              </p>


              <form onSubmit={saveAppointment}
              className="mt-4 grid gap-3">


              <select
              required
              value={appointmentForm.doctorId}
              onChange={(e)=>setAppointmentForm({
              ...appointmentForm,
              doctorId:e.target.value
              })}
              className="rounded-2xl border px-4 py-3"
              >

              <option value="">
              Choisir médecin
              </option>

              {doctorsList.map((doctor)=>(

              <option key={doctor._id} value={doctor._id}>

              {doctor.userId?.firstName}
              {doctor.userId?.lastName}

              </option>

              ))}

              </select>



              <input
              required
              type="datetime-local"
              value={appointmentForm.date}
              onChange={(e)=>setAppointmentForm({
              ...appointmentForm,
              date:e.target.value
              })}
              className="rounded-2xl border px-4 py-3"
              />


              <input
              placeholder="Motif"
              value={appointmentForm.reason}
              onChange={(e)=>setAppointmentForm({
              ...appointmentForm,
              reason:e.target.value
              })}
              className="rounded-2xl border px-4 py-3"
              />


              <button
              disabled={appointmentSaving}
              className="rounded-2xl bg-[#10263f] px-4 py-3 text-white"
              >

              {
              appointmentSaving
              ?'Enregistrement...'
              :'Prendre rendez-vous'
              }

              </button>


              </form>

              </div>



              <div className="rounded-2xl border bg-slate-50 p-4">
              <p className="font-semibold">Ordonnances</p>
              <div className="mt-4 space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {patientPrescriptions.map((prescription) => (
                  <div key={prescription._id} className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">Dr {prescription.doctorId?.userId?.firstName} {prescription.doctorId?.userId?.lastName}</p>
                        <p className="text-sm text-slate-500">{prescription.notes || 'Aucune note'}</p>
                      </div>
                      <button onClick={() => openPrescriptionEditor(prescription)} className="rounded-2xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">Modifier</button>
                    </div>
                    <div className="mt-3 text-xs text-slate-500">
                      {new Date(prescription.date).toLocaleDateString('fr-FR')} {prescription.archived ? '· Archivée' : '· Active'}
                    </div>
                  </div>
                ))}
                {patientPrescriptions.length === 0 && <p className="text-sm text-slate-500">Aucune ordonnance</p>}
              </div>
              </div>


              </section>



              <section className="rounded-2xl border p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold">Mes rendez-vous</p>
                <button onClick={() => setCalendarOpen(true)} className="rounded-2xl border border-[#10263f] px-3 py-1.5 text-xs font-semibold text-[#10263f] transition hover:bg-slate-50">Voir calendrier</button>
              </div>
              <div className="mt-4 space-y-3 max-h-[420px] overflow-y-auto pr-1">

              {
              patientAppointments.map((appointment)=>(

              <div
              key={appointment._id}
              className="rounded-2xl bg-slate-50 p-4"
              >

              <p className="font-semibold">

              Dr {appointment.doctorId?.userId?.firstName}
              {' '}
              {appointment.doctorId?.userId?.lastName}

              </p>


              <p>
              {
              new Date(appointment.date)
              .toLocaleString('fr-FR')
              }
              </p>


              <p className="text-sm text-slate-500">
              {appointment.status}
              </p>


              </div>

              ))
              }


              {
              patientAppointments.length===0 &&
              <p className="text-sm text-slate-500">
              Aucun rendez-vous
              </p>
              }


              </div>


              </section>


              </div>
              )

              }


              </Modal>
      {calendarOpen && <AppointmentsCalendar appointments={patientAppointments} onClose={() => setCalendarOpen(false)} />}
      {editingPrescription && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm" onMouseDown={() => setEditingPrescription(null)}>
          <div className="w-full max-w-xl rounded-[30px] border border-white/20 bg-white p-6 shadow-[0_30px_100px_rgba(15,23,42,0.35)] overflow-y-auto max-h-[90vh]" onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Modifier l'ordonnance</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">
                  Dr {editingPrescription.doctorId?.userId?.firstName} {editingPrescription.doctorId?.userId?.lastName}
                </h2>
              </div>
              <button onClick={() => setEditingPrescription(null)} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600 transition hover:bg-slate-200">Fermer</button>
            </div>
            <form onSubmit={savePrescription} className="mt-4 grid gap-3 sm:grid-cols-2">
              <input type="date" className={cls} value={prescriptionForm.date} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, date: e.target.value })} />
              <label className={`flex items-center gap-2 ${cls}`}>
                <input type="checkbox" checked={prescriptionForm.archived} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, archived: e.target.checked })} />
                Archivée
              </label>
              <textarea placeholder="Notes" className={`min-h-[80px] ${cls} sm:col-span-2`} value={prescriptionForm.notes} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, notes: e.target.value })} />
              <div className="sm:col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700">Médicaments</p>
                  <button type="button" onClick={addPrescriptionMed} className="text-xs text-[#10263f] hover:underline">+ Ajouter</button>
                </div>
                {prescriptionForm.medications.map((med, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <input placeholder="Nom" className={cls} value={med.name} onChange={(e) => setPrescriptionMed(i, 'name', e.target.value)} />
                    <input placeholder="Dosage" className={cls} value={med.dosage} onChange={(e) => setPrescriptionMed(i, 'dosage', e.target.value)} />
                    <input placeholder="Fréquence" className={cls} value={med.frequency} onChange={(e) => setPrescriptionMed(i, 'frequency', e.target.value)} />
                    <input placeholder="Durée" className={cls} value={med.duration} onChange={(e) => setPrescriptionMed(i, 'duration', e.target.value)} />
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

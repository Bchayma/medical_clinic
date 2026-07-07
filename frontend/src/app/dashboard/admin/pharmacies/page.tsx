'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Modal from '@/components/Modal';

const emptyCreate = { firstName: '', lastName: '', email: '', password: '', phone: '', name: '', type: 'central', address: '', contact: '' };
const emptyEdit = { name: '', type: 'central', address: '', contact: '' };

export default function AdminPharmaciesPage() {
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [stockPharmacy, setStockPharmacy] = useState<any | null>(null);
  const [createForm, setCreateForm] = useState(emptyCreate);
  const [editForm, setEditForm] = useState(emptyEdit);
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockSaving, setStockSaving] = useState(false);
  const [stockSearch, setStockSearch] = useState('');
  const [stockSearchResults, setStockSearchResults] = useState<any[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<any | null>(null);
  const [stockForm, setStockForm] = useState({ quantity: '', minimumQuantity: '', expirationDate: '', batchNumber: '' });
  const [medications, setMedications] = useState<any[]>([]);
  const [medModalOpen, setMedModalOpen] = useState(false);
const [editingMed, setEditingMed] = useState<any | null>(null);
const [medForm, setMedForm] = useState({
  name: '',
  category: '',
  price: '',
});
const [medLoading, setMedLoading] = useState(false);

const loadMedications = async () => {
  const { data } = await api.get('/medications/search?name=');
  setMedications(data);
};
const [showAddStock, setShowAddStock] = useState(false);

useEffect(() => {
  loadMedications();
}, []);

  useEffect(() => {
    api.get('/medications').then(res => setMedications(res.data));
  }, []);

  const load = async () => { const { data } = await api.get('/pharmacies'); setPharmacies(data); };

  useEffect(() => { load().catch(console.error).finally(() => setLoading(false)); }, []);

  const openCreate = () => { setEditing(null); setCreateForm(emptyCreate); setOpen(true); };

  const openEdit = (ph: any) => {
    setEditing(ph);
    setEditForm({ name: ph.name || '', type: ph.type || 'central', address: ph.address || '', contact: ph.contact || '' });
    setOpen(true);
  };

//crud medicamment
const saveMedication = async (e: React.FormEvent) => {
  e.preventDefault();
  setMedLoading(true);

  try {
    if (editingMed) {
      await api.patch(`/medications/${editingMed._id}`, medForm);
    } else {
      await api.post('/medications', medForm);
    }

    await loadMedications();
    setMedModalOpen(false);
    setEditingMed(null);
    setMedForm({ name: '', category: '', price: '' });
  } catch (err) {
    console.error(err);
    alert('Erreur médicament');
  } finally {
    setMedLoading(false);
  }
};

const deleteMedication = async (id: string) => {
  if (!confirm('Supprimer ce médicament ?')) return;

  try {
    await api.delete(`/medications/${id}`);
    await loadMedications();
  } catch (err) {
    alert('Erreur suppression');
  }
};


const openEditMed = (med: any) => {
  setEditingMed(med);
  setMedForm({
    name: med.name,
    category: med.category || '',
    price: med.price || '',
  });
  setMedModalOpen(true);
};


  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) await api.patch(`/pharmacies/${editing._id}`, editForm);
      else await api.post('/pharmacies', createForm);
      await load(); setOpen(false);
    } catch (err) { console.error(err); alert('Erreur lors de l\'enregistrement'); }
    finally { setSaving(false); }
  };

  const remove = async (ph: any) => {
    if (!window.confirm('Supprimer cette pharmacie ?')) return;
    try { await api.delete(`/pharmacies/${ph._id}`); await load(); }
    catch { alert('Impossible de supprimer'); }
  };

  const openStock = async (ph: any) => {
    setStockPharmacy(ph);
    setStockOpen(true);
    setStockLoading(true);
    setStockItems([]);
    setStockSearch('');
    setStockSearchResults([]);
    setSelectedMedicine(null);
    setStockForm({ quantity: '', minimumQuantity: '', expirationDate: '', batchNumber: '' });

    try {
      const { data } = await api.get(`/pharmacy-stocks/pharmacy/${ph._id}`);
      setStockItems(data);
    } catch (error) {
      console.error(error);
      alert('Impossible de charger le stock');
    } finally {
      setStockLoading(false);
    }
  };

  const searchMedicine = async (value: string) => {
    setStockSearch(value);
    setSelectedMedicine(null);
    if (!value.trim()) {
      setStockSearchResults([]);
      return;
    }

    try {
      const { data } = await api.get(`/medications/search?name=${encodeURIComponent(value)}`);
      setStockSearchResults(data);
    } catch (error) {
      console.error(error);
      setStockSearchResults([]);
    }
  };

  const saveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockPharmacy || !selectedMedicine) {
  alert("Veuillez sélectionner un médicament");
  return;
}

    setStockSaving(true);
    try {
      await api.post('/pharmacy-stocks', {
        pharmacyId: stockPharmacy._id,
        medicineId: selectedMedicine._id,
        quantity: Number(stockForm.quantity),
        minimumQuantity: Number(stockForm.minimumQuantity),
        expirationDate: stockForm.expirationDate || undefined,
        batchNumber: stockForm.batchNumber || undefined,
      });

      const { data } = await api.get(`/pharmacy-stocks/pharmacy/${stockPharmacy._id}`);
      setStockItems(data);
      setStockForm({ quantity: '', minimumQuantity: '', expirationDate: '', batchNumber: '' });
      setStockSearch('');
      setStockSearchResults([]);
      setSelectedMedicine(null);
    } catch (error) {
      console.error(error);
      alert('Erreur lors de l\'enregistrement du stock');
    } finally {
      setStockSaving(false);
    }
  };

  const updateStockQuantity = async (id: string, quantity: number) => {
    try {
      await api.patch(`/pharmacy-stocks/${id}`, { quantity });
      if (stockPharmacy) {
        const { data } = await api.get(`/pharmacy-stocks/pharmacy/${stockPharmacy._id}`);
        setStockItems(data);
      }
    } catch (error) {
      console.error(error);
      alert('Impossible de modifier la quantité');
    }
  };

  const removeStock = async (id: string) => {
    try {
      await api.delete(`/pharmacy-stocks/${id}`);
      if (stockPharmacy) {
        const { data } = await api.get(`/pharmacy-stocks/pharmacy/${stockPharmacy._id}`);
        setStockItems(data);
      }
    } catch (error) {
      console.error(error);
      alert('Impossible de supprimer le stock');
    }
  };

  const cls = 'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400';

 
  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between gap-4 rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Pharmacies</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-900">Réseau pharmaceutique</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">Supervisez les pharmacies centrales et partenaires.</p>
        </div>
        <button onClick={openCreate} className="rounded-2xl bg-[#10263f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d1f34]">Ajouter</button>
      </section>

      <Modal open={open} title={editing ? 'Modifier la pharmacie' : 'Ajouter une pharmacie'} onClose={() => setOpen(false)}>
        <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
          {!editing && (
            <>
              <input required placeholder="Prénom" className={cls} value={createForm.firstName} onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })} />
              <input required placeholder="Nom" className={cls} value={createForm.lastName} onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })} />
              <input required type="email" placeholder="Email" className={cls} value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
              <input required type="password" placeholder="Mot de passe" className={cls} value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} />
              <input placeholder="Téléphone" className={cls} value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} />
              <input required placeholder="Nom de la pharmacie" className={cls} value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
              <select className={cls} value={createForm.type} onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}>
                <option value="central">Centrale</option>
                <option value="partner">Partenaire</option>
              </select>
              <input placeholder="Contact" className={cls} value={createForm.contact} onChange={(e) => setCreateForm({ ...createForm, contact: e.target.value })} />
              <textarea placeholder="Adresse" className={`${cls} min-h-[80px] sm:col-span-2`} value={createForm.address} onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })} />
            </>
          )}
          {editing && (
            <>
              <input required placeholder="Nom de la pharmacie" className={`${cls} sm:col-span-2`} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              <select className={cls} value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}>
                <option value="central">Centrale</option>
                <option value="partner">Partenaire</option>
              </select>
              <input placeholder="Contact" className={cls} value={editForm.contact} onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })} />
              <textarea placeholder="Adresse" className={`${cls} min-h-[80px] sm:col-span-2`} value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
            </>
          )}
          <button disabled={saving} className="rounded-2xl bg-[#10263f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0d1f34] disabled:opacity-60 sm:col-span-2">
            {saving ? 'Enregistrement...' : editing ? 'Modifier' : 'Ajouter'}
          </button>
        </form>
      </Modal>

      <Modal
        open={stockOpen}
        title={stockPharmacy ? `Gérer le stock - ${stockPharmacy.name}` : 'Gérer le stock'}
        onClose={() => setStockOpen(false)}
      >
        {/* <div className="bg-white rounded-2xl p-6 w-[95vw] max-w-7xl h-[90vh] overflow-hidden"> */}
        {/* <div className="bg-white rounded-2xl p-6 w-[95vw] max-w-7xl h-[90vh] flex flex-col"> */}
       
        {/* <div className="grid gap-6 lg:grid-cols-3 h-full overflow-hidden"> */}
        <div className="grid gap-6 lg:grid-cols-2 h-full min-h-0">
      
    
          <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 h-full min-h-0 overflow-y-auto">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Stock actuel</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">{stockItems.length} ligne(s)</h3>
              </div>
                      <button
            onClick={() => setShowAddStock(true)}
            className="rounded-xl bg-[#10263f] px-3 py-2 text-xs text-white"
          >
            + Ajouter
          </button>
            </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
           {showAddStock && (
  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30">
    <div className="w-[420px] rounded-2xl bg-white p-4 shadow-xl">
      
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Ajouter au stock</h3>
        <button onClick={() => setShowAddStock(false)}>✕</button>
      </div>

      <form onSubmit={saveStock} className="space-y-3 text-sm">

        <select
          value={selectedMedicine?._id || ''}
          onChange={(e) => {
            const med = medications.find(m => m._id === e.target.value);
            setSelectedMedicine(med || null);
          }}
          className={cls}
          required
        >
          <option value="">-- Médicament --</option>
          {medications.map(m => (
            <option key={m._id} value={m._id}>{m.name}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Quantité"
          className={cls}
          value={stockForm.quantity}
          onChange={(e) =>
            setStockForm({ ...stockForm, quantity: e.target.value })
          }
        />

        <input
          type="number"
          placeholder="Minimum"
          className={cls}
          value={stockForm.minimumQuantity}
          onChange={(e) =>
            setStockForm({ ...stockForm, minimumQuantity: e.target.value })
          }
        />
         
            <input
              type="date"
              value={stockForm.expirationDate}
              onChange={(e) =>
                setStockForm({ ...stockForm, expirationDate: e.target.value })
              }
              className={cls}
            />

        <button
          type="submit"
          className="w-full rounded-xl bg-[#10263f] py-2 text-white"
        >
          Ajouter
        </button>
      </form>
    </div>
  </div>
)}

          </div>
            


            <div className="mt-4 space-y-2">
              {stockLoading && <p className="text-sm text-slate-500">Chargement du stock...</p>}
              {!stockLoading && stockItems.map((stock) => (
                <div key={stock._id} className="rounded-2xl border border-slate-200 bg-white p-3 text-sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{stock.medicineId?.name || 'Médicament'}</p>
                      <p className="mt-1 text-slate-500">
                        Min: {stock.minimumQuantity} · Lot: {stock.batchNumber || '—'} · Exp: {stock.expirationDate ? new Date(stock.expirationDate).toLocaleDateString('fr-FR') : '—'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        defaultValue={stock.quantity}
                        onBlur={(e) => updateStockQuantity(stock._id, Number(e.target.value))}
                        className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => removeStock(stock._id)}
                        className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {!stockLoading && stockItems.length === 0 && <p className="text-sm text-slate-500">Aucun stock enregistré pour cette pharmacie.</p>}
            </div>
          </section>
                  {/* <section className="rounded-[24px] border border-slate-200 bg-white p-4 h-full min-h-0 overflow-y-auto">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
            Ajouter au stock
          </p>

          <h3 className="mt-1 text-lg font-semibold text-slate-900">
            Nouveau médicament
          </h3>

          <form onSubmit={saveStock} className="mt-4 space-y-3 text-sm">

           
            <select
              value={selectedMedicine?._id || ''}
              onChange={(e) => {
                const med = medications.find(m => m._id === e.target.value);
                setSelectedMedicine(med || null);
              }}
              className={cls}
              required
            >
              <option value="">-- Choisir un médicament --</option>

              {medications.map((med) => (
                <option key={med._id} value={med._id}>
                  {med.name}
                </option>
              ))}
            </select>

            
            {selectedMedicine && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                Sélectionné: {selectedMedicine.name}
              </div>
            )}

           
            <input
              required
              type="number"
              min="0"
              placeholder="Quantité disponible"
              value={stockForm.quantity}
              onChange={(e) =>
                setStockForm({ ...stockForm, quantity: e.target.value })
              }
              className={cls}
            />

           
            <input
              required
              type="number"
              min="0"
              placeholder="Quantité minimum"
              value={stockForm.minimumQuantity}
              onChange={(e) =>
                setStockForm({ ...stockForm, minimumQuantity: e.target.value })
              }
              className={cls}
            />

          
            <input
              type="date"
              value={stockForm.expirationDate}
              onChange={(e) =>
                setStockForm({ ...stockForm, expirationDate: e.target.value })
              }
              className={cls}
            />

         
            <input
              placeholder="Numéro de lot"
              value={stockForm.batchNumber}
              onChange={(e) =>
                setStockForm({ ...stockForm, batchNumber: e.target.value })
              }
              className={cls}
            />

            <button
              type="submit"
              disabled={!selectedMedicine || stockSaving}
              className="rounded-2xl bg-[#10263f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0d1f34] disabled:opacity-60"
            >
              {stockSaving ? 'Enregistrement...' : 'Ajouter au stock'}
            </button>
          </form>
        </section> */}

      <section className="rounded-[24px] border border-slate-200 bg-white p-4 flex flex-col h-full min-h-0 overflow-y-auto">

            <div className="flex items-center justify-between mb-3">
  <h3 className="text-lg font-semibold">Médicaments</h3>

  <button
    onClick={() => {
      setEditingMed(null);
      setMedForm({ name: '', category: '', price: '' });
      setMedModalOpen(true);
    }}
    className="rounded-xl bg-emerald-600 px-3 py-1 text-xs text-white"
  >
    + Ajouter
  </button>
</div>

<div className="space-y-2 max-h-48 overflow-y-auto">
  {medications.map((med) => (
    <div
      key={med._id}
      className="flex items-center justify-between rounded-xl border bg-white p-2 text-xs"
    >
      <div>
        <p className="font-semibold">{med.name}</p>
        <p className="text-slate-500">{med.category} · {med.price} TND</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => openEditMed(med)}
          className="text-blue-600"
        >
          edit
        </button>

        <button
          onClick={() => deleteMedication(med._id)}
          className="text-red-600"
        >
          del
        </button>
      </div>

    </div>
  ))}
</div>
 </section>


<Modal
  open={medModalOpen}
  title={editingMed ? "Modifier médicament" : "Ajouter médicament"}
  onClose={() => setMedModalOpen(false)}
>
  <form onSubmit={saveMedication} className="space-y-3">
    <input
      required
      placeholder="Nom"
      className={cls}
      value={medForm.name}
      onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
    />

    <input
      placeholder="Catégorie"
      className={cls}
      value={medForm.category}
      onChange={(e) => setMedForm({ ...medForm, category: e.target.value })}
    />

    <input
      required
      type="number"
      placeholder="Prix"
      className={cls}
      value={medForm.price}
      onChange={(e) => setMedForm({ ...medForm, price: e.target.value })}
    />

    <button
      className="rounded-xl bg-black px-4 py-2 text-white"
      disabled={medLoading}
    >
      {medLoading ? "..." : editingMed ? "Modifier" : "Ajouter"}
    </button>
  </form>
  
</Modal>


        
        </div>
        {/* </div>
        */}
      </Modal>

      <div className="flex flex-wrap gap-3">
        <input placeholder="Rechercher par nom, adresse, contact..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 min-w-[200px] rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-400" />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-400">
          <option value="">Tous les types</option>
          <option value="central">Centrale</option>
          <option value="partner">Partenaire</option>
        </select>
      </div>

      {loading ? <p className="text-sm text-slate-500">Chargement...</p> : (
        <div className="grid gap-5 xl:grid-cols-2">
          {pharmacies.filter((ph) => {
            const q = search.toLowerCase();
            const matchSearch = !q || ph.name?.toLowerCase().includes(q) || ph.address?.toLowerCase().includes(q) || ph.contact?.toLowerCase().includes(q);
            const matchType = !filterType || ph.type === filterType;
            return matchSearch && matchType;
          }).map((ph) => (
            <article key={ph._id} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{ph.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{ph.contact || 'Pas de contact renseigné'}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">{ph.type}</span>
              </div>
              <div className="mt-5 rounded-2xl bg-[#f8fafc] p-4 text-sm text-slate-700">
                <p>Adresse: {ph.address || '—'}</p>
                <p className="mt-1">Utilisateur lié: {ph.userId?.email || '—'}</p>
              </div>
              <div className="mt-5 flex justify-end gap-3">
                <button onClick={() => openStock(ph)} className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100">Stock</button>
                <button onClick={() => openEdit(ph)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Modifier</button>
                <button onClick={() => remove(ph)} className="rounded-2xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100">Supprimer</button>
              </div>
            </article>
          ))}
          {pharmacies.length === 0 && <p className="text-sm text-slate-500">Aucune pharmacie trouvée.</p>}
        </div>
      )}
    </div>
  );
}

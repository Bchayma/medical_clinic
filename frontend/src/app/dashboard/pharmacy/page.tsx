'use client';

import { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import api from '@/lib/api';

export default function PharmacyDashboard() {
  const [pharmacy, setPharmacy] = useState<any>(null);
  const [meds, setMeds] = useState<any[]>([]);
  const [stocks, setStocks] = useState<any[]>([]);
  const [medicineSearch, setMedicineSearch] = useState('');
  const [medicineResults, setMedicineResults] = useState<any[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [medForm, setMedForm] = useState({ name: '', category: '', price: '', quantity: '', expirationDate: '' });
  const [stockForm, setStockForm] = useState({ quantity: '', minimumQuantity: '', expirationDate: '', batchNumber: '' });

  const load = async () => {
    try {
      const { data: ph } = await api.get('/pharmacies/me/profile');
      setPharmacy(ph);
      if (ph?._id) {
        const [m, s] = await Promise.all([
          api.get(`/medications/by-pharmacy/${ph._id}`),
          api.get(`/pharmacy-stocks/pharmacy/${ph._id}`),
        ]);
        setMeds(m.data);
        setStocks(s.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pharmacy) return;
    await api.post('/medications', {
      pharmacyId: pharmacy._id,
      name: medForm.name,
      category: medForm.category,
      price: Number(medForm.price),
      quantity: Number(medForm.quantity),
      expirationDate: medForm.expirationDate || undefined,
    });
    setMedForm({ name: '', category: '', price: '', quantity: '', expirationDate: '' });
    load();
  };

  const updateQuantity = async (id: string, quantity: number) => {
    await api.patch(`/medications/${id}`, { quantity });
    load();
  };

  const removeMedication = async (id: string) => {
    await api.delete(`/medications/${id}`);
    load();
  };

  const searchMedicine = async (value: string) => {
    setMedicineSearch(value);
    setSelectedMedicine(null);
    if (!value.trim()) {
      setMedicineResults([]);
      return;
    }
    const { data } = await api.get(`/medications/search?name=${encodeURIComponent(value)}`);
    setMedicineResults(data);
  };

  const addStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pharmacy || !selectedMedicine) return;

    await api.post('/pharmacy-stocks', {
      pharmacyId: pharmacy._id,
      medicineId: selectedMedicine._id,
      quantity: Number(stockForm.quantity),
      minimumQuantity: Number(stockForm.minimumQuantity),
      expirationDate: stockForm.expirationDate || undefined,
      batchNumber: stockForm.batchNumber || undefined,
    });

    setStockForm({ quantity: '', minimumQuantity: '', expirationDate: '', batchNumber: '' });
    setSelectedMedicine(null);
    setMedicineSearch('');
    setMedicineResults([]);
    load();
  };

  const updateStockQuantity = async (id: string, quantity: number) => {
    await api.patch(`/pharmacy-stocks/${id}`, { quantity });
    load();
  };

  const removeStock = async (id: string) => {
    await api.delete(`/pharmacy-stocks/${id}`);
    load();
  };

  if (loading) {
    return (
      <ProtectedLayout allowedRoles={['pharmacy_central', 'pharmacy_partner']}>
        <p className="text-slate-500">Chargement...</p>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout allowedRoles={['pharmacy_central', 'pharmacy_partner']}>
      <h2 className="text-2xl font-bold mb-1">{pharmacy?.name}</h2>
      <p className="text-slate-500 mb-6">
        {pharmacy?.type === 'central' ? 'Pharmacie centrale de la clinique' : 'Pharmacie partenaire'}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="bg-white rounded-xl border border-slate-200 p-5 lg:col-span-2">
          <h3 className="font-semibold mb-4">Médicaments liés à la pharmacie ({meds.length})</h3>
          <div className="space-y-2">
            {meds.map((m) => (
              <div
                key={m._id}
                className="border border-slate-100 rounded-lg p-3 text-sm flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">
                    {m.name} {m.outOfStock && <span className="text-red-600 text-xs">(rupture)</span>}
                  </p>
                  <p className="text-slate-500">
                    {m.category} — {m.price} DT
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    defaultValue={m.quantity}
                    onBlur={(e) => updateQuantity(m._id, Number(e.target.value))}
                    className="w-20 rounded border border-slate-300 px-2 py-1 text-xs"
                  />
                  <button
                    onClick={() => removeMedication(m._id)}
                    className="text-xs px-2 py-1 rounded bg-red-100 text-red-700"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
            {meds.length === 0 && <p className="text-slate-400 text-sm">Aucun médicament trouvé.</p>}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold mb-4">Ajouter un médicament</h3>
          <form onSubmit={addMedication} className="space-y-3 text-sm">
            <input
              required
              placeholder="Nom"
              value={medForm.name}
              onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            <input
              placeholder="Catégorie"
              value={medForm.category}
              onChange={(e) => setMedForm({ ...medForm, category: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            <input
              required
              type="number"
              step="0.01"
              placeholder="Prix (DT)"
              value={medForm.price}
              onChange={(e) => setMedForm({ ...medForm, price: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            <input
              required
              type="number"
              placeholder="Quantité"
              value={medForm.quantity}
              onChange={(e) => setMedForm({ ...medForm, quantity: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            <input
              type="date"
              value={medForm.expirationDate}
              onChange={(e) => setMedForm({ ...medForm, expirationDate: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            <button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-lg py-2 font-medium"
            >
              Ajouter
            </button>
          </form>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="bg-white rounded-xl border border-slate-200 p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="font-semibold">Stock de pharmacie</h3>
            <span className="text-sm text-slate-500">{stocks.length} ligne(s)</span>
          </div>

          <div className="space-y-2">
            {stocks.map((stock) => (
              <div key={stock._id} className="border border-slate-100 rounded-lg p-3 text-sm flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium">
                    {stock.medicineId?.name || 'Médicament'}
                  </p>
                  <p className="text-slate-500">
                    Min: {stock.minimumQuantity} - Lot: {stock.batchNumber || '—'} - Exp: {stock.expirationDate ? new Date(stock.expirationDate).toLocaleDateString('fr-FR') : '—'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    defaultValue={stock.quantity}
                    onBlur={(e) => updateStockQuantity(stock._id, Number(e.target.value))}
                    className="w-24 rounded border border-slate-300 px-2 py-1 text-xs"
                  />
                  <button
                    onClick={() => removeStock(stock._id)}
                    className="text-xs px-2 py-1 rounded bg-red-100 text-red-700"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
            {stocks.length === 0 && <p className="text-slate-400 text-sm">Aucun stock pharmacie enregistré.</p>}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold mb-4">Ajouter au stock</h3>
          <form onSubmit={addStock} className="space-y-3 text-sm">
            <input
              value={medicineSearch}
              onChange={(e) => searchMedicine(e.target.value)}
              placeholder="Rechercher un médicament"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />

            {medicineResults.length > 0 && !selectedMedicine && (
              <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-2">
                {medicineResults.map((medicine) => (
                  <button
                    key={medicine._id}
                    type="button"
                    onClick={() => {
                      setSelectedMedicine(medicine);
                      setMedicineSearch(medicine.name);
                      setMedicineResults([]);
                    }}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-white"
                  >
                    <span>{medicine.name}</span>
                    <span className="text-xs text-slate-500">Qté: {medicine.quantity}</span>
                  </button>
                ))}
              </div>
            )}

            {selectedMedicine && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
                Sélectionné: {selectedMedicine.name}
              </div>
            )}

            <input
              required
              type="number"
              min="0"
              placeholder="Quantité disponible"
              value={stockForm.quantity}
              onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            <input
              required
              type="number"
              min="0"
              placeholder="Quantité minimum"
              value={stockForm.minimumQuantity}
              onChange={(e) => setStockForm({ ...stockForm, minimumQuantity: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            <input
              type="date"
              value={stockForm.expirationDate}
              onChange={(e) => setStockForm({ ...stockForm, expirationDate: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            <input
              placeholder="Numéro de lot"
              value={stockForm.batchNumber}
              onChange={(e) => setStockForm({ ...stockForm, batchNumber: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            <button
              type="submit"
              disabled={!selectedMedicine}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg py-2 font-medium"
            >
              Ajouter au stock
            </button>
          </form>
        </section>
      </div>
    </ProtectedLayout>
  );
}

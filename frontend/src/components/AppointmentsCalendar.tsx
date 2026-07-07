'use client';

import { useState } from 'react';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  refused: 'bg-rose-100 text-rose-800',
  cancelled: 'bg-slate-100 text-slate-500',
  completed: 'bg-blue-100 text-blue-800',
};

const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAYS_FR = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

interface Props {
  appointments: any[];
  onClose: () => void;
}

export default function AppointmentsCalendar({ appointments, onClose }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<string | null>(null);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); setSelected(null); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); setSelected(null); };

  // Build calendar grid (Mon-first)
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7; // Mon=0
  const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;

  const cells: (number | null)[] = Array.from({ length: totalCells }, (_, i) => {
    const d = i - startOffset + 1;
    return d >= 1 && d <= lastDay.getDate() ? d : null;
  });

  // Group appointments by date key YYYY-MM-DD
  const byDay: Record<string, any[]> = {};
  for (const a of appointments) {
    const d = new Date(a.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(a);
  }

  const toKey = (d: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const selectedAppts = selected ? (byDay[selected] || []) : [];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm" onMouseDown={onClose}>
      <div className="w-full max-w-3xl rounded-[30px] border border-white/20 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.35)] overflow-hidden" onMouseDown={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="rounded-xl bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200">‹</button>
            <p className="text-base font-semibold text-slate-900 w-40 text-center">{MONTHS_FR[month]} {year}</p>
            <button onClick={nextMonth} className="rounded-xl bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200">›</button>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600 hover:bg-slate-200">Fermer</button>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Calendar grid */}
          <div className="flex-1 p-4">
            <div className="grid grid-cols-7 mb-1">
              {DAYS_FR.map(d => (
                <div key={d} className="py-1 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                if (!day) return <div key={i} />;
                const key = toKey(day);
                const count = byDay[key]?.length || 0;
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                const isSelected = selected === key;
                return (
                  <button
                    key={i}
                    onClick={() => setSelected(isSelected ? null : key)}
                    className={`relative flex flex-col items-center rounded-2xl py-2 transition
                      ${isSelected ? 'bg-[#10263f] text-white' : isToday ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-50 text-slate-700'}
                    `}
                  >
                    <span className="text-sm font-medium">{day}</span>
                    {count > 0 && (
                      <span className={`mt-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${isSelected ? 'bg-white/20 text-white' : 'bg-[#10263f] text-white'}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
              {Object.entries(STATUS_COLORS).map(([s, cls]) => (
                <span key={s} className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${cls}`}>{s}</span>
              ))}
            </div>
          </div>

          {/* Day detail panel */}
          <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-slate-100 p-4 overflow-y-auto max-h-[420px]">
            {!selected ? (
              <p className="text-sm text-slate-400 mt-2">Sélectionnez un jour pour voir les rendez-vous.</p>
            ) : selectedAppts.length === 0 ? (
              <p className="text-sm text-slate-400 mt-2">Aucun rendez-vous ce jour.</p>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {new Date(selected).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                {selectedAppts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((a) => (
                  <div key={a._id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-500">
                      {new Date(a.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {a.patientId?.userId?.firstName} {a.patientId?.userId?.lastName}
                    </p>
                    <p className="text-xs text-slate-500">Dr. {a.doctorId?.userId?.firstName} {a.doctorId?.userId?.lastName}</p>
                    {a.reason && <p className="mt-1 text-xs text-slate-500">{a.reason}</p>}
                    <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${STATUS_COLORS[a.status] || 'bg-slate-100 text-slate-600'}`}>
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

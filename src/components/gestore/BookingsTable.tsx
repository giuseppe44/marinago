"use client";

import { useState } from "react";
import { Ship, Calendar, Check, X, Eye } from "lucide-react";

export function BookingsTable({ initialBookings }: { initialBookings: any[] }) {
  const [filter, setFilter] = useState("ALL");
  
  const filtered = initialBookings.filter(b => filter === "ALL" || b.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-6">
        {['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              filter === f 
                ? 'bg-slate-900 text-white' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f === 'ALL' ? 'Tutte' : f === 'PENDING' ? 'In Attesa' : f === 'CONFIRMED' ? 'Confermate' : 'Cancellate'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
              <tr>
                <th className="px-6 py-4">Codice</th>
                <th className="px-6 py-4">Data Ricezione</th>
                <th className="px-6 py-4">Cliente & Barca</th>
                <th className="px-6 py-4">Periodo Ormeggio</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Incasso</th>
                <th className="px-6 py-4 text-center">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((b: any) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {b.id.split('-')[0].toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(b.created_at).toLocaleDateString("it-IT", { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{b.users?.full_name || "Ospite"}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Ship className="h-3 w-3" /> {b.boats?.name} ({b.boats?.length}m)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                         <Calendar className="h-4 w-4 text-slate-400" />
                         <span>{new Date(b.check_in).toLocaleDateString("it-IT")} - {new Date(b.check_out).toLocaleDateString("it-IT")}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={"px-3 py-1 font-bold text-xs rounded-full " + (
                        b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' :
                        b.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      )}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      € {b.total_price}
                    </td>
                    <td className="px-6 py-4 text-center">
                       {b.status === 'PENDING' ? (
                         <div className="flex justify-center gap-2">
                           <button className="p-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded transition-colors" title="Accetta">
                             <Check className="h-4 w-4" />
                           </button>
                           <button className="p-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors" title="Rifiuta">
                             <X className="h-4 w-4" />
                           </button>
                         </div>
                       ) : (
                         <button className="text-blue-600 hover:underline text-xs font-semibold flex items-center gap-1 mx-auto">
                           <Eye className="h-4 w-4" /> Dettagli
                         </button>
                       )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    Nessuna prenotazione trovata con questi filtri.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

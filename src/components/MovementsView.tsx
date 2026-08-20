import React, { useState } from 'react';
import { StockMovement, MovementType } from '../types';
import { 
  ArrowDownUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sliders, 
  Repeat, 
  Plus, 
  Search, 
  Download, 
  Calendar, 
  Filter, 
  User 
} from 'lucide-react';

interface MovementsViewProps {
  movements: StockMovement[];
  onOpenNewMovement: () => void;
}

export const MovementsView: React.FC<MovementsViewProps> = ({
  movements,
  onOpenNewMovement
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredMovements = movements.filter(m => {
    const matchesSearch = 
      m.articleName.toLowerCase().includes(search.toLowerCase()) ||
      m.reference.toLowerCase().includes(search.toLowerCase()) ||
      m.reason.toLowerCase().includes(search.toLowerCase()) ||
      m.performedBy.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === 'all' || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalEntries = movements.filter(m => m.type === 'entree').reduce((acc, m) => acc + m.quantity, 0);
  const totalExits = movements.filter(m => m.type === 'sortie').reduce((acc, m) => acc + m.quantity, 0);
  const totalAdjustments = movements.filter(m => m.type === 'ajustement').length;

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Type', 'Reference', 'Article', 'Quantite', 'StockAvant', 'NouveauStock', 'Motif', 'Operateur'];
    const rows = filteredMovements.map(m => [
      m.id,
      `"${m.timestamp}"`,
      m.type,
      `"${m.reference}"`,
      `"${m.articleName.replace(/"/g, '""')}"`,
      m.quantity,
      m.previousQuantity,
      m.newQuantity,
      `"${m.reason.replace(/"/g, '""')}"`,
      `"${m.performedBy}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `journal_mouvements_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Mouvements & Traçabilité des Flux
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Journal d'audit des entrées, sorties, transferts et régularisations d'inventaire
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Journal CSV</span>
          </button>
          <button
            onClick={onOpenNewMovement}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            Nouveau Mouvement
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/60 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              Total Entrées Réceptionnées
            </div>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
              +{totalEntries} <span className="text-xs font-normal">unités</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/80 text-emerald-600 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-red-50/60 dark:bg-red-950/20 border border-red-200/70 dark:border-red-900/60 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-red-800 dark:text-red-300 uppercase tracking-wider">
              Total Sorties & Expéditions
            </div>
            <div className="text-2xl font-black text-red-700 dark:text-red-400 mt-1">
              -{totalExits} <span className="text-xs font-normal">unités</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/80 text-red-600 flex items-center justify-center">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/60 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
              Ajustements & Contrôles
            </div>
            <div className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-1">
              {totalAdjustments} <span className="text-xs font-normal">opérations</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/80 text-blue-600 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrer par référence, article, opérateur ou motif..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
        >
          <option value="all">Tous les types de mouvements</option>
          <option value="entree">Entrées (+)</option>
          <option value="sortie">Sorties (-)</option>
          <option value="ajustement">Ajustements d'inventaire (=)</option>
          <option value="transfert">Transferts de zone</option>
          <option value="retour">Retours</option>
        </select>
      </div>

      {/* Movements Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Horodatage</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Article & Réf</th>
                <th className="py-3.5 px-4 text-center">Quantité</th>
                <th className="py-3.5 px-4 text-center">Avant / Après</th>
                <th className="py-3.5 px-4">Motif / Justificatif</th>
                <th className="py-3.5 px-4">Opérateur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Aucun mouvement enregistré.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((mov) => {
                  const dateObj = new Date(mov.timestamp);
                  const formattedDate = dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
                  const formattedTime = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <tr key={mov.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      
                      {/* Timestamp */}
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                        <div className="text-slate-800 dark:text-slate-200 font-semibold">{formattedDate}</div>
                        <div className="text-[10px] text-slate-400">{formattedTime}</div>
                      </td>

                      {/* Movement Type Badge */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          mov.type === 'entree' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          mov.type === 'sortie' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' :
                          mov.type === 'ajustement' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                          'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {mov.type === 'entree' ? <ArrowUpRight className="w-3.5 h-3.5" /> :
                           mov.type === 'sortie' ? <ArrowDownRight className="w-3.5 h-3.5" /> :
                           <Sliders className="w-3.5 h-3.5" />}
                          {mov.type.toUpperCase()}
                        </span>
                      </td>

                      {/* Article & SKU */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {mov.articleName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {mov.reference}
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-4 text-center">
                        <span className={`font-black text-sm font-mono ${
                          mov.type === 'entree' ? 'text-emerald-600 dark:text-emerald-400' :
                          mov.type === 'sortie' ? 'text-red-600 dark:text-red-400' :
                          'text-blue-600 dark:text-blue-400'
                        }`}>
                          {mov.type === 'entree' ? `+${mov.quantity}` :
                           mov.type === 'sortie' ? `-${mov.quantity}` :
                           `${mov.quantity}`}
                        </span>
                      </td>

                      {/* Before / After Progression */}
                      <td className="py-3 px-4 text-center font-mono">
                        <div className="flex items-center justify-center gap-1.5 text-xs">
                          <span className="text-slate-400">{mov.previousQuantity}</span>
                          <span className="text-slate-300">➔</span>
                          <span className="font-bold text-slate-900 dark:text-white">{mov.newQuantity}</span>
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {mov.reason}
                      </td>

                      {/* Performed By */}
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{mov.performedBy}</span>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { Article } from '../types';
import { MapPin, Boxes, Eye, ArrowRight, Layers, CheckCircle2 } from 'lucide-react';

interface WarehouseViewProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

export const WarehouseView: React.FC<WarehouseViewProps> = ({
  articles,
  onSelectArticle
}) => {
  const [selectedAisle, setSelectedAisle] = useState<string>('Allée A');

  const aisles = [
    { id: 'Allée A', name: 'Allée A - Électronique & High-Tech', zone: 'Zone Nord (Climatisée)', color: 'border-blue-500 bg-blue-50/30' },
    { id: 'Allée B', name: 'Allée B - Outillage & Équipement', zone: 'Zone Centrale (Charges Moyennes)', color: 'border-emerald-500 bg-emerald-50/30' },
    { id: 'Allée C', name: 'Allée C - Équipements de Sécurité (EPI)', zone: 'Zone Ouest (Accès Rapide)', color: 'border-amber-500 bg-amber-50/30' },
    { id: 'Allée D', name: 'Allée D - Bureautique & Consommables', zone: 'Zone Est (Stockage Palettes)', color: 'border-purple-500 bg-purple-50/30' },
    { id: 'Allée E', name: 'Allée E - Pièces Mécaniques', zone: 'Zone Sud (Charges Lourdes)', color: 'border-sky-500 bg-sky-50/30' },
    { id: 'Allée F', name: 'Allée F - Emballage & Expéditions', zone: 'Zone Quai de Chargement', color: 'border-rose-500 bg-rose-50/30' },
  ];

  // Filter articles in selected aisle
  const currentArticles = articles.filter(a => a.location?.toLowerCase().includes(selectedAisle.toLowerCase()));
  const totalUnitsInAisle = currentArticles.reduce((acc, a) => acc + a.quantity, 0);
  const totalValuationInAisle = currentArticles.reduce((acc, a) => acc + (a.quantity * a.purchasePrice), 0);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Plan & Cartographie de l'Entrepôt
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Visualisation spatiale des allées, rayons et répartition physique des stocks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-800">
            6 Allées Principales actives
          </span>
        </div>
      </div>

      {/* Interactive Warehouse Grid Map */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            Cliquez sur une allée pour inspecter les articles stockés :
          </h2>
          <span className="text-xs text-slate-400 font-mono">Plan 2D Interactif</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {aisles.map((aisle) => {
            const aisleArticles = articles.filter(a => a.location?.toLowerCase().includes(aisle.id.toLowerCase()));
            const count = aisleArticles.reduce((acc, a) => acc + a.quantity, 0);
            const isSelected = selectedAisle === aisle.id;

            return (
              <button
                key={aisle.id}
                onClick={() => setSelectedAisle(aisle.id)}
                className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between space-y-3 relative overflow-hidden group ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {aisle.zone}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">
                      {aisle.id}
                    </h3>
                  </div>

                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}>
                    {aisleArticles.length}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{count} unités physiques</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Voir les rayons <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail list for Selected Aisle */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Articles stockés dans <span className="text-blue-600">{selectedAisle}</span>
            </h2>
            <p className="text-xs text-slate-500">
              {currentArticles.length} référence(s) • {totalUnitsInAisle} unités • {totalValuationInAisle.toFixed(2)} € de valorisation
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {currentArticles.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Aucun article n'est actuellement assigné à cette allée.
            </div>
          ) : (
            currentArticles.map((art) => (
              <div 
                key={art.id}
                onClick={() => onSelectArticle(art)}
                className="py-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 p-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-mono font-bold text-xs text-slate-700 dark:text-slate-300">
                    {art.location.split('-')[1]?.trim() || 'R1'}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                      {art.name}
                    </h3>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                      <span>Réf : {art.reference}</span>
                      <span>•</span>
                      <span className="text-blue-600 font-bold">{art.location}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {art.quantity} {art.unit}s
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {(art.quantity * art.purchasePrice).toFixed(2)} €
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

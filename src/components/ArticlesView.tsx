import React, { useState } from 'react';
import { Article, Supplier } from '../types';
import { 
  Search, 
  Plus, 
  Filter, 
  ArrowUpDown, 
  Download, 
  Upload, 
  QrCode, 
  Barcode as BarcodeIcon, 
  Edit, 
  Trash2, 
  Boxes, 
  PlusCircle, 
  MinusCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  LayoutGrid, 
  List,
  Sparkles,
  ArrowDownUp,
  FileText
} from 'lucide-react';
import { exportInventoryReportPDF } from '../utils/pdfGenerator';

interface ArticlesViewProps {
  articles: Article[];
  suppliers: Supplier[];
  onOpenNewArticle: () => void;
  onEditArticle: (article: Article) => void;
  onDeleteArticle: (id: string) => Promise<void>;
  onOpenBarcode: (article: Article) => void;
  onQuickMovement: (article: Article, type: 'entree' | 'sortie') => void;
}

export const ArticlesView: React.FC<ArticlesViewProps> = ({
  articles,
  suppliers,
  onOpenNewArticle,
  onEditArticle,
  onDeleteArticle,
  onOpenBarcode,
  onQuickMovement
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'low' | 'out_of_stock' | 'overstock'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'value' | 'updated'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Extract unique categories
  const categories = Array.from(new Set(articles.map(a => a.category).filter(Boolean)));

  // Filter & Sort
  const filteredArticles = articles.filter(art => {
    const matchesSearch = 
      art.name.toLowerCase().includes(search.toLowerCase()) ||
      art.reference.toLowerCase().includes(search.toLowerCase()) ||
      art.barcode.includes(search) ||
      art.location.toLowerCase().includes(search.toLowerCase()) ||
      art.supplier.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || art.category === selectedCategory;

    let matchesStatus = true;
    if (statusFilter === 'in_stock') {
      matchesStatus = art.quantity > art.minQuantity && (!art.idealQuantity || art.quantity < art.idealQuantity * 1.5);
    } else if (statusFilter === 'low') {
      matchesStatus = art.quantity > 0 && art.quantity <= art.minQuantity;
    } else if (statusFilter === 'out_of_stock') {
      matchesStatus = art.quantity === 0;
    } else if (statusFilter === 'overstock') {
      matchesStatus = art.idealQuantity > 0 && art.quantity >= art.idealQuantity * 1.5;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    let diff = 0;
    if (sortBy === 'name') {
      diff = a.name.localeCompare(b.name);
    } else if (sortBy === 'quantity') {
      diff = a.quantity - b.quantity;
    } else if (sortBy === 'value') {
      diff = (a.quantity * a.purchasePrice) - (b.quantity * b.purchasePrice);
    } else if (sortBy === 'updated') {
      diff = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    }
    return sortOrder === 'asc' ? diff : -diff;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Reference', 'CodeBarre', 'Nom', 'Categorie', 'Quantite', 'Unite', 'SeuilAlerte', 'StockIdeal', 'PrixAchatHT', 'PrixVenteHT', 'Emplacement', 'Fournisseur'];
    const rows = filteredArticles.map(a => [
      a.id,
      `"${a.reference}"`,
      `"${a.barcode}"`,
      `"${a.name.replace(/"/g, '""')}"`,
      `"${a.category}"`,
      a.quantity,
      a.unit,
      a.minQuantity,
      a.idealQuantity,
      a.purchasePrice,
      a.sellingPrice,
      `"${a.location}"`,
      `"${a.supplier}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventaire_stockflow_${new Date().toISOString().slice(0, 10)}.csv`);
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
            Articles & Inventaire
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Gestion du catalogue, valorisation unitaire et surveillance des seuils ({articles.length} références)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportInventoryReportPDF(articles, 'MAD')}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs shadow-amber-500/20"
            title="Générer et télécharger l'état de stock en PDF"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF</span> Inventaire
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            title="Exporter l'inventaire en CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span> CSV
          </button>
          <button
            onClick={onOpenNewArticle}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            Nouvel Article
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, SKU, code-barre, allée..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
          >
            <option value="all">Toutes catégories ({articles.length})</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
          >
            <option value="name">Trier par Nom</option>
            <option value="quantity">Trier par Quantité</option>
            <option value="value">Trier par Valeur (€)</option>
            <option value="updated">Trier par Mise à jour</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-400'}`}
              title="Vue Tableau"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-400'}`}
              title="Vue Grille"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Quick Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-400 font-medium">État du stock :</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
              statusFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Tous ({articles.length})
          </button>
          <button
            onClick={() => setStatusFilter('in_stock')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
              statusFilter === 'in_stock' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            Stock Optimal
          </button>
          <button
            onClick={() => setStatusFilter('low')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
              statusFilter === 'low' ? 'bg-amber-600 text-white' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
            }`}
          >
            Stock Faible ({articles.filter(a => a.quantity > 0 && a.quantity <= a.minQuantity).length})
          </button>
          <button
            onClick={() => setStatusFilter('out_of_stock')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
              statusFilter === 'out_of_stock' ? 'bg-red-600 text-white' : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300'
            }`}
          >
            Rupture ({articles.filter(a => a.quantity === 0).length})
          </button>
          <button
            onClick={() => setStatusFilter('overstock')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
              statusFilter === 'overstock' ? 'bg-purple-600 text-white' : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
            }`}
          >
            Surstock ({articles.filter(a => a.idealQuantity > 0 && a.quantity >= a.idealQuantity * 1.5).length})
          </button>
        </div>

      </div>

      {/* Main Articles List / Table */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Article & Réf.</th>
                  <th className="py-3.5 px-4">Catégorie</th>
                  <th className="py-3.5 px-4 text-center">Niveau de Stock</th>
                  <th className="py-3.5 px-4">Emplacement</th>
                  <th className="py-3.5 px-4">Prix Achat / Vente</th>
                  <th className="py-3.5 px-4">Valeur Stock</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredArticles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Aucun article ne correspond à votre recherche.
                    </td>
                  </tr>
                ) : (
                  filteredArticles.map((art) => {
                    const isOutOfStock = art.quantity === 0;
                    const isLow = !isOutOfStock && art.quantity <= art.minQuantity;
                    const isOver = art.idealQuantity > 0 && art.quantity >= art.idealQuantity * 1.5;
                    const stockValue = art.quantity * art.purchasePrice;

                    return (
                      <tr key={art.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                        
                        {/* Name & Reference */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-mono font-bold text-xs text-slate-700 dark:text-slate-300 shrink-0">
                              {art.reference.split('-')[1] || 'SKU'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                {art.name}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                                <span>{art.reference}</span>
                                <span>•</span>
                                <span>{art.barcode}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-medium">
                            {art.category}
                          </span>
                        </td>

                        {/* Stock Level with Progress */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <div className="flex items-center gap-2">
                              {/* Quick - 1 */}
                              <button
                                onClick={() => onQuickMovement(art, 'sortie')}
                                className="w-5 h-5 rounded-md bg-slate-100 hover:bg-red-100 dark:bg-slate-800 dark:hover:bg-red-950 text-slate-500 hover:text-red-600 flex items-center justify-center transition-colors"
                                title="-1 unité"
                              >
                                -
                              </button>

                              <span className={`font-black text-sm ${
                                isOutOfStock ? 'text-red-600 dark:text-red-400' :
                                isLow ? 'text-amber-600 dark:text-amber-400' :
                                isOver ? 'text-purple-600 dark:text-purple-400' :
                                'text-emerald-600 dark:text-emerald-400'
                              }`}>
                                {art.quantity} <span className="text-[10px] font-normal text-slate-400">{art.unit}s</span>
                              </span>

                              {/* Quick + 1 */}
                              <button
                                onClick={() => onQuickMovement(art, 'entree')}
                                className="w-5 h-5 rounded-md bg-slate-100 hover:bg-emerald-100 dark:bg-slate-800 dark:hover:bg-emerald-950 text-slate-500 hover:text-emerald-600 flex items-center justify-center transition-colors"
                                title="+1 unité"
                              >
                                +
                              </button>
                            </div>

                            <span className="text-[10px] text-slate-400 mt-0.5">
                              Seuil mini: {art.minQuantity} | Idéal: {art.idealQuantity}
                            </span>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-3 px-4">
                          <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                            {art.location}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                            {art.supplier}
                          </div>
                        </td>

                        {/* Prices */}
                        <td className="py-3 px-4">
                          <div className="text-slate-900 dark:text-white font-semibold">
                            {art.sellingPrice.toFixed(2)} € <span className="text-[10px] text-slate-400 font-normal">TTC</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Achat: {art.purchasePrice.toFixed(2)} €
                          </div>
                        </td>

                        {/* Total Stock Valuation */}
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          {stockValue.toFixed(2)} €
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onOpenBarcode(art)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="Code-barre & Étiquette"
                            >
                              <BarcodeIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onEditArticle(art)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors"
                              title="Modifier l'article"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Confirmez-vous la suppression de l'article "${art.name}" ?`)) {
                                  onDeleteArticle(art.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                              title="Supprimer l'article"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
      ) : (
        /* Grid Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArticles.map((art) => {
            const isOutOfStock = art.quantity === 0;
            const isLow = !isOutOfStock && art.quantity <= art.minQuantity;
            const isOver = art.idealQuantity > 0 && art.quantity >= art.idealQuantity * 1.5;

            return (
              <div 
                key={art.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                      {art.category}
                    </span>
                    <span className="font-mono text-xs text-slate-400 font-bold">
                      {art.reference}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 transition-colors line-clamp-1">
                    {art.name}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {art.notes || 'Aucune remarque spécifique.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Stock disponible</div>
                      <div className={`text-base font-black ${
                        isOutOfStock ? 'text-red-600' :
                        isLow ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {art.quantity} {art.unit}s
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Prix Vente HT</div>
                      <div className="text-base font-black text-slate-900 dark:text-white font-mono">
                        {art.sellingPrice.toFixed(2)} €
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1">
                    <span>{art.location}</span>
                    <span>Valeur: {(art.quantity * art.purchasePrice).toFixed(0)} €</span>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => onQuickMovement(art, 'entree')}
                      className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Entrée
                    </button>
                    <button
                      onClick={() => onQuickMovement(art, 'sortie')}
                      className="flex-1 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
                    >
                      <MinusCircle className="w-3.5 h-3.5" /> Sortie
                    </button>
                    <button
                      onClick={() => onEditArticle(art)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

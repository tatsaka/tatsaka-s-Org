import React, { useState, useEffect } from 'react';
import { Article, Supplier, StockMovement } from '../types';
import { generateProductSheetAI, runFastAssist } from '../lib/geminiClient';
import { ArticleTimeline } from './ArticleTimeline';
import { 
  X, 
  Sparkles, 
  Boxes, 
  Tag, 
  Barcode as BarcodeIcon, 
  Euro, 
  MapPin, 
  Truck, 
  Layers, 
  Info,
  Loader2,
  Check,
  History,
  FileText
} from 'lucide-react';

const DEFAULT_CATEGORIES = [
  'Électronique & High-Tech',
  'Outillage & Équipement',
  'Équipements de Sécurité (EPI)',
  'Bureautique & Fournitures',
  'Pièces Mécaniques & Maintenance',
  'Emballage & Conditionnement'
];

interface ArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: Article | null; // null if creating new
  onSave: (article: Article) => Promise<void>;
  suppliers?: Supplier[];
  categories?: string[];
  movements?: StockMovement[];
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  isOpen,
  onClose,
  article,
  onSave,
  suppliers = [],
  categories = DEFAULT_CATEGORIES,
  movements = []
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'timeline'>('form');
  const [formData, setFormData] = useState<Partial<Article>>({
    name: '',
    reference: '',
    barcode: '',
    category: categories?.[0] || 'Électronique & High-Tech',
    quantity: 0,
    minQuantity: 5,
    idealQuantity: 20,
    purchasePrice: 0,
    sellingPrice: 0,
    unit: 'pièce',
    location: 'Allée A - R1 - E1',
    supplier: suppliers?.[0]?.name || 'TechLogistics France',
    notes: '',
    imageUrl: ''
  });

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (article) {
      setFormData(article);
    } else {
      // New article default
      const randomEan = '3700' + Math.floor(100000000 + Math.random() * 900000000).toString().slice(0, 9);
      setFormData({
        name: '',
        reference: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
        barcode: randomEan,
        category: categories?.[0] || 'Électronique & High-Tech',
        quantity: 10,
        minQuantity: 5,
        idealQuantity: 25,
        purchasePrice: 10,
        sellingPrice: 24.90,
        unit: 'pièce',
        location: 'Allée A - R1 - E1',
        supplier: suppliers?.[0]?.name || 'TechLogistics France',
        notes: '',
        imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&auto=format&fit=crop&q=60'
      });
    }
  }, [article, isOpen, categories, suppliers]);

  if (!isOpen) return null;

  // Margin calculation
  const purchase = Number(formData.purchasePrice) || 0;
  const selling = Number(formData.sellingPrice) || 0;
  const marginEur = selling - purchase;
  const marginPct = purchase > 0 ? ((marginEur / purchase) * 100).toFixed(1) : '0.0';

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim() && !formData.name?.trim()) {
      setError('Veuillez saisir un nom de produit ou une courte description pour l\'IA.');
      return;
    }
    try {
      setAiLoading(true);
      setError(null);
      const query = aiPrompt.trim() || formData.name || '';
      const generated = await generateProductSheetAI(query);
      
      setFormData(prev => ({
        ...prev,
        name: generated.name || prev.name,
        reference: generated.reference || prev.reference,
        category: generated.category || prev.category,
        unit: generated.unit || prev.unit,
        purchasePrice: generated.purchasePrice ?? prev.purchasePrice,
        sellingPrice: generated.sellingPrice ?? prev.sellingPrice,
        minQuantity: generated.minQuantity ?? prev.minQuantity,
        idealQuantity: generated.idealQuantity ?? prev.idealQuantity,
        location: generated.location || prev.location,
        notes: generated.notes || prev.notes,
      }));
    } catch (err: any) {
      console.error(err);
      setError('Erreur lors de la génération IA: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleFastSku = async () => {
    if (!formData.name) return;
    try {
      setAiLoading(true);
      const res = await runFastAssist('generate_sku', { name: formData.name, category: formData.category });
      if (res?.recommended) {
        setFormData(prev => ({ ...prev, reference: res.recommended }));
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.reference) {
      setError('Le nom et la référence sont obligatoires.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSave({
        id: article?.id || `art-${Date.now()}`,
        reference: formData.reference!,
        barcode: formData.barcode || '3700000000000',
        name: formData.name!,
        category: formData.category || 'Général',
        quantity: Number(formData.quantity) || 0,
        minQuantity: Number(formData.minQuantity) || 0,
        idealQuantity: Number(formData.idealQuantity) || 0,
        purchasePrice: Number(formData.purchasePrice) || 0,
        sellingPrice: Number(formData.sellingPrice) || 0,
        unit: formData.unit || 'pièce',
        location: formData.location || 'Non spécifié',
        supplier: formData.supplier || 'Général',
        notes: formData.notes || '',
        imageUrl: formData.imageUrl || '',
        createdAt: article?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      onClose();
    } catch (err: any) {
      setError('Erreur lors de l\'enregistrement: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {article ? `Fiche Article : ${article.name}` : 'Nouvel Article en Stock'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {article ? `Réf: ${article.reference} • ${formData.quantity} ${formData.unit || 'pièce'}(s) en stock` : 'Informations logistiques, seuils et tarification'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher if article exists */}
        {article && (
          <div className="px-6 pt-3 pb-0 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`flex items-center gap-2 px-3.5 py-2 border-b-2 text-xs font-bold transition-colors ${
                activeTab === 'form'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Fiche & Paramètres
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-2 px-3.5 py-2 border-b-2 text-xs font-bold transition-colors ${
                activeTab === 'timeline'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Timeline & Historique Stock
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 text-[10px]">
                {movements.filter(m => m.articleId === article.id || m.reference === article.reference).length}
              </span>
            </button>
          </div>
        )}

        {/* Scrollable Body */}
        {activeTab === 'timeline' && article ? (
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Quick stock status summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Stock Actuel</span>
                <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">
                  {formData.quantity} {formData.unit || 'pièces'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Emplacement</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1 block truncate">
                  {formData.location || 'Non défini'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Valeur HT Stock</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1 block font-mono">
                  {((formData.quantity || 0) * (formData.purchasePrice || 0)).toFixed(2)} €
                </span>
              </div>
            </div>

            {/* Timeline Component */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
              <ArticleTimeline
                movements={movements}
                articleId={article.id}
                articleReference={article.reference}
                maxItems={5}
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Retour à la fiche technique
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Gemini AI Auto-Fill Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 border border-blue-200/60 dark:border-indigo-900/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-300">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Remplissage automatique avec Gemini 3.5 Flash</span>
              </div>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">IA Assist</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ex: Disque SSD NVMe 1To haute vitesse pour serveur..."
                className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAiGenerate}
                disabled={aiLoading}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shrink-0"
              >
                {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Générer la fiche
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 text-xs bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 rounded-xl">
              {error}
            </div>
          )}

          {/* General Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              Identification du Produit
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nom de l'article / Désignation *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Câble HDMI 2.1 Tressé 2m"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Référence interne (SKU) *
                  </label>
                  <button
                    type="button"
                    onClick={handleFastSku}
                    className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-2.5 h-2.5" /> Suggérer SKU IA
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={formData.reference || ''}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="REF-ELEC-001"
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Code-barre (EAN-13 / UPC)
                </label>
                <input
                  type="text"
                  value={formData.barcode || ''}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  placeholder="3700123456789"
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Catégorie
                </label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="Autre">Autre catégorie...</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Unité de mesure
                </label>
                <select
                  value={formData.unit || 'pièce'}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pièce">Pièce (u)</option>
                  <option value="lot">Lot</option>
                  <option value="carton">Carton</option>
                  <option value="kg">Kilogramme (kg)</option>
                  <option value="litre">Litre (L)</option>
                  <option value="mètre">Mètre (m)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stock Quantities & Thresholds */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Niveaux de Stock & Seuils d'Alerte
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Quantité Actuelle en Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.quantity ?? 0}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
                  Seuil d'Alerte (Stock Mini)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.minQuantity ?? 0}
                  onChange={(e) => setFormData({ ...formData, minQuantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">
                  Stock Idéal (Objectif)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.idealQuantity ?? 0}
                  onChange={(e) => setFormData({ ...formData, idealQuantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Pricing and Margins */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Euro className="w-3.5 h-3.5" />
              Tarification & Rentabilité
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Prix d'Achat Unitaire HT (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.purchasePrice ?? 0}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Prix de Vente Unitaire HT (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.sellingPrice ?? 0}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl flex flex-col justify-center">
                <span className="text-[10px] uppercase font-semibold text-slate-500">Marge brute estimée</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className={`text-base font-bold ${marginEur >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                    {marginEur.toFixed(2)} €
                  </span>
                  <span className="text-xs font-mono font-medium text-slate-500">
                    ({marginPct}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Location & Supplier */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Emplacement & Fournisseur
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Emplacement Entrepôt
                </label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ex: Allée A - R2 - E1"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Fournisseur Principal
                </label>
                <select
                  value={formData.supplier || ''}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Remarques / Description technique
              </label>
              <textarea
                rows={2}
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Spécifications, compatibilités, précautions de stockage..."
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Timeline of 5 last movements (Integrated directly in the sheet) */}
          {article && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <ArticleTimeline
                movements={movements}
                articleId={article.id}
                articleReference={article.reference}
                maxItems={5}
              />
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {article ? 'Mettre à jour l\'article' : 'Créer l\'article'}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

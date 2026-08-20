import React, { useState } from 'react';
import { Supplier, Article } from '../types';
import { Truck, Plus, Mail, Phone, MapPin, Clock, Boxes, Edit, X, Check, Loader2 } from 'lucide-react';

interface SuppliersViewProps {
  suppliers: Supplier[];
  articles: Article[];
  onSaveSupplier: (supplier: Supplier) => Promise<void>;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  suppliers,
  articles,
  onSaveSupplier
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    deliveryLeadDays: 3,
    categories: ['Électronique & High-Tech'],
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      deliveryLeadDays: 3,
      categories: ['Électronique & High-Tech'],
      notes: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (s: Supplier) => {
    setEditingSupplier(s);
    setFormData(s);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    try {
      setSaving(true);
      await onSaveSupplier({
        id: editingSupplier?.id || `supp-${Date.now()}`,
        name: formData.name!,
        contactName: formData.contactName || '',
        email: formData.email || '',
        phone: formData.phone || '',
        address: formData.address || '',
        deliveryLeadDays: Number(formData.deliveryLeadDays) || 3,
        categories: formData.categories || ['Général'],
        notes: formData.notes || ''
      });
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Fournisseurs & Partenaires Logistiques
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Gestion des coordonnées, délais d'approvisionnement et catalogue produits associé
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          Nouveau Fournisseur
        </button>
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suppliers.map((supp) => {
          const associatedArticles = articles.filter(a => a.supplier === supp.name);
          const totalValue = associatedArticles.reduce((acc, a) => acc + (a.quantity * a.purchasePrice), 0);

          return (
            <div 
              key={supp.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {supp.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Contact : {supp.contactName || 'Non spécifié'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(supp)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>

                {/* Info Pills */}
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {supp.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{supp.email}</span>
                    </div>
                  )}
                  {supp.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{supp.phone}</span>
                    </div>
                  )}
                  {supp.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate max-w-xs">{supp.address}</span>
                    </div>
                  )}
                </div>

                {supp.notes && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    {supp.notes}
                  </p>
                )}
              </div>

              {/* Bottom stats */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>Délai moyen : <strong className="text-slate-800 dark:text-slate-200">{supp.deliveryLeadDays} jours</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 font-mono">
                  <Boxes className="w-3.5 h-3.5 text-emerald-500" />
                  <span><strong>{associatedArticles.length}</strong> réf ({totalValue.toFixed(0)} €)</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add / Edit Supplier Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden">
            
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingSupplier ? 'Modifier Fournisseur' : 'Nouveau Fournisseur'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Fiche d'identification et conditions logistiques
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nom de l'entreprise *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: TechLogistics France"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nom du contact
                  </label>
                  <input
                    type="text"
                    value={formData.contactName || ''}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="Marc Dupont"
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Délai moyen (jours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.deliveryLeadDays || 3}
                    onChange={(e) => setFormData({ ...formData, deliveryLeadDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@fournisseur.fr"
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+33 1 23 45 67 89"
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Adresse postale
                </label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="14 Rue de l'Industrie, 75000 Paris"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes et conditions commerciales
                </label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Remises sur volume, franco de port, etc."
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Enregistrer
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

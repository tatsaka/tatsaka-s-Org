import React, { useState, useEffect } from 'react';
import { SaleOrder, SaleOrderItem, Article, Client, Currency, User } from '../types';
import { X, Plus, Trash2, ShoppingCart, User as UserIcon, Calendar, Check, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface SaleOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: SaleOrder, deductStock: boolean) => Promise<void>;
  articles: Article[];
  clients: Client[];
  currency: Currency;
  currentUser: User | null;
  initialClient?: Client | null;
  existingOrder?: SaleOrder | null;
  saleOrder?: SaleOrder | null;
}

export const SaleOrderModal: React.FC<SaleOrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  articles = [],
  clients = [],
  currency = 'MAD',
  currentUser,
  initialClient,
  existingOrder,
  saleOrder
}) => {
  const activeExistingOrder = existingOrder || saleOrder;
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'brouillon' | 'validee' | 'livree' | 'annulee'>('validee');
  const [taxRate, setTaxRate] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [items, setItems] = useState<SaleOrderItem[]>([]);
  const [deductStock, setDeductStock] = useState<boolean>(true);
  
  // Line item selector states
  const [selectedArticleId, setSelectedArticleId] = useState<string>('');
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [itemUnitPrice, setItemUnitPrice] = useState<number>(0);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeExistingOrder) {
      setSelectedClientId(activeExistingOrder.clientId);
      setOrderNumber(activeExistingOrder.orderNumber);
      setDate(activeExistingOrder.date);
      setDueDate(activeExistingOrder.dueDate);
      setStatus(activeExistingOrder.status);
      setTaxRate(activeExistingOrder.taxRate || 0);
      setNotes(activeExistingOrder.notes || '');
      setItems(activeExistingOrder.items || []);
      setDeductStock(false);
    } else {
      const randomNum = Math.floor(100 + Math.random() * 900);
      setOrderNumber(`FAC-2026-${randomNum}`);
      setSelectedClientId(initialClient ? initialClient.id : (clients[0]?.id || ''));
      setDate(new Date().toISOString().split('T')[0]);
      setDueDate(new Date().toISOString().split('T')[0]);
      setStatus('validee');
      setTaxRate(0);
      setNotes('');
      setItems([]);
      setDeductStock(true);
    }
  }, [activeExistingOrder, initialClient, clients, isOpen]);

  // When selected article changes, auto-fill unit price
  useEffect(() => {
    if (selectedArticleId) {
      const art = articles.find(a => a.id === selectedArticleId);
      if (art) {
        setItemUnitPrice(art.sellingPrice || art.purchasePrice || 0);
      }
    }
  }, [selectedArticleId, articles]);

  if (!isOpen) return null;

  const currentSelectedClient = clients.find(c => c.id === selectedClientId);

  const handleAddItem = () => {
    if (!selectedArticleId) return;
    const art = articles.find(a => a.id === selectedArticleId);
    if (!art) return;

    if (itemQuantity <= 0) {
      setError('La quantité doit être supérieure à 0.');
      return;
    }

    if (itemQuantity > art.quantity) {
      setError(`Stock insuffisant pour ${art.name}. Disponible: ${art.quantity}`);
      return;
    }

    // Check if already in items
    const existingIdx = items.findIndex(i => i.articleId === art.id);
    if (existingIdx >= 0) {
      const updated = [...items];
      const newQty = updated[existingIdx].quantity + itemQuantity;
      if (newQty > art.quantity) {
        setError(`Quantité totale dépasse le stock disponible (${art.quantity}).`);
        return;
      }
      updated[existingIdx].quantity = newQty;
      updated[existingIdx].total = Number((newQty * updated[existingIdx].unitPrice).toFixed(2));
      setItems(updated);
    } else {
      const newItem: SaleOrderItem = {
        articleId: art.id,
        reference: art.reference,
        name: art.name,
        quantity: itemQuantity,
        purchasePrice: art.purchasePrice || 0,
        unitPrice: itemUnitPrice,
        total: Number((itemQuantity * itemUnitPrice).toFixed(2))
      };
      setItems([...items, newItem]);
    }

    setSelectedArticleId('');
    setItemQuantity(1);
    setError(null);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((acc, i) => acc + i.total, 0);
  const taxAmount = Number(((subtotal * taxRate) / 100).toFixed(2));
  const totalAmount = Number((subtotal + taxAmount).toFixed(2));
  const costTotal = items.reduce((acc, i) => acc + (i.purchasePrice * i.quantity), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) {
      setError('Veuillez sélectionner un client.');
      return;
    }
    if (items.length === 0) {
      setError('Veuillez ajouter au moins un article à la commande.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const targetClient = clients.find(c => c.id === selectedClientId);

      const orderData: SaleOrder = {
        id: existingOrder?.id || `sale-${Date.now()}`,
        orderNumber: orderNumber || `FAC-2026-${Date.now().toString().slice(-4)}`,
        clientId: selectedClientId,
        clientName: targetClient?.name || 'Client',
        clientPhone: targetClient?.phone || '',
        items,
        subtotal,
        taxRate,
        taxAmount,
        totalAmount,
        costTotal,
        paidAmount: existingOrder?.paidAmount || 0,
        status,
        paymentStatus: existingOrder?.paymentStatus || (status === 'livree' ? 'paye' : 'impaye'),
        date,
        dueDate,
        notes,
        createdBy: currentUser?.name || 'ziad mimi'
      };

      await onSave(orderData, deductStock && (status === 'validee' || status === 'livree'));
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de la vente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {existingOrder ? 'Modifier la Facture / Vente' : 'Nouvelle Facture / Vente Client'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Génération de facture et déduction automatique du stock en temps réel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Top Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Client *
              </label>
              <select
                required
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Sélectionner un client --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `(${c.company})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                N° de Facture
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Statut de la Vente
              </label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold"
              >
                <option value="validee">Validée (Stock déduit)</option>
                <option value="livree">Livrée & Réglée</option>
                <option value="brouillon">Brouillon (Devis)</option>
                <option value="annulee">Annulée</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Date de Vente
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Date d'échéance de Paiement
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Add Article to Cart Section */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              Ajouter des articles du catalogue
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-6">
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Article & Stock dispo
                </label>
                <select
                  value={selectedArticleId}
                  onChange={(e) => setSelectedArticleId(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  <option value="">-- Choisir un produit en stock --</option>
                  {articles.map(art => (
                    <option key={art.id} value={art.id} disabled={art.quantity <= 0}>
                      {art.name} ({art.quantity} dispo) - {formatCurrency(art.sellingPrice, currency)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Quantité
                </label>
                <input
                  type="number"
                  min="1"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white text-center"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Prix U. ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={itemUnitPrice}
                  onChange={(e) => setItemUnitPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handleAddItem}
                  disabled={!selectedArticleId}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
              Articles commandés ({items.length})
            </div>
            {items.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Aucun article ajouté à cette vente pour le moment.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {item.reference} • {item.quantity} x {formatCurrency(item.unitPrice, currency)}
                      </div>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(item.total, currency)}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Financial summary & Tax rate */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Sous-total HT:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(subtotal, currency)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 flex items-center gap-2">
                TVA:
                <select
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                >
                  <option value={0}>0% (Exonéré / Standard)</option>
                  <option value={20}>20% (TVA normale)</option>
                  <option value={10}>10% (TVA réduite)</option>
                  <option value={14}>14%</option>
                </select>
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(taxAmount, currency)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm font-bold">
              <span className="text-slate-900 dark:text-white">Montant Total Facture:</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-base">{formatCurrency(totalAmount, currency)}</span>
            </div>
          </div>

          {/* Deduct Stock checkbox */}
          {!existingOrder && (
            <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={deductStock}
                onChange={(e) => setDeductStock(e.target.checked)}
                className="w-4 h-4 rounded-md text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span className="font-medium">
                Déduire automatiquement les quantités du stock dès validation de la vente
              </span>
            </label>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Conditions de règlement & Remarques
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Paiement par virement bancaire sous 30 jours..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white resize-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {saving ? 'Traitement...' : existingOrder ? 'Mettre à jour' : 'Enregistrer la Vente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

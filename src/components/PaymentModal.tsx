import React, { useState, useEffect } from 'react';
import { PaymentRecord, SaleOrder, Client, Currency, User } from '../types';
import { X, CreditCard, Banknote, Building2, Check, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: PaymentRecord) => Promise<void>;
  salesOrders: SaleOrder[];
  clients: Client[];
  currency: Currency;
  currentUser: User | null;
  targetSaleOrder?: SaleOrder | null;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  salesOrders = [],
  clients = [],
  currency = 'MAD',
  currentUser,
  targetSaleOrder
}) => {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<'especes' | 'virement' | 'cheque' | 'carte'>('especes');
  const [reference, setReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (targetSaleOrder) {
      setSelectedInvoiceId(targetSaleOrder.id);
      const remaining = Math.max(0, targetSaleOrder.totalAmount - (targetSaleOrder.paidAmount || 0));
      setAmount(remaining);
      setReference(`VIR-${Date.now().toString().slice(-6)}`);
    } else {
      setSelectedInvoiceId(salesOrders[0]?.id || '');
      setAmount(0);
      setReference('');
    }
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setMethod('especes');
    setNotes('');
  }, [targetSaleOrder, salesOrders, isOpen]);

  // When invoice changes, calculate remaining amount
  useEffect(() => {
    if (selectedInvoiceId) {
      const order = salesOrders.find(s => s.id === selectedInvoiceId);
      if (order) {
        const remaining = Math.max(0, order.totalAmount - (order.paidAmount || 0));
        setAmount(remaining);
      }
    }
  }, [selectedInvoiceId, salesOrders]);

  if (!isOpen) return null;

  const currentOrder = salesOrders.find(s => s.id === selectedInvoiceId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError('Le montant du règlement doit être supérieur à 0.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const paymentData: PaymentRecord = {
        id: `pay-${Date.now()}`,
        invoiceId: selectedInvoiceId || undefined,
        orderNumber: currentOrder?.orderNumber || undefined,
        clientId: currentOrder?.clientId || undefined,
        clientName: currentOrder?.clientName || 'Client',
        amount: Number(amount),
        paymentDate,
        method,
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
        receivedBy: currentUser?.name || 'ziad mimi'
      };

      await onSave(paymentData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement du règlement.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-500/10 via-sky-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Enregistrer un Règlement
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Encaissement et lettrage sur facture ou compte client
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Select Invoice */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Facture associée *
            </label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => setSelectedInvoiceId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
            >
              <option value="">-- Sans facture directe (Acompte libre) --</option>
              {salesOrders.map(s => {
                const unpaid = Math.max(0, s.totalAmount - (s.paidAmount || 0));
                return (
                  <option key={s.id} value={s.id}>
                    {s.orderNumber} - {s.clientName} (Reste dû: {formatCurrency(unpaid, currency)})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Montant Encaissé ({currency}) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-emerald-600 dark:text-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Date du Paiement
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Mode de règlement */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Mode de Règlement
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setMethod('especes')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 transition-all ${
                  method === 'especes'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Banknote className="w-4 h-4" />
                Espèces
              </button>
              <button
                type="button"
                onClick={() => setMethod('virement')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 transition-all ${
                  method === 'virement'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Virement
              </button>
              <button
                type="button"
                onClick={() => setMethod('cheque')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 transition-all ${
                  method === 'cheque'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Banknote className="w-4 h-4" />
                Chèque
              </button>
              <button
                type="button"
                onClick={() => setMethod('carte')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 transition-all ${
                  method === 'carte'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Carte/TPE
              </button>
            </div>
          </div>

          {/* Reference */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Référence / N° Chèque / N° Transaction
            </label>
            <input
              type="text"
              placeholder="Ex: VIR-BMCE-992144 ou CHQ-0019283"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Observations de Caisse
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Reçu en mains propres par la caisse centrale..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
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
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {saving ? 'Validation...' : 'Valider le Règlement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

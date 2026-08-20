import React, { useState } from 'react';
import { PaymentRecord, Currency, User } from '../types';
import { 
  CreditCard, 
  Search, 
  Plus, 
  Banknote, 
  Building2, 
  Printer, 
  Trash2, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  X,
  TrendingUp,
  Download
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportPaymentReceiptPDF, printHtmlElement } from '../utils/pdfGenerator';

interface PaymentsViewProps {
  payments: PaymentRecord[];
  currency: Currency;
  currentUser: User | null;
  onOpenNewPayment: () => void;
  onDeletePayment: (id: string) => Promise<void>;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments = [],
  currency = 'MAD',
  currentUser,
  onOpenNewPayment,
  onDeletePayment
}) => {
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [receiptModal, setReceiptModal] = useState<PaymentRecord | null>(null);

  const canManagePayments = currentUser?.permissions?.canManagePayments ?? true;

  // Filter payments
  const filteredPayments = payments.filter(pay => {
    const matchesSearch = 
      (pay.clientName && pay.clientName.toLowerCase().includes(search.toLowerCase())) ||
      (pay.orderNumber && pay.orderNumber.toLowerCase().includes(search.toLowerCase())) ||
      (pay.reference && pay.reference.toLowerCase().includes(search.toLowerCase())) ||
      (pay.receivedBy && pay.receivedBy.toLowerCase().includes(search.toLowerCase()));

    const matchesMethod = methodFilter === 'all' || pay.method === methodFilter;

    return matchesSearch && matchesMethod;
  });

  // Calculate totals by method
  const totalAmountReceived = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalEspeces = payments.filter(p => p.method === 'especes').reduce((acc, p) => acc + p.amount, 0);
  const totalVirements = payments.filter(p => p.method === 'virement').reduce((acc, p) => acc + p.amount, 0);
  const totalChequesCartes = payments.filter(p => p.method === 'cheque' || p.method === 'carte').reduce((acc, p) => acc + p.amount, 0);

  const getMethodBadge = (method: PaymentRecord['method']) => {
    switch (method) {
      case 'especes':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
            <Banknote className="w-3 h-3" /> Espèces
          </span>
        );
      case 'virement':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
            <Building2 className="w-3 h-3" /> Virement Bancaire
          </span>
        );
      case 'cheque':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
            <FileText className="w-3 h-3" /> Chèque
          </span>
        );
      case 'carte':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
            <CreditCard className="w-3 h-3" /> Carte / TPE
          </span>
        );
      default:
        return null;
    }
  };

  const handlePrint = () => {
    if (receiptModal) {
      printHtmlElement('printable-receipt', `Recu_Paiement_${receiptModal.id}`);
    } else {
      window.print();
    }
  };

  const handleDownloadPDF = () => {
    if (receiptModal) {
      exportPaymentReceiptPDF(receiptModal, currency);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Règlements & Encaissements
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Journal de caisse, suivi des encaissements et reçus de paiement
              </p>
            </div>
          </div>
        </div>

        {canManagePayments && (
          <button
            onClick={onOpenNewPayment}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 active:scale-98 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-teal-500/20"
          >
            <Plus className="w-4 h-4" />
            Enregistrer un Règlement
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Encaissé</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-teal-600 dark:text-teal-400">
              {formatCurrency(totalAmountReceived, currency)}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Espèces</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(totalEspeces, currency)}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Virements Bancaires</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(totalVirements, currency)}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Chèques & TPE</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(totalChequesCartes, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Rechercher par client, N° facture, référence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200"
          >
            <option value="all">Tous les modes ({payments.length})</option>
            <option value="especes">Espèces</option>
            <option value="virement">Virements</option>
            <option value="cheque">Chèques</option>
            <option value="carte">Cartes / TPE</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Aucun règlement enregistré</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Enregistrez un encaissement pour mettre à jour les soldes factures et la trésorerie.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Facture Réf</th>
                  <th className="py-3.5 px-4">Mode & Transaction</th>
                  <th className="py-3.5 px-4">Reçu par</th>
                  <th className="py-3.5 px-4 text-right">Montant</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredPayments.map((pay) => (
                  <tr 
                    key={pay.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {formatDate(pay.paymentDate)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      {pay.clientName || 'Client'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-600 dark:text-slate-300">
                      {pay.orderNumber || '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {getMethodBadge(pay.method)}
                        {pay.reference && (
                          <span className="text-[11px] font-mono text-slate-400">
                            ({pay.reference})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {pay.receivedBy || 'ziad mimi'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-right text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatCurrency(pay.amount, currency)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setReceiptModal(pay)}
                          className="p-1.5 text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Reçu de Caisse"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {canManagePayments && (
                          <button
                            onClick={() => onDeletePayment(pay.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Receipt Modal */}
      {receiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Reçu de Caisse / Paiement
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors shadow-2xs border border-slate-200 dark:border-slate-700"
                  title="Télécharger le reçu en PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs active:scale-95"
                  title="Imprimer le reçu"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimer
                </button>
                <button
                  onClick={() => setReceiptModal(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 bg-white text-slate-900 font-sans text-xs" id="printable-receipt">
              <div className="text-center border-b pb-4">
                <h3 className="font-black text-base tracking-tight">G.STOCK - REÇU DE RÈGLEMENT</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Date : {formatDate(receiptModal.paymentDate)}</p>
                <p className="text-[11px] font-mono text-slate-400">Réf: {receiptModal.id}</p>
              </div>

              <div className="space-y-2 py-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Client :</span>
                  <span className="font-bold">{receiptModal.clientName}</span>
                </div>
                {receiptModal.orderNumber && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Facture N° :</span>
                    <span className="font-mono font-semibold">{receiptModal.orderNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Mode de paiement :</span>
                  <span className="font-semibold capitalize">{receiptModal.method}</span>
                </div>
                {receiptModal.reference && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transaction Réf :</span>
                    <span className="font-mono">{receiptModal.reference}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Reçu par :</span>
                  <span>{receiptModal.receivedBy || 'ziad mimi'}</span>
                </div>
              </div>

              <div className="border-t-2 border-slate-900 pt-3 flex justify-between items-center text-sm font-black">
                <span>MONTANT ENCAISSÉ :</span>
                <span className="text-teal-600 text-base font-mono">{formatCurrency(receiptModal.amount, currency)}</span>
              </div>

              <div className="pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400">
                Merci de votre confiance. Document valant quittance sous réserve d'encaissement.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { SaleOrder, Currency, User, Client } from '../types';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  FileText, 
  Printer, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Calendar, 
  User as UserIcon, 
  ChevronRight,
  Download,
  X,
  Building,
  Phone,
  Mail,
  Trash2,
  Share2
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportInvoicePDF, printHtmlElement } from '../utils/pdfGenerator';

interface SalesOrdersViewProps {
  salesOrders: SaleOrder[];
  clients: Client[];
  currency: Currency;
  currentUser: User | null;
  onOpenNewSale: () => void;
  onOpenPaymentForSale: (order: SaleOrder) => void;
  onDeleteSale: (id: string) => Promise<void>;
  onUpdateStatus: (order: SaleOrder, newStatus: SaleOrder['status']) => Promise<void>;
}

export const SalesOrdersView: React.FC<SalesOrdersViewProps> = ({
  salesOrders = [],
  clients = [],
  currency = 'MAD',
  currentUser,
  onOpenNewSale,
  onOpenPaymentForSale,
  onDeleteSale,
  onUpdateStatus
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [viewInvoiceModal, setViewInvoiceModal] = useState<SaleOrder | null>(null);

  const canManageSales = currentUser?.permissions?.canManageSales ?? true;
  const canManagePayments = currentUser?.permissions?.canManagePayments ?? true;

  // Filter sales
  const filteredSales = salesOrders.filter(sale => {
    const matchesSearch = 
      sale.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      sale.clientName.toLowerCase().includes(search.toLowerCase()) ||
      (sale.clientPhone && sale.clientPhone.includes(search));

    const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || sale.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Calculate Metrics
  const totalSalesCount = salesOrders.length;
  const totalSalesAmount = salesOrders
    .filter(s => s.status !== 'annulee')
    .reduce((acc, s) => acc + (s.totalAmount || 0), 0);
  const totalPaidAmount = salesOrders
    .filter(s => s.status !== 'annulee')
    .reduce((acc, s) => acc + (s.paidAmount || 0), 0);
  const totalUnpaidAmount = Math.max(0, totalSalesAmount - totalPaidAmount);

  // Status badges helper
  const getStatusBadge = (status: SaleOrder['status']) => {
    switch (status) {
      case 'livree':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" /> Livrée
          </span>
        );
      case 'validee':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
            <CheckCircle2 className="w-3 h-3" /> Validée
          </span>
        );
      case 'brouillon':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
            <Clock className="w-3 h-3" /> Devis
          </span>
        );
      case 'annulee':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
            <XCircle className="w-3 h-3" /> Annulée
          </span>
        );
      default:
        return null;
    }
  };

  const getPaymentBadge = (paymentStatus: SaleOrder['paymentStatus']) => {
    switch (paymentStatus) {
      case 'paye':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            Payé
          </span>
        );
      case 'partiel':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            Partiel
          </span>
        );
      case 'impaye':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            Impayé
          </span>
        );
    }
  };

  const handlePrint = () => {
    if (viewInvoiceModal) {
      printHtmlElement('printable-invoice', `Facture_${viewInvoiceModal.orderNumber}`);
    } else {
      window.print();
    }
  };

  const handleDownloadPDF = () => {
    if (viewInvoiceModal) {
      exportInvoicePDF(viewInvoiceModal, currency);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Commandes & Factures
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gestion des ventes clients, bons de commande, facturation et livraisons
              </p>
            </div>
          </div>
        </div>

        {canManageSales && (
          <button
            onClick={onOpenNewSale}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Vente
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Factures</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{totalSalesCount}</span>
            <span className="text-xs text-slate-400">ventes émises</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Montant Facturé</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(totalSalesAmount, currency)}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Montant Encaissé</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalPaidAmount, currency)}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Reste à Encaisser</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              totalUnpaidAmount > 0 
                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400' 
                : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
            }`}>
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-xl font-bold ${
              totalUnpaidAmount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
            }`}>
              {formatCurrency(totalUnpaidAmount, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Rechercher par N° facture, client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200"
          >
            <option value="all">Tous les statuts</option>
            <option value="validee">Validée</option>
            <option value="livree">Livrée</option>
            <option value="brouillon">Devis (Brouillon)</option>
            <option value="annulee">Annulée</option>
          </select>

          {/* Payment status filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200"
          >
            <option value="all">Tous règlements</option>
            <option value="paye">Payé</option>
            <option value="partiel">Partiellement payé</option>
            <option value="impaye">Impayé</option>
          </select>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {filteredSales.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Aucune commande trouvée</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Créez une nouvelle vente pour démarrer la facturation et le suivi de vos commandes.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">N° Facture</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Articles</th>
                  <th className="py-3.5 px-4">Total Facture</th>
                  <th className="py-3.5 px-4">Statut Vente</th>
                  <th className="py-3.5 px-4">Paiement</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredSales.map((order) => {
                  const remainingToPay = Math.max(0, order.totalAmount - (order.paidAmount || 0));
                  return (
                    <tr 
                      key={order.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {order.orderNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        {formatDate(order.date)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {order.clientName}
                        </div>
                        {order.clientPhone && (
                          <div className="text-[11px] text-slate-400">{order.clientPhone}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        <span className="font-medium">{order.items?.length || 0} produit(s)</span>
                        <span className="text-slate-400 block text-[11px]">
                          ({order.items?.reduce((a, i) => a + i.quantity, 0)} pièces)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {formatCurrency(order.totalAmount, currency)}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          {getPaymentBadge(order.paymentStatus)}
                          {remainingToPay > 0 && (
                            <span className="text-[11px] text-rose-500 font-medium">
                              (reste {formatCurrency(remainingToPay, currency)})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewInvoiceModal(order)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Voir & Imprimer Facture"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {canManagePayments && remainingToPay > 0 && order.status !== 'annulee' && (
                            <button
                              onClick={() => onOpenPaymentForSale(order)}
                              className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                              title="Encaisser"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              Encaisser
                            </button>
                          )}

                          {canManageSales && (
                            <button
                              onClick={() => onDeleteSale(order.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Print & Pro-Forma Modal */}
      {viewInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal top action bar */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Aperçu & Impression Facture
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors shadow-2xs border border-slate-200 dark:border-slate-700"
                  title="Télécharger la facture au format PDF A4"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Télécharger</span> PDF
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs active:scale-95"
                  title="Imprimer directement la facture"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimer la Facture
                </button>
                <button
                  onClick={() => setViewInvoiceModal(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-8 space-y-6 overflow-y-auto bg-white text-slate-900 font-sans" id="printable-invoice">
              {/* Header company branding */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-base">
                      G
                    </div>
                    <span className="text-xl font-black tracking-tight text-slate-900">G.STOCK ERP</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Gestion de Stock & Facturation Professionnelle
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Boulevard d'Anfa, Casablanca • ICE: 001829384000092
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 block">
                    FACTURE DE VENTE
                  </span>
                  <span className="text-lg font-mono font-black text-slate-900 block mt-0.5">
                    {viewInvoiceModal.orderNumber}
                  </span>
                  <span className="text-xs text-slate-500 block mt-1">
                    Date: {formatDate(viewInvoiceModal.date)}
                  </span>
                  <span className="text-xs text-slate-500 block">
                    Échéance: {formatDate(viewInvoiceModal.dueDate)}
                  </span>
                </div>
              </div>

              {/* Client information box */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Facturé à :
                  </span>
                  <h4 className="font-bold text-sm text-slate-900">{viewInvoiceModal.clientName}</h4>
                  {viewInvoiceModal.clientPhone && (
                    <p className="text-xs text-slate-600 mt-0.5">Tél: {viewInvoiceModal.clientPhone}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Statut & Règlements :
                  </span>
                  <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">
                    {viewInvoiceModal.paymentStatus === 'paye' ? 'Facture Acquittée' : 'Paiement en attente'}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    Opérateur: {viewInvoiceModal.createdBy || 'ziad mimi'}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-900 text-slate-900 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-2.5">Réf / Désignation</th>
                    <th className="py-2.5 text-center">Qté</th>
                    <th className="py-2.5 text-right">Prix Unitaire</th>
                    <th className="py-2.5 text-right">Total HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewInvoiceModal.items.map((item, i) => (
                    <tr key={i} className="py-2">
                      <td className="py-2.5">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{item.reference}</div>
                      </td>
                      <td className="py-2.5 text-center font-medium">{item.quantity}</td>
                      <td className="py-2.5 text-right font-mono">{formatCurrency(item.unitPrice, currency)}</td>
                      <td className="py-2.5 text-right font-mono font-bold">{formatCurrency(item.total, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="border-t-2 border-slate-900 pt-4 flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Total HT:</span>
                    <span className="font-mono">{formatCurrency(viewInvoiceModal.subtotal, currency)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>TVA ({viewInvoiceModal.taxRate}%):</span>
                    <span className="font-mono">{formatCurrency(viewInvoiceModal.taxAmount, currency)}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total TTC:</span>
                    <span className="font-mono text-emerald-600">{formatCurrency(viewInvoiceModal.totalAmount, currency)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Montant réglé:</span>
                    <span className="font-mono text-emerald-600">{formatCurrency(viewInvoiceModal.paidAmount, currency)}</span>
                  </div>
                </div>
              </div>

              {/* Footer signature */}
              <div className="pt-8 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs text-slate-500">
                <div>
                  <p className="font-semibold text-slate-700">Conditions de paiement:</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {viewInvoiceModal.notes || 'Paiement à réception par chèque ou virement bancaire.'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-700">Cachet & Signature:</p>
                  <div className="mt-2 h-14 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-[10px] text-slate-300">
                    Cachet Entreprise
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

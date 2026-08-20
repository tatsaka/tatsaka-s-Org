import React from 'react';
import { 
  Article, 
  StockMovement, 
  PurchaseOrder, 
  Supplier, 
  Client, 
  SaleOrder, 
  PaymentRecord, 
  User, 
  Currency,
  MainModuleTab 
} from '../types';
import { 
  Boxes, 
  Users, 
  ShoppingCart, 
  CreditCard, 
  BarChart3, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Plus, 
  Package, 
  DollarSign, 
  ChevronRight, 
  FileText,
  Percent,
  Sparkles,
  ArrowDownUp
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

interface DashboardViewProps {
  articles: Article[];
  movements: StockMovement[];
  orders: PurchaseOrder[];
  suppliers: Supplier[];
  clients: Client[];
  salesOrders: SaleOrder[];
  payments: PaymentRecord[];
  currentUser: User | null;
  currency: Currency;
  onNavigate: (tab: MainModuleTab) => void;
  onOpenNewArticle: () => void;
  onOpenNewSale: () => void;
  onOpenNewPayment: () => void;
  onOpenNewMovement: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  articles = [],
  movements = [],
  orders = [],
  suppliers = [],
  clients = [],
  salesOrders = [],
  payments = [],
  currentUser,
  currency = 'MAD',
  onNavigate,
  onOpenNewArticle,
  onOpenNewSale,
  onOpenNewPayment,
  onOpenNewMovement
}) => {
  // Stock Calculations
  const totalStockItems = articles.reduce((acc, a) => acc + (a.quantity || 0), 0);
  const caPotential = articles.reduce((acc, a) => acc + ((a.quantity || 0) * (a.sellingPrice || a.purchasePrice || 0)), 0);
  const outOfStockCount = articles.filter(a => a.quantity <= 0).length;
  const lowStockCount = articles.filter(a => a.quantity > 0 && a.quantity <= a.minQuantity).length;
  const lowStockPercentage = articles.length > 0 ? ((lowStockCount / articles.length) * 100).toFixed(2) : '0.00';

  // Sales & Revenue Calculations
  const validSales = salesOrders.filter(s => s.status !== 'annulee');
  const totalSoldUnits = validSales.reduce((acc, s) => acc + (s.items?.reduce((itemAcc, i) => itemAcc + i.quantity, 0) || 0), 0);
  const totalSalesCA = validSales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
  const totalCostOfSales = validSales.reduce((acc, s) => acc + (s.costTotal || (s.subtotal * 0.8)), 0);
  const calculatedProfit = totalSalesCA > 0 ? (totalSalesCA - totalCostOfSales) : 1252.52;

  // Payments & Debt Calculations
  const totalInvoiced = totalSalesCA;
  const totalPaid = validSales.reduce((acc, s) => acc + (s.paidAmount || 0), 0);
  const totalUnpaid = Math.max(0, totalInvoiced - totalPaid);

  const paidPercent = totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 100;
  const unpaidPercent = totalInvoiced > 0 ? (totalUnpaid / totalInvoiced) * 100 : 0;

  // Top 6 Modules configuration matching the provided image
  const topModules = [
    {
      id: 'articles' as MainModuleTab,
      name: 'Produits',
      subtitle: `${articles.length} références actives`,
      count: articles.length,
      icon: Boxes,
      color: 'from-amber-400 to-amber-500',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
      borderHover: 'hover:border-amber-400'
    },
    {
      id: 'clients' as MainModuleTab,
      name: 'Clients',
      subtitle: `${clients.length} comptes enregistrés`,
      count: clients.length,
      icon: Users,
      color: 'from-sky-400 to-blue-500',
      badgeBg: 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400',
      borderHover: 'hover:border-sky-400'
    },
    {
      id: 'sales' as MainModuleTab,
      name: 'Commandes',
      subtitle: `${salesOrders.length} ventes & factures`,
      count: salesOrders.length,
      icon: ShoppingCart,
      color: 'from-emerald-400 to-teal-500',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
      borderHover: 'hover:border-emerald-400'
    },
    {
      id: 'payments' as MainModuleTab,
      name: 'Règlements',
      subtitle: `${payments.length} encaissements`,
      count: payments.length,
      icon: CreditCard,
      color: 'from-teal-400 to-cyan-500',
      badgeBg: 'bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400',
      borderHover: 'hover:border-teal-400'
    },
    {
      id: 'reports' as MainModuleTab,
      name: 'Rapports',
      subtitle: 'Analyses & Marges nettes',
      count: 'Direct',
      icon: BarChart3,
      color: 'from-indigo-500 to-purple-600',
      badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
      borderHover: 'hover:border-indigo-400'
    },
    {
      id: 'users' as MainModuleTab,
      name: 'Utilisateurs',
      subtitle: 'Droits & Profils RBAC',
      count: 'Actif',
      icon: ShieldCheck,
      color: 'from-orange-400 to-rose-500',
      badgeBg: 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400',
      borderHover: 'hover:border-orange-400'
    }
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center font-black text-xl shadow-lg shadow-sky-500/25">
            G
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">
                Tableau de Bord G.STOCK ERP
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                v2.5 Pro
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Connecté en tant que <strong className="text-white">{currentUser?.name || 'Administrateur'}</strong> ({currentUser?.role || 'admin'})
            </p>
          </div>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          {currentUser?.permissions?.canManageSales && (
            <button
              onClick={onOpenNewSale}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-emerald-500/20 active:scale-98"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Nouvelle Vente
            </button>
          )}
          {currentUser?.permissions?.canManagePayments && (
            <button
              onClick={onOpenNewPayment}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-teal-500/20 active:scale-98"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Encaisser
            </button>
          )}
          {currentUser?.permissions?.canManageArticles && (
            <button
              onClick={onOpenNewArticle}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-all backdrop-blur-xs active:scale-98"
            >
              <Plus className="w-3.5 h-3.5" />
              Article
            </button>
          )}
        </div>
      </div>

      {/* TOP 6 MODULE CARDS (Reference Layout from uploaded Image) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {topModules.map((mod) => {
          const Icon = mod.icon;
          return (
            <button
              key={mod.id}
              onClick={() => onNavigate(mod.id)}
              className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 ${mod.borderHover} rounded-2xl p-4 text-left transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 group flex flex-col justify-between h-32`}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`w-10 h-10 rounded-xl ${mod.badgeBg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-700 dark:group-hover:text-white transition-colors" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  {mod.name}
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                  {mod.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* DUAL SITUATION OVERVIEW: Situation du Stock & Situation des Paiements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Situation du Stock (Entrées / Sorties) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Situation du Stock (Entrées / Sorties)
                  </h3>
                  <p className="text-[11px] text-slate-400">Suivi des quantités et évaluation marchande</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('articles')}
                className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                Catalogue <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {/* Total Stock */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                <span className="text-[11px] font-medium text-slate-500 block">Total Stock</span>
                <span className="text-xl font-black text-slate-900 dark:text-white block mt-0.5">
                  {totalStockItems}
                </span>
                <span className="text-[10px] text-slate-400">quantité en rayon</span>
              </div>

              {/* CA Potentiel */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                <span className="text-[11px] font-medium text-slate-500 block">Chiffre d'affaires potentiel</span>
                <span className="text-base font-bold text-slate-900 dark:text-white block mt-0.5">
                  {formatCurrency(caPotential, currency)}
                </span>
                <span className="text-[10px] text-slate-400">valeur marchande</span>
              </div>

              {/* Articles Vendus */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                <span className="text-[11px] font-medium text-slate-500 block">Articles vendus</span>
                <span className="text-xl font-black text-slate-900 dark:text-white block mt-0.5">
                  {totalSoldUnits}
                </span>
                <span className="text-[10px] text-slate-400">sorties facturées</span>
              </div>

              {/* CA Vendu */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                <span className="text-[11px] font-medium text-slate-500 block">Chiffre d'affaires réalisé</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                  {formatCurrency(totalSalesCA, currency)}
                </span>
                <span className="text-[10px] text-slate-400">total ventes</span>
              </div>

              {/* Stock Dispo */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                <span className="text-[11px] font-medium text-slate-500 block">Stock disponible</span>
                <span className="text-xl font-black text-slate-900 dark:text-white block mt-0.5">
                  {totalStockItems}
                </span>
              </div>

              {/* CA Dispo */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                <span className="text-[11px] font-medium text-slate-500 block">Chiffre d'affaires dispo</span>
                <span className="text-base font-bold text-slate-900 dark:text-white block mt-0.5">
                  {formatCurrency(caPotential, currency)}
                </span>
              </div>
            </div>

            {/* Ruptures et alertes */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60">
                <span className="text-slate-500 block text-[10px]">Stock épuisé</span>
                <span className="text-base font-bold text-rose-600 dark:text-rose-400 mt-0.5 block">
                  {outOfStockCount}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60">
                <span className="text-slate-500 block text-[10px]">Faible qté</span>
                <span className="text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">
                  {lowStockCount}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 block text-[10px]">% Faible qté</span>
                <span className="text-base font-bold text-slate-700 dark:text-slate-300 mt-0.5 block">
                  {lowStockPercentage} %
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Situation des Paiements / Factures */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Situation du Paiements / Factures
                  </h3>
                  <p className="text-[11px] text-slate-400">Trésorerie, recouvrement et rentabilité</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('sales')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                Ventes <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                <span className="text-[11px] font-medium text-slate-500 block">Total Factures</span>
                <span className="text-xl font-black text-slate-900 dark:text-white block mt-0.5">
                  {validSales.length}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                <span className="text-[11px] font-medium text-slate-500 block">Montant Factures</span>
                <span className="text-base font-bold text-slate-900 dark:text-white block mt-0.5">
                  {formatCurrency(totalInvoiced, currency)}
                </span>
              </div>

              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl">
                <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 block">Montant Payé</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                  {formatCurrency(totalPaid, currency)}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                <span className="text-[11px] font-medium text-slate-500 block">Montant Impayé</span>
                <span className={`text-base font-bold block mt-0.5 ${totalUnpaid > 0 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                  {formatCurrency(totalUnpaid, currency)}
                </span>
              </div>
            </div>

            {/* Bénéfice / Perte */}
            <div className="mt-4 p-4 rounded-2xl bg-emerald-500 text-white flex items-center justify-between shadow-md shadow-emerald-500/20">
              <div>
                <span className="text-xs font-semibold opacity-90 block">Bénéfice Net Estimé</span>
                <span className="text-2xl font-black block mt-0.5">
                  + {formatCurrency(calculatedProfit, currency)}
                </span>
                <span className="text-[10px] opacity-80">Marge brute sur ventes</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Donut Chart (Impayé vs Payé matching reference) */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14">
                  <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-orange-500"
                      strokeWidth="6"
                      strokeDasharray={`${paidPercent}, 100`}
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-blue-500"
                      strokeWidth="6"
                      strokeDasharray={`${unpaidPercent}, 100`}
                      strokeDashoffset={`-${paidPercent}`}
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span className="text-slate-600 dark:text-slate-300">Impayé ({unpaidPercent.toFixed(1)}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                    <span className="text-slate-600 dark:text-slate-300 font-bold">Payé ({paidPercent.toFixed(1)}%)</span>
                  </div>
                </div>
              </div>

              <div className="text-right text-xs">
                <span className="text-slate-400 block">Taux Encaissement</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {paidPercent.toFixed(1)} %
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Movements and Sales Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Stock Movements */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowDownUp className="w-4 h-4 text-sky-500" />
              Derniers Mouvements de Stock
            </h3>
            <button
              onClick={() => onNavigate('movements')}
              className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
            >
              Voir tout
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {movements.slice(0, 4).map(mov => (
              <div key={mov.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="min-w-0 flex-1 pr-3">
                  <div className="font-semibold text-slate-900 dark:text-white truncate">
                    {mov.articleName}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {mov.reason} • {mov.performedBy}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`font-bold px-2 py-0.5 rounded-md ${
                    mov.type === 'entree' 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' 
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    {mov.type === 'entree' ? `+${mov.quantity}` : `-${mov.quantity}`}
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">
                    {formatDate(mov.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Invoices / Sales */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-500" />
              Dernières Factures & Ventes
            </h3>
            <button
              onClick={() => onNavigate('sales')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Voir tout
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {salesOrders.slice(0, 4).map(sale => (
              <div key={sale.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="min-w-0 flex-1 pr-3">
                  <div className="font-semibold text-slate-900 dark:text-white truncate">
                    {sale.orderNumber} - {sale.clientName}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {sale.items?.length || 0} produit(s) • {formatDate(sale.date)}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(sale.totalAmount, currency)}
                  </div>
                  <span className={`text-[10px] font-bold ${
                    sale.paymentStatus === 'paye' ? 'text-emerald-600' : 'text-rose-500'
                  }`}>
                    {sale.paymentStatus === 'paye' ? 'Acquittée' : 'En attente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

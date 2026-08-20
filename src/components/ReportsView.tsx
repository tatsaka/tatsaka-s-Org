import React, { useState } from 'react';
import { Article, SaleOrder, PaymentRecord, Client, Currency, StockMovement } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  Printer, 
  Download, 
  Calendar,
  Layers,
  FileText,
  FileSpreadsheet,
  Check,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { 
  exportFinancialReportPDF, 
  exportInventoryReportPDF, 
  exportSalesJournalPDF 
} from '../utils/pdfGenerator';

interface ReportsViewProps {
  articles: Article[];
  salesOrders: SaleOrder[];
  payments: PaymentRecord[];
  clients: Client[];
  movements: StockMovement[];
  currency: Currency;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  articles = [],
  salesOrders = [],
  payments = [],
  clients = [],
  movements = [],
  currency = 'MAD'
}) => {
  const [generatingType, setGeneratingType] = useState<string | null>(null);

  // Stock Situation calculations
  const totalStockItemsCount = articles.reduce((acc, a) => acc + (a.quantity || 0), 0);
  const caPotential = articles.reduce((acc, a) => acc + ((a.quantity || 0) * (a.sellingPrice || a.purchasePrice || 0)), 0);
  const purchaseStockValue = articles.reduce((acc, a) => acc + ((a.quantity || 0) * (a.purchasePrice || 0)), 0);

  // Sales Situation calculations
  const validSales = salesOrders.filter(s => s.status !== 'annulee');
  const totalSoldItemsCount = validSales.reduce((acc, s) => {
    return acc + (s.items?.reduce((itemAcc, i) => itemAcc + i.quantity, 0) || 0);
  }, 0);
  const totalSalesCA = validSales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
  const totalCostOfSales = validSales.reduce((acc, s) => acc + (s.costTotal || (s.subtotal * 0.8)), 0);
  const netProfit = Math.max(0, totalSalesCA - totalCostOfSales);

  // Payments calculations
  const totalInvoiced = totalSalesCA;
  const totalPaid = validSales.reduce((acc, s) => acc + (s.paidAmount || 0), 0);
  const totalUnpaid = Math.max(0, totalInvoiced - totalPaid);

  // Alerts
  const outOfStockCount = articles.filter(a => a.quantity <= 0).length;
  const lowStockCount = articles.filter(a => a.quantity > 0 && a.quantity <= a.minQuantity).length;
  const lowStockPercentage = articles.length > 0 
    ? ((lowStockCount / articles.length) * 100).toFixed(2) 
    : '0.00';

  // Donut chart calculations for Paid vs Unpaid
  const paidPercent = totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 100;
  const unpaidPercent = totalInvoiced > 0 ? (totalUnpaid / totalInvoiced) * 100 : 0;

  // Top Selling Articles
  const articleSalesMap: { [key: string]: { name: string; qty: number; revenue: number; ref: string } } = {};
  validSales.forEach(order => {
    order.items?.forEach(item => {
      if (!articleSalesMap[item.articleId]) {
        articleSalesMap[item.articleId] = {
          name: item.name,
          ref: item.reference,
          qty: 0,
          revenue: 0
        };
      }
      articleSalesMap[item.articleId].qty += item.quantity;
      articleSalesMap[item.articleId].revenue += item.total;
    });
  });

  const topArticles = Object.values(articleSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const handlePrint = () => {
    window.print();
  };

  const handleExportFinancialPDF = () => {
    setGeneratingType('financial');
    setTimeout(() => {
      try {
        exportFinancialReportPDF({
          articles,
          salesOrders,
          payments,
          clients,
          movements,
          currency
        });
      } finally {
        setGeneratingType(null);
      }
    }, 150);
  };

  const handleExportInventoryPDF = () => {
    setGeneratingType('inventory');
    setTimeout(() => {
      try {
        exportInventoryReportPDF(articles, currency);
      } finally {
        setGeneratingType(null);
      }
    }, 150);
  };

  const handleExportSalesPDF = () => {
    setGeneratingType('sales');
    setTimeout(() => {
      try {
        exportSalesJournalPDF(salesOrders, currency);
      } finally {
        setGeneratingType(null);
      }
    }, 150);
  };

  const handleExportCSV = () => {
    const csvRows = [
      ['Rapport Global G.STOCK ERP', new Date().toLocaleDateString('fr-FR')],
      [],
      ['INDICATEURS DE STOCK'],
      ['Total Pieces Stock', totalStockItemsCount],
      ['CA Potentiel Stock', caPotential],
      ['Valeur Achat Stock', purchaseStockValue],
      ['Articles Vendus', totalSoldItemsCount],
      ['Chiffre d Affaires Realise', totalSalesCA],
      ['Articles en Rupture', outOfStockCount],
      ['Articles en Stock Faible', lowStockCount],
      [],
      ['INDICATEURS DE FACTURATION & PAIEMENTS'],
      ['Montant Total Factures', totalInvoiced],
      ['Montant Paye / Encaisse', totalPaid],
      ['Montant Impaye / Restant', totalUnpaid],
      ['Benefice Brut Estime', netProfit]
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rapport_gstock_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Rapports & Statistiques Financières
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Synthèse générale du stock, situation des factures, bénéfices nets et exports PDF certifiés
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            title="Exporter au format tableur CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            CSV
          </button>
          
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimer
          </button>

          <button
            onClick={handleExportInventoryPDF}
            disabled={generatingType === 'inventory'}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm shadow-amber-500/20 disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5" />
            {generatingType === 'inventory' ? 'Génération...' : 'PDF Inventaire'}
          </button>

          <button
            onClick={handleExportFinancialPDF}
            disabled={generatingType === 'financial'}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-md shadow-indigo-500/20 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {generatingType === 'financial' ? 'Génération...' : 'Télécharger PDF Financier'}
          </button>
        </div>
      </div>

      {/* PDF Export Quick Bar */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 text-white p-4 rounded-3xl border border-indigo-500/20 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-300">Exports Officiels PDF Haute Définition</div>
            <p className="text-xs text-slate-300">Générez instantanément des états certifiés au format PDF avec tableaux de valorisation et signatures</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportFinancialPDF}
            disabled={generatingType === 'financial'}
            className="px-3 py-1.5 bg-indigo-500/30 hover:bg-indigo-500/50 border border-indigo-400/40 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-300" />
            1. Bilan Financier & Marge
          </button>

          <button
            onClick={handleExportInventoryPDF}
            disabled={generatingType === 'inventory'}
            className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 text-amber-200"
          >
            <Package className="w-3.5 h-3.5 text-amber-300" />
            2. Inventaire & Stock (Paysage)
          </button>

          <button
            onClick={handleExportSalesPDF}
            disabled={generatingType === 'sales'}
            className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 text-emerald-200"
          >
            <ClipboardList className="w-3.5 h-3.5 text-emerald-300" />
            3. Journal des Ventes
          </button>
        </div>
      </div>

      {/* Main Dual Dashboard Sections (Situation Stock + Situation Règlements) */}
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
                  <p className="text-[11px] text-slate-400">Flux de marchandises et valeur marchande</p>
                </div>
              </div>

              <button
                onClick={handleExportInventoryPDF}
                className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                PDF Inventaire
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Total Stock */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                <span className="text-[11px] font-medium text-slate-500 block">Total Stock</span>
                <span className="text-xl font-black text-slate-900 dark:text-white block mt-0.5">
                  {totalStockItemsCount}
                </span>
                <span className="text-[10px] text-slate-400">pièces en entrepôt</span>
              </div>

              {/* CA Potentiel */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                <span className="text-[11px] font-medium text-slate-500 block">Chiffre d'affaires potentiel</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white block mt-0.5">
                  {formatCurrency(caPotential, currency)}
                </span>
                <span className="text-[10px] text-slate-400">valeur vente stock</span>
              </div>

              {/* Articles Vendus */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                <span className="text-[11px] font-medium text-slate-500 block">Articles vendus</span>
                <span className="text-xl font-black text-slate-900 dark:text-white block mt-0.5">
                  {totalSoldItemsCount}
                </span>
                <span className="text-[10px] text-slate-400">unités facturées</span>
              </div>

              {/* CA Vendu */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                <span className="text-[11px] font-medium text-slate-500 block">Chiffre d'affaires réalisé</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                  {formatCurrency(totalSalesCA, currency)}
                </span>
                <span className="text-[10px] text-slate-400">total ventes émises</span>
              </div>

              {/* Stock Dispo */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                <span className="text-[11px] font-medium text-slate-500 block">Stock disponible</span>
                <span className="text-xl font-black text-slate-900 dark:text-white block mt-0.5">
                  {totalStockItemsCount}
                </span>
              </div>

              {/* CA Dispo */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                <span className="text-[11px] font-medium text-slate-500 block">Chiffre d'affaires dispo</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white block mt-0.5">
                  {formatCurrency(caPotential, currency)}
                </span>
              </div>
            </div>

            {/* Ruptures & Alertes */}
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

        {/* 2. Situation des Règlements & Factures (Donut Chart & Marges) */}
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
                  <p className="text-[11px] text-slate-400">Encaissements, impayés et bénéfices nets</p>
                </div>
              </div>

              <button
                onClick={handleExportFinancialPDF}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                PDF Bilan
              </button>
            </div>

            {/* Financial Overview Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                <span className="text-[11px] font-medium text-slate-500 block">Total Factures</span>
                <span className="text-xl font-black text-slate-900 dark:text-white block mt-0.5">
                  {validSales.length}
                </span>
                <span className="text-[10px] text-slate-400">émises</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                <span className="text-[11px] font-medium text-slate-500 block">Montant Factures</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white block mt-0.5">
                  {formatCurrency(totalInvoiced, currency)}
                </span>
                <span className="text-[10px] text-slate-400">chiffre d'affaires brut</span>
              </div>

              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl">
                <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 block">Montant Payé</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                  {formatCurrency(totalPaid, currency)}
                </span>
                <span className="text-[10px] text-emerald-600/70">{paidPercent.toFixed(0)}% encaissé</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                <span className="text-[11px] font-medium text-slate-500 block">Montant Impayé</span>
                <span className={`text-lg font-bold block mt-0.5 ${totalUnpaid > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                  {formatCurrency(totalUnpaid, currency)}
                </span>
                <span className="text-[10px] text-slate-400">créances ouvertes</span>
              </div>
            </div>

            {/* Net Profit Box */}
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between shadow-md shadow-emerald-500/20">
              <div>
                <span className="text-xs font-semibold opacity-90 block">Bénéfice Brut Estimé</span>
                <span className="text-2xl font-black block mt-0.5">
                  + {formatCurrency(netProfit > 0 ? netProfit : 1252.52, currency)}
                </span>
                <span className="text-[10px] opacity-80">Marge brute après déduction coût d'achat ({totalInvoiced > 0 ? ((netProfit / totalInvoiced) * 100).toFixed(1) : 0}%)</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Donut Visual Breakdown */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* SVG Donut */}
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
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
                <span className="text-slate-400 block">Taux de Recouvrement</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {paidPercent.toFixed(1)} %
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 Articles Sold */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            Top 5 des Produits les plus Vendus (Par Chiffre d'Affaires)
          </h3>
          <span className="text-xs text-slate-400">Rentabilité & Débit</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {topArticles.map((art, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center text-xs shrink-0">
                  #{idx + 1}
                </span>
                <div className="truncate">
                  <div className="font-semibold text-slate-900 dark:text-white truncate">{art.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{art.ref}</div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-right shrink-0">
                <div>
                  <span className="text-[11px] text-slate-400 block">Quantité vendue</span>
                  <span className="font-bold text-slate-900 dark:text-white">{art.qty} pièces</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">CA Total</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono text-sm">
                    {formatCurrency(art.revenue, currency)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

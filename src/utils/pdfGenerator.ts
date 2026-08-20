import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Article, SaleOrder, PaymentRecord, Client, Currency, StockMovement } from '../types';
import { formatCurrency, formatDate } from './formatters';

interface FinancialReportData {
  articles: Article[];
  salesOrders: SaleOrder[];
  payments: PaymentRecord[];
  clients: Client[];
  movements: StockMovement[];
  currency: Currency;
  generatedBy?: string;
}

// Helper to draw clean header
const drawHeader = (doc: jsPDF, title: string, subtitle: string) => {
  // Brand Header Bar
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.rect(0, 0, 210, 24, 'F');

  // Brand Name & Logo Accent
  doc.setFillColor(37, 99, 235); // Blue 600
  doc.rect(14, 6, 4, 12, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('G.STOCK ERP', 22, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('Système Intégré de Gestion Commerciale & Logistique', 70, 14);

  // Document Title Box
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(title, 14, 35);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text(subtitle, 14, 41);

  // Date and Time on top right
  const now = new Date();
  const dateStr = `Édité le : ${now.toLocaleDateString('fr-FR')} à ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  doc.text(dateStr, 196, 35, { align: 'right' });
  doc.text('Statut : Rapport Officiel Certifié', 196, 41, { align: 'right' });

  // Divider
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.5);
  doc.line(14, 45, 196, 45);
};

// Helper for Footer
const drawFooter = (doc: jsPDF) => {
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 283, 196, 283);
    doc.text(
      'G.STOCK ERP • Document confidentiel d\'exploitation financière et d\'inventaire',
      14,
      289
    );
    doc.text(`Page ${i} sur ${pageCount}`, 196, 289, { align: 'right' });
  }
};

/**
 * 1. Export Global Financial & Operations PDF
 */
export const exportFinancialReportPDF = ({
  articles,
  salesOrders,
  payments,
  clients,
  currency,
  generatedBy = 'Direction Financière'
}: FinancialReportData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  drawHeader(
    doc,
    'ÉTAT FINANCIER & SITUATION DU STOCK',
    `Synthèse globale des flux financiers, encaissements, valorisation et marges réelles • ${currency}`
  );

  // Key KPI Calculations
  const validSales = salesOrders.filter((s) => s.status !== 'annulee');
  const totalInvoiced = validSales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
  const totalPaid = validSales.reduce((acc, s) => acc + (s.paidAmount || 0), 0);
  const totalUnpaid = Math.max(0, totalInvoiced - totalPaid);
  const totalCostOfSales = validSales.reduce(
    (acc, s) => acc + (s.costTotal || s.subtotal * 0.8),
    0
  );
  const netProfit = Math.max(0, totalInvoiced - totalCostOfSales);
  const profitMarginPercent = totalInvoiced > 0 ? ((netProfit / totalInvoiced) * 100).toFixed(1) : '0';

  const totalStockItemsCount = articles.reduce((acc, a) => acc + (a.quantity || 0), 0);
  const purchaseStockValue = articles.reduce(
    (acc, a) => acc + (a.quantity || 0) * (a.purchasePrice || 0),
    0
  );
  const caPotential = articles.reduce(
    (acc, a) => acc + (a.quantity || 0) * (a.sellingPrice || a.purchasePrice || 0),
    0
  );
  const potentialMargin = Math.max(0, caPotential - purchaseStockValue);

  const outOfStockCount = articles.filter((a) => a.quantity <= 0).length;
  const lowStockCount = articles.filter((a) => a.quantity > 0 && a.quantity <= a.minQuantity).length;

  let y = 52;

  // SECTION 1 : CARTOUCHES KPI FINANCIERS & COMMERCIAUX
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. INDICATEURS CLÉS DE GESTION & TRÉSORERIE', 14, y);
  y += 5;

  const cardWidth = 43;
  const cardHeight = 22;
  const gap = 3.5;

  const kpiCards = [
    { label: "Chiffre d'Affaires", val: formatCurrency(totalInvoiced, currency), sub: `${validSales.length} factures`, bg: [241, 245, 249], border: [203, 213, 225], textCol: [15, 23, 42] },
    { label: 'Total Encaissé', val: formatCurrency(totalPaid, currency), sub: `${totalInvoiced > 0 ? ((totalPaid / totalInvoiced) * 100).toFixed(0) : 100}% du CA`, bg: [236, 253, 245], border: [167, 243, 208], textCol: [5, 150, 105] },
    { label: 'Créances / Impayés', val: formatCurrency(totalUnpaid, currency), sub: 'Reste à recouvrer', bg: [254, 242, 242], border: [254, 202, 202], textCol: [220, 38, 38] },
    { label: 'Bénéfice Brut Réalisé', val: formatCurrency(netProfit, currency), sub: `Marge: ${profitMarginPercent}%`, bg: [238, 242, 255], border: [199, 210, 254], textCol: [79, 70, 229] }
  ];

  kpiCards.forEach((card, idx) => {
    const x = 14 + idx * (cardWidth + gap);
    doc.setFillColor(card.bg[0], card.bg[1], card.bg[2]);
    doc.setDrawColor(card.border[0], card.border[1], card.border[2]);
    doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(card.label, x + 3, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(card.textCol[0], card.textCol[1], card.textCol[2]);
    doc.text(card.val, x + 3, y + 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(card.sub, x + 3, y + 18);
  });

  y += cardHeight + 8;

  // SECTION 2 : SITUATION PHYSIQUE ET FINANCIÈRE DU STOCK
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. VALORISATION & PERFORMANCE DU STOCK', 14, y);
  y += 4;

  const stockRows = [
    ['Nombre total d\'articles référencés', `${articles.length} références`, 'Articles en rupture de stock', `${outOfStockCount} articles (Critique)`],
    ['Volume global en stock physique', `${totalStockItemsCount} unités`, 'Articles en stock d\'alerte', `${lowStockCount} articles`],
    ['Valeur du stock (Prix d\'Achat HT)', formatCurrency(purchaseStockValue, currency), 'Chiffre d\'Affaires Vente Potentiel', formatCurrency(caPotential, currency)],
    ['Marge brute prévisionnelle stock', formatCurrency(potentialMargin, currency), 'Taux de marge prévisionnel', `${purchaseStockValue > 0 ? ((potentialMargin / purchaseStockValue) * 100).toFixed(1) : 0} %`]
  ];

  autoTable(doc, {
    startY: y,
    theme: 'grid',
    head: [['Indicateur Stock', 'Valeur', 'Indicateur Risque / Marge', 'Valeur']],
    body: stockRows,
    styles: { fontSize: 8, cellPadding: 2.5, textColor: [51, 65, 85] },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55 },
      1: { cellWidth: 38 },
      2: { fontStyle: 'bold', cellWidth: 55 },
      3: { cellWidth: 38 }
    },
    margin: { left: 14, right: 14 }
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // SECTION 3 : TOP 5 PRODUITS PAR CHIFFRE D'AFFAIRES
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('3. TOP DES VENTES & PRODUITS LES PLUS RENTABLES', 14, y);
  y += 4;

  const articleSalesMap: { [key: string]: { name: string; ref: string; qty: number; revenue: number; margin: number } } = {};
  validSales.forEach(order => {
    order.items?.forEach(item => {
      if (!articleSalesMap[item.articleId]) {
        articleSalesMap[item.articleId] = {
          name: item.name,
          ref: item.reference,
          qty: 0,
          revenue: 0,
          margin: 0
        };
      }
      articleSalesMap[item.articleId].qty += item.quantity;
      articleSalesMap[item.articleId].revenue += item.total;
      const cost = (item.purchasePrice || item.unitPrice * 0.7) * item.quantity;
      articleSalesMap[item.articleId].margin += (item.total - cost);
    });
  });

  const topArticles = Object.values(articleSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  const topRows = topArticles.length > 0
    ? topArticles.map((art, idx) => [
        `#${idx + 1}`,
        art.ref,
        art.name,
        `${art.qty} unités`,
        formatCurrency(art.revenue, currency),
        formatCurrency(art.margin, currency),
        `${art.revenue > 0 ? ((art.margin / art.revenue) * 100).toFixed(1) : 0} %`
      ])
    : [['-', '-', 'Aucune vente enregistrée', '-', '-', '-', '-']];

  autoTable(doc, {
    startY: y,
    theme: 'striped',
    head: [['Rang', 'Réf.', 'Désignation Produit', 'Qté Vendue', 'CA Réalisé', 'Marge Brute', '% Marge']],
    body: topRows,
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
    margin: { left: 14, right: 14 }
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // SECTION 4 : SIGNATURES & VALIDATION
  if (y > 230) {
    doc.addPage();
    y = 30;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Visa Responsable Financier', 30, y);
  doc.text('Direction Générale / Gérance', 130, y);

  doc.setDrawColor(203, 213, 225);
  doc.rect(20, y + 3, 65, 22);
  doc.rect(120, y + 3, 65, 22);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Document généré par ${generatedBy}`, 22, y + 20);
  doc.text('Signature & Cachet Société', 122, y + 20);

  drawFooter(doc);

  // Save the PDF
  const filename = `Rapport_Financier_GStock_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

/**
 * 2. Export Detailed Inventory Status PDF
 */
export const exportInventoryReportPDF = (articles: Article[], currency: Currency = 'MAD') => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Brand Header
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 297, 22, 'F');

  doc.setFillColor(37, 99, 235);
  doc.rect(14, 5, 4, 12, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('G.STOCK ERP • ÉTAT D\'INVENTAIRE & VALORISATION DU STOCK', 22, 13);

  const dateStr = `Date d'inventaire : ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text(dateStr, 283, 13, { align: 'right' });

  // Summary Metrics Banner
  const totalQty = articles.reduce((sum, a) => sum + (a.quantity || 0), 0);
  const totalValuationPurchase = articles.reduce((sum, a) => sum + ((a.quantity || 0) * (a.purchasePrice || 0)), 0);
  const totalValuationSelling = articles.reduce((sum, a) => sum + ((a.quantity || 0) * (a.sellingPrice || 0)), 0);
  const outCount = articles.filter(a => a.quantity <= 0).length;
  const alertCount = articles.filter(a => a.quantity > 0 && a.quantity <= a.minQuantity).length;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 26, 269, 14, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`Total Références: ${articles.length}`, 20, 34);
  doc.text(`Pièces en Stock: ${totalQty}`, 70, 34);
  doc.text(`Valeur d'Achat HT: ${formatCurrency(totalValuationPurchase, currency)}`, 120, 34);
  doc.text(`Valeur de Vente HT: ${formatCurrency(totalValuationSelling, currency)}`, 185, 34);

  doc.setTextColor(outCount > 0 ? 220 : 71, outCount > 0 ? 38 : 85, outCount > 0 ? 38 : 105);
  doc.text(`Ruptures: ${outCount} | Alertes: ${alertCount}`, 250, 34);

  const inventoryRows = articles.map((art) => {
    const stockValPurchase = (art.quantity || 0) * (art.purchasePrice || 0);
    const stockValSell = (art.quantity || 0) * (art.sellingPrice || 0);
    const status = art.quantity <= 0 ? 'RUPTURE' : art.quantity <= art.minQuantity ? 'ALERTE' : 'NORMAL';

    return [
      art.reference || '-',
      art.barcode || '-',
      art.name || '-',
      art.category || 'Général',
      art.location || '-',
      `${art.quantity} ${art.unit || 'pièce'}`,
      `${art.minQuantity}`,
      formatCurrency(art.purchasePrice || 0, currency),
      formatCurrency(art.sellingPrice || 0, currency),
      formatCurrency(stockValPurchase, currency),
      formatCurrency(stockValSell, currency),
      status
    ];
  });

  autoTable(doc, {
    startY: 44,
    theme: 'grid',
    head: [[
      'Réf.',
      'Code Barre',
      'Désignation Article',
      'Catégorie',
      'Emplacement',
      'Stock Actuel',
      'Min',
      'P. Achat HT',
      'P. Vente HT',
      'Total Achat HT',
      'Total Vente HT',
      'État'
    ]],
    body: inventoryRows,
    styles: { fontSize: 7.5, cellPadding: 2 },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { fontStyle: 'bold' },
      2: { cellWidth: 45 },
      5: { fontStyle: 'bold', halign: 'center' },
      9: { halign: 'right', fontStyle: 'bold' },
      10: { halign: 'right' },
      11: { halign: 'center' }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 11) {
        if (data.cell.raw === 'RUPTURE') {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        } else if (data.cell.raw === 'ALERTE') {
          data.cell.styles.textColor = [217, 119, 6];
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [5, 150, 105];
        }
      }
    },
    margin: { left: 14, right: 14 }
  });

  // Footer for Landscape
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 195, 283, 195);
    doc.text(
      'G.STOCK ERP • Inventaire Physique et Comptable des Marchandises • Conforme aux normes d\'audit',
      14,
      200
    );
    doc.text(`Page ${i} sur ${pageCount}`, 283, 200, { align: 'right' });
  }

  const filename = `Inventaire_Stock_GStock_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

/**
 * 3. Export Sales Journal PDF
 */
export const exportSalesJournalPDF = (salesOrders: SaleOrder[], currency: Currency = 'MAD') => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  drawHeader(
    doc,
    'JOURNAL DES VENTES & SUIVI DU RECOUVREMENT',
    `État chronologique des commandes clients, factures et statuts de règlement • ${currency}`
  );

  const totalSales = salesOrders.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const totalPaid = salesOrders.reduce((sum, s) => sum + (s.paidAmount || 0), 0);
  const totalDue = Math.max(0, totalSales - totalPaid);

  const rows = salesOrders.map((sale) => {
    const due = Math.max(0, sale.totalAmount - (sale.paidAmount || 0));
    return [
      sale.orderNumber,
      formatDate(sale.date || (sale as any).orderDate || ''),
      sale.clientName || 'Client Comptoir',
      sale.status.toUpperCase(),
      formatCurrency(sale.totalAmount, currency),
      formatCurrency(sale.paidAmount || 0, currency),
      formatCurrency(due, currency),
      sale.paymentStatus === 'paye' ? 'Soldé' : sale.paymentStatus === 'partiel' ? 'Partiel' : 'Impayé'
    ];
  });

  autoTable(doc, {
    startY: 52,
    theme: 'striped',
    head: [['N° Facture', 'Date', 'Client', 'Statut Vente', 'Total TTC', 'Payé', 'Solde Dû', 'Règlement']],
    body: rows,
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
    margin: { left: 14, right: 14 },
    foot: [[
      'TOTAL',
      '',
      `${salesOrders.length} ventes`,
      '',
      formatCurrency(totalSales, currency),
      formatCurrency(totalPaid, currency),
      formatCurrency(totalDue, currency),
      ''
    ]],
    footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' }
  });

  drawFooter(doc);

  const filename = `Journal_Ventes_GStock_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

/**
 * Generates an official, high-resolution A4 Sales Invoice PDF
 */
export const generateInvoicePDF = (order: SaleOrder, currency: Currency = 'MAD'): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Top header banner
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.rect(0, 0, 210, 24, 'F');

  doc.setFillColor(16, 185, 129); // Emerald 500
  doc.rect(14, 6, 4, 12, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('G.STOCK ERP', 22, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text('Gestion Commerciale & Facturation Officielle', 70, 14);

  // Invoice Title and Info
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('FACTURE DE VENTE', 14, 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`N° Facture : ${order.orderNumber}`, 14, 45);
  doc.text(`Date d'émission : ${formatDate(order.date)}`, 14, 51);
  if (order.dueDate) {
    doc.text(`Date d'échéance : ${formatDate(order.dueDate)}`, 14, 57);
  }

  // Company Box on the left / Client on the right
  // Seller
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 64, 86, 32, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('ÉMETTEUR / ENTREPRISE', 18, 70);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.text('G.STOCK SOLUTIONS SARL', 18, 76);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Boulevard d\'Anfa, Casablanca', 18, 82);
  doc.text('ICE: 001829384000092 • Tél: +212 5 22 45 67 89', 18, 88);

  // Client Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(110, 64, 86, 32, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('FACTURÉ À (CLIENT)', 114, 70);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.text(order.clientName || 'Client Comptoir', 114, 76);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  if (order.clientPhone) {
    doc.text(`Tél: ${order.clientPhone}`, 114, 82);
  }
  doc.text(`Statut: ${order.paymentStatus === 'paye' ? 'Facture Acquittée' : order.paymentStatus === 'partiel' ? 'Paiement Partiel' : 'En attente de paiement'}`, 114, 88);

  // Items table
  const itemRows = (order.items || []).map((item) => [
    item.reference || '-',
    item.name,
    item.quantity.toString(),
    formatCurrency(item.unitPrice, currency),
    formatCurrency(item.total, currency)
  ]);

  autoTable(doc, {
    startY: 102,
    theme: 'grid',
    head: [['Réf', 'Désignation de l\'article', 'Qté', 'Prix Unitaire HT', 'Total HT']],
    body: itemRows,
    styles: { fontSize: 8.5, cellPadding: 3 },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 80 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 32, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' }
    },
    margin: { left: 14, right: 14 }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 6;

  // Summary box on right
  const summaryX = 120;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(summaryX, finalY, 76, 38, 2, 2, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Total HT :', summaryX + 4, finalY + 7);
  doc.text(formatCurrency(order.subtotal || 0, currency), 192, finalY + 7, { align: 'right' });

  doc.text(`TVA (${order.taxRate || 0}%) :`, summaryX + 4, finalY + 14);
  doc.text(formatCurrency(order.taxAmount || 0, currency), 192, finalY + 14, { align: 'right' });

  doc.setDrawColor(226, 232, 240);
  doc.line(summaryX + 4, finalY + 18, 192, finalY + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL TTC :', summaryX + 4, finalY + 25);
  doc.setTextColor(16, 185, 129); // Emerald 600
  doc.text(formatCurrency(order.totalAmount, currency), 192, finalY + 25, { align: 'right' });

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Montant Payé :', summaryX + 4, finalY + 32);
  doc.text(formatCurrency(order.paidAmount || 0, currency), 192, finalY + 32, { align: 'right' });

  // Payment notes & stamp on left
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('CONDITIONS DE PAIEMENT & MENTIONS', 14, finalY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(order.notes || 'Paiement à réception. Pénalités de retard applicables selon la loi en vigueur.', 14, finalY + 13, { maxWidth: 95 });

  // Stamp rectangle
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, finalY + 22, 95, 24, 2, 2, 'D');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Cachet et Signature de l\'Entreprise', 18, finalY + 28);

  drawFooter(doc);
  return doc;
};

/**
 * Downloads the Invoice PDF
 */
export const exportInvoicePDF = (order: SaleOrder, currency: Currency = 'MAD') => {
  const doc = generateInvoicePDF(order, currency);
  doc.save(`Facture_${order.orderNumber}_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Generates and downloads a formal Payment Receipt PDF
 */
export const generatePaymentReceiptPDF = (payment: PaymentRecord, currency: Currency = 'MAD'): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [148, 210] // A5 format for receipts
  });

  // Top header banner
  doc.setFillColor(15, 118, 110); // Teal 700
  doc.rect(0, 0, 148, 20, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('G.STOCK ERP', 10, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('REÇU D\'ENCAISSEMENT & QUITTANCE', 70, 12);

  // Content
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('REÇU DE RÈGLEMENT', 10, 32);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Réf. Reçu : ${payment.id}`, 10, 38);
  doc.text(`Date du règlement : ${formatDate(payment.paymentDate)}`, 10, 44);
  if (payment.orderNumber) {
    doc.text(`Facture / Commande liée : ${payment.orderNumber}`, 10, 50);
  }

  // Payment Details Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(10, 56, 128, 54, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Client :', 14, 64);
  doc.setTextColor(15, 23, 42);
  doc.text(payment.clientName || 'Client Comptoir', 50, 64);

  doc.setTextColor(71, 85, 105);
  doc.text('Mode de paiement :', 14, 72);
  doc.setTextColor(15, 23, 42);
  doc.text(payment.method.toUpperCase(), 50, 72);

  if (payment.reference) {
    doc.setTextColor(71, 85, 105);
    doc.text('Référence trans. / N° Chèque :', 14, 80);
    doc.setTextColor(15, 23, 42);
    doc.text(payment.reference, 65, 80);
  }

  doc.setTextColor(71, 85, 105);
  doc.text('Encaissé par :', 14, 88);
  doc.setTextColor(15, 23, 42);
  doc.text(payment.receivedBy || 'Responsable de caisse', 50, 88);

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 94, 134, 94);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('MONTANT ENCAISSÉ :', 14, 103);
  doc.setTextColor(13, 148, 136); // Teal 600
  doc.setFontSize(13);
  doc.text(formatCurrency(payment.amount, currency), 134, 103, { align: 'right' });

  // Notes
  if (payment.notes) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Notes : ${payment.notes}`, 10, 118, { maxWidth: 128 });
  }

  // Stamp and legal disclaimer
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(10, 126, 128, 22, 2, 2, 'D');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Cachet de caisse & Signature autorisée', 14, 132);
  doc.text('Document certifié valant quittance sous réserve d\'encaissement effectif.', 14, 142);

  return doc;
};

/**
 * Downloads the Payment Receipt PDF
 */
export const exportPaymentReceiptPDF = (payment: PaymentRecord, currency: Currency = 'MAD') => {
  const doc = generatePaymentReceiptPDF(payment, currency);
  doc.save(`Recu_Paiement_${payment.id.slice(0, 8)}_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Robust universal print helper that works inside IFrames and standalone windows
 */
export const printHtmlElement = (elementId: string, documentTitle: string = 'Impression') => {
  const sourceElement = document.getElementById(elementId);
  if (!sourceElement) {
    window.print();
    return;
  }

  const printWindow = window.open('', '_blank', 'width=850,height=900');
  if (!printWindow) {
    // Popup was blocked or iframe restriction, fallback to window.print()
    window.print();
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>${documentTitle}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @media print {
          body { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            margin: 0;
            padding: 15mm;
          }
          @page {
            margin: 10mm;
            size: auto;
          }
        }
      </style>
    </head>
    <body class="bg-white text-slate-900 font-sans p-6">
      ${sourceElement.innerHTML}
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.focus();
            window.print();
            setTimeout(function() {
              window.close();
            }, 1000);
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};


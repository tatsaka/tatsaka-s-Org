import React, { useState } from 'react';
import { Article, PurchaseOrder, Supplier, OrderItem } from '../types';
import { 
  ShoppingCart, 
  AlertTriangle, 
  Truck, 
  Plus, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Printer, 
  X, 
  ChevronRight, 
  Sparkles,
  ArrowRight,
  PackageCheck
} from 'lucide-react';
import { printHtmlElement } from '../utils/pdfGenerator';

interface ReorderViewProps {
  articles: Article[];
  suppliers: Supplier[];
  orders: PurchaseOrder[];
  onCreateOrder: (order: PurchaseOrder) => Promise<void>;
  onReceiveOrder: (order: PurchaseOrder) => Promise<void>;
}

export const ReorderView: React.FC<ReorderViewProps> = ({
  articles,
  suppliers,
  orders,
  onCreateOrder,
  onReceiveOrder
}) => {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('all');
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<PurchaseOrder | null>(null);

  // Identify all articles needing replenishment (quantity <= minQuantity)
  const replenishmentNeeds = articles.filter(a => a.quantity <= a.minQuantity);

  // Group needs by supplier
  const needsBySupplier: Record<string, Article[]> = {};
  replenishmentNeeds.forEach(art => {
    const supp = art.supplier || 'Fournisseur Général';
    if (!needsBySupplier[supp]) needsBySupplier[supp] = [];
    needsBySupplier[supp].push(art);
  });

  // Handle 1-click generate purchase order for a supplier
  const handleGenerateSupplierOrder = async (supplierName: string, itemsToOrder: Article[]) => {
    const matchedSupplier = suppliers.find(s => s.name === supplierName);
    const orderItems: OrderItem[] = itemsToOrder.map(art => {
      const neededQty = Math.max(1, (art.idealQuantity || 20) - art.quantity);
      return {
        articleId: art.id,
        reference: art.reference,
        name: art.name,
        quantity: neededQty,
        unitPrice: art.purchasePrice,
        total: Number((neededQty * art.purchasePrice).toFixed(2))
      };
    });

    const totalAmount = Number(orderItems.reduce((acc, i) => acc + i.total, 0).toFixed(2));
    const leadDays = matchedSupplier?.deliveryLeadDays || 3;
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + leadDays);

    const newOrder: PurchaseOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: `BC-2026-${Math.floor(100 + Math.random() * 900)}`,
      supplierId: matchedSupplier?.id || 'supp-gen',
      supplierName: supplierName,
      items: orderItems,
      totalAmount,
      status: 'ordered',
      createdAt: new Date().toISOString(),
      expectedDelivery: expectedDate.toISOString().slice(0, 10),
      notes: `Généré automatiquement suite alerte de stock bas.`
    };

    await onCreateOrder(newOrder);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Réapprovisionnements & Commandes Fournisseurs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Calcul automatisé des besoins, émission de bons de commande et réception des flux
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-xl text-xs font-bold border border-amber-200 dark:border-amber-900">
            {replenishmentNeeds.length} référence(s) sous le seuil
          </span>
        </div>
      </div>

      {/* Section 1: Replenishment Needs & Suggested Orders */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Plan de Réapprovisionnement Recommandé
          </h2>
          <span className="text-xs text-slate-400">
            Groupement par fournisseur partenaire
          </span>
        </div>

        {Object.keys(needsBySupplier).length === 0 ? (
          <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Tous vos stocks sont à des niveaux optimaux !
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Aucun article ne se trouve actuellement en dessous de son seuil de sécurité.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Object.entries(needsBySupplier).map(([supplierName, items]) => {
              const matchedSupplier = suppliers.find(s => s.name === supplierName);
              const totalEstCost = items.reduce((acc, a) => {
                const qty = Math.max(1, (a.idealQuantity || 20) - a.quantity);
                return acc + (qty * a.purchasePrice);
              }, 0);

              return (
                <div 
                  key={supplierName}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            {supplierName}
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            Délai estimé : {matchedSupplier?.deliveryLeadDays || 3} jours
                          </p>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold text-xs">
                        {items.length} article(s)
                      </span>
                    </div>

                    {/* Items table list */}
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      {items.map(art => {
                        const needed = Math.max(1, (art.idealQuantity || 20) - art.quantity);
                        return (
                          <div key={art.id} className="py-2 flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{art.name}</span>
                              <span className="text-[11px] font-mono text-slate-400 ml-2">({art.reference})</span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-blue-600 dark:text-blue-400">+{needed} {art.unit}s</span>
                              <span className="text-slate-400 text-[11px] ml-1.5 font-mono">({(needed * art.purchasePrice).toFixed(2)} €)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Montant total estimé</div>
                      <div className="text-base font-black text-slate-900 dark:text-white font-mono">
                        {totalEstCost.toFixed(2)} € HT
                      </div>
                    </div>

                    <button
                      onClick={() => handleGenerateSupplierOrder(supplierName, items)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Créer Bon de Commande
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Purchase Orders History */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Bons de Commande en Cours & Historique
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {orders.length} commande(s)
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">N° Commande</th>
                  <th className="py-3.5 px-4">Fournisseur</th>
                  <th className="py-3.5 px-4">Date de Création</th>
                  <th className="py-3.5 px-4">Date Prévue</th>
                  <th className="py-3.5 px-4">Articles & Quantités</th>
                  <th className="py-3.5 px-4">Montant Total</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Aucune commande créée pour le moment.
                    </td>
                  </tr>
                ) : (
                  orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {ord.orderNumber}
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {ord.supplierName}
                      </td>

                      <td className="py-3 px-4 text-slate-500 font-mono">
                        {new Date(ord.createdAt).toLocaleDateString('fr-FR')}
                      </td>

                      <td className="py-3 px-4 text-slate-500 font-mono">
                        {ord.expectedDelivery || 'Sous 48h'}
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {ord.items.length} réf ({ord.items.reduce((acc, i) => acc + i.quantity, 0)} unités)
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {ord.totalAmount.toFixed(2)} € HT
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 ${
                          ord.status === 'received' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          ord.status === 'ordered' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                          'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {ord.status === 'received' ? '✓ Réceptionné' :
                           ord.status === 'ordered' ? '🚚 Commandé' : 'Brouillon'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedOrderForPrint(ord)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Visualiser / Imprimer le Bon de Commande"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {ord.status !== 'received' && (
                            <button
                              onClick={async () => {
                                if (confirm(`Confirmez-vous la réception complète du bon de commande ${ord.orderNumber} ?\nLes quantités seront automatiquement ajoutées au stock.`)) {
                                  await onReceiveOrder(ord);
                                }
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
                            >
                              <PackageCheck className="w-3.5 h-3.5" />
                              Réceptionner
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Printable Purchase Order Modal */}
      {selectedOrderForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden print:w-full print:max-w-none print:shadow-none print:border-none p-6 space-y-6">
            
            <div className="flex items-center justify-between border-b pb-4 print:hidden">
              <h2 className="text-base font-bold">Aperçu du Bon de Commande</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => printHtmlElement('printable-purchase-order', `Bon_Commande_${selectedOrderForPrint.orderNumber}`)}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Imprimer le Bon
                </button>
                <button
                  onClick={() => setSelectedOrderForPrint(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div id="printable-purchase-order" className="space-y-6 text-xs bg-white text-slate-900 p-2">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-black text-blue-600">STOCKFLOW LOGISTICS</h1>
                  <p className="text-slate-500">Plateforme de Gestion des Stocks</p>
                  <p className="text-slate-500">contact@stockflow-logistics.fr</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold font-mono">{selectedOrderForPrint.orderNumber}</div>
                  <div className="text-slate-500">Date : {new Date(selectedOrderForPrint.createdAt).toLocaleDateString('fr-FR')}</div>
                  <div className="text-slate-500">Livraison souhaitée : {selectedOrderForPrint.expectedDelivery}</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800">Fournisseur : {selectedOrderForPrint.supplierName}</div>
                <div className="text-slate-500">{selectedOrderForPrint.notes}</div>
              </div>

              {/* Items Table */}
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-600 font-bold">
                    <th className="py-2 text-left">Réf</th>
                    <th className="py-2 text-left">Désignation</th>
                    <th className="py-2 text-center">Quantité</th>
                    <th className="py-2 text-right">Prix Unitaire HT</th>
                    <th className="py-2 text-right">Total HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedOrderForPrint.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 font-mono">{item.reference}</td>
                      <td className="py-2 font-medium">{item.name}</td>
                      <td className="py-2 text-center font-bold">{item.quantity}</td>
                      <td className="py-2 text-right font-mono">{item.unitPrice.toFixed(2)} €</td>
                      <td className="py-2 text-right font-mono font-bold">{item.total.toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end pt-4 border-t border-slate-300">
                <div className="text-right space-y-1 w-48">
                  <div className="flex justify-between text-slate-600">
                    <span>Total HT :</span>
                    <span className="font-mono font-bold">{selectedOrderForPrint.totalAmount.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>TVA (20%) :</span>
                    <span className="font-mono">{(selectedOrderForPrint.totalAmount * 0.20).toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t pt-1 text-slate-900">
                    <span>Total TTC :</span>
                    <span className="font-mono text-blue-600">{(selectedOrderForPrint.totalAmount * 1.20).toFixed(2)} €</span>
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

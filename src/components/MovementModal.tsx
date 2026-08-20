import React, { useState, useEffect } from 'react';
import { Article, MovementType } from '../types';
import { 
  X, 
  ArrowDownUp, 
  PlusCircle, 
  MinusCircle, 
  Sliders, 
  Repeat, 
  Undo2, 
  Boxes, 
  Loader2,
  Check
} from 'lucide-react';

interface MovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles?: Article[];
  initialArticle?: Article | null;
  preselectedArticle?: Article | null;
  currentUser?: string;
  onRecordMovement?: (
    article: Article,
    type: MovementType,
    quantity: number,
    reason: string
  ) => Promise<void>;
  onSave?: (movement: any) => Promise<void>;
}

export const MovementModal: React.FC<MovementModalProps> = ({
  isOpen,
  onClose,
  articles = [],
  initialArticle,
  preselectedArticle,
  currentUser = 'Opérateur Stock',
  onRecordMovement,
  onSave
}) => {
  const targetInitial = preselectedArticle || initialArticle;
  const [selectedArticleId, setSelectedArticleId] = useState<string>('');
  const [type, setType] = useState<MovementType>('entree');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('Réception fournisseur standard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (targetInitial) {
      setSelectedArticleId(targetInitial.id);
    } else if (articles?.length > 0 && !selectedArticleId) {
      setSelectedArticleId(articles[0].id);
    }
  }, [targetInitial, articles, isOpen]);

  if (!isOpen) return null;

  const currentArticle = articles.find(a => a.id === selectedArticleId);
  const previousQuantity = currentArticle ? currentArticle.quantity : 0;

  // Compute calculated new quantity
  let newQuantity = previousQuantity;
  if (type === 'entree' || type === 'retour') {
    newQuantity = previousQuantity + (Number(quantity) || 0);
  } else if (type === 'sortie') {
    newQuantity = Math.max(0, previousQuantity - (Number(quantity) || 0));
  } else if (type === 'ajustement') {
    newQuantity = Number(quantity) || 0; // For adjustment, input is the actual physical count
  }

  const reasonPresets: Record<MovementType, string[]> = {
    entree: [
      'Réception commande fournisseur',
      'Réapprovisionnement programmé',
      'Production interne / Fabrication',
      'Régularisation stock positif'
    ],
    sortie: [
      'Expédition commande client',
      'Vente directe au comptoir',
      'Consommation atelier / Usage interne',
      'Casse, détérioration ou perte'
    ],
    ajustement: [
      'Inventaire périodique de contrôle',
      'Correction d\'erreur de comptage',
      'Régularisation suite à audit physique'
    ],
    transfert: [
      'Transfert vers autre entrepôt / filiale',
      'Déplacement de zone ou allée'
    ],
    retour: [
      'Retour client avec remise en stock',
      'Retour SAV testé fonctionnel'
    ]
  };

  const handleTypeChange = (newType: MovementType) => {
    setType(newType);
    if (reasonPresets[newType]?.length > 0) {
      setReason(reasonPresets[newType][0]);
    }
    if (newType === 'ajustement' && currentArticle) {
      setQuantity(currentArticle.quantity);
    } else {
      setQuantity(1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentArticle) {
      setError('Veuillez sélectionner un article.');
      return;
    }

    if (quantity <= 0 && type !== 'ajustement') {
      setError('La quantité doit être supérieure à zéro.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      if (onRecordMovement) {
        await onRecordMovement(currentArticle, type, quantity, reason);
      } else if (onSave) {
        await onSave({
          id: `mov-${Date.now()}`,
          articleId: currentArticle.id,
          reference: currentArticle.reference,
          articleName: currentArticle.name,
          type,
          quantity: Number(quantity) || 1,
          previousQuantity,
          newQuantity,
          timestamp: new Date().toISOString(),
          reason,
          performedBy: currentUser
        });
      }
      onClose();
    } catch (err: any) {
      setError('Erreur lors de l\'enregistrement : ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <ArrowDownUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Mouvement de Stock Express
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Entrée, sortie ou ajustement avec traçabilité
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 text-xs bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 rounded-xl">
              {error}
            </div>
          )}

          {/* Movement Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Type d'Opération
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('entree')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  type === 'entree'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>+ Entrée (Achat)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('sortie')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  type === 'sortie'
                    ? 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <MinusCircle className="w-4 h-4 text-red-600" />
                <span>- Sortie (Vente)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('ajustement')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  type === 'ajustement'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Ajustement</span>
              </button>
            </div>
          </div>

          {/* Article Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Sélectionner l'Article
            </label>
            <select
              value={selectedArticleId}
              onChange={(e) => setSelectedArticleId(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              {articles.map((art) => (
                <option key={art.id} value={art.id}>
                  {art.reference} — {art.name} (Stock actuel: {art.quantity} {art.unit}s)
                </option>
              ))}
            </select>
          </div>

          {/* Quantity & Live Simulation */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {type === 'ajustement' ? 'Nouveau comptage physique réel :' : 'Quantité du mouvement :'}
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 5, 10, 50].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuantity(num)}
                    className="px-2 py-0.5 text-[11px] font-semibold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md hover:bg-slate-100 text-slate-700 dark:text-slate-200"
                  >
                    +{num}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min={type === 'ajustement' ? "0" : "1"}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-32 px-3 py-2 text-base font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white text-center focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-xs font-medium text-slate-500">
                {currentArticle?.unit || 'pièce'}(s)
              </span>
            </div>

            {/* Live calculation banner */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <div className="text-slate-500">
                Stock avant : <span className="font-semibold text-slate-800 dark:text-slate-200">{previousQuantity}</span>
              </div>
              <div className="text-slate-400">➔</div>
              <div>
                Nouveau stock :{' '}
                <span className={`font-bold text-sm ${
                  newQuantity === 0 ? 'text-red-600' :
                  newQuantity <= (currentArticle?.minQuantity || 5) ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {newQuantity} {currentArticle?.unit || 'pièce'}s
                </span>
              </div>
            </div>
          </div>

          {/* Reason / Reference Motive */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Motif / Bon de commande ou livraison
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Bon de livraison BL-2026-99"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            {reasonPresets[type] && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {reasonPresets[type].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setReason(preset)}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2.5 px-4 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md ${
                type === 'entree' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' :
                type === 'sortie' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' :
                'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
              }`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Confirmer le Mouvement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

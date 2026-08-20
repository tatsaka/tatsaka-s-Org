import React, { useState } from 'react';
import { Article } from '../types';
import { X, Printer, QrCode, Barcode as BarcodeIcon, Copy, Check } from 'lucide-react';
import { printHtmlElement } from '../utils/pdfGenerator';

interface BarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  article?: Article | null;
  articles?: Article[];
}

export const BarcodeModal: React.FC<BarcodeModalProps> = ({
  isOpen,
  onClose,
  article,
  articles = []
}) => {
  const [selectedId, setSelectedId] = useState<string>(article?.id || articles?.[0]?.id || '');
  const [labelFormat, setLabelFormat] = useState<'thermal' | 'a4'>('thermal');
  const [copies, setCopies] = useState(1);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (article?.id) {
      setSelectedId(article.id);
    } else if (articles?.length > 0 && !selectedId) {
      setSelectedId(articles[0].id);
    }
  }, [article, articles]);

  if (!isOpen) return null;

  const current = articles.find(a => a.id === selectedId) || article || articles[0];
  if (!current) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl text-center space-y-4 max-w-sm">
          <p className="text-sm text-slate-600 dark:text-slate-300">Aucun article sélectionné pour l'impression.</p>
          <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold">
            Fermer
          </button>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    printHtmlElement('printable-label-card', `Etiquette_${current.reference}`);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(current.barcode || current.reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate simulated crisp barcode lines from string hash
  const generateBarcodeLines = (text: string) => {
    const chars = text.split('');
    return chars.map((char, index) => {
      const charCode = char.charCodeAt(0);
      const width = (charCode % 4) + 1.5;
      const opacity = (index % 2 === 0) ? 1 : 0.85;
      return (
        <rect
          key={index}
          x={index * 6 + 10}
          y="10"
          width={width}
          height="55"
          fill="black"
          opacity={opacity}
        />
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden print:w-full print:max-w-none print:shadow-none print:border-none">
        
        {/* Header (hidden in print) */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-md">
              <BarcodeIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Générateur d'Étiquettes & Code-Barres
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Impression directe format thermique ou planche d'étiquettes
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

        {/* Controls (hidden in print) */}
        <div className="p-6 space-y-6 print:hidden">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Article cible
              </label>
              <select
                value={current.id}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                {articles.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.reference} — {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Format d'impression
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLabelFormat('thermal')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all ${
                    labelFormat === 'thermal'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600'
                  }`}
                >
                  Thermique 50x30mm
                </button>
                <button
                  type="button"
                  onClick={() => setLabelFormat('a4')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all ${
                    labelFormat === 'a4'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600'
                  }`}
                >
                  Planche A4 (Standard)
                </button>
              </div>
            </div>
          </div>

          {/* Visual Label Preview */}
          <div className="p-6 bg-slate-100 dark:bg-slate-950/60 rounded-2xl flex flex-col items-center justify-center border border-slate-200 dark:border-slate-800">
            
            {/* The Print Label Card */}
            <div id="printable-label-card" className="w-80 bg-white text-black p-4 rounded-xl border-2 border-dashed border-slate-300 shadow-md flex flex-col items-center justify-between text-center space-y-2">
              <div className="w-full flex justify-between items-start text-left border-b border-black/10 pb-1.5">
                <div>
                  <div className="text-[11px] font-mono font-bold tracking-wider text-black">
                    {current.reference}
                  </div>
                  <div className="text-xs font-black text-black leading-tight max-w-[190px] truncate">
                    {current.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono font-semibold text-slate-600">{current.location}</div>
                  <div className="text-xs font-black text-black">{current.sellingPrice.toFixed(2)} €</div>
                </div>
              </div>

              {/* Barcode SVG representation */}
              <div className="w-full flex flex-col items-center justify-center py-1">
                <svg className="w-full h-16" viewBox="0 0 160 70">
                  {generateBarcodeLines(current.barcode || current.reference)}
                </svg>
                <span className="font-mono text-xs tracking-widest font-bold mt-1 text-black">
                  {current.barcode || '3700123456789'}
                </span>
              </div>

              <div className="w-full flex justify-between items-center text-[9px] font-mono text-slate-500 border-t border-black/10 pt-1">
                <span>STOCKFLOW LOGISTICS</span>
                <span>CAT: {current.category.slice(0, 14)}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copié !' : 'Copier le code-barre'}
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 transition-colors"
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Printer className="w-4 h-4" />
              Imprimer l'étiquette
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

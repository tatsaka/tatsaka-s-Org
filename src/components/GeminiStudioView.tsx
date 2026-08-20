import React, { useState } from 'react';
import { Article, StockMovement, Supplier, StockAuditResult } from '../types';
import { runDeepAudit, askStockCopilot, extractDocumentAI, runFastAssist } from '../lib/geminiClient';
import { 
  Sparkles, 
  BrainCircuit, 
  MessageSquare, 
  FileText, 
  Zap, 
  Send, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Euro, 
  Upload, 
  ShieldAlert, 
  Lightbulb, 
  PlusCircle, 
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';

interface GeminiStudioViewProps {
  articles: Article[];
  movements: StockMovement[];
  suppliers: Supplier[];
  onImportExtractedArticles: (extracted: any[]) => Promise<void>;
}

export const GeminiStudioView: React.FC<GeminiStudioViewProps> = ({
  articles,
  movements,
  suppliers,
  onImportExtractedArticles
}) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'chat' | 'ocr' | 'fast'>('audit');

  // Audit state
  const [auditResult, setAuditResult] = useState<StockAuditResult | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    {
      role: 'model',
      text: "Bonjour ! Je suis **StockMind IA**, votre copilot d'intelligence logistique. Je peux analyser vos niveaux de stock, identifier les ruptures imminentes, optimiser vos flux ou rédiger des courriers fournisseurs. Comment puis-je vous aider ?"
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Document OCR state
  const [docImage, setDocImage] = useState<string | null>(null);
  const [docText, setDocText] = useState('');
  const [docLoading, setDocLoading] = useState(false);
  const [docResult, setDocResult] = useState<any | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  // Fast assist state
  const [fastName, setFastName] = useState('Casque Bluetooth antibruit');
  const [fastCategory, setFastCategory] = useState('Électronique & High-Tech');
  const [fastResult, setFastResult] = useState<any | null>(null);
  const [fastLoading, setFastLoading] = useState(false);

  // 1. Run Deep Audit (Gemini 3.1 Pro Thinking Mode)
  const handleRunAudit = async () => {
    try {
      setAuditLoading(true);
      setAuditError(null);
      const res = await runDeepAudit(articles, movements, suppliers);
      setAuditResult(res);
    } catch (err: any) {
      console.error(err);
      setAuditError(err.message || 'Erreur lors du calcul de l\'audit stratégique.');
    } finally {
      setAuditLoading(false);
    }
  };

  // 2. Chat with Gemini 3.5 Flash
  const handleSendChat = async (presetText?: string) => {
    const textToSend = presetText || chatInput;
    if (!textToSend.trim()) return;

    const newHistory = [...chatMessages, { role: 'user' as const, text: textToSend }];
    setChatMessages(newHistory);
    if (!presetText) setChatInput('');
    setChatLoading(true);

    try {
      const stockContext = {
        totalSkus: articles.length,
        totalValue: articles.reduce((acc, a) => acc + (a.quantity * a.purchasePrice), 0),
        lowStockCount: articles.filter(a => a.quantity <= a.minQuantity).length,
        lowStockItems: articles.filter(a => a.quantity <= a.minQuantity).map(a => ({ name: a.name, quantity: a.quantity, minQuantity: a.minQuantity })),
        sampleArticles: articles.slice(0, 8).map(a => ({ name: a.name, quantity: a.quantity, category: a.category }))
      };

      const responseText = await askStockCopilot(
        textToSend,
        chatMessages.map(m => ({ role: m.role, content: m.text })),
        stockContext
      );

      setChatMessages([...newHistory, { role: 'model', text: responseText }]);
    } catch (err: any) {
      setChatMessages([
        ...newHistory,
        { role: 'model', text: "Une erreur s'est produite lors de la génération de la réponse. Veuillez réessayer." }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // 3. Document Extraction (Gemini 3.5 Flash Multi-Modal)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExtractDoc = async () => {
    if (!docImage && !docText.trim()) return;
    try {
      setDocLoading(true);
      setDocResult(null);
      const res = await extractDocumentAI(docImage || undefined, docText || undefined);
      setDocResult(res);
    } catch (err: any) {
      alert('Erreur lors de la lecture du document: ' + err.message);
    } finally {
      setDocLoading(false);
    }
  };

  const handleImportDocArticles = async () => {
    if (!docResult?.articles) return;
    await onImportExtractedArticles(docResult.articles);
    setImportSuccess(true);
    setTimeout(() => setImportSuccess(false), 3000);
  };

  // 4. Fast Assist (Gemini 3.1 Flash-Lite)
  const handleFastSkuGen = async () => {
    if (!fastName) return;
    try {
      setFastLoading(true);
      const res = await runFastAssist('generate_sku', { name: fastName, category: fastCategory });
      setFastResult(res);
    } catch (err) {
      console.warn(err);
    } finally {
      setFastLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 text-white p-6 rounded-3xl border border-indigo-900/60 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-[10px] font-bold bg-indigo-500/30 text-indigo-300 rounded-full border border-indigo-400/30 flex items-center gap-1.5">
            <BrainCircuit className="w-3 h-3 text-indigo-400" />
            Gemini Multimodal Intelligence Hub
          </span>
          <span className="text-xs text-slate-400 font-mono">Modèles 3.1 Pro & 3.5 Flash</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black tracking-tight">
          Centre d'Intelligence Artificielle StockFlow
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Exploitez les modèles d'IA de dernière génération de Google pour auditer vos stocks, anticiper la demande, extraire automatiquement des factures et optimiser votre trésorerie.
        </p>

        {/* Tab Navigation */}
        <div className="pt-2 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'audit'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-white/10 hover:bg-white/15 text-slate-300'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5 text-sky-400" />
            <span>Audit Stratégique (Thinking Mode)</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'chat'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-white/10 hover:bg-white/15 text-slate-300'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span>Stock Copilot (Gemini 3.5 Flash)</span>
          </button>

          <button
            onClick={() => setActiveTab('ocr')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'ocr'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-white/10 hover:bg-white/15 text-slate-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Scan Facture & Bon de Livraison</span>
          </button>

          <button
            onClick={() => setActiveTab('fast')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'fast'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-white/10 hover:bg-white/15 text-slate-300'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Générateur SKU Ultra-Rapide</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Deep Strategic Audit (gemini-3.1-pro-preview with Thinking Level HIGH) */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-indigo-600" />
                  Audit Stratégique Approfondi (Thinking Mode HIGH)
                </h2>
                <p className="text-xs text-slate-500">
                  Modèle : <strong>gemini-3.1-pro-preview</strong> avec raisonnement logistique et financier complet
                </p>
              </div>

              <button
                onClick={handleRunAudit}
                disabled={auditLoading}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all"
              >
                {auditLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {auditLoading ? 'Raisonnement approfondi en cours...' : 'Exécuter l\'Audit IA'}
              </button>
            </div>

            {auditError && (
              <div className="p-3 text-xs bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 rounded-xl">
                {auditError}
              </div>
            )}

            {!auditResult && !auditLoading && (
              <div className="p-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-3">
                <BrainCircuit className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Prêt à analyser l'ensemble de votre catalogue
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Cliquez sur le bouton ci-dessus pour lancer une analyse stratégique basée sur la formule de Wilson, la détection des stocks dormants et la réduction du BFR.
                </p>
              </div>
            )}

            {/* Audit Results Presentation */}
            {auditResult && (
              <div className="space-y-6 pt-4 animate-in fade-in duration-300">
                
                {/* Score & Summary Banner */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-indigo-400">Score de Santé Logistique</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-black text-emerald-400">
                          {auditResult.healthScore || 85}/100
                        </span>
                        <span className="text-xs text-slate-400">État général satisfaisant</span>
                      </div>
                    </div>

                    <div className="flex gap-4 text-right">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Capital Immobilisé</div>
                        <div className="text-base font-bold text-white font-mono">
                          {auditResult.totalTiedCapital ? `${auditResult.totalTiedCapital.toFixed(2)} €` : 'Calculé'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Stock Mort Estimé</div>
                        <div className="text-base font-bold text-amber-400 font-mono">
                          {auditResult.deadStockEstimate ? `${auditResult.deadStockEstimate.toFixed(2)} €` : '0.00 €'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed border-t border-slate-700/80 pt-3">
                    {auditResult.summary}
                  </p>
                </div>

                {/* Top Risks */}
                {auditResult.topRisks && auditResult.topRisks.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-red-500" />
                      Risques Prioritaires Identifiés
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {auditResult.topRisks.map((risk, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/60 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-red-900 dark:text-red-300">{risk.title}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200">
                              {risk.level}
                            </span>
                          </div>
                          <p className="text-xs text-red-800 dark:text-red-300/80">{risk.description}</p>
                          <div className="text-[11px] font-semibold text-red-600 dark:text-red-400 pt-1">
                            Impact : {risk.impact}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reorder Recommendations */}
                {auditResult.reorderRecommendations && auditResult.reorderRecommendations.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      Quantités Économiques de Commande (Wilson EOQ)
                    </h3>
                    <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                      {auditResult.reorderRecommendations.map((rec, i) => (
                        <div key={i} className="p-3 flex items-center justify-between gap-3">
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {rec.name} <span className="font-mono text-slate-400">({rec.reference})</span>
                            </div>
                            <div className="text-[11px] text-slate-500">{rec.justification}</div>
                          </div>
                          <div className="text-right">
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-lg font-bold">
                              Commander +{rec.suggestedOrder}
                            </span>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              Est. {rec.estimatedCost} €
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strategic Advice */}
                {auditResult.strategicAdvice && (
                  <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 rounded-2xl space-y-2">
                    <h3 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-indigo-600" />
                      Recommandations Stratégiques du Modèle Thinking
                    </h3>
                    <ul className="space-y-1.5 text-xs text-indigo-950 dark:text-indigo-200 list-disc list-inside">
                      {auditResult.strategicAdvice.map((adv, i) => (
                        <li key={i}>{adv}</li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Conversational Copilot (Gemini 3.5 Flash) */}
      {activeTab === 'chat' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col h-[600px] overflow-hidden">
          
          {/* Chat header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">StockMind Copilot</h3>
                <p className="text-[11px] text-slate-400">Connecté en temps réel aux données d'inventaire</p>
              </div>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl text-xs max-w-lg leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span>StockMind réfléchit...</span>
              </div>
            )}
          </div>

          {/* Quick prompt suggestions */}
          <div className="px-6 py-2 border-t border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto text-[11px]">
            <button
              onClick={() => handleSendChat('Quels sont nos 3 articles les plus critiques en rupture ?')}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full shrink-0 transition-colors"
            >
              ⚠️ Articles les plus critiques
            </button>
            <button
              onClick={() => handleSendChat('Rédige un email pour le fournisseur Outillage Pro pour commander 10 perceuses.')}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full shrink-0 transition-colors"
            >
              ✉️ Rédiger email de commande
            </button>
            <button
              onClick={() => handleSendChat('Quelle est la valeur globale de notre stock et notre marge moyenne ?')}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full shrink-0 transition-colors"
            >
              💶 Synthèse valorisation & marge
            </button>
          </div>

          {/* Input field */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              placeholder="Posez une question sur vos stocks, fournisseurs, allées..."
              className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => handleSendChat()}
              disabled={chatLoading || !chatInput.trim()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}

      {/* Tab 3: Document / Invoice OCR Scanner (Gemini 3.5 Flash Multi-Modal) */}
      {activeTab === 'ocr' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Reconnaissance Automatique de Bons de Livraison & Factures
            </h2>
            <p className="text-xs text-slate-500">
              Importez une photo ou collez le texte d'un document fournisseur pour extraire automatiquement les références et quantités.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Input Side */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  1. Importer une photo / scan (JPG, PNG)
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {docImage ? (
                    <div className="space-y-2">
                      <img src={docImage} alt="Preview" className="max-h-40 mx-auto rounded-lg shadow-xs" />
                      <p className="text-xs text-emerald-600 font-semibold">Image prête pour l'analyse</p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-slate-500">
                      <Upload className="w-8 h-8 mx-auto text-slate-400" />
                      <p className="text-xs font-semibold">Glissez une image ici ou cliquez pour choisir</p>
                      <p className="text-[10px] text-slate-400">Facture fournisseur, bon de réception, inventaire papier</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  ou Collez le texte brut du document :
                </label>
                <textarea
                  rows={4}
                  value={docText}
                  onChange={(e) => setDocText(e.target.value)}
                  placeholder="Ex: BON DE LIVRAISON BL-9901 - Fournisseur TechLogistics&#10;10x Câble HDMI 2m à 4.50€&#10;5x Clavier mécanique à 42.00€"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <button
                onClick={handleExtractDoc}
                disabled={docLoading || (!docImage && !docText.trim())}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
              >
                {docLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Extraire les Lignes d'Articles avec Gemini
              </button>
            </div>

            {/* Results Side */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Articles Détectés
                  </span>
                  {docResult && (
                    <span className="text-[10px] font-mono text-emerald-600 font-bold">
                      Fournisseur: {docResult.supplierName || 'Détecté'}
                    </span>
                  )}
                </div>

                {!docResult && (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    Importez un document et cliquez sur "Extraire" pour voir les articles découverts.
                  </div>
                )}

                {docResult?.articles && (
                  <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-64 overflow-y-auto text-xs mt-3">
                    {docResult.articles.map((art: any, i: number) => (
                      <div key={i} className="py-2.5 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{art.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {art.reference || `REF-NEW-${i}`} • Cat: {art.category || 'Général'}
                          </div>
                        </div>
                        <div className="text-right font-mono">
                          <div className="font-bold text-emerald-600">+{art.quantity || 1} u</div>
                          <div className="text-[10px] text-slate-400">{art.unitPrice || 0} €/u</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {docResult?.articles && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={handleImportDocArticles}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    {importSuccess ? <Check className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                    {importSuccess ? 'Articles Intégrés au Stock !' : `Intégrer ces ${docResult.articles.length} articles en stock`}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Tab 4: Fast SKU & Reorder Math (Gemini 3.1 Flash-Lite) */}
      {activeTab === 'fast' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Générateur Express de Références SKU & Barcodes
            </h2>
            <p className="text-xs text-slate-500">
              Modèle ultra basse latence : <strong>gemini-3.1-flash-lite</strong> pour suggestions instantanées
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nom du produit
              </label>
              <input
                type="text"
                value={fastName}
                onChange={(e) => setFastName(e.target.value)}
                placeholder="Ex: Écran Gamer 27 pouces 144Hz"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Catégorie
              </label>
              <input
                type="text"
                value={fastCategory}
                onChange={(e) => setFastCategory(e.target.value)}
                placeholder="Électronique"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            onClick={handleFastSkuGen}
            disabled={fastLoading || !fastName}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {fastLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            Générer instantanément SKU
          </button>

          {fastResult && (
            <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-2xl max-w-xl space-y-2">
              <span className="text-[10px] font-bold uppercase text-amber-800 dark:text-amber-300">Propositions Générées :</span>
              <div className="flex flex-wrap gap-2">
                {(fastResult.suggestions || [fastResult.recommended]).map((sku: string, idx: number) => (
                  <span key={idx} className="px-3 py-1.5 bg-white dark:bg-slate-800 font-mono font-bold text-xs rounded-xl border border-amber-200 dark:border-amber-800 text-slate-800 dark:text-white">
                    {sku}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

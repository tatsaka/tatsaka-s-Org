import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Enable large JSON payloads for document and image scanning
app.use(express.json({ limit: '20mb' }));

// Lazy initialize Gemini client
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not defined in environment variables.');
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

/**
 * 1. Low-latency fast actions (SKU generation, quick category suggestions, fast stock math)
 * Uses gemini-3.1-flash-lite
 */
app.post('/api/gemini/fast-assist', async (req, res) => {
  try {
    const { action, input, currentStock } = req.body;
    const ai = getGenAI();

    let systemPrompt = `Tu es l'assistant ultra-rapide de gestion des stocks. Réponds de façon concise, précise et directement exploitable au format JSON strict.`;
    let userPrompt = '';

    if (action === 'generate_sku') {
      userPrompt = `Génère 3 propositions de codes SKU / Références internes professionnels pour un produit nommé "${input.name}" dans la catégorie "${input.category || 'Général'}". Fournis le résultat au format JSON: { "suggestions": ["SKU1", "SKU2", "SKU3"], "recommended": "SKU1", "barcode": "EAN13_ex" }`;
    } else if (action === 'categorize') {
      userPrompt = `Détermine la meilleure catégorie, l'emplacement d'entrepôt standard conseillé (ex: Allée A - Rayon 3) et l'unité de mesure recommandée (pièce, kg, litre, carton, mètre) pour le produit: "${input.name}". Format JSON: { "category": "...", "location": "...", "unit": "..." }`;
    } else if (action === 'quick_reorder') {
      userPrompt = `À partir des données d'article actuelles: ${JSON.stringify(input)}, calcule instantanément la quantité recommandée à commander, le coût estimé et le niveau de criticité (urgente, normale, préventive). Format JSON: { "suggestedQuantity": 0, "estimatedCost": 0, "urgency": "urgente|normale|preventive", "reason": "..." }`;
    } else {
      userPrompt = `Réponds rapidement à cette requête de gestion de stock: "${input.prompt || input}". Format JSON: { "result": "..." }`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text || '{}';
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { raw: responseText };
    }

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error in /api/gemini/fast-assist:', error);
    res.status(500).json({ success: false, error: error.message || 'Erreur lors du traitement rapide' });
  }
});

/**
 * 2. General Smart Copilot (Product fiche generator, chat, anomaly detection, automated restock report)
 * Uses gemini-3.5-flash
 */
app.post('/api/gemini/copilot', async (req, res) => {
  try {
    const { message, history, stockContext, action } = req.body;
    const ai = getGenAI();

    if (action === 'generate_product_sheet') {
      const prompt = `Tu es un expert logistique et gestion d'inventaire. À partir de cette description sommaire ou mot-clé: "${message}", génère une fiche produit complète et optimisée pour un logiciel de gestion des stocks.
Format JSON strict:
{
  "name": "Nom complet et professionnel du produit",
  "category": "Catégorie logistique",
  "reference": "REF-XXXX",
  "unit": "pièce|kg|litre|carton|mètre|lot",
  "purchasePrice": 0.00,
  "sellingPrice": 0.00,
  "minQuantity": 0,
  "idealQuantity": 0,
  "location": "Allée X - Rayon Y",
  "notes": "Description technique et caractéristiques de stockage",
  "suggestedSupplier": "Type de fournisseur recommandé"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [{ text: prompt }],
        config: {
          responseMimeType: 'application/json',
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, product: parsed });
    }

    // Chat with inventory context
    const formattedContext = stockContext ? `
Contexte actuel du stock:
- Nombre total de références: ${stockContext.totalSkus || 0}
- Valeur totale du stock: ${stockContext.totalValue || 0} €
- Articles en rupture/alerte (${stockContext.lowStockCount || 0}): ${JSON.stringify(stockContext.lowStockItems || [])}
- Articles récents ou phares: ${JSON.stringify(stockContext.sampleArticles || [])}
` : '';

    const systemInstruction = `Tu es "StockMind IA", l'assistant d'intelligence opérationnelle intégré dans l'application moderne de Gestion des Stocks.
Tu es concis, professionnel, précis et tu apportes des recommandations logistiques et financières concrètes.
Tu aides à:
- Suivre et analyser les niveaux de stock
- Identifier les goulots d'étranglement et les risques de rupture
- Proposer des stratégies de réapprovisionnement
- Analyser les marges et la rotation des stocks
${formattedContext}`;

    const contents = (history || []).map((h: any) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content || h.text || '' }]
    }));

    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents,
      config: {
        systemInstruction,
      }
    });

    res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.error('Error in /api/gemini/copilot:', error);
    res.status(500).json({ success: false, error: error.message || 'Erreur du Copilot' });
  }
});

/**
 * 3. High Thinking Deep Strategic Inventory Audit & Demand Forecasting
 * Uses gemini-3.1-pro-preview with thinkingLevel: HIGH
 */
app.post('/api/gemini/deep-audit', async (req, res) => {
  try {
    const { stockItems, movements, suppliers } = req.body;
    const ai = getGenAI();

    const auditPrompt = `Effectue un audit logistique et financier approfondi (Deep Inventory Analysis) de ce portefeuille de stocks.
Données d'inventaire:
${JSON.stringify(stockItems || [], null, 2)}

Historique récent des mouvements:
${JSON.stringify(movements || [], null, 2)}

Fournisseurs:
${JSON.stringify(suppliers || [], null, 2)}

En tant qu'auditeur en Supply Chain & Directeur Financier:
1. Analyse la santé globale des stocks (rotation, sur-stockage, capitaux dormants).
2. Identifie les 3 à 5 risques prioritaires (ruptures imminentes, produits à faible rotation / stock mort, dépendance fournisseur).
3. Calcule le plan de réapprovisionnement optimisé (formule de Wilson / quantité économique de commande EOQ simplifiée).
4. Propose un plan d'action immédiat chiffré pour libérer du cash-flow et améliorer le taux de service client.

Génère la réponse au format JSON strict respectant cette structure:
{
  "healthScore": 85,
  "summary": "Résumé exécutif en 2-3 phrases percutantes",
  "totalTiedCapital": 0.00,
  "deadStockEstimate": 0.00,
  "topRisks": [
    { "level": "critique|moyen|faible", "title": "...", "description": "...", "impact": "..." }
  ],
  "reorderRecommendations": [
    { "reference": "...", "name": "...", "currentStock": 0, "suggestedOrder": 0, "estimatedCost": 0, "supplier": "...", "priority": "Haute|Moyenne|Basse", "justification": "..." }
  ],
  "cashFlowOpportunities": [
    { "action": "...", "potentialSaving": 0, "impact": "..." }
  ],
  "strategicAdvice": [
    "Conseil 1...",
    "Conseil 2..."
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: [{ text: auditPrompt }],
      config: {
        thinkingConfig: {
          thinkingLevel: 'HIGH' as any,
        },
        responseMimeType: 'application/json',
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, audit: parsed });
  } catch (error: any) {
    console.error('Error in /api/gemini/deep-audit:', error);
    res.status(500).json({ success: false, error: error.message || 'Erreur lors de l\'audit stratégique' });
  }
});

/**
 * 4. Document / Bon de livraison / Facture image & text extraction
 * Uses gemini-3.5-flash multi-modal
 */
app.post('/api/gemini/extract-document', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', textContent } = req.body;
    const ai = getGenAI();

    const extractionPrompt = `Tu es un système de reconnaissance automatique de documents logistiques (bons de livraison, factures fournisseurs, inventaires papier).
Extrais toutes les lignes d'articles trouvées dans ce document pour intégration directe dans la base de données de stock.
Format JSON attendu:
{
  "documentType": "bon_de_livraison|facture|bon_de_commande|autre",
  "documentNumber": "...",
  "supplierName": "...",
  "date": "YYYY-MM-DD",
  "articles": [
    {
      "reference": "...",
      "name": "...",
      "quantity": 1,
      "unitPrice": 0.0,
      "category": "...",
      "totalPrice": 0.0
    }
  ],
  "totalAmount": 0.0,
  "confidenceScore": 0.95
}`;

    let parts: any[] = [];

    if (imageBase64) {
      // Remove data URL prefix if present
      const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanBase64
        }
      });
    }

    if (textContent) {
      parts.push({
        text: `Texte du document brut:\n${textContent}`
      });
    }

    parts.push({ text: extractionPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [{ parts }],
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, document: parsed });
  } catch (error: any) {
    console.error('Error in /api/gemini/extract-document:', error);
    res.status(500).json({ success: false, error: error.message || 'Erreur lors de l\'extraction du document' });
  }
});

// Start Express with Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur Gestion des Stocks démarré sur http://localhost:${PORT}`);
  });
}

startServer();

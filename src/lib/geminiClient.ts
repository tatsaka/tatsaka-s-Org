import { Article, StockMovement, Supplier, StockAuditResult } from '../types';

export async function runFastAssist(action: 'generate_sku' | 'categorize' | 'quick_reorder', input: any) {
  try {
    const res = await fetch('/api/gemini/fast-assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, input }),
    });
    const data = await res.json();
    return data.data;
  } catch (err: any) {
    console.error('Fast assist error:', err);
    throw err;
  }
}

export async function askStockCopilot(
  message: string,
  history: { role: 'user' | 'model'; content: string }[],
  stockContext?: {
    totalSkus: number;
    totalValue: number;
    lowStockCount: number;
    lowStockItems: { name: string; quantity: number; minQuantity: number }[];
    sampleArticles: { name: string; quantity: number; category: string }[];
  }
) {
  try {
    const res = await fetch('/api/gemini/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, stockContext }),
    });
    const data = await res.json();
    return data.text || "Désolé, je n'ai pas pu traiter votre demande.";
  } catch (err: any) {
    console.error('Copilot error:', err);
    throw err;
  }
}

export async function generateProductSheetAI(description: string): Promise<Partial<Article>> {
  try {
    const res = await fetch('/api/gemini/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: description, action: 'generate_product_sheet' }),
    });
    const data = await res.json();
    return data.product;
  } catch (err: any) {
    console.error('Generate product sheet error:', err);
    throw err;
  }
}

export async function runDeepAudit(
  stockItems: Article[],
  movements: StockMovement[],
  suppliers: Supplier[]
): Promise<StockAuditResult> {
  try {
    const res = await fetch('/api/gemini/deep-audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stockItems: stockItems.map(a => ({
          reference: a.reference,
          name: a.name,
          category: a.category,
          quantity: a.quantity,
          minQuantity: a.minQuantity,
          idealQuantity: a.idealQuantity,
          purchasePrice: a.purchasePrice,
          sellingPrice: a.sellingPrice,
          supplier: a.supplier,
          location: a.location,
        })),
        movements: movements.slice(0, 30),
        suppliers: suppliers.map(s => ({ name: s.name, leadDays: s.deliveryLeadDays }))
      }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Erreur lors de l\'audit');
    }
    return data.audit;
  } catch (err: any) {
    console.error('Deep audit error:', err);
    throw err;
  }
}

export async function extractDocumentAI(imageBase64?: string, textContent?: string) {
  try {
    const res = await fetch('/api/gemini/extract-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, textContent }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Erreur d\'extraction');
    }
    return data.document;
  } catch (err: any) {
    console.error('Extract document error:', err);
    throw err;
  }
}

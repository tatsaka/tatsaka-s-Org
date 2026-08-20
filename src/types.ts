export interface Article {
  id: string;
  reference: string;
  barcode: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  idealQuantity: number;
  purchasePrice: number; // Prix d'achat HT
  sellingPrice: number;  // Prix de vente HT
  unit: string;          // pièce, kg, litre, carton, mètre, lot
  location: string;      // ex: Allée A - R3 - E2
  supplier: string;      // Nom du fournisseur
  notes?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type MovementType = 'entree' | 'sortie' | 'ajustement' | 'transfert' | 'retour';

export interface StockMovement {
  id: string;
  articleId: string;
  articleName: string;
  reference: string;
  type: MovementType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  performedBy: string;
  timestamp: string;
  cost?: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  deliveryLeadDays: number;
  categories: string[];
  notes?: string;
}

export interface OrderItem {
  articleId: string;
  reference: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type OrderStatus = 'draft' | 'ordered' | 'received_partial' | 'received' | 'cancelled';

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  expectedDelivery: string;
  notes?: string;
}

// Client Management (Module Clients)
export interface Client {
  id: string;
  name: string;
  company?: string;
  phone: string;
  email: string;
  address: string;
  city?: string;
  taxNumber?: string;
  totalPurchases: number; // Montant total des achats
  totalPaid: number;      // Montant total réglé
  balanceDue: number;     // Solde restant dû (Impayé)
  notes?: string;
  createdAt: string;
}

// Sales Orders & Invoices (Module Commandes & Factures)
export interface SaleOrderItem {
  articleId: string;
  reference: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  unitPrice: number; // Prix de vente
  total: number;
}

export type SaleOrderStatus = 'brouillon' | 'validee' | 'livree' | 'annulee';
export type PaymentStatus = 'impaye' | 'partiel' | 'paye';

export interface SaleOrder {
  id: string;
  orderNumber: string; // Ex: FAC-2026-001
  clientId: string;
  clientName: string;
  clientPhone?: string;
  items: SaleOrderItem[];
  subtotal: number;
  taxRate: number; // Ex: 0 ou 20%
  taxAmount: number;
  totalAmount: number;
  costTotal: number; // Somme des prix d'achat pour calcul du bénéfice
  paidAmount: number;
  status: SaleOrderStatus;
  paymentStatus: PaymentStatus;
  date: string;
  dueDate?: string;
  notes?: string;
  createdBy: string;
}

// Payments & Settlements (Module Règlements)
export type PaymentMethod = 'especes' | 'virement' | 'cheque' | 'carte';

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  orderNumber: string;
  clientId: string;
  clientName: string;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  reference?: string; // N° de chèque ou référence virement
  notes?: string;
  receivedBy: string;
}

export interface WarehouseLocation {
  id: string;
  code: string;
  zone: string;
  aisle: string;
  shelf: string;
  capacity: number;
  currentItemsCount: number;
}

// Roles & Permissions (Module Utilisateurs & RBAC)
export type RoleType = 'admin' | 'manager' | 'vendeur' | 'magasinier' | 'comptable';

export interface UserPermissions {
  canManageArticles: boolean;     // Créer, modifier, supprimer des articles
  canAdjustStock: boolean;        // Faire des entrées/sorties manuelles
  canManageClients: boolean;      // Ajouter / Modifier des clients
  canManageSales: boolean;        // Créer des commandes / factures
  canValidateSales: boolean;      // Valider et déduire le stock
  canManagePayments: boolean;     // Encaisser des règlements
  canViewReports: boolean;        // Voir les marges, bénéfices et statistiques
  canManageSuppliers: boolean;    // Gérer les fournisseurs & réassorts
  canManageUsers: boolean;        // Gérer les comptes et les permissions
}

export interface UserAccount {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: RoleType;
  permissions?: UserPermissions;
  photoURL?: string | null;
  phone?: string;
  isActive?: boolean;
  isDemo?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  phone?: string;
  permissions: UserPermissions;
  isActive: boolean;
  avatarColor?: string;
  lastLogin?: string;
}

export type Currency = 'MAD' | 'EUR' | 'USD' | string;

export function formatCurrency(amount: number, currency: Currency | string = 'MAD'): string {
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const curr = (currency || 'MAD').toString().toUpperCase();
  const formatted = num.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  switch (curr) {
    case 'MAD':
      return `${formatted} DH`;
    case 'EUR':
      return `${formatted} €`;
    case 'USD':
      return `$${formatted}`;
    default:
      return `${formatted} ${currency}`;
  }
}

export type MainModuleTab = 
  | 'dashboard' 
  | 'articles' 
  | 'clients' 
  | 'sales' 
  | 'payments' 
  | 'reports' 
  | 'users' 
  | 'movements' 
  | 'reorder' 
  | 'suppliers' 
  | 'warehouse' 
  | 'gemini';

export interface StockAuditResult {
  healthScore: number;
  summary: string;
  totalTiedCapital: number;
  deadStockEstimate: number;
  topRisks: {
    level: 'critique' | 'moyen' | 'faible';
    title: string;
    description: string;
    impact: string;
  }[];
  reorderRecommendations: {
    reference: string;
    name: string;
    currentStock: number;
    suggestedOrder: number;
    estimatedCost: number;
    supplier: string;
    priority: 'Haute' | 'Moyenne' | 'Basse';
    justification: string;
  }[];
  cashFlowOpportunities: {
    action: string;
    potentialSaving: number;
    impact: string;
  }[];
  strategicAdvice: string[];
}


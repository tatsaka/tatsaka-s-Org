import { 
  Article, 
  StockMovement, 
  Supplier, 
  PurchaseOrder, 
  Client, 
  SaleOrder, 
  PaymentRecord, 
  User 
} from '../types';

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'supp-1',
    name: 'TechLogistics France',
    contactName: 'Marc Dupont',
    email: 'contact@techlogistics.fr',
    phone: '+33 1 45 89 20 11',
    address: '14 Rue de l\'Industrie, 93200 Saint-Denis',
    deliveryLeadDays: 3,
    categories: ['Électronique & High-Tech', 'Bureautique & Consommables'],
    notes: 'Fournisseur principal matériel informatique certifié ISO 9001.'
  },
  {
    id: 'supp-2',
    name: 'Outillage Pro Express',
    contactName: 'Sophie Lambert',
    email: 'commandes@outillage-pro.fr',
    phone: '+33 4 72 10 33 44',
    address: 'Zone Industrielle Nord, 69000 Lyon',
    deliveryLeadDays: 2,
    categories: ['Outillage & Équipement', 'Équipements de Sécurité (EPI)'],
    notes: 'Livraison express en 48h, remises sur volume à partir de 500€.'
  },
  {
    id: 'supp-3',
    name: 'MecaParts Distribution',
    contactName: 'Karim Benali',
    email: 'k.benali@mecaparts.com',
    phone: '+33 3 20 55 78 90',
    address: '8 Boulevard de l\'Europe, 59000 Lille',
    deliveryLeadDays: 5,
    categories: ['Pièces Mécaniques & Maintenance'],
    notes: 'Pièces détachées industrielles et roulements haute précision.'
  },
  {
    id: 'supp-4',
    name: 'PackEco Solutions',
    contactName: 'Émilie Leroy',
    email: 'ventes@packeco.fr',
    phone: '+33 2 40 12 88 00',
    address: 'Parc d\'Activités Ouest, 44000 Nantes',
    deliveryLeadDays: 4,
    categories: ['Emballage & Conditionnement'],
    notes: 'Cartons recyclables, palettes et adhésifs industriels.'
  }
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art-1',
    reference: 'REF-ELEC-001',
    barcode: '3700123456789',
    name: 'Câble HDMI 2.1 Tressé 4K/8K 2m',
    category: 'Électronique & High-Tech',
    quantity: 45,
    minQuantity: 15,
    idealQuantity: 80,
    purchasePrice: 4.50,
    sellingPrice: 14.90,
    unit: 'pièce',
    location: 'Allée A - R1 - E1',
    supplier: 'TechLogistics France',
    notes: 'Haute résistance, connecteurs plaqués or.',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=60',
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-08-15T14:30:00.000Z'
  },
  {
    id: 'art-2',
    reference: 'REF-ELEC-002',
    barcode: '3700123456796',
    name: 'Adaptateur USB-C Hub 7-en-1 Aluminium',
    category: 'Électronique & High-Tech',
    quantity: 8,
    minQuantity: 12, // Stock faible !
    idealQuantity: 40,
    purchasePrice: 18.20,
    sellingPrice: 49.99,
    unit: 'pièce',
    location: 'Allée A - R1 - E2',
    supplier: 'TechLogistics France',
    notes: 'Compatible HDMI 4K, PD 100W, 3x USB 3.0, SD.',
    imageUrl: 'https://images.unsplash.com/photo-1618761714958-0efedfc7ce45?w=300&auto=format&fit=crop&q=60',
    createdAt: '2026-01-12T10:00:00.000Z',
    updatedAt: '2026-08-18T11:15:00.000Z'
  },
  {
    id: 'art-3',
    reference: 'REF-OUT-101',
    barcode: '3700123456802',
    name: 'Perceuse Visseuse Sans Fil 18V Brushless',
    category: 'Outillage & Équipement',
    quantity: 14,
    minQuantity: 5,
    idealQuantity: 20,
    purchasePrice: 75.00,
    sellingPrice: 149.00,
    unit: 'pièce',
    location: 'Allée B - R2 - E1',
    supplier: 'Outillage Pro Express',
    notes: 'Livré en mallette avec 2 batteries 4Ah et chargeur rapide.',
    imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=300&auto=format&fit=crop&q=60',
    createdAt: '2026-02-01T08:30:00.000Z',
    updatedAt: '2026-08-10T16:00:00.000Z'
  },
  {
    id: 'art-4',
    reference: 'REF-OUT-102',
    barcode: '3700123456819',
    name: 'Coffret Embouts de Vissage et Forets 100 Pièces',
    category: 'Outillage & Équipement',
    quantity: 0, // Rupture de stock !
    minQuantity: 10,
    idealQuantity: 35,
    purchasePrice: 19.50,
    sellingPrice: 39.90,
    unit: 'lot',
    location: 'Allée B - R2 - E3',
    supplier: 'Outillage Pro Express',
    notes: 'Acier titane haute résistance, boîtier renforcé.',
    imageUrl: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=300&auto=format&fit=crop&q=60',
    createdAt: '2026-02-05T11:00:00.000Z',
    updatedAt: '2026-08-19T09:45:00.000Z'
  },
  {
    id: 'art-5',
    reference: 'REF-EPI-201',
    barcode: '3700123456826',
    name: 'Gants de Manutention Anti-Coupure Niveau 5 (Lot 10)',
    category: 'Équipements de Sécurité (EPI)',
    quantity: 62,
    minQuantity: 20,
    idealQuantity: 70,
    purchasePrice: 12.00,
    sellingPrice: 28.50,
    unit: 'lot',
    location: 'Allée C - R1 - E1',
    supplier: 'Outillage Pro Express',
    notes: 'Norme EN 388, grip nitrile haute adhérence.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60',
    createdAt: '2026-02-15T14:00:00.000Z',
    updatedAt: '2026-08-12T10:00:00.000Z'
  },
  {
    id: 'art-6',
    reference: 'REF-EPI-202',
    barcode: '3700123456833',
    name: 'Casque de Chantier avec Visière et Molette de Serrage',
    category: 'Équipements de Sécurité (EPI)',
    quantity: 28,
    minQuantity: 15,
    idealQuantity: 50,
    purchasePrice: 14.20,
    sellingPrice: 32.00,
    unit: 'pièce',
    location: 'Allée C - R1 - E2',
    supplier: 'Outillage Pro Express',
    notes: 'Ventilé, conforme CE EN 397, coloris blanc haute visibilité.',
    imageUrl: 'https://images.unsplash.com/photo-1578885136359-16c8bd4d3a8e?w=300&auto=format&fit=crop&q=60',
    createdAt: '2026-03-01T09:30:00.000Z',
    updatedAt: '2026-08-16T15:20:00.000Z'
  },
  {
    id: 'art-7',
    reference: 'REF-BUR-301',
    barcode: '3700123456840',
    name: 'Carton Papier A4 80g Extra Blanc (5 Ramettes 500f)',
    category: 'Bureautique & Consommables',
    quantity: 110,
    minQuantity: 30,
    idealQuantity: 120,
    purchasePrice: 16.80,
    sellingPrice: 29.90,
    unit: 'carton',
    location: 'Allée D - R1 - E1',
    supplier: 'TechLogistics France',
    notes: 'Certifié FSC et Écolabel Européen, anti-bourrage.',
    imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=300&auto=format&fit=crop&q=60',
    createdAt: '2026-03-10T10:00:00.000Z',
    updatedAt: '2026-08-18T17:00:00.000Z'
  },
  {
    id: 'art-8',
    reference: 'REF-MEC-401',
    barcode: '3700123456857',
    name: 'Roulement à Billes Haute Vitesse SKF 6204-2RSH',
    category: 'Pièces Mécaniques & Maintenance',
    quantity: 4,
    minQuantity: 10, // Stock faible !
    idealQuantity: 30,
    purchasePrice: 6.40,
    sellingPrice: 15.80,
    unit: 'pièce',
    location: 'Allée E - R3 - E1',
    supplier: 'MecaParts Distribution',
    notes: 'Étanchéité renforcée caoutchouc des deux côtés.',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=60',
    createdAt: '2026-04-01T08:00:00.000Z',
    updatedAt: '2026-08-17T09:10:00.000Z'
  },
  {
    id: 'art-9',
    reference: 'REF-MEC-402',
    barcode: '3700123456864',
    name: 'Graisse Industrielle Haute Température Cartouche 400g',
    category: 'Pièces Mécaniques & Maintenance',
    quantity: 35,
    minQuantity: 12,
    idealQuantity: 40,
    purchasePrice: 3.80,
    sellingPrice: 9.50,
    unit: 'pièce',
    location: 'Allée E - R3 - E2',
    supplier: 'MecaParts Distribution',
    notes: 'Plage -30°C à +160°C, résiste à l\'eau et aux fortes charges.',
    imageUrl: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=300&auto=format&fit=crop&q=60',
    createdAt: '2026-04-05T13:40:00.000Z',
    updatedAt: '2026-08-14T11:00:00.000Z'
  },
  {
    id: 'art-10',
    reference: 'REF-PACK-501',
    barcode: '3700123456871',
    name: 'Rouleau Film Étirable Manuel Transparent 450mm x 300m',
    category: 'Emballage & Conditionnement',
    quantity: 85,
    minQuantity: 25,
    idealQuantity: 100,
    purchasePrice: 5.20,
    sellingPrice: 11.90,
    unit: 'pièce',
    location: 'Allée F - R1 - E1',
    supplier: 'PackEco Solutions',
    notes: 'Épaisseur 17 microns, haute élasticité.',
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=300&auto=format&fit=crop&q=60',
    createdAt: '2026-04-20T09:15:00.000Z',
    updatedAt: '2026-08-19T16:20:00.000Z'
  },
  {
    id: 'art-11',
    reference: 'REF-PACK-502',
    barcode: '3700123456888',
    name: 'Carton Double Cannelure 400x300x300mm (Lot de 25)',
    category: 'Emballage & Conditionnement',
    quantity: 180, // Surstock !
    minQuantity: 30,
    idealQuantity: 80,
    purchasePrice: 18.00,
    sellingPrice: 38.00,
    unit: 'lot',
    location: 'Allée F - R2 - E1',
    supplier: 'PackEco Solutions',
    notes: 'Résistance jusqu\'à 40kg, idéal expéditions lourdes.',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&auto=format&fit=crop&q=60',
    createdAt: '2026-05-02T14:10:00.000Z',
    updatedAt: '2026-08-16T10:45:00.000Z'
  },
  {
    id: 'art-12',
    reference: 'REF-ELEC-003',
    barcode: '3700123456895',
    name: 'Clavier Mécanique Rétroéclairé Sans Fil AZERTY',
    category: 'Électronique & High-Tech',
    quantity: 22,
    minQuantity: 8,
    idealQuantity: 25,
    purchasePrice: 42.00,
    sellingPrice: 89.90,
    unit: 'pièce',
    location: 'Allée A - R2 - E1',
    supplier: 'TechLogistics France',
    notes: 'Switches silencieux, autonomie 200h, Bluetooth + 2.4Ghz.',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&auto=format&fit=crop&q=60',
    createdAt: '2026-05-15T11:20:00.000Z',
    updatedAt: '2026-08-18T14:10:00.000Z'
  }
];

export const INITIAL_MOVEMENTS: StockMovement[] = [
  {
    id: 'mov-1',
    articleId: 'art-1',
    articleName: 'Câble HDMI 2.1 Tressé 4K/8K 2m',
    reference: 'REF-ELEC-001',
    type: 'entree',
    quantity: 25,
    previousQuantity: 20,
    newQuantity: 45,
    reason: 'Réception bon de commande BC-2026-084',
    performedBy: 'Ziad (Administrateur)',
    timestamp: '2026-08-15T14:30:00.000Z',
    cost: 112.50
  },
  {
    id: 'mov-2',
    articleId: 'art-2',
    articleName: 'Adaptateur USB-C Hub 7-en-1 Aluminium',
    reference: 'REF-ELEC-002',
    type: 'sortie',
    quantity: 12,
    previousQuantity: 20,
    newQuantity: 8,
    reason: 'Expédition commande client #CL-9921',
    performedBy: 'Ziad (Administrateur)',
    timestamp: '2026-08-18T11:15:00.000Z'
  },
  {
    id: 'mov-3',
    articleId: 'art-4',
    articleName: 'Coffret Embouts de Vissage et Forets 100 Pièces',
    reference: 'REF-OUT-102',
    type: 'sortie',
    quantity: 5,
    previousQuantity: 5,
    newQuantity: 0,
    reason: 'Vente directe comptoir',
    performedBy: 'Ziad (Administrateur)',
    timestamp: '2026-08-19T09:45:00.000Z'
  },
  {
    id: 'mov-4',
    articleId: 'art-7',
    articleName: 'Carton Papier A4 80g Extra Blanc (5 Ramettes 500f)',
    reference: 'REF-BUR-301',
    type: 'entree',
    quantity: 50,
    previousQuantity: 60,
    newQuantity: 110,
    reason: 'Réapprovisionnement fournisseur TechLogistics',
    performedBy: 'Sophie Lambert',
    timestamp: '2026-08-18T17:00:00.000Z',
    cost: 840.00
  },
  {
    id: 'mov-5',
    articleId: 'art-11',
    articleName: 'Carton Double Cannelure 400x300x300mm (Lot de 25)',
    reference: 'REF-PACK-501',
    type: 'ajustement',
    quantity: 10,
    previousQuantity: 170,
    newQuantity: 180,
    reason: 'Régularisation suite inventaire tournant Allée F',
    performedBy: 'Ziad (Administrateur)',
    timestamp: '2026-08-16T10:45:00.000Z'
  }
];

export const INITIAL_ORDERS: PurchaseOrder[] = [
  {
    id: 'ord-1',
    orderNumber: 'BC-2026-089',
    supplierId: 'supp-2',
    supplierName: 'Outillage Pro Express',
    items: [
      {
        articleId: 'art-4',
        reference: 'REF-OUT-102',
        name: 'Coffret Embouts de Vissage et Forets 100 Pièces',
        quantity: 35,
        unitPrice: 19.50,
        total: 682.50
      },
      {
        articleId: 'art-3',
        reference: 'REF-OUT-101',
        name: 'Perceuse Visseuse Sans Fil 18V Brushless',
        quantity: 10,
        unitPrice: 75.00,
        total: 750.00
      }
    ],
    totalAmount: 1432.50,
    status: 'ordered',
    createdAt: '2026-08-19T10:30:00.000Z',
    expectedDelivery: '2026-08-22',
    notes: 'Commande urgente pour réapprovisionnement des ruptures.'
  },
  {
    id: 'ord-2',
    orderNumber: 'BC-2026-088',
    supplierId: 'supp-1',
    supplierName: 'TechLogistics France',
    items: [
      {
        articleId: 'art-2',
        reference: 'REF-ELEC-002',
        name: 'Adaptateur USB-C Hub 7-en-1 Aluminium',
        quantity: 30,
        unitPrice: 18.20,
        total: 546.00
      }
    ],
    totalAmount: 546.00,
    status: 'draft',
    createdAt: '2026-08-20T08:15:00.000Z',
    expectedDelivery: '2026-08-25',
    notes: 'Brouillon généré par recommandation IA StockMind.'
  }
];

export const DEFAULT_ROLE_PERMISSIONS = {
  admin: {
    canManageArticles: true,
    canAdjustStock: true,
    canManageClients: true,
    canManageSales: true,
    canValidateSales: true,
    canManagePayments: true,
    canViewReports: true,
    canManageSuppliers: true,
    canManageUsers: true
  },
  manager: {
    canManageArticles: true,
    canAdjustStock: true,
    canManageClients: true,
    canManageSales: true,
    canValidateSales: true,
    canManagePayments: true,
    canViewReports: true,
    canManageSuppliers: true,
    canManageUsers: false
  },
  vendeur: {
    canManageArticles: false,
    canAdjustStock: false,
    canManageClients: true,
    canManageSales: true,
    canValidateSales: true,
    canManagePayments: true,
    canViewReports: false,
    canManageSuppliers: false,
    canManageUsers: false
  },
  magasinier: {
    canManageArticles: true,
    canAdjustStock: true,
    canManageClients: false,
    canManageSales: false,
    canValidateSales: false,
    canManagePayments: false,
    canViewReports: false,
    canManageSuppliers: true,
    canManageUsers: false
  },
  comptable: {
    canManageArticles: false,
    canAdjustStock: false,
    canManageClients: true,
    canManageSales: true,
    canValidateSales: false,
    canManagePayments: true,
    canViewReports: true,
    canManageSuppliers: false,
    canManageUsers: false
  }
};

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-1',
    name: 'Atlas Technologies SARL',
    company: 'Atlas Tech Maroc',
    phone: '+212 5 22 45 67 89',
    email: 'achats@atlastech.ma',
    address: '45 Boulevard d\'Anfa, 20000 Casablanca',
    city: 'Casablanca',
    taxNumber: 'ICE-001928374000088',
    totalPurchases: 18450.00,
    totalPaid: 18450.00,
    balanceDue: 0.00,
    notes: 'Client VIP compte pro, règlement à 30 jours fin de mois.',
    createdAt: '2026-01-15T08:30:00.000Z'
  },
  {
    id: 'cli-2',
    name: 'Société Maghrébine d\'Équipement',
    company: 'SME Maghreb',
    phone: '+212 5 37 70 12 34',
    email: 'contact@smemaghreb.ma',
    address: '12 Avenue Mohammed V, 10000 Rabat',
    city: 'Rabat',
    taxNumber: 'ICE-002847192000045',
    totalPurchases: 9615.48,
    totalPaid: 9615.48,
    balanceDue: 0.00,
    notes: 'Commandes récurrentes d\'outillage et fournitures industrielles.',
    createdAt: '2026-02-01T10:00:00.000Z'
  },
  {
    id: 'cli-3',
    name: 'Tanger Med Logistics Hub',
    company: 'Tanger Logistic Services',
    phone: '+212 5 39 32 44 00',
    email: 'logistique@tangermed-hub.ma',
    address: 'Zone Franche Tanger Med, 90000 Tanger',
    city: 'Tanger',
    taxNumber: 'ICE-003918273000021',
    totalPurchases: 3500.00,
    totalPaid: 3500.00,
    balanceDue: 0.00,
    notes: 'Plateforme portuaire, consommables et matériel de sécurité EPI.',
    createdAt: '2026-03-10T14:15:00.000Z'
  },
  {
    id: 'cli-4',
    name: 'Oasis BTP & Rénovation',
    company: 'Oasis BTP',
    phone: '+212 5 24 43 88 90',
    email: 'chantiers@oasisbtp.ma',
    address: 'Quartier Industriel Sidi Ghanem, 40000 Marrakech',
    city: 'Marrakech',
    taxNumber: 'ICE-004819201000012',
    totalPurchases: 0.00,
    totalPaid: 0.00,
    balanceDue: 0.00,
    notes: 'Nouveau prospect en attente de validation de devis.',
    createdAt: '2026-07-20T11:00:00.000Z'
  }
];

export const INITIAL_SALES_ORDERS: SaleOrder[] = [
  {
    id: 'sale-1',
    orderNumber: 'FAC-2026-001',
    clientId: 'cli-1',
    clientName: 'Atlas Technologies SARL',
    clientPhone: '+212 5 22 45 67 89',
    items: [
      {
        articleId: 'art-1',
        reference: 'REF-ELEC-001',
        name: 'Câble HDMI 2.1 Tressé 4K/8K 2m',
        quantity: 20,
        purchasePrice: 4.50,
        unitPrice: 14.90,
        total: 298.00
      },
      {
        articleId: 'art-3',
        reference: 'REF-OUT-101',
        name: 'Perceuse Visseuse Sans Fil 18V Brushless',
        quantity: 8,
        purchasePrice: 75.00,
        unitPrice: 149.00,
        total: 1192.00
      },
      {
        articleId: 'art-6',
        reference: 'REF-EPI-202',
        name: 'Gants de Protection Anti-Coupure Niveau 5 (Lot de 10)',
        quantity: 15,
        purchasePrice: 12.00,
        unitPrice: 28.50,
        total: 427.50
      }
    ],
    subtotal: 18450.00,
    taxRate: 0,
    taxAmount: 0,
    totalAmount: 18450.00,
    costTotal: 17280.00, // Permet un bénéfice net direct
    paidAmount: 18450.00,
    status: 'livree',
    paymentStatus: 'paye',
    date: '2026-08-15',
    dueDate: '2026-08-15',
    notes: 'Livraison effectuée avec succès. Paiement reçu par virement bancaire.',
    createdBy: 'ziad mimi'
  },
  {
    id: 'sale-2',
    orderNumber: 'FAC-2026-002',
    clientId: 'cli-2',
    clientName: 'Société Maghrébine d\'Équipement',
    clientPhone: '+212 5 37 70 12 34',
    items: [
      {
        articleId: 'art-2',
        reference: 'REF-ELEC-002',
        name: 'Adaptateur USB-C Hub 7-en-1 Aluminium',
        quantity: 12,
        purchasePrice: 18.20,
        unitPrice: 49.99,
        total: 599.88
      },
      {
        articleId: 'art-5',
        reference: 'REF-EPI-201',
        name: 'Casque de Chantier avec Visière Relevable',
        quantity: 6,
        purchasePrice: 9.80,
        unitPrice: 22.00,
        total: 132.00
      }
    ],
    subtotal: 9615.48,
    taxRate: 0,
    taxAmount: 0,
    totalAmount: 9615.48,
    costTotal: 9400.00,
    paidAmount: 9615.48,
    status: 'livree',
    paymentStatus: 'paye',
    date: '2026-08-18',
    dueDate: '2026-08-18',
    notes: 'Règlement par chèque bancaire encaissé.',
    createdBy: 'ziad mimi'
  },
  {
    id: 'sale-3',
    orderNumber: 'FAC-2026-003',
    clientId: 'cli-3',
    clientName: 'Tanger Med Logistics Hub',
    clientPhone: '+212 5 39 32 44 00',
    items: [
      {
        articleId: 'art-7',
        reference: 'REF-BUR-301',
        name: 'Carton Papier A4 80g Extra Blanc (5 Ramettes 500f)',
        quantity: 10,
        purchasePrice: 16.80,
        unitPrice: 26.50,
        total: 265.00
      },
      {
        articleId: 'art-11',
        reference: 'REF-PACK-501',
        name: 'Carton Double Cannelure 400x300x300mm (Lot de 25)',
        quantity: 5,
        purchasePrice: 14.50,
        unitPrice: 24.00,
        total: 120.00
      }
    ],
    subtotal: 3500.00,
    taxRate: 0,
    taxAmount: 0,
    totalAmount: 3500.00,
    costTotal: 3400.00,
    paidAmount: 3500.00,
    status: 'livree',
    paymentStatus: 'paye',
    date: '2026-08-19',
    dueDate: '2026-08-19',
    notes: 'Règlement comptant par carte bancaire TPE.',
    createdBy: 'Sara El Amrani'
  }
];

export const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-1',
    invoiceId: 'sale-1',
    orderNumber: 'FAC-2026-001',
    clientId: 'cli-1',
    clientName: 'Atlas Technologies SARL',
    amount: 18450.00,
    paymentDate: '2026-08-15',
    method: 'virement',
    reference: 'VIR-BMCE-992144',
    notes: 'Virement reçu sur compte Attijariwafa Bank',
    receivedBy: 'ziad mimi'
  },
  {
    id: 'pay-2',
    invoiceId: 'sale-2',
    orderNumber: 'FAC-2026-002',
    clientId: 'cli-2',
    clientName: 'Société Maghrébine d\'Équipement',
    amount: 9615.48,
    paymentDate: '2026-08-18',
    method: 'cheque',
    reference: 'CHQ-BP-8812903',
    notes: 'Chèque Banque Populaire déposé et encaissé',
    receivedBy: 'ziad mimi'
  },
  {
    id: 'pay-3',
    invoiceId: 'sale-3',
    orderNumber: 'FAC-2026-003',
    clientId: 'cli-3',
    clientName: 'Tanger Med Logistics Hub',
    amount: 3500.00,
    paymentDate: '2026-08-19',
    method: 'carte',
    reference: 'TPE-CBI-77123',
    notes: 'Paiement sans contact terminal TPE',
    receivedBy: 'Sara El Amrani'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'ziad mimi',
    email: 'ziad@gstock.ma',
    role: 'admin',
    phone: '+212 6 61 22 33 44',
    permissions: DEFAULT_ROLE_PERMISSIONS.admin,
    isActive: true,
    avatarColor: 'from-blue-600 to-indigo-600',
    lastLogin: '2026-08-20T08:00:00.000Z'
  },
  {
    id: 'usr-2',
    name: 'Sara El Amrani',
    email: 'sara.commerciale@gstock.ma',
    role: 'vendeur',
    phone: '+212 6 62 44 55 66',
    permissions: DEFAULT_ROLE_PERMISSIONS.vendeur,
    isActive: true,
    avatarColor: 'from-emerald-600 to-teal-600',
    lastLogin: '2026-08-20T07:45:00.000Z'
  },
  {
    id: 'usr-3',
    name: 'Karim Tazi',
    email: 'karim.depot@gstock.ma',
    role: 'magasinier',
    phone: '+212 6 63 77 88 99',
    permissions: DEFAULT_ROLE_PERMISSIONS.magasinier,
    isActive: true,
    avatarColor: 'from-amber-500 to-orange-600',
    lastLogin: '2026-08-19T16:30:00.000Z'
  },
  {
    id: 'usr-4',
    name: 'Fatima Zahra',
    email: 'compta@gstock.ma',
    role: 'comptable',
    phone: '+212 6 64 11 22 33',
    permissions: DEFAULT_ROLE_PERMISSIONS.comptable,
    isActive: true,
    avatarColor: 'from-purple-600 to-pink-600',
    lastLogin: '2026-08-18T14:10:00.000Z'
  },
  {
    id: 'usr-5',
    name: 'Youssef Berrada',
    email: 'youssef.manager@gstock.ma',
    role: 'manager',
    phone: '+212 6 65 99 00 11',
    permissions: DEFAULT_ROLE_PERMISSIONS.manager,
    isActive: true,
    avatarColor: 'from-cyan-600 to-blue-700',
    lastLogin: '2026-08-17T09:20:00.000Z'
  }
];

export const DEMO_USERS = INITIAL_USERS;



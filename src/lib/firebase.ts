import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  writeBatch
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  Article, 
  StockMovement, 
  Supplier, 
  PurchaseOrder, 
  UserAccount, 
  Client, 
  SaleOrder, 
  PaymentRecord, 
  User as AppUser 
} from '../types';
import { 
  INITIAL_ARTICLES, 
  INITIAL_MOVEMENTS, 
  INITIAL_SUPPLIERS, 
  INITIAL_ORDERS,
  INITIAL_CLIENTS,
  INITIAL_SALES_ORDERS,
  INITIAL_PAYMENTS,
  INITIAL_USERS
} from './demoData';

// Initialize Firebase safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Local Storage Fallback Keys
const LS_ARTICLES_KEY = 'stock_app_articles';
const LS_MOVEMENTS_KEY = 'stock_app_movements';
const LS_SUPPLIERS_KEY = 'stock_app_suppliers';
const LS_ORDERS_KEY = 'stock_app_orders';
const LS_USER_KEY = 'stock_app_user';
const LS_CLIENTS_KEY = 'stock_app_clients';
const LS_SALES_KEY = 'stock_app_sales';
const LS_PAYMENTS_KEY = 'stock_app_payments';
const LS_USERS_LIST_KEY = 'stock_app_users_list';

// Helper to get local data
export function getLocalData<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Error reading localStorage for ${key}`, err);
    return fallback;
  }
}

export function saveLocalData<T>(key: string, data: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Error saving to localStorage for ${key}`, err);
  }
}

// Seed initial database
export async function seedFirestoreDatabase(): Promise<boolean> {
  try {
    const batch = writeBatch(db);
    
    // Seed articles
    for (const art of INITIAL_ARTICLES) {
      const artRef = doc(db, 'articles', art.id);
      batch.set(artRef, art);
    }

    // Seed suppliers
    for (const supp of INITIAL_SUPPLIERS) {
      const suppRef = doc(db, 'suppliers', supp.id);
      batch.set(suppRef, supp);
    }

    // Seed movements
    for (const mov of INITIAL_MOVEMENTS) {
      const movRef = doc(db, 'movements', mov.id);
      batch.set(movRef, mov);
    }

    // Seed orders
    for (const ord of INITIAL_ORDERS) {
      const ordRef = doc(db, 'orders', ord.id);
      batch.set(ordRef, ord);
    }

    // Seed clients
    for (const cli of INITIAL_CLIENTS) {
      const cliRef = doc(db, 'clients', cli.id);
      batch.set(cliRef, cli);
    }

    // Seed sales
    for (const sale of INITIAL_SALES_ORDERS) {
      const saleRef = doc(db, 'sales', sale.id);
      batch.set(saleRef, sale);
    }

    // Seed payments
    for (const pay of INITIAL_PAYMENTS) {
      const payRef = doc(db, 'payments', pay.id);
      batch.set(payRef, pay);
    }

    // Seed users
    for (const u of INITIAL_USERS) {
      const uRef = doc(db, 'users', u.id);
      batch.set(uRef, u);
    }

    await batch.commit();

    // Also update local cache
    saveLocalData(LS_ARTICLES_KEY, INITIAL_ARTICLES);
    saveLocalData(LS_MOVEMENTS_KEY, INITIAL_MOVEMENTS);
    saveLocalData(LS_SUPPLIERS_KEY, INITIAL_SUPPLIERS);
    saveLocalData(LS_ORDERS_KEY, INITIAL_ORDERS);
    saveLocalData(LS_CLIENTS_KEY, INITIAL_CLIENTS);
    saveLocalData(LS_SALES_KEY, INITIAL_SALES_ORDERS);
    saveLocalData(LS_PAYMENTS_KEY, INITIAL_PAYMENTS);
    saveLocalData(LS_USERS_LIST_KEY, INITIAL_USERS);

    return true;
  } catch (error) {
    console.warn('Firestore bulk seeding failed, initialized in localStorage fallback:', error);
    saveLocalData(LS_ARTICLES_KEY, INITIAL_ARTICLES);
    saveLocalData(LS_MOVEMENTS_KEY, INITIAL_MOVEMENTS);
    saveLocalData(LS_SUPPLIERS_KEY, INITIAL_SUPPLIERS);
    saveLocalData(LS_ORDERS_KEY, INITIAL_ORDERS);
    saveLocalData(LS_CLIENTS_KEY, INITIAL_CLIENTS);
    saveLocalData(LS_SALES_KEY, INITIAL_SALES_ORDERS);
    saveLocalData(LS_PAYMENTS_KEY, INITIAL_PAYMENTS);
    saveLocalData(LS_USERS_LIST_KEY, INITIAL_USERS);
    return true;
  }
}

export const seedInitialData = seedFirestoreDatabase;


// Subscribe to articles (Real-time Firestore + Local fallback)
export function subscribeArticles(callback: (articles: Article[]) => void) {
  try {
    const q = query(collection(db, 'articles'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const items: Article[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as Article);
        });
        saveLocalData(LS_ARTICLES_KEY, items);
        callback(items);
      } else {
        // If empty on firestore, seed or fallback
        const local = getLocalData<Article>(LS_ARTICLES_KEY, INITIAL_ARTICLES);
        callback(local);
      }
    }, (err) => {
      console.warn('Firestore articles subscription fallback:', err);
      const local = getLocalData<Article>(LS_ARTICLES_KEY, INITIAL_ARTICLES);
      callback(local);
    });
    return unsubscribe;
  } catch {
    const local = getLocalData<Article>(LS_ARTICLES_KEY, INITIAL_ARTICLES);
    callback(local);
    return () => {};
  }
}

// Subscribe to movements
export function subscribeMovements(callback: (movements: StockMovement[]) => void) {
  try {
    const q = query(collection(db, 'movements'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const items: StockMovement[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as StockMovement);
        });
        saveLocalData(LS_MOVEMENTS_KEY, items);
        callback(items);
      } else {
        const local = getLocalData<StockMovement>(LS_MOVEMENTS_KEY, INITIAL_MOVEMENTS);
        callback(local);
      }
    }, (err) => {
      console.warn('Firestore movements fallback:', err);
      const local = getLocalData<StockMovement>(LS_MOVEMENTS_KEY, INITIAL_MOVEMENTS);
      callback(local);
    });
    return unsubscribe;
  } catch {
    const local = getLocalData<StockMovement>(LS_MOVEMENTS_KEY, INITIAL_MOVEMENTS);
    callback(local);
    return () => {};
  }
}

// Subscribe to suppliers
export function subscribeSuppliers(callback: (suppliers: Supplier[]) => void) {
  try {
    const q = query(collection(db, 'suppliers'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const items: Supplier[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as Supplier);
        });
        saveLocalData(LS_SUPPLIERS_KEY, items);
        callback(items);
      } else {
        const local = getLocalData<Supplier>(LS_SUPPLIERS_KEY, INITIAL_SUPPLIERS);
        callback(local);
      }
    }, (err) => {
      console.warn('Firestore suppliers fallback:', err);
      const local = getLocalData<Supplier>(LS_SUPPLIERS_KEY, INITIAL_SUPPLIERS);
      callback(local);
    });
    return unsubscribe;
  } catch {
    const local = getLocalData<Supplier>(LS_SUPPLIERS_KEY, INITIAL_SUPPLIERS);
    callback(local);
    return () => {};
  }
}

// Subscribe to orders
export function subscribeOrders(callback: (orders: PurchaseOrder[]) => void) {
  try {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const items: PurchaseOrder[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as PurchaseOrder);
        });
        saveLocalData(LS_ORDERS_KEY, items);
        callback(items);
      } else {
        const local = getLocalData<PurchaseOrder>(LS_ORDERS_KEY, INITIAL_ORDERS);
        callback(local);
      }
    }, (err) => {
      console.warn('Firestore orders fallback:', err);
      const local = getLocalData<PurchaseOrder>(LS_ORDERS_KEY, INITIAL_ORDERS);
      callback(local);
    });
    return unsubscribe;
  } catch {
    const local = getLocalData<PurchaseOrder>(LS_ORDERS_KEY, INITIAL_ORDERS);
    callback(local);
    return () => {};
  }
}

// Create or update article
export async function saveArticle(article: Article): Promise<void> {
  const isNew = !article.id || article.id.startsWith('temp-');
  const id = isNew ? `art-${Date.now()}` : article.id;
  const cleaned: Article = {
    ...article,
    id,
    updatedAt: new Date().toISOString(),
    createdAt: article.createdAt || new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'articles', id), cleaned, { merge: true });
  } catch (err) {
    console.warn('Firestore write failed, saving to local cache:', err);
  }

  // Update local
  const current = getLocalData<Article>(LS_ARTICLES_KEY, INITIAL_ARTICLES);
  const index = current.findIndex(a => a.id === id);
  if (index >= 0) {
    current[index] = cleaned;
  } else {
    current.unshift(cleaned);
  }
  saveLocalData(LS_ARTICLES_KEY, current);
}

// Delete article
export async function removeArticle(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'articles', id));
  } catch (err) {
    console.warn('Firestore delete failed, removing locally:', err);
  }
  const current = getLocalData<Article>(LS_ARTICLES_KEY, INITIAL_ARTICLES);
  saveLocalData(LS_ARTICLES_KEY, current.filter(a => a.id !== id));
}

// Record stock movement (updates article quantity and writes movement log)
export async function recordStockMovement(
  article: Article,
  type: 'entree' | 'sortie' | 'ajustement' | 'transfert' | 'retour',
  quantity: number,
  reason: string,
  userName: string = 'Ziad (Admin)'
): Promise<StockMovement> {
  const previousQuantity = Number(article.quantity) || 0;
  let newQuantity = previousQuantity;

  if (type === 'entree' || type === 'retour') {
    newQuantity = previousQuantity + Number(quantity);
  } else if (type === 'sortie') {
    newQuantity = Math.max(0, previousQuantity - Number(quantity));
  } else if (type === 'ajustement') {
    newQuantity = Number(quantity); // For adjustment, quantity is the new target count
  }

  const movementId = `mov-${Date.now()}`;
  const movement: StockMovement = {
    id: movementId,
    articleId: article.id,
    articleName: article.name,
    reference: article.reference,
    type,
    quantity: type === 'ajustement' ? Math.abs(newQuantity - previousQuantity) : Number(quantity),
    previousQuantity,
    newQuantity,
    reason: reason || 'Mouvement de stock standard',
    performedBy: userName,
    timestamp: new Date().toISOString(),
    cost: Number((Number(quantity) * (article.purchasePrice || 0)).toFixed(2))
  };

  // Update Article in Firestore
  try {
    await updateDoc(doc(db, 'articles', article.id), {
      quantity: newQuantity,
      updatedAt: new Date().toISOString()
    });
    await setDoc(doc(db, 'movements', movementId), movement);
  } catch (err) {
    console.warn('Firestore movement recording failed, saving locally:', err);
  }

  // Update Local Storage
  const articles = getLocalData<Article>(LS_ARTICLES_KEY, INITIAL_ARTICLES);
  const artIdx = articles.findIndex(a => a.id === article.id);
  if (artIdx >= 0) {
    articles[artIdx].quantity = newQuantity;
    articles[artIdx].updatedAt = new Date().toISOString();
    saveLocalData(LS_ARTICLES_KEY, articles);
  }

  const movements = getLocalData<StockMovement>(LS_MOVEMENTS_KEY, INITIAL_MOVEMENTS);
  movements.unshift(movement);
  saveLocalData(LS_MOVEMENTS_KEY, movements);

  return movement;
}

// Save Supplier
export async function saveSupplier(supplier: Supplier): Promise<void> {
  const id = supplier.id || `supp-${Date.now()}`;
  const cleaned = { ...supplier, id };
  try {
    await setDoc(doc(db, 'suppliers', id), cleaned, { merge: true });
  } catch (err) {
    console.warn('Firestore write failed, updating local:', err);
  }
  const current = getLocalData<Supplier>(LS_SUPPLIERS_KEY, INITIAL_SUPPLIERS);
  const idx = current.findIndex(s => s.id === id);
  if (idx >= 0) {
    current[idx] = cleaned;
  } else {
    current.push(cleaned);
  }
  saveLocalData(LS_SUPPLIERS_KEY, current);
}

// Save Order
export async function saveOrder(order: PurchaseOrder): Promise<void> {
  const id = order.id || `ord-${Date.now()}`;
  const cleaned = { ...order, id };
  try {
    await setDoc(doc(db, 'orders', id), cleaned, { merge: true });
  } catch (err) {
    console.warn('Firestore write order failed, updating local:', err);
  }
  const current = getLocalData<PurchaseOrder>(LS_ORDERS_KEY, INITIAL_ORDERS);
  const idx = current.findIndex(o => o.id === id);
  if (idx >= 0) {
    current[idx] = cleaned;
  } else {
    current.unshift(cleaned);
  }
  saveLocalData(LS_ORDERS_KEY, current);
}

// Receive order (adds stock for all order items)
export async function receivePurchaseOrder(order: PurchaseOrder, userName: string = 'Ziad'): Promise<void> {
  const updatedOrder: PurchaseOrder = {
    ...order,
    status: 'received'
  };
  await saveOrder(updatedOrder);

  // Update quantities for each article
  const currentArticles = getLocalData<Article>(LS_ARTICLES_KEY, INITIAL_ARTICLES);
  for (const item of order.items) {
    const art = currentArticles.find(a => a.id === item.articleId || a.reference === item.reference);
    if (art) {
      await recordStockMovement(
        art,
        'entree',
        item.quantity,
        `Réception commande fournisseur ${order.orderNumber}`,
        userName
      );
    }
  }
}

// Aliases for convenience
export const deleteArticle = removeArticle;
export const receiveOrderItems = receivePurchaseOrder;

export async function recordMovement(mov: StockMovement): Promise<void> {
  const currentArticles = getLocalData<Article>(LS_ARTICLES_KEY, INITIAL_ARTICLES);
  const targetArt = currentArticles.find(a => a.id === mov.articleId || a.reference === mov.reference);
  if (targetArt) {
    await recordStockMovement(
      targetArt,
      mov.type,
      mov.quantity,
      mov.reason,
      mov.performedBy
    );
  } else {
    // If article not found in cache, still persist movement
    try {
      await setDoc(doc(db, 'movements', mov.id), mov);
    } catch {}
    const movements = getLocalData<StockMovement>(LS_MOVEMENTS_KEY, INITIAL_MOVEMENTS);
    movements.unshift(mov);
    saveLocalData(LS_MOVEMENTS_KEY, movements);
  }
}

// -------------------------------------------------------------
// CLIENTS MANAGEMENT (Module Clients)
// -------------------------------------------------------------
export function subscribeClients(callback: (clients: Client[]) => void): () => void {
  const local = getLocalData<Client>(LS_CLIENTS_KEY, INITIAL_CLIENTS);
  callback(local);

  try {
    const q = query(collection(db, 'clients'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
        saveLocalData(LS_CLIENTS_KEY, items);
        callback(items);
      }
    }, (err) => {
      console.warn('Clients snapshot listener fallback to localStorage:', err);
    });
    return unsubscribe;
  } catch (err) {
    return () => {};
  }
}

export async function saveClient(client: Client): Promise<void> {
  const id = client.id || `cli-${Date.now()}`;
  const cleaned = { ...client, id };
  try {
    await setDoc(doc(db, 'clients', id), cleaned, { merge: true });
  } catch (err) {
    console.warn('Firestore write client failed, saving locally:', err);
  }
  const current = getLocalData<Client>(LS_CLIENTS_KEY, INITIAL_CLIENTS);
  const idx = current.findIndex(c => c.id === id);
  if (idx >= 0) {
    current[idx] = cleaned;
  } else {
    current.unshift(cleaned);
  }
  saveLocalData(LS_CLIENTS_KEY, current);
}

export async function deleteClient(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'clients', id));
  } catch (err) {
    console.warn('Firestore delete client failed, removing locally:', err);
  }
  const current = getLocalData<Client>(LS_CLIENTS_KEY, INITIAL_CLIENTS);
  const filtered = current.filter(c => c.id !== id);
  saveLocalData(LS_CLIENTS_KEY, filtered);
}

// -------------------------------------------------------------
// SALES ORDERS & INVOICES (Module Commandes & Factures)
// -------------------------------------------------------------
export function subscribeSalesOrders(callback: (sales: SaleOrder[]) => void): () => void {
  const local = getLocalData<SaleOrder>(LS_SALES_KEY, INITIAL_SALES_ORDERS);
  callback(local);

  try {
    const q = query(collection(db, 'sales'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SaleOrder));
        saveLocalData(LS_SALES_KEY, items);
        callback(items);
      }
    }, (err) => {
      console.warn('Sales snapshot listener fallback to localStorage:', err);
    });
    return unsubscribe;
  } catch (err) {
    return () => {};
  }
}

export async function saveSalesOrder(order: SaleOrder, deductStockOnValidate: boolean = false, performedBy: string = 'ziad mimi'): Promise<void> {
  const id = order.id || `sale-${Date.now()}`;
  const cleaned = { ...order, id };

  try {
    await setDoc(doc(db, 'sales', id), cleaned, { merge: true });
  } catch (err) {
    console.warn('Firestore write sales failed, saving locally:', err);
  }

  const current = getLocalData<SaleOrder>(LS_SALES_KEY, INITIAL_SALES_ORDERS);
  const idx = current.findIndex(s => s.id === id);
  if (idx >= 0) {
    current[idx] = cleaned;
  } else {
    current.unshift(cleaned);
  }
  saveLocalData(LS_SALES_KEY, current);

  // If order is validated or delivered and stock deduction requested, record movement
  if (deductStockOnValidate && (order.status === 'validee' || order.status === 'livree')) {
    const currentArticles = getLocalData<Article>(LS_ARTICLES_KEY, INITIAL_ARTICLES);
    for (const item of order.items) {
      const art = currentArticles.find(a => a.id === item.articleId || a.reference === item.reference);
      if (art) {
        await recordStockMovement(
          art,
          'sortie',
          item.quantity,
          `Vente client ${order.orderNumber} - ${order.clientName}`,
          performedBy
        );
      }
    }
  }

  // Update client total purchases & balance due
  const clients = getLocalData<Client>(LS_CLIENTS_KEY, INITIAL_CLIENTS);
  const clientIdx = clients.findIndex(c => c.id === order.clientId);
  if (clientIdx >= 0) {
    const clientSales = current.filter(s => s.clientId === order.clientId && s.status !== 'annulee');
    const totalPurchases = clientSales.reduce((acc, s) => acc + s.totalAmount, 0);
    const totalPaid = clientSales.reduce((acc, s) => acc + s.paidAmount, 0);
    clients[clientIdx].totalPurchases = totalPurchases;
    clients[clientIdx].totalPaid = totalPaid;
    clients[clientIdx].balanceDue = Math.max(0, totalPurchases - totalPaid);
    saveLocalData(LS_CLIENTS_KEY, clients);
    try {
      await updateDoc(doc(db, 'clients', order.clientId), {
        totalPurchases,
        totalPaid,
        balanceDue: Math.max(0, totalPurchases - totalPaid)
      });
    } catch {}
  }
}

export async function deleteSalesOrder(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'sales', id));
  } catch (err) {
    console.warn('Firestore delete sales failed, removing locally:', err);
  }
  const current = getLocalData<SaleOrder>(LS_SALES_KEY, INITIAL_SALES_ORDERS);
  const filtered = current.filter(s => s.id !== id);
  saveLocalData(LS_SALES_KEY, filtered);
}

// -------------------------------------------------------------
// PAYMENTS & SETTLEMENTS (Module Règlements)
// -------------------------------------------------------------
export function subscribePayments(callback: (payments: PaymentRecord[]) => void): () => void {
  const local = getLocalData<PaymentRecord>(LS_PAYMENTS_KEY, INITIAL_PAYMENTS);
  callback(local);

  try {
    const q = query(collection(db, 'payments'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentRecord));
        saveLocalData(LS_PAYMENTS_KEY, items);
        callback(items);
      }
    }, (err) => {
      console.warn('Payments snapshot listener fallback to localStorage:', err);
    });
    return unsubscribe;
  } catch (err) {
    return () => {};
  }
}

export async function savePayment(payment: PaymentRecord): Promise<void> {
  const id = payment.id || `pay-${Date.now()}`;
  const cleaned = { ...payment, id };

  try {
    await setDoc(doc(db, 'payments', id), cleaned, { merge: true });
  } catch (err) {
    console.warn('Firestore write payment failed, saving locally:', err);
  }

  const current = getLocalData<PaymentRecord>(LS_PAYMENTS_KEY, INITIAL_PAYMENTS);
  const idx = current.findIndex(p => p.id === id);
  if (idx >= 0) {
    current[idx] = cleaned;
  } else {
    current.unshift(cleaned);
  }
  saveLocalData(LS_PAYMENTS_KEY, current);

  // Update associated SaleOrder paidAmount and status
  if (payment.invoiceId) {
    const sales = getLocalData<SaleOrder>(LS_SALES_KEY, INITIAL_SALES_ORDERS);
    const saleIdx = sales.findIndex(s => s.id === payment.invoiceId || s.orderNumber === payment.orderNumber);
    if (saleIdx >= 0) {
      const order = sales[saleIdx];
      const newPaidAmount = Math.min(order.totalAmount, order.paidAmount + payment.amount);
      const newPaymentStatus = newPaidAmount >= order.totalAmount ? 'paye' : (newPaidAmount > 0 ? 'partiel' : 'impaye');
      
      sales[saleIdx].paidAmount = newPaidAmount;
      sales[saleIdx].paymentStatus = newPaymentStatus;
      saveLocalData(LS_SALES_KEY, sales);

      try {
        await updateDoc(doc(db, 'sales', order.id), {
          paidAmount: newPaidAmount,
          paymentStatus: newPaymentStatus
        });
      } catch {}
    }
  }

  // Update Client totalPaid & balanceDue
  if (payment.clientId) {
    const clients = getLocalData<Client>(LS_CLIENTS_KEY, INITIAL_CLIENTS);
    const cliIdx = clients.findIndex(c => c.id === payment.clientId);
    if (cliIdx >= 0) {
      const client = clients[cliIdx];
      const newTotalPaid = client.totalPaid + payment.amount;
      const newBalanceDue = Math.max(0, client.totalPurchases - newTotalPaid);
      clients[cliIdx].totalPaid = newTotalPaid;
      clients[cliIdx].balanceDue = newBalanceDue;
      saveLocalData(LS_CLIENTS_KEY, clients);

      try {
        await updateDoc(doc(db, 'clients', payment.clientId), {
          totalPaid: newTotalPaid,
          balanceDue: newBalanceDue
        });
      } catch {}
    }
  }
}

export async function deletePayment(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'payments', id));
  } catch (err) {
    console.warn('Firestore delete payment failed, removing locally:', err);
  }
  const current = getLocalData<PaymentRecord>(LS_PAYMENTS_KEY, INITIAL_PAYMENTS);
  const filtered = current.filter(p => p.id !== id);
  saveLocalData(LS_PAYMENTS_KEY, filtered);
}

// -------------------------------------------------------------
// USERS & RBAC MANAGEMENT (Module Utilisateurs & Droits)
// -------------------------------------------------------------
export function subscribeUsers(callback: (users: AppUser[]) => void): () => void {
  const local = getLocalData<AppUser>(LS_USERS_LIST_KEY, INITIAL_USERS);
  callback(local);

  try {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppUser));
        saveLocalData(LS_USERS_LIST_KEY, items);
        callback(items);
      }
    }, (err) => {
      console.warn('Users snapshot listener fallback to localStorage:', err);
    });
    return unsubscribe;
  } catch (err) {
    return () => {};
  }
}

export const subscribeUserAccounts = subscribeUsers;


export async function saveUserAccount(user: AppUser): Promise<void> {
  const id = user.id || `usr-${Date.now()}`;
  const cleaned = { ...user, id };

  try {
    await setDoc(doc(db, 'users', id), cleaned, { merge: true });
  } catch (err) {
    console.warn('Firestore write user failed, saving locally:', err);
  }

  const current = getLocalData<AppUser>(LS_USERS_LIST_KEY, INITIAL_USERS);
  const idx = current.findIndex(u => u.id === id);
  if (idx >= 0) {
    current[idx] = cleaned;
  } else {
    current.push(cleaned);
  }
  saveLocalData(LS_USERS_LIST_KEY, current);
}

export async function deleteUserAccount(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', id));
  } catch (err) {
    console.warn('Firestore delete user failed, removing locally:', err);
  }
  const current = getLocalData<AppUser>(LS_USERS_LIST_KEY, INITIAL_USERS);
  const filtered = current.filter(u => u.id !== id);
  saveLocalData(LS_USERS_LIST_KEY, filtered);
}


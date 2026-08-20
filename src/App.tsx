import React, { useState, useEffect } from 'react';
import { 
  Article, 
  StockMovement, 
  PurchaseOrder, 
  Supplier, 
  Client, 
  SaleOrder, 
  PaymentRecord, 
  User, 
  Currency,
  MainModuleTab 
} from './types';
import { 
  subscribeArticles, 
  subscribeMovements, 
  subscribeOrders, 
  subscribeSuppliers,
  subscribeClients,
  subscribeSalesOrders,
  subscribePayments,
  subscribeUserAccounts,
  saveArticle,
  deleteArticle,
  recordMovement,
  saveOrder,
  receiveOrderItems,
  saveSupplier,
  saveClient,
  deleteClient,
  saveSalesOrder,
  deleteSalesOrder,
  savePayment,
  deletePayment,
  saveUserAccount,
  deleteUserAccount,
  seedInitialData
} from './lib/firebase';
import { DEMO_USERS } from './lib/demoData';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ArticlesView } from './components/ArticlesView';
import { ClientsView } from './components/ClientsView';
import { SalesOrdersView } from './components/SalesOrdersView';
import { PaymentsView } from './components/PaymentsView';
import { ReportsView } from './components/ReportsView';
import { UsersManagementView } from './components/UsersManagementView';
import { MovementsView } from './components/MovementsView';
import { ReorderView } from './components/ReorderView';
import { SuppliersView } from './components/SuppliersView';
import { WarehouseView } from './components/WarehouseView';
import { GeminiStudioView } from './components/GeminiStudioView';

// Modals
import { ArticleModal } from './components/ArticleModal';
import { ClientModal } from './components/ClientModal';
import { SaleOrderModal } from './components/SaleOrderModal';
import { PaymentModal } from './components/PaymentModal';
import { UserModal } from './components/UserModal';
import { MovementModal } from './components/MovementModal';
import { BarcodeModal } from './components/BarcodeModal';
import { AuthModal } from './components/AuthModal';

export const App: React.FC = () => {
  // Navigation & Theme
  const [activeTab, setActiveTab] = useState<MainModuleTab>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [currency, setCurrency] = useState<Currency>('MAD');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Authentication State with full RBAC
  const [currentUser, setCurrentUser] = useState<User | null>(() => DEMO_USERS[0]);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Core Domain State
  const [articles, setArticles] = useState<Article[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [salesOrders, setSalesOrders] = useState<SaleOrder[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);

  // Modals state
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [editingSaleOrder, setEditingSaleOrder] = useState<SaleOrder | null>(null);
  const [targetClientForSale, setTargetClientForSale] = useState<Client | null>(null);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [targetSaleOrderForPayment, setTargetSaleOrderForPayment] = useState<SaleOrder | null>(null);

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [preselectedArticleForMovement, setPreselectedArticleForMovement] = useState<Article | null>(null);
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [selectedArticleForBarcode, setSelectedArticleForBarcode] = useState<Article | null>(null);

  // Subscriptions to Firestore / Local Storage fallback
  useEffect(() => {
    const unsubArticles = subscribeArticles(setArticles);
    const unsubMovements = subscribeMovements(setMovements);
    const unsubOrders = subscribeOrders(setOrders);
    const unsubSuppliers = subscribeSuppliers(setSuppliers);
    const unsubClients = subscribeClients(setClients);
    const unsubSales = subscribeSalesOrders(setSalesOrders);
    const unsubPayments = subscribePayments(setPayments);
    const unsubUsers = subscribeUserAccounts(setUsersList);

    return () => {
      unsubArticles();
      unsubMovements();
      unsubOrders();
      unsubSuppliers();
      unsubClients();
      unsubSales();
      unsubPayments();
      unsubUsers();
    };
  }, []);

  // Sync Dark mode with DOM
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handlers for Articles
  const handleOpenNewArticle = () => {
    setEditingArticle(null);
    setArticleModalOpen(true);
  };

  const handleOpenEditArticle = (art: Article) => {
    setEditingArticle(art);
    setArticleModalOpen(true);
  };

  const handleSaveArticle = async (art: Article) => {
    await saveArticle(art);
  };

  const handleDeleteArticle = async (id: string) => {
    await deleteArticle(id);
  };

  // Handlers for Clients
  const handleOpenNewClient = () => {
    setEditingClient(null);
    setClientModalOpen(true);
  };

  const handleOpenEditClient = (cli: Client) => {
    setEditingClient(cli);
    setClientModalOpen(true);
  };

  const handleSaveClient = async (cli: Client) => {
    await saveClient(cli);
  };

  const handleDeleteClient = async (id: string) => {
    await deleteClient(id);
  };

  // Handlers for Sales Orders
  const handleOpenNewSale = (client?: Client) => {
    setEditingSaleOrder(null);
    setTargetClientForSale(client || null);
    setSaleModalOpen(true);
  };

  const handleOpenEditSale = (order: SaleOrder) => {
    setEditingSaleOrder(order);
    setTargetClientForSale(null);
    setSaleModalOpen(true);
  };

  const handleSaveSale = async (order: SaleOrder) => {
    await saveSalesOrder(order, currentUser?.name || 'Vendeur G.Stock');
  };

  const handleDeleteSale = async (id: string) => {
    await deleteSalesOrder(id);
  };

  // Handlers for Payments
  const handleOpenNewPayment = (order?: SaleOrder) => {
    setTargetSaleOrderForPayment(order || null);
    setPaymentModalOpen(true);
  };

  const handleSavePayment = async (payment: PaymentRecord) => {
    await savePayment(payment);
  };

  const handleDeletePayment = async (id: string) => {
    await deletePayment(id);
  };

  // Handlers for Users & RBAC
  const handleOpenNewUser = () => {
    setEditingUser(null);
    setUserModalOpen(true);
  };

  const handleOpenEditUser = (u: User) => {
    setEditingUser(u);
    setUserModalOpen(true);
  };

  const handleSaveUser = async (u: User) => {
    await saveUserAccount(u);
  };

  const handleDeleteUser = async (id: string) => {
    await deleteUserAccount(id);
  };

  const handleSimulateUser = (simulatedUser: User) => {
    setCurrentUser(simulatedUser);
  };

  // Stock movements
  const handleOpenNewMovement = (art?: Article) => {
    setPreselectedArticleForMovement(art || null);
    setMovementModalOpen(true);
  };

  const handleSaveMovement = async (mov: StockMovement) => {
    await recordMovement(mov);
  };

  const handleQuickMovement = async (article: Article, type: 'entree' | 'sortie') => {
    const qtyChange = 1;
    const newQty = type === 'entree' ? article.quantity + qtyChange : Math.max(0, article.quantity - qtyChange);
    
    await recordMovement({
      id: `mov-${Date.now()}`,
      articleId: article.id,
      reference: article.reference,
      articleName: article.name,
      type,
      quantity: qtyChange,
      previousQuantity: article.quantity,
      newQuantity: newQty,
      timestamp: new Date().toISOString(),
      reason: type === 'entree' ? 'Entrée rapide (+1)' : 'Sortie rapide (-1)',
      performedBy: currentUser?.name || 'Opérateur Stock'
    });
  };

  const handleOpenBarcode = (article: Article) => {
    setSelectedArticleForBarcode(article);
    setBarcodeModalOpen(true);
  };

  const handleSaveOrder = async (order: PurchaseOrder) => {
    await saveOrder(order);
  };

  const handleReceiveOrder = async (order: PurchaseOrder) => {
    await receiveOrderItems(order, currentUser?.name || 'Responsable Logistique');
  };

  const handleSaveSupplier = async (supplier: Supplier) => {
    await saveSupplier(supplier);
  };

  const handleSeedData = async () => {
    await seedInitialData();
  };

  const handleImportExtractedArticles = async (extracted: any[]) => {
    for (const item of extracted) {
      const existing = articles.find(a => a.reference === item.reference || a.name.toLowerCase() === item.name?.toLowerCase());
      if (existing) {
        await recordMovement({
          id: `mov-${Date.now()}-${Math.random()}`,
          articleId: existing.id,
          reference: existing.reference,
          articleName: existing.name,
          type: 'entree',
          quantity: item.quantity || 1,
          previousQuantity: existing.quantity,
          newQuantity: existing.quantity + (item.quantity || 1),
          timestamp: new Date().toISOString(),
          reason: 'Import automatique document OCR IA',
          performedBy: currentUser?.name || 'IA Gemini'
        });
      } else {
        const newArt: Article = {
          id: `art-${Date.now()}-${Math.random()}`,
          reference: item.reference || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
          barcode: `${Math.floor(3000000000000 + Math.random() * 900000000000)}`,
          name: item.name || 'Nouvel Article Importé',
          category: item.category || 'Général',
          quantity: item.quantity || 1,
          minQuantity: 5,
          idealQuantity: 20,
          purchasePrice: Number(item.unitPrice) || 10,
          sellingPrice: (Number(item.unitPrice) || 10) * 1.5,
          unit: 'pièce',
          location: 'Allée F - Rayon 1',
          supplier: item.supplier || 'Fournisseur Import',
          notes: 'Importé via Scan Document Gemini Flash',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await saveArticle(newArt);
      }
    }
  };

  // Low stock badge count
  const lowStockCount = articles.filter(a => a.quantity <= a.minQuantity).length;

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Navbar */}
      <Navbar
        articles={articles}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        user={currentUser}
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenQuickMovement={() => handleOpenNewMovement()}
        onOpenQuickNewArticle={handleOpenNewArticle}
        onOpenGemini={() => setActiveTab('gemini')}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        onSeedData={handleSeedData}
        lowStockCount={lowStockCount}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-3 sm:p-4 lg:p-6 gap-6">
        
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setMobileMenuOpen(false);
          }}
          articlesCount={articles.length}
          lowStockCount={lowStockCount}
          clientsCount={clients.length}
          salesCount={salesOrders.length}
          paymentsCount={payments.length}
          usersCount={usersList.length}
          currentUser={currentUser}
        />

        {/* Mobile slide-over drawer for navigation */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <div 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-50 w-72 bg-white dark:bg-slate-900 h-full p-4 shadow-2xl flex flex-col justify-between">
              <Sidebar
                activeTab={activeTab}
                onSelectTab={(tab) => {
                  setActiveTab(tab);
                  setMobileMenuOpen(false);
                }}
                articlesCount={articles.length}
                lowStockCount={lowStockCount}
                clientsCount={clients.length}
                salesCount={salesOrders.length}
                paymentsCount={payments.length}
                usersCount={usersList.length}
                currentUser={currentUser}
              />
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          
          {activeTab === 'dashboard' && (
            <DashboardView
              articles={articles}
              movements={movements}
              orders={orders}
              suppliers={suppliers}
              clients={clients}
              salesOrders={salesOrders}
              payments={payments}
              currentUser={currentUser}
              currency={currency}
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenNewArticle={handleOpenNewArticle}
              onOpenNewSale={handleOpenNewSale}
              onOpenNewPayment={() => handleOpenNewPayment()}
              onOpenNewMovement={() => handleOpenNewMovement()}
            />
          )}

          {activeTab === 'articles' && (
            <ArticlesView
              articles={articles}
              suppliers={suppliers}
              onOpenNewArticle={handleOpenNewArticle}
              onEditArticle={handleOpenEditArticle}
              onDeleteArticle={handleDeleteArticle}
              onOpenBarcode={handleOpenBarcode}
              onQuickMovement={handleQuickMovement}
            />
          )}

          {activeTab === 'clients' && (
            <ClientsView
              clients={clients}
              salesOrders={salesOrders}
              currency={currency}
              currentUser={currentUser}
              onOpenNewClient={handleOpenNewClient}
              onEditClient={handleOpenEditClient}
              onDeleteClient={handleDeleteClient}
              onNewSaleForClient={handleOpenNewSale}
            />
          )}

          {activeTab === 'sales' && (
            <SalesOrdersView
              salesOrders={salesOrders}
              clients={clients}
              articles={articles}
              currency={currency}
              currentUser={currentUser}
              onOpenNewSale={handleOpenNewSale}
              onEditSale={handleOpenEditSale}
              onDeleteSale={handleDeleteSale}
              onOpenPayment={handleOpenNewPayment}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsView
              payments={payments}
              currency={currency}
              currentUser={currentUser}
              onOpenNewPayment={() => handleOpenNewPayment()}
              onDeletePayment={handleDeletePayment}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              articles={articles}
              salesOrders={salesOrders}
              payments={payments}
              clients={clients}
              movements={movements}
              currency={currency}
            />
          )}

          {activeTab === 'users' && (
            <UsersManagementView
              users={usersList}
              currentUser={currentUser}
              onOpenNewUser={handleOpenNewUser}
              onEditUser={handleOpenEditUser}
              onDeleteUser={handleDeleteUser}
              onSimulateUser={handleSimulateUser}
            />
          )}

          {activeTab === 'movements' && (
            <MovementsView
              movements={movements}
              onOpenNewMovement={() => handleOpenNewMovement()}
            />
          )}

          {activeTab === 'reorder' && (
            <ReorderView
              articles={articles}
              suppliers={suppliers}
              orders={orders}
              onCreateOrder={handleSaveOrder}
              onReceiveOrder={handleReceiveOrder}
            />
          )}

          {activeTab === 'suppliers' && (
            <SuppliersView
              suppliers={suppliers}
              articles={articles}
              onSaveSupplier={handleSaveSupplier}
            />
          )}

          {activeTab === 'warehouse' && (
            <WarehouseView
              articles={articles}
              onSelectArticle={handleOpenEditArticle}
            />
          )}

          {activeTab === 'gemini' && (
            <GeminiStudioView
              articles={articles}
              movements={movements}
              suppliers={suppliers}
              onImportExtractedArticles={handleImportExtractedArticles}
            />
          )}

        </main>

      </div>

      {/* Global Modals */}
      <ArticleModal
        isOpen={articleModalOpen}
        article={editingArticle}
        suppliers={suppliers}
        movements={movements}
        onClose={() => setArticleModalOpen(false)}
        onSave={handleSaveArticle}
      />

      <ClientModal
        isOpen={clientModalOpen}
        client={editingClient}
        onClose={() => setClientModalOpen(false)}
        onSave={handleSaveClient}
      />

      <SaleOrderModal
        isOpen={saleModalOpen}
        existingOrder={editingSaleOrder}
        initialClient={targetClientForSale}
        clients={clients}
        articles={articles}
        currency={currency}
        currentUser={currentUser}
        onClose={() => {
          setSaleModalOpen(false);
          setEditingSaleOrder(null);
          setTargetClientForSale(null);
        }}
        onSave={handleSaveSale}
      />

      <PaymentModal
        isOpen={paymentModalOpen}
        salesOrders={salesOrders}
        clients={clients}
        currency={currency}
        currentUser={currentUser}
        targetSaleOrder={targetSaleOrderForPayment}
        onClose={() => setPaymentModalOpen(false)}
        onSave={handleSavePayment}
      />

      <UserModal
        isOpen={userModalOpen}
        user={editingUser}
        onClose={() => setUserModalOpen(false)}
        onSave={handleSaveUser}
      />

      <MovementModal
        isOpen={movementModalOpen}
        articles={articles}
        preselectedArticle={preselectedArticleForMovement}
        currentUser={currentUser?.name || 'Responsable Logistique'}
        onClose={() => setMovementModalOpen(false)}
        onSave={handleSaveMovement}
      />

      <BarcodeModal
        isOpen={barcodeModalOpen}
        article={selectedArticleForBarcode}
        articles={articles}
        onClose={() => setBarcodeModalOpen(false)}
      />

      <AuthModal
        isOpen={authModalOpen}
        currentUser={currentUser}
        onClose={() => setAuthModalOpen(false)}
        onLogin={(user) => setCurrentUser(user)}
        onLogout={() => setCurrentUser(null)}
      />

    </div>
  );
};

export default App;

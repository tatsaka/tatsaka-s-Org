import React from 'react';
import { 
  LayoutDashboard, 
  Boxes, 
  ArrowDownUp, 
  ShoppingCart, 
  Truck, 
  Sparkles, 
  Users,
  CreditCard,
  BarChart3,
  ShieldCheck,
  Package
} from 'lucide-react';
import { MainModuleTab, User } from '../types';

interface SidebarProps {
  activeTab: MainModuleTab;
  onSelectTab: (tab: MainModuleTab) => void;
  articlesCount?: number;
  lowStockCount?: number;
  clientsCount?: number;
  salesCount?: number;
  paymentsCount?: number;
  usersCount?: number;
  currentUser: User | null;
}

interface NavItem {
  id: MainModuleTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number | null;
  badgeColor?: string;
  visible: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  articlesCount = 0,
  lowStockCount = 0,
  clientsCount = 0,
  salesCount = 0,
  paymentsCount = 0,
  usersCount = 0,
  currentUser
}) => {
  const permissions = currentUser?.permissions;

  // Navigation Items
  const commercialItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Tableau de Bord',
      icon: LayoutDashboard,
      badge: null,
      visible: true
    },
    {
      id: 'articles',
      label: 'Produits & Stock',
      icon: Boxes,
      badge: articlesCount,
      badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
      visible: permissions?.canManageArticles ?? true
    },
    {
      id: 'clients',
      label: 'Clients & CRM',
      icon: Users,
      badge: clientsCount,
      badgeColor: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
      visible: permissions?.canManageClients ?? true
    },
    {
      id: 'sales',
      label: 'Commandes & Ventes',
      icon: ShoppingCart,
      badge: salesCount,
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
      visible: permissions?.canManageSales ?? true
    },
    {
      id: 'payments',
      label: 'Règlements & Caisse',
      icon: CreditCard,
      badge: paymentsCount,
      badgeColor: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
      visible: permissions?.canManagePayments ?? true
    }
  ];

  const logisticsItems: NavItem[] = [
    {
      id: 'movements',
      label: 'Mouvements de Stock',
      icon: ArrowDownUp,
      badge: null,
      visible: permissions?.canAdjustStock ?? true
    },
    {
      id: 'reorder',
      label: 'Réapprovisionnement',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} urg.` : null,
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold animate-pulse',
      visible: permissions?.canManageSuppliers ?? true
    },
    {
      id: 'suppliers',
      label: 'Fournisseurs',
      icon: Truck,
      badge: null,
      visible: permissions?.canManageSuppliers ?? true
    }
  ];

  const adminItems: NavItem[] = [
    {
      id: 'reports',
      label: 'Rapports & Marges',
      icon: BarChart3,
      badge: null,
      visible: permissions?.canViewReports ?? true
    },
    {
      id: 'users',
      label: 'Utilisateurs & Droits',
      icon: ShieldCheck,
      badge: usersCount > 0 ? usersCount : 'RBAC',
      badgeColor: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 font-bold',
      visible: permissions?.canManageUsers ?? (currentUser?.role === 'admin')
    },
    {
      id: 'gemini',
      label: 'Assistant IA Gemini',
      icon: Sparkles,
      badge: 'PRO',
      badgeColor: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold',
      visible: true
    }
  ];

  const renderNavGroup = (title: string, items: NavItem[]) => {
    const visibleItems = items.filter(item => item.visible);
    if (visibleItems.length === 0) return null;

    return (
      <div className="space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {title}
        </div>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : item.id === 'gemini' ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                }`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== null && item.badge !== undefined && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <aside className="w-64 shrink-0 hidden md:block">
      <div className="sticky top-20 space-y-4">
        
        {/* Navigation links */}
        <nav className="space-y-4 bg-white dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          {renderNavGroup('Gestion Commerciale', commercialItems)}
          {renderNavGroup('Logistique & Stocks', logisticsItems)}
          {renderNavGroup('Pilotage & Sécurité', adminItems)}
        </nav>

        {/* Real-time status widget */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-200">Cloud Firestore</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">En direct</span>
          </div>

          <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Rôle Actif</span>
            <span className="font-bold text-sky-400 capitalize">
              {currentUser?.role || 'Admin'}
            </span>
          </div>
        </div>

      </div>
    </aside>
  );
};

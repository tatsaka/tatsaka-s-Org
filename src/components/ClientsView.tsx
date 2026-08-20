import React, { useState } from 'react';
import { Client, Currency, User } from '../types';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  ShoppingCart, 
  MoreVertical, 
  Edit3, 
  Trash2,
  TrendingUp
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

interface ClientsViewProps {
  clients: Client[];
  currency?: Currency;
  currentUser: User | null;
  onOpenNewClient: () => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (id: string) => Promise<void>;
  onNewSaleForClient?: (client: Client) => void;
  salesOrders?: any[];
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients = [],
  currency = 'MAD',
  currentUser,
  onOpenNewClient,
  onEditClient,
  onDeleteClient,
  onNewSaleForClient
}) => {
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [debtFilter, setDebtFilter] = useState<'all' | 'with_debt' | 'settled'>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const canManageClients = currentUser?.permissions?.canManageClients ?? true;
  const canManageSales = currentUser?.permissions?.canManageSales ?? true;

  // Cities list
  const cities = Array.from(new Set(clients.map(c => c.city).filter(Boolean))) as string[];

  // Filter clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      (client.company && client.company.toLowerCase().includes(search.toLowerCase())) ||
      (client.phone && client.phone.includes(search)) ||
      (client.email && client.email.toLowerCase().includes(search.toLowerCase())) ||
      (client.taxNumber && client.taxNumber.toLowerCase().includes(search.toLowerCase()));

    const matchesCity = cityFilter === 'all' || client.city === cityFilter;
    
    const matchesDebt = 
      debtFilter === 'all' || 
      (debtFilter === 'with_debt' && client.balanceDue > 0) ||
      (debtFilter === 'settled' && client.balanceDue <= 0);

    return matchesSearch && matchesCity && matchesDebt;
  });

  // KPI calculations
  const totalClientsCount = clients.length;
  const totalPurchasesSum = clients.reduce((acc, c) => acc + (c.totalPurchases || 0), 0);
  const totalPaidSum = clients.reduce((acc, c) => acc + (c.totalPaid || 0), 0);
  const totalBalanceDueSum = clients.reduce((acc, c) => acc + (c.balanceDue || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Gestion des Clients
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Répertoire complet, suivi des facturations et gestion des créances
              </p>
            </div>
          </div>
        </div>

        {canManageClients && (
          <button
            onClick={onOpenNewClient}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 active:scale-98 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" />
            Nouveau Client
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Portefeuille Clients</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{totalClientsCount}</span>
            <span className="text-xs text-slate-400">comptes actifs</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Ventes Cumulées</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(totalPurchasesSum, currency)}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Règlements Encaissés</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalPaidSum, currency)}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Solde Restant / Impayés</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              totalBalanceDueSum > 0 
                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400' 
                : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
            }`}>
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-xl font-bold ${
              totalBalanceDueSum > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
            }`}>
              {formatCurrency(totalBalanceDueSum, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Rechercher par nom, société, téléphone, ICE..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* City Filter */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="all">Toutes les villes ({clients.length})</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          {/* Debt Filter */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setDebtFilter('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                debtFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setDebtFilter('with_debt')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                debtFilter === 'with_debt'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              Impayés
            </button>
            <button
              onClick={() => setDebtFilter('settled')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                debtFilter === 'settled'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              À jour
            </button>
          </div>
        </div>
      </div>

      {/* Clients Cards Grid */}
      {filteredClients.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Aucun client trouvé</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Aucun résultat ne correspond à vos critères de recherche.
          </p>
          {canManageClients && (
            <button
              onClick={onOpenNewClient}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              Ajouter un client
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const hasDebt = client.balanceDue > 0;
            return (
              <div 
                key={client.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top card header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          {client.name}
                        </h3>
                        {client.company && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3 text-slate-400" />
                            {client.company}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {canManageClients && (
                        <button
                          onClick={() => onEditClient(client)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      {canManageClients && (
                        <button
                          onClick={() => onDeleteClient(client.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Contact info */}
                  <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {client.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                    {client.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                    {(client.address || client.city) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{[client.address, client.city].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                    {client.taxNumber && (
                      <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>{client.taxNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial status footer */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-500 dark:text-slate-400">Cumul Achats:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(client.totalPurchases || 0, currency)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="text-slate-500 dark:text-slate-400">Solde Impayé:</span>
                    <span className={`font-bold px-2 py-0.5 rounded-md text-xs ${
                      hasDebt 
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' 
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    }`}>
                      {hasDebt ? formatCurrency(client.balanceDue, currency) : 'À jour (0,00 MAD)'}
                    </span>
                  </div>

                  {canManageSales && (
                    <button
                      onClick={() => onNewSaleForClient?.(client)}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-slate-100 hover:bg-sky-50 dark:bg-slate-800 dark:hover:bg-sky-950/40 text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 rounded-xl text-xs font-semibold transition-colors"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Créer une Commande / Vente
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

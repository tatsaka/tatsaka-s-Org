import React, { useState } from 'react';
import { User, RoleType } from '../types';
import { 
  ShieldCheck, 
  Search, 
  Plus, 
  UserCheck, 
  Lock, 
  Key, 
  Edit3, 
  Trash2, 
  Phone, 
  Mail, 
  CheckCircle2, 
  XCircle, 
  LogIn, 
  Eye,
  Sliders,
  Sparkles
} from 'lucide-react';
import { formatDate } from '../utils/formatters';

interface UsersManagementViewProps {
  users: User[];
  currentUser: User | null;
  onOpenNewUser: () => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (id: string) => Promise<void>;
  onSimulateUser: (user: User) => void;
}

export const UsersManagementView: React.FC<UsersManagementViewProps> = ({
  users = [],
  currentUser,
  onOpenNewUser,
  onEditUser,
  onDeleteUser,
  onSimulateUser
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const canManageUsers = currentUser?.permissions?.canManageUsers ?? (currentUser?.role === 'admin');

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: RoleType) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <ShieldCheck className="w-3.5 h-3.5" /> Super Admin
          </span>
        );
      case 'manager':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <UserCheck className="w-3.5 h-3.5" /> Manager
          </span>
        );
      case 'vendeur':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Commercial / Vendeur
          </span>
        );
      case 'magasinier':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Magasinier / Stock
          </span>
        );
      case 'comptable':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border border-pink-200 dark:border-pink-800">
            Comptable / Trésorerie
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Utilisateurs & Droits d'Accès (RBAC)
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gestion des comptes, profils de sécurité et simulation de sessions
              </p>
            </div>
          </div>
        </div>

        {canManageUsers && (
          <button
            onClick={onOpenNewUser}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 active:scale-98 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-orange-500/20"
          >
            <Plus className="w-4 h-4" />
            Nouvel Utilisateur
          </button>
        )}
      </div>

      {/* Simulator Banner for testing RBAC live */}
      <div className="p-4 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-200/70 dark:border-orange-900/60 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Testeur & Simulateur de Rôles en Direct
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 font-mono font-bold">
                Session Active : {currentUser?.name} ({currentUser?.role})
              </span>
            </h3>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              Cliquez sur "Simuler ce profil" sur n'importe quel compte pour vérifier immédiatement le comportement et les restrictions des modules !
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Rechercher par nom, email, rôle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200"
          >
            <option value="all">Tous les rôles ({users.length})</option>
            <option value="admin">Super Admin</option>
            <option value="manager">Manager</option>
            <option value="vendeur">Commercial / Vendeur</option>
            <option value="magasinier">Magasinier</option>
            <option value="comptable">Comptable</option>
          </select>
        </div>
      </div>

      {/* Users Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((u) => {
          const isCurrent = currentUser?.id === u.id;
          return (
            <div
              key={u.id}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between ${
                isCurrent 
                  ? 'border-orange-500 ring-2 ring-orange-500/20' 
                  : 'border-slate-200/80 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-700'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${u.avatarColor || 'from-blue-600 to-indigo-600'} text-white flex items-center justify-center font-bold text-base shadow-xs`}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          {u.name}
                        </h3>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                            Vous
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {u.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {canManageUsers && (
                      <button
                        onClick={() => onEditUser(u)}
                        className="p-1.5 text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Modifier le compte"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    {canManageUsers && !isCurrent && (
                      <button
                        onClick={() => onDeleteUser(u.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Role badge and status */}
                <div className="mt-3.5 flex items-center justify-between">
                  {getRoleBadge(u.role)}
                  <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                    u.isActive !== false ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    {u.isActive !== false ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> Actif
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" /> Inactif
                      </>
                    )}
                  </span>
                </div>

                {/* Permissions summary pills */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Droits d'accès accordés :
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    {u.permissions?.canManageArticles && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        Articles
                      </span>
                    )}
                    {u.permissions?.canAdjustStock && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        Stock
                      </span>
                    )}
                    {u.permissions?.canManageClients && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        Clients
                      </span>
                    )}
                    {u.permissions?.canManageSales && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        Commandes
                      </span>
                    )}
                    {u.permissions?.canManagePayments && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        Règlements
                      </span>
                    )}
                    {u.permissions?.canViewReports && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        Rapports
                      </span>
                    )}
                    {u.permissions?.canManageUsers && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold">
                        SuperAdmin
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Simulation button */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => onSimulateUser(u)}
                  disabled={isCurrent}
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isCurrent
                      ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 cursor-default'
                      : 'bg-slate-100 hover:bg-orange-50 dark:bg-slate-800 dark:hover:bg-orange-950/40 text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 active:scale-98'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  {isCurrent ? 'Profil Actuellement Actif' : 'Simuler / Se connecter sous ce profil'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

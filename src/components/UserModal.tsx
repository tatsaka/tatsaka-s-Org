import React, { useState, useEffect } from 'react';
import { User, RoleType, UserPermissions } from '../types';
import { DEFAULT_ROLE_PERMISSIONS } from '../lib/demoData';
import { X, Shield, User as UserIcon, Mail, Phone, Lock, Check, Key } from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => Promise<void>;
  user?: User | null;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  user
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<RoleType>('vendeur');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [permissions, setPermissions] = useState<UserPermissions>(DEFAULT_ROLE_PERMISSIONS.vendeur);
  const [customPermissions, setCustomPermissions] = useState<boolean>(false);
  const [avatarColor, setAvatarColor] = useState<string>('from-blue-600 to-indigo-600');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || '');
      setRole(user.role);
      setIsActive(user.isActive ?? true);
      setPermissions(user.permissions || DEFAULT_ROLE_PERMISSIONS[user.role]);
      setAvatarColor(user.avatarColor || 'from-blue-600 to-indigo-600');
    } else {
      setName('');
      setEmail('');
      setPhone('+212 6 ');
      setRole('vendeur');
      setIsActive(true);
      setPermissions(DEFAULT_ROLE_PERMISSIONS.vendeur);
      setCustomPermissions(false);
      setAvatarColor('from-emerald-600 to-teal-600');
    }
  }, [user, isOpen]);

  // When role changes, if not customized, reset default permissions
  const handleRoleChange = (newRole: RoleType) => {
    setRole(newRole);
    if (!customPermissions) {
      setPermissions(DEFAULT_ROLE_PERMISSIONS[newRole]);
    }
  };

  const handlePermissionToggle = (key: keyof UserPermissions) => {
    setCustomPermissions(true);
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Le nom et l\'adresse email sont obligatoires.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const updatedUser: User = {
        id: user?.id || `usr-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        role,
        permissions,
        isActive,
        avatarColor,
        lastLogin: user?.lastLogin || new Date().toISOString()
      };

      await onSave(updatedUser);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde de l\'utilisateur.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {user ? 'Modifier le profil utilisateur' : 'Créer un nouvel utilisateur'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Attribution des rôles et contrôle d'accès granulaire RBAC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-xl text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nom complet *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Ex: Sara El Amrani"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Adresse Email (Identifiant de connexion) *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="sara@gstock.ma"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Téléphone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  placeholder="+212 6 00 00 00 00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Profil / Rôle Principal *
              </label>
              <select
                value={role}
                onChange={(e) => handleRoleChange(e.target.value as RoleType)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold"
              >
                <option value="admin">Administrateur (Accès Total)</option>
                <option value="manager">Manager / Responsable</option>
                <option value="vendeur">Vendeur / Commercial</option>
                <option value="magasinier">Magasinier / Gestionnaire Stock</option>
                <option value="comptable">Comptable / Trésorier</option>
              </select>
            </div>
          </div>

          {/* Granular Permission Matrix */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-orange-500" />
                  Matrice des Droits & Privilèges Granulaires
                </h4>
                <p className="text-[11px] text-slate-500">
                  Personnalisez individuellement les autorisations d'accès aux modules
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPermissions(DEFAULT_ROLE_PERMISSIONS[role]);
                  setCustomPermissions(false);
                }}
                className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400"
              >
                Rétablir défaut ({role})
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-700">
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permissions.canManageArticles}
                  onChange={() => handlePermissionToggle('canManageArticles')}
                  className="w-4 h-4 rounded-md text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <span className="font-semibold block">Gestion des Articles</span>
                  <span className="text-[10px] text-slate-400">Création, modification des fiches produits & prix</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permissions.canAdjustStock}
                  onChange={() => handlePermissionToggle('canAdjustStock')}
                  className="w-4 h-4 rounded-md text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <span className="font-semibold block">Mouvements de Stock</span>
                  <span className="text-[10px] text-slate-400">Entrées manuelles, ajustements et inventaires</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permissions.canManageClients}
                  onChange={() => handlePermissionToggle('canManageClients')}
                  className="w-4 h-4 rounded-md text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <span className="font-semibold block">Gestion des Clients</span>
                  <span className="text-[10px] text-slate-400">Ajout, coordonnées et suivi des comptes clients</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permissions.canManageSales}
                  onChange={() => handlePermissionToggle('canManageSales')}
                  className="w-4 h-4 rounded-md text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <span className="font-semibold block">Commandes & Facturation</span>
                  <span className="text-[10px] text-slate-400">Émission de devis, factures et bons de vente</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permissions.canValidateSales}
                  onChange={() => handlePermissionToggle('canValidateSales')}
                  className="w-4 h-4 rounded-md text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <span className="font-semibold block">Validation des Ventes</span>
                  <span className="text-[10px] text-slate-400">Déduction directe automatique du stock magasin</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permissions.canManagePayments}
                  onChange={() => handlePermissionToggle('canManagePayments')}
                  className="w-4 h-4 rounded-md text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <span className="font-semibold block">Règlements & Caisse</span>
                  <span className="text-[10px] text-slate-400">Encaissements chèques, espèces, virements & TPE</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permissions.canViewReports}
                  onChange={() => handlePermissionToggle('canViewReports')}
                  className="w-4 h-4 rounded-md text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <span className="font-semibold block">Rapports & Marges Financières</span>
                  <span className="text-[10px] text-slate-400">Consultation des bénéfices nets et analyses de vente</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permissions.canManageSuppliers}
                  onChange={() => handlePermissionToggle('canManageSuppliers')}
                  className="w-4 h-4 rounded-md text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <span className="font-semibold block">Fournisseurs & Réappro</span>
                  <span className="text-[10px] text-slate-400">Bons de commande et réceptions fournisseurs</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 cursor-pointer sm:col-span-2">
                <input
                  type="checkbox"
                  checked={permissions.canManageUsers}
                  onChange={() => handlePermissionToggle('canManageUsers')}
                  className="w-4 h-4 rounded-md text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <span className="font-semibold block">Gestion des Utilisateurs & Droits (Super Admin)</span>
                  <span className="text-[10px] text-slate-400">Création des comptes, attribution des privilèges de sécurité</span>
                </div>
              </label>
            </div>
          </div>

          {/* Account status toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
            <div>
              <span className="text-xs font-semibold text-slate-900 dark:text-white block">Statut du compte</span>
              <span className="text-[11px] text-slate-500">Activer ou suspendre temporairement cet utilisateur</span>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                isActive ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 active:scale-98 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-orange-500/20 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {saving ? 'Sauvegarde...' : user ? 'Mettre à jour' : 'Créer l\'utilisateur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

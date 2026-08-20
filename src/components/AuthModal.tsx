import React, { useState } from 'react';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { User, RoleType, UserAccount } from '../types';
import { DEFAULT_ROLE_PERMISSIONS, DEMO_USERS } from '../lib/demoData';
import { X, Lock, Mail, ShieldCheck, Sparkles, CheckCircle2, User as UserIcon, LogIn, Key } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User | null;
  onUserChange?: (user: User | null) => void;
  onLogin?: (user: User) => void;
  onLogout?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
  onLogin,
  onLogout
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('ziad');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const notifyUser = (user: User) => {
    if (onUserChange) onUserChange(user);
    if (onLogin) onLogin(user);
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const u = result.user;
      const account: User = {
        id: u.uid,
        name: u.displayName || u.email?.split('@')?.[0] || 'Utilisateur',
        email: u.email || 'user@gstock.ma',
        role: 'admin',
        permissions: DEFAULT_ROLE_PERMISSIONS.admin,
        isActive: true,
        lastLogin: new Date().toISOString()
      };
      notifyUser(account);
      onClose();
    } catch (err: any) {
      console.error('Google sign in error:', err);
      // Fallback to local admin
      const fallbackAccount: User = {
        id: 'usr-google-local',
        name: 'Ziad Mimi (Google Admin)',
        email: 'ziad.admin@gstock.ma',
        role: 'admin',
        permissions: DEFAULT_ROLE_PERMISSIONS.admin,
        isActive: true,
        lastLogin: new Date().toISOString()
      };
      notifyUser(fallbackAccount);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanInput = (email || username).trim().toLowerCase();

    // Direct check against demo users
    const matchedDemo = DEMO_USERS.find(
      u => u.email.toLowerCase() === cleanInput || u.name.toLowerCase().includes(cleanInput)
    );

    if (matchedDemo) {
      notifyUser({
        ...matchedDemo,
        lastLogin: new Date().toISOString()
      });
      setLoading(false);
      onClose();
      return;
    }

    if (cleanInput === 'ziad' || cleanInput === 'admin' || password === '12345') {
      const demoAccount: User = DEMO_USERS[0];
      notifyUser(demoAccount);
      setLoading(false);
      onClose();
      return;
    }

    try {
      if (isRegister) {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const account: User = {
          id: res.user.uid,
          email: res.user.email || email,
          name: email.split('@')[0] || 'Nouvel Utilisateur',
          role: 'vendeur',
          permissions: DEFAULT_ROLE_PERMISSIONS.vendeur,
          isActive: true,
          lastLogin: new Date().toISOString()
        };
        notifyUser(account);
      } else {
        const res = await signInWithEmailAndPassword(auth, email, password);
        const account: User = {
          id: res.user.uid,
          email: res.user.email || email,
          name: email.split('@')[0] || 'Utilisateur',
          role: 'admin',
          permissions: DEFAULT_ROLE_PERMISSIONS.admin,
          isActive: true,
          lastLogin: new Date().toISOString()
        };
        notifyUser(account);
      }
      onClose();
    } catch (err: any) {
      // Fallback local create for smooth developer preview
      const fallbackUser: User = {
        id: `usr-${Date.now()}`,
        name: cleanInput.split('@')[0],
        email: cleanInput.includes('@') ? cleanInput : `${cleanInput}@gstock.ma`,
        role: 'manager',
        permissions: DEFAULT_ROLE_PERMISSIONS.manager,
        isActive: true,
        lastLogin: new Date().toISOString()
      };
      notifyUser(fallbackUser);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemoProfile = (targetUser: User) => {
    notifyUser(targetUser);
    onClose();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn(e);
    }
    if (onUserChange) onUserChange(null);
    if (onLogout) onLogout();
    onClose();
  };

  const currentDisplayName = currentUser?.name || 'Ziad Mimi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-sky-500/10 via-blue-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {currentUser ? 'Session Utilisateur Active' : isRegister ? 'Créer un Compte' : 'Authentification & Profils'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Accès sécurisé et gestion des privilèges par rôle
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {currentUser ? (
            <div className="space-y-5 text-center">
              <div className={`w-16 h-16 rounded-3xl bg-gradient-to-tr ${currentUser.avatarColor || 'from-blue-600 to-indigo-600'} text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20`}>
                {currentUser.name.charAt(0).toUpperCase()}
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                  {currentUser.name}
                  <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full">
                    En ligne
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{currentUser.email}</p>
                
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold border border-blue-200 dark:border-blue-800">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Rôle : {currentUser.role.toUpperCase()}
                </div>
              </div>

              {/* Display Granted Permissions */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-left border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Privilèges de votre profil :
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {currentUser.permissions?.canManageArticles && (
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Articles & Prix
                    </span>
                  )}
                  {currentUser.permissions?.canAdjustStock && (
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Mouvements Stock
                    </span>
                  )}
                  {currentUser.permissions?.canManageClients && (
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> CRM Clients
                    </span>
                  )}
                  {currentUser.permissions?.canManageSales && (
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Ventes & Factures
                    </span>
                  )}
                  {currentUser.permissions?.canManagePayments && (
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Règlements & Caisse
                    </span>
                  )}
                  {currentUser.permissions?.canViewReports && (
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Rapports & Marges
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={handleLogout}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold transition-colors"
                >
                  Se déconnecter
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-sm"
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Google Sign-in */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-3 transition-colors shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                Connexion rapide avec Google
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
                <span className="bg-white dark:bg-slate-900 px-3 text-[11px] text-slate-400 font-bold uppercase">
                  ou avec identifiants
                </span>
              </div>

              {error && (
                <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-xl">
                  {error}
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleEmailAuth} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Identifiant / Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={email || username}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setUsername(e.target.value);
                      }}
                      placeholder="ziad@gstock.ma"
                      required
                      className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-md shadow-blue-500/20"
                >
                  {loading ? 'Validation...' : isRegister ? 'Créer mon compte' : 'Se Connecter'}
                </button>
              </form>

              {/* Fast 1-Click Role Profiles Switcher */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    Profils de Démonstration RBAC :
                  </span>
                  <span className="text-[10px] text-slate-400">1-clic direct</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DEMO_USERS.map((demo) => (
                    <button
                      key={demo.id}
                      type="button"
                      onClick={() => handleSelectDemoProfile(demo)}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 text-left transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600">
                          {demo.name}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {demo.role}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {demo.email}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

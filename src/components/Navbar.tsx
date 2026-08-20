import React, { useState } from 'react';
import { Article } from '../types';
import { 
  Boxes, 
  Search, 
  Plus, 
  ArrowDownUp, 
  Sparkles, 
  User, 
  Database, 
  Check, 
  Sun,
  Moon,
  Menu
} from 'lucide-react';

interface NavbarProps {
  articles?: Article[];
  user?: any | null;
  currentUser?: any | null;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  onOpenAuth?: () => void;
  onOpenNewArticle?: () => void;
  onOpenQuickNewArticle?: () => void;
  onOpenNewMovement?: () => void;
  onOpenQuickMovement?: () => void;
  onOpenBarcodeModal?: (article?: Article) => void;
  onOpenAIStudio?: () => void;
  onOpenGemini?: () => void;
  onSelectArticle?: (article: Article) => void;
  onSeedData?: () => void;
  onToggleMobileMenu?: () => void;
  lowStockCount?: number;
  totalValue?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  articles = [],
  user,
  currentUser,
  darkMode,
  onToggleDarkMode,
  onOpenAuth,
  onOpenNewArticle,
  onOpenQuickNewArticle,
  onOpenNewMovement,
  onOpenQuickMovement,
  onOpenAIStudio,
  onOpenGemini,
  onSelectArticle,
  onSeedData,
  onToggleMobileMenu,
  lowStockCount = 0,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const activeUser = currentUser || user;
  const userName = activeUser?.displayName || activeUser?.name || 'Ziad (Admin)';
  const userInitial = userName ? userName.charAt(0).toUpperCase() : 'Z';
  const handleArticleClick = onOpenNewArticle || onOpenQuickNewArticle;
  const handleMovementClick = onOpenNewMovement || onOpenQuickMovement;
  const handleGeminiClick = onOpenAIStudio || onOpenGemini;

  // Filter matching articles for quick jump
  const filteredArticles = searchQuery.trim() === '' ? [] : (articles || []).filter(a => 
    a?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a?.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a?.barcode?.includes(searchQuery) ||
    a?.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a?.location?.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 6);

  const handleSeed = async () => {
    if (onSeedData) {
      onSeedData();
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 3000);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-lg">
                  StockFlow
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800">
                  PRO AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Gestion des stocks intelligente & temps réel
              </p>
            </div>
          </div>

          {/* Quick Search Bar with Instant Palette */}
          <div className="relative flex-1 max-w-md hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                placeholder="Recherche rapide (nom, référence, code-barre, allée)..."
                className="w-full pl-10 pr-12 py-2 text-sm bg-slate-100 dark:bg-slate-800/80 border border-transparent dark:border-slate-700/60 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs font-mono">
                <span>⌘K</span>
              </div>
            </div>

            {/* Live Search Dropdown */}
            {showSearchDropdown && filteredArticles.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Articles correspondants ({filteredArticles.length})
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredArticles.map((art) => (
                    <button
                      key={art.id}
                      onClick={() => {
                        onSelectArticle(art);
                        setShowSearchDropdown(false);
                        setSearchQuery('');
                      }}
                      className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                          {art.reference?.split('-')?.[1] || art.reference || 'SKU'}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                            {art.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <span>{art.category}</span>
                            <span>•</span>
                            <span className="font-mono text-[11px]">{art.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs font-bold ${
                          art.quantity === 0 ? 'text-red-600' :
                          art.quantity <= art.minQuantity ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {art.quantity} {art.unit}s
                        </div>
                        <div className="text-[11px] text-slate-400">{(art.sellingPrice || 0).toFixed(2)} €</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Hub */}
          <div className="flex items-center gap-2">
            
            {/* Dark mode button */}
            {onToggleDarkMode && (
              <button
                onClick={onToggleDarkMode}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                title={darkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {/* AI Assistant Button */}
            {handleGeminiClick && (
              <button
                onClick={handleGeminiClick}
                className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 hover:from-indigo-500/20 hover:to-blue-500/20 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-semibold transition-all shadow-xs"
                title="Ouvrir le Hub d'Intelligence Gemini IA"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                <span className="hidden sm:inline">IA & Audit</span>
              </button>
            )}

            {/* Fast Movement Button */}
            {handleMovementClick && (
              <button
                onClick={handleMovementClick}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
              >
                <ArrowDownUp className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mouvement</span>
              </button>
            )}

            {/* New Article Button */}
            {handleArticleClick && (
              <button
                onClick={handleArticleClick}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs shadow-blue-500/20"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nouvel Article</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            {onToggleMobileMenu && (
              <button
                onClick={onToggleMobileMenu}
                className="p-2 lg:hidden text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {/* User Profile / Auth Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 pl-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                  {userInitial}
                </div>
                <div className="text-left hidden lg:block pr-1">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                    {userName}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium leading-tight">
                    En ligne • Sync
                  </div>
                </div>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {userName}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {activeUser?.email || 'admin@stockflow.fr'}
                    </p>
                  </div>

                  <div className="py-1">
                    {onOpenAuth && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenAuth();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-left"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Changer d'utilisateur / Connexion
                      </button>
                    )}

                    {onSeedData && (
                      <button
                        onClick={() => {
                          handleSeed();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <Database className="w-3.5 h-3.5 text-blue-500" />
                          Réinitialiser données de démo
                        </div>
                        {seedSuccess && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { StockMovement, MovementType } from '../types';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  Sliders, 
  Undo2, 
  Clock, 
  User, 
  History, 
  Layers,
  Calendar,
  Sparkles
} from 'lucide-react';
import { formatDateTime } from '../utils/formatters';

interface ArticleTimelineProps {
  movements: StockMovement[];
  articleId?: string;
  articleReference?: string;
  maxItems?: number;
  className?: string;
}

export const ArticleTimeline: React.FC<ArticleTimelineProps> = ({
  movements = [],
  articleId,
  articleReference,
  maxItems = 5,
  className = ''
}) => {
  // Filter movements for this specific article
  const articleMovements = movements
    .filter((m) => {
      if (!articleId && !articleReference) return true;
      return (
        (articleId && m.articleId === articleId) ||
        (articleReference && m.reference === articleReference)
      );
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, maxItems);

  const getMovementConfig = (type: MovementType) => {
    switch (type) {
      case 'entree':
        return {
          label: 'Entrée / Réception',
          badgeBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          dotBg: 'bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950/60',
          icon: <ArrowDownLeft className="w-3.5 h-3.5 text-white" />,
          iconBg: 'bg-emerald-600',
          sign: '+',
          textClass: 'text-emerald-600 dark:text-emerald-400'
        };
      case 'sortie':
        return {
          label: 'Sortie / Vente',
          badgeBg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          dotBg: 'bg-rose-500 ring-4 ring-rose-100 dark:ring-rose-950/60',
          icon: <ArrowUpRight className="w-3.5 h-3.5 text-white" />,
          iconBg: 'bg-rose-600',
          sign: '-',
          textClass: 'text-rose-600 dark:text-rose-400'
        };
      case 'ajustement':
        return {
          label: 'Ajustement Inventaire',
          badgeBg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          dotBg: 'bg-amber-500 ring-4 ring-amber-100 dark:ring-amber-950/60',
          icon: <Sliders className="w-3.5 h-3.5 text-white" />,
          iconBg: 'bg-amber-600',
          sign: '±',
          textClass: 'text-amber-600 dark:text-amber-400'
        };
      case 'transfert':
        return {
          label: 'Transfert de Stock',
          badgeBg: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
          dotBg: 'bg-indigo-500 ring-4 ring-indigo-100 dark:ring-indigo-950/60',
          icon: <ArrowLeftRight className="w-3.5 h-3.5 text-white" />,
          iconBg: 'bg-indigo-600',
          sign: '↔',
          textClass: 'text-indigo-600 dark:text-indigo-400'
        };
      case 'retour':
        return {
          label: 'Retour / SAV',
          badgeBg: 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
          dotBg: 'bg-sky-500 ring-4 ring-sky-100 dark:ring-sky-950/60',
          icon: <Undo2 className="w-3.5 h-3.5 text-white" />,
          iconBg: 'bg-sky-600',
          sign: '+',
          textClass: 'text-sky-600 dark:text-sky-400'
        };
      default:
        return {
          label: 'Mouvement',
          badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          dotBg: 'bg-slate-500 ring-4 ring-slate-100 dark:ring-slate-800',
          icon: <History className="w-3.5 h-3.5 text-white" />,
          iconBg: 'bg-slate-600',
          sign: '',
          textClass: 'text-slate-700 dark:text-slate-300'
        };
    }
  };

  const getTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 2) return 'À l\'instant';
      if (diffMins < 60) return `Il y a ${diffMins} min`;
      if (diffHours < 24) return `Il y a ${diffHours}h`;
      if (diffDays === 1) return 'Hier';
      if (diffDays < 7) return `Il y a ${diffDays} j`;
      return formatDateTime(dateStr).split(' ')[0];
    } catch {
      return '';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <History className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Timeline des 5 Derniers Mouvements
          </h4>
        </div>
        <span className="text-[10px] font-medium text-slate-400 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
          {articleMovements.length} événement{articleMovements.length > 1 ? 's' : ''}
        </span>
      </div>

      {articleMovements.length === 0 ? (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-1">
          <Clock className="w-5 h-5 text-slate-400 mx-auto" />
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Aucun mouvement récent enregistré
          </p>
          <p className="text-[10px] text-slate-400">
            Les entrées, sorties et ajustements de stock apparaîtront ici chronologiquement.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {articleMovements.map((mov, idx) => {
            const config = getMovementConfig(mov.type);
            const timeAgo = getTimeAgo(mov.timestamp);

            return (
              <div 
                key={mov.id || idx}
                className="relative group transition-all"
              >
                {/* Timeline Dot / Icon */}
                <div className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow-xs ${config.iconBg} ring-4 ring-white dark:ring-slate-900`}>
                  {config.icon}
                </div>

                {/* Content Card */}
                <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-3 hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-2xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${config.badgeBg}`}>
                        {config.label}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {timeAgo && `• ${timeAgo}`}
                      </span>
                    </div>

                    {/* Quantity delta */}
                    <div className={`text-xs font-black font-mono flex items-center ${config.textClass}`}>
                      {config.sign}{Math.abs(mov.quantity)} unité{Math.abs(mov.quantity) > 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Reason / Motif */}
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1.5">
                    {mov.reason || 'Mouvement régulier de stock'}
                  </p>

                  {/* Stock evolution and Operator */}
                  <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-slate-400" />
                      <span>Évolution : </span>
                      <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                        {mov.previousQuantity ?? '?'} → {mov.newQuantity ?? (mov.previousQuantity + (mov.type === 'sortie' ? -mov.quantity : mov.quantity))}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 font-medium">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{mov.performedBy || 'Système'}</span>
                    </div>
                  </div>

                  {/* Timestamp detail */}
                  <div className="mt-1 flex items-center gap-1 text-[9px] text-slate-400 font-mono">
                    <Calendar className="w-2.5 h-2.5" />
                    <span>{formatDateTime(mov.timestamp)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

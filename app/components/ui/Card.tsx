/**
 * COMPOSANT CARD RÉUTILISABLE
 */

interface CardProps {
  children: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  info?: string;
  className?: string;
}

export function Card({ children, title, icon, info, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden ${className}`}>
      {(title || icon) && (
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2">
          {icon && <span className="text-amber-600">{icon}</span>}
          <h3 className="font-semibold text-slate-800 text-sm flex-1">{title}</h3>
          {info && (
            <div className="relative group">
              <button
                type="button"
                className="w-5 h-5 rounded-full border border-slate-300 bg-white text-slate-400 hover:text-slate-600 hover:border-slate-400 flex items-center justify-center text-xs font-bold leading-none transition-colors"
                aria-label="Informations"
              >
                i
              </button>
              <div className="absolute right-0 top-7 z-50 w-64 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {info}
                <div className="absolute -top-1.5 right-2 w-3 h-3 bg-slate-800 rotate-45" />
              </div>
            </div>
          )}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

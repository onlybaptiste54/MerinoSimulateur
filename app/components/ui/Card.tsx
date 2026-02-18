/**
 * COMPOSANT CARD RÉUTILISABLE
 */

interface CardProps {
  children: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function Card({ children, title, icon, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden ${className}`}>
      {(title || icon) && (
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2">
          {icon && <span className="text-amber-600">{icon}</span>}
          <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

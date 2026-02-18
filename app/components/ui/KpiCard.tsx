/**
 * COMPOSANT KPI RÉUTILISABLE
 */

import { formatCurrency, formatPercent } from '../../services/format.service';

interface KpiCardProps {
  title: string;
  value: number;
  type: 'currency' | 'percent' | 'number';
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
}

const colorMap = {
  blue: 'border-l-blue-500 text-blue-600 bg-blue-50',
  green: 'border-l-emerald-500 text-emerald-600 bg-emerald-50',
  orange: 'border-l-orange-500 text-orange-600 bg-orange-50',
  red: 'border-l-red-500 text-red-600 bg-red-50',
  purple: 'border-l-purple-500 text-purple-600 bg-purple-50'
};

export function KpiCard({ title, value, type, subtitle, color = 'blue' }: KpiCardProps) {
  const formatted = type === 'currency' ? formatCurrency(value) :
                   type === 'percent' ? formatPercent(value) :
                   value.toFixed(0);
  
  const isNegative = value < 0;
  const displayColor = isNegative ? 'red' : color;
  
  return (
    <div className={`bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 ${colorMap[displayColor].split(' ')[0]}`}>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{title}</p>
      <p className={`text-2xl font-bold ${isNegative ? 'text-red-600' : 'text-slate-800'}`}>
        {formatted}
      </p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}

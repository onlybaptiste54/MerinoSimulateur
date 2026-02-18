/**
 * Toggles "Et si..." — impact de chaque décision, barre Avant / Après
 */

'use client';

import { useState, useMemo } from 'react';
import { HelpCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../services/format.service';
import { ET_SI_PRESETS, applyEtSiToggles } from '../../services/calculator.service';

interface EtSiTogglesProps {
  baseProfit: number;
  baseRevenue: number;
}

export function EtSiToggles({ baseProfit, baseRevenue }: EtSiTogglesProps) {
  const [toggles, setToggles] = useState<{ id: string; on: boolean }[]>(
    ET_SI_PRESETS.map((p) => ({ id: p.id, on: false }))
  );

  const { profitAfter, delta } = useMemo(
    () => applyEtSiToggles(baseProfit, baseRevenue, toggles),
    [baseProfit, baseRevenue, toggles]
  );

  const toggle = (id: string) => {
    setToggles((prev) => prev.map((t) => (t.id === id ? { ...t, on: !t.on } : t)));
  };

  const maxAbs = Math.max(Math.abs(baseProfit), Math.abs(profitAfter), 1);
  const scale = (v: number) => (v / maxAbs) * 50 + 50; // 0 → 50%, max → 100%

  return (
    <Card title="Et si…" icon={<HelpCircle size={18} />}>
      <p className="text-slate-600 text-sm mb-4">Activez une option pour voir l'impact sur le résultat.</p>
      <div className="space-y-3">
        {ET_SI_PRESETS.map((preset) => {
          const on = toggles.find((t) => t.id === preset.id)?.on ?? false;
          const net = preset.revenueDelta - preset.costsDelta;
          const displayNet = preset.revenueDelta > 0 && preset.revenueDelta < 1
            ? baseRevenue * preset.revenueDelta - preset.costsDelta
            : net;
          return (
            <label key={preset.id} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={on}
                onChange={() => toggle(preset.id)}
                className="rounded border-slate-300 text-customBlue focus:ring-customBlue"
              />
              <span className="text-sm text-slate-700 flex-1">{preset.label}</span>
              <span className={`text-xs font-medium ${displayNet >= 0 ? 'text-customBlue' : 'text-red-600'}`}>
                {displayNet >= 0 ? '+' : ''}{formatCurrency(displayNet)}
              </span>
            </label>
          );
        })}
      </div>
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-4 mb-2">
          <span className="text-sm text-slate-600 w-16">Avant</span>
          <div className="flex-1 h-6 rounded-full bg-slate-100 overflow-hidden flex">
            <div
              className={baseProfit >= 0 ? 'bg-customBlue' : 'bg-red-500'}
              style={{ width: `${scale(baseProfit)}%` }}
            />
          </div>
          <span className={`text-sm font-semibold w-20 text-right ${baseProfit >= 0 ? 'text-customBlue' : 'text-red-700'}`}>
            {formatCurrency(baseProfit)}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600 w-16">Après</span>
          <div className="flex-1 h-6 rounded-full bg-slate-100 overflow-hidden flex">
            <div
              className={profitAfter >= 0 ? 'bg-customBlue' : 'bg-red-600'}
              style={{ width: `${scale(profitAfter)}%` }}
            />
          </div>
          <span className={`text-sm font-semibold w-20 text-right ${profitAfter >= 0 ? 'text-customBlue' : 'text-red-700'}`}>
            {formatCurrency(profitAfter)}
          </span>
          {delta !== 0 && (
            <span className={`text-xs font-medium ${delta >= 0 ? 'text-customBlue' : 'text-red-600'}`}>
              ({delta >= 0 ? '+' : ''}{formatCurrency(delta)})
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

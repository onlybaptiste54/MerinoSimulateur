/**
 * Toggles "Et si..." — impact de chaque décision, barre Avant / Après
 */

'use client';

import { useState, useMemo } from 'react';
import { HelpCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../services/format.service';
import { ET_SI_PRESETS, applyEtSiToggles, OperationParams } from '../../services/calculator.service';

interface EtSiTogglesProps {
  baseProfit: number;
  baseRevenue: number;
  ops: OperationParams;
}

export function EtSiToggles({ baseProfit, baseRevenue, ops }: EtSiTogglesProps) {
  const [toggles, setToggles] = useState<{ id: string; on: boolean }[]>(
    ET_SI_PRESETS.map((p) => ({ id: p.id, on: false }))
  );

  const variableRate = ops.cogsRate + ops.laborRate + ops.overheadRate;

  const { profitAfter, delta } = useMemo(
    () => applyEtSiToggles(baseProfit, baseRevenue, toggles, variableRate),
    [baseProfit, baseRevenue, toggles, variableRate]
  );

  const toggle = (id: string) => {
    setToggles((prev) => prev.map((t) => (t.id === id ? { ...t, on: !t.on } : t)));
  };

  const maxAbs = Math.max(Math.abs(baseProfit), Math.abs(profitAfter), 1);
  const scale = (v: number) => (v / maxAbs) * 50 + 50; // 0 → 50%, max → 100%

  return (
    <Card title="Et si…" icon={<HelpCircle size={18} />} info="Simule l'impact de décisions stratégiques sur votre résultat net. Cochez une ou plusieurs options pour voir comment votre profit évoluerait. Les montants affichés tiennent compte de votre structure de coûts actuelle.">
      <p className="text-slate-600 text-sm mb-4">Activez une option pour voir l'impact sur le résultat.</p>
      <div className="space-y-3">
        {ET_SI_PRESETS.map((preset) => {
          const on = toggles.find((t) => t.id === preset.id)?.on ?? false;
          const net = preset.revenueDelta - preset.costsDelta;
          const displayNet = preset.revenueDelta > 0 && preset.revenueDelta < 1
            ? baseRevenue * preset.revenueDelta * (1 - variableRate) - preset.costsDelta
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
      <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs text-slate-500 mb-1">Avant</p>
          <p className={`text-xl font-bold ${baseProfit >= 0 ? 'text-customBlue' : 'text-red-600'}`}>
            {formatCurrency(baseProfit)}
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full rounded-full ${baseProfit >= 0 ? 'bg-customBlue' : 'bg-red-500'}`}
              style={{ width: `${scale(baseProfit)}%` }}
            />
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs text-slate-500 mb-1">
            Après
            {delta !== 0 && (
              <span className={`ml-2 font-semibold ${delta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {delta >= 0 ? '▲' : '▼'} {delta >= 0 ? '+' : ''}{formatCurrency(delta)}
              </span>
            )}
          </p>
          <p className={`text-xl font-bold ${profitAfter >= 0 ? 'text-customBlue' : 'text-red-600'}`}>
            {formatCurrency(profitAfter)}
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full rounded-full ${profitAfter >= 0 ? 'bg-customBlue' : 'bg-red-500'}`}
              style={{ width: `${scale(profitAfter)}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

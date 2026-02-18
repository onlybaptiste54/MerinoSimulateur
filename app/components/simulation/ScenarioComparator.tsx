/**
 * Comparateur 3 scénarios — Actuel / Optimiste / Pessimiste
 */

'use client';

import { useState, useMemo } from 'react';
import { Columns } from 'lucide-react';
import { Card } from '../ui/Card';
import {
  OperationParams,
  LoanParams,
  FinancialResults,
  calculateProfitability
} from '../../services/calculator.service';
import { formatCurrency } from '../../services/format.service';

interface ScenarioComparatorProps {
  ops: OperationParams;
  loan: LoanParams;
  results: FinancialResults;
  monthlyPayment: number;
}

const defaultOptimiste = (ops: OperationParams): OperationParams => ({
  ...ops,
  coversPerDay: Math.min(150, ops.coversPerDay + 20),
  ticketAvg: ops.ticketAvg + 3,
  cogsRate: Math.max(0.2, ops.cogsRate - 0.02)
});

const defaultPessimiste = (ops: OperationParams): OperationParams => ({
  ...ops,
  coversPerDay: Math.max(20, ops.coversPerDay - 20),
  ticketAvg: Math.max(15, ops.ticketAvg - 3),
  cogsRate: Math.min(0.4, ops.cogsRate + 0.02)
});

export function ScenarioComparator({ ops, loan, results, monthlyPayment }: ScenarioComparatorProps) {
  const [optimisteOps, setOptimisteOps] = useState<OperationParams>(() => defaultOptimiste(ops));
  const [pessimisteOps, setPessimisteOps] = useState<OperationParams>(() => defaultPessimiste(ops));

  const resultsOptimiste = useMemo(
    () => calculateProfitability(optimisteOps, monthlyPayment),
    [optimisteOps, monthlyPayment]
  );
  const resultsPessimiste = useMemo(
    () => calculateProfitability(pessimisteOps, monthlyPayment),
    [pessimisteOps, monthlyPayment]
  );

  const updateOptimiste = (updates: Partial<OperationParams>) => setOptimisteOps((p) => ({ ...p, ...updates }));
  const updatePessimiste = (updates: Partial<OperationParams>) => setPessimisteOps((p) => ({ ...p, ...updates }));

  return (
    <Card title="Comparateur de scénarios" icon={<Columns size={18} />}>
      <p className="text-slate-600 text-sm mb-4">Modifiez une colonne pour recalculer uniquement ce scénario.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 px-3 font-semibold text-slate-600 w-32"></th>
              <th className="text-center py-2 px-3 font-semibold text-slate-700 bg-slate-50">Actuel</th>
              <th className="text-center py-2 px-3 font-semibold text-customBlue bg-customBlue/10">Optimiste</th>
              <th className="text-center py-2 px-3 font-semibold text-customOrange bg-customOrange/10">Pessimiste</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-2 px-3 text-slate-600">Couverts/jour</td>
              <td className="py-2 px-3 text-center">{ops.coversPerDay}</td>
              <td className="py-2 px-3 text-center">
                <input
                  type="number"
                  min={10}
                  max={200}
                  value={optimisteOps.coversPerDay}
                  onChange={(e) => updateOptimiste({ coversPerDay: Number(e.target.value) || 10 })}
                  className="w-16 text-center border border-slate-200 rounded px-1 py-0.5 text-customBlue"
                />
              </td>
              <td className="py-2 px-3 text-center">
                <input
                  type="number"
                  min={10}
                  max={200}
                  value={pessimisteOps.coversPerDay}
                  onChange={(e) => updatePessimiste({ coversPerDay: Number(e.target.value) || 10 })}
                  className="w-16 text-center border border-slate-200 rounded px-1 py-0.5 text-customOrange"
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 px-3 text-slate-600">Ticket moyen (€)</td>
              <td className="py-2 px-3 text-center">{ops.ticketAvg}</td>
              <td className="py-2 px-3 text-center">
                <input
                  type="number"
                  min={15}
                  max={80}
                  value={optimisteOps.ticketAvg}
                  onChange={(e) => updateOptimiste({ ticketAvg: Number(e.target.value) || 15 })}
                  className="w-16 text-center border border-slate-200 rounded px-1 py-0.5 text-customBlue"
                />
              </td>
              <td className="py-2 px-3 text-center">
                <input
                  type="number"
                  min={15}
                  max={80}
                  value={pessimisteOps.ticketAvg}
                  onChange={(e) => updatePessimiste({ ticketAvg: Number(e.target.value) || 15 })}
                  className="w-16 text-center border border-slate-200 rounded px-1 py-0.5 text-customOrange"
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 px-3 text-slate-600">Food %</td>
              <td className="py-2 px-3 text-center">{Math.round(ops.cogsRate * 100)}%</td>
              <td className="py-2 px-3 text-center">
                <input
                  type="number"
                  min={20}
                  max={45}
                  value={Math.round(optimisteOps.cogsRate * 100)}
                  onChange={(e) => updateOptimiste({ cogsRate: (Number(e.target.value) || 30) / 100 })}
                  className="w-14 text-center border border-slate-200 rounded px-1 py-0.5 text-customBlue"
                />
                %
              </td>
              <td className="py-2 px-3 text-center">
                <input
                  type="number"
                  min={20}
                  max={45}
                  value={Math.round(pessimisteOps.cogsRate * 100)}
                  onChange={(e) => updatePessimiste({ cogsRate: (Number(e.target.value) || 30) / 100 })}
                  className="w-14 text-center border border-slate-200 rounded px-1 py-0.5 text-customOrange"
                />
                %
              </td>
            </tr>
            <tr>
              <td className="py-2 px-3 text-slate-600">Labor %</td>
              <td className="py-2 px-3 text-center">{Math.round(ops.laborRate * 100)}%</td>
              <td className="py-2 px-3 text-center">
                <input
                  type="number"
                  min={25}
                  max={50}
                  value={Math.round(optimisteOps.laborRate * 100)}
                  onChange={(e) => updateOptimiste({ laborRate: (Number(e.target.value) || 35) / 100 })}
                  className="w-14 text-center border border-slate-200 rounded px-1 py-0.5 text-customBlue"
                />
                %
              </td>
              <td className="py-2 px-3 text-center">
                <input
                  type="number"
                  min={25}
                  max={50}
                  value={Math.round(pessimisteOps.laborRate * 100)}
                  onChange={(e) => updatePessimiste({ laborRate: (Number(e.target.value) || 35) / 100 })}
                  className="w-14 text-center border border-slate-200 rounded px-1 py-0.5 text-customOrange"
                />
                %
              </td>
            </tr>
            <tr className="font-semibold border-t-2 border-slate-200">
              <td className="py-3 px-3 text-slate-700">Résultat</td>
              <td className={`py-3 px-3 text-center ${results.profit.amount >= 0 ? 'text-customBlue' : 'text-red-700'}`}>
                {formatCurrency(results.profit.amount)}
              </td>
              <td className={`py-3 px-3 text-center ${resultsOptimiste.profit.amount >= 0 ? 'text-customBlue' : 'text-red-700'}`}>
                {formatCurrency(resultsOptimiste.profit.amount)}
              </td>
              <td className={`py-3 px-3 text-center ${resultsPessimiste.profit.amount >= 0 ? 'text-customBlue' : 'text-red-700'}`}>
                {formatCurrency(resultsPessimiste.profit.amount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={() => setOptimisteOps({ ...ops })}
          className="text-xs px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          Dupliquer Actuel → Optimiste
        </button>
        <button
          type="button"
          onClick={() => setPessimisteOps({ ...ops })}
          className="text-xs px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          Dupliquer Actuel → Pessimiste
        </button>
      </div>
    </Card>
  );
}

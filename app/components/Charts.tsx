/**
 * Graphiques de simulation — 5 blocs actionnables
 */

'use client';

import { RentabilityHeatmap } from './simulation/RentabilityHeatmap';
import { SafetyGauge } from './simulation/SafetyGauge';
import { ScenarioComparator } from './simulation/ScenarioComparator';
import { EtSiToggles } from './simulation/EtSiToggles';
import { IndifferenceCurve } from './simulation/IndifferenceCurve';
import {
  OperationParams,
  LoanParams,
  FinancialResults
} from '../services/calculator.service';

export interface SimulationChartsProps {
  ops: OperationParams;
  loan: LoanParams;
  results: FinancialResults;
  monthlyPayment: number;
  onUpdateOps: (u: Partial<OperationParams>) => void;
}

export function Charts({
  ops,
  loan,
  results,
  monthlyPayment,
  onUpdateOps
}: SimulationChartsProps) {
  return (
    <>
      <h2 className="text-xl font-bold text-slate-800 mb-6">Simulation</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <RentabilityHeatmap ops={ops} loanMonthly={monthlyPayment} onUpdateOps={onUpdateOps} />
        <SafetyGauge results={results} coversPerDay={ops.coversPerDay} />
      </div>

      <div className="mb-8">
        <ScenarioComparator
          ops={ops}
          loan={loan}
          results={results}
          monthlyPayment={monthlyPayment}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <EtSiToggles baseProfit={results.profit.amount} baseRevenue={results.revenue.annual} />
        <IndifferenceCurve
          ops={ops}
          loanMonthly={monthlyPayment}
          currentProfit={results.profit.amount}
          onUpdateOps={onUpdateOps}
        />
      </div>
    </>
  );
}

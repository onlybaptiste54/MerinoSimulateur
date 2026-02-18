/**
 * TABLEAU DE BORD — indicateurs puis graphiques de simulation
 */

'use client';

import { DollarSign, Calculator, TrendingUp, Target, AlertTriangle } from 'lucide-react';
import { Card } from './ui/Card';
import { Charts } from './Charts';
import { formatCurrency, formatPercent } from '../services/format.service';
import { FinancialResults, LoanParams, OperationParams } from '../services/calculator.service';

interface DashboardProps {
  ops: OperationParams;
  results: FinancialResults;
  loan: LoanParams;
  monthlyPayment: number;
  onUpdateOps: (u: Partial<OperationParams>) => void;
}

export function Dashboard({ ops, results, loan, monthlyPayment, onUpdateOps }: DashboardProps) {
  const isProfitable = results.profit.amount >= 0;

  return (
    <div className="space-y-10">
      <h2 className="text-xl font-bold text-slate-800">Résultats</h2>

      {/* Indicateurs clés — une ligne */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          className={`rounded-xl border-2 p-4 ${
            isProfitable
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={18} />
            <span className="text-xs font-semibold uppercase tracking-wide">Résultat</span>
          </div>
          <p className="text-xl font-bold">{formatCurrency(results.profit.amount)}</p>
        </div>

        <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 text-amber-900">
          <div className="flex items-center gap-2 mb-1">
            <Target size={18} />
            <span className="text-xs font-semibold uppercase tracking-wide">Seuil (couverts/j)</span>
          </div>
          <p className="text-xl font-bold">{Math.ceil(results.breakeven.dailyCovers)}</p>
          <p className="text-xs mt-0.5 opacity-90">{formatCurrency(results.breakeven.revenue)}/an</p>
        </div>

        <div className="rounded-xl border-2 border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={18} className="text-slate-600" />
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">CA annuel</span>
          </div>
          <p className="text-xl font-bold text-slate-800">{formatCurrency(results.revenue.annual)}</p>
          <p className="text-xs mt-0.5 text-slate-500">Marge {formatPercent(results.profit.margin)}</p>
        </div>

        <div className="rounded-xl border-2 border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={18} className="text-slate-600" />
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Prime cost</span>
          </div>
          <p className="text-xl font-bold text-slate-800">{formatPercent(results.primeCost * 100)}</p>
          <p className="text-xs mt-0.5 text-slate-500">Objectif &lt; 60%</p>
        </div>
      </div>

      {/* Graphiques — pleine largeur, plus d’espace */}
      <Charts
        ops={ops}
        loan={loan}
        results={results}
        monthlyPayment={monthlyPayment}
        onUpdateOps={onUpdateOps}
      />

      {/* Compte de résultat */}
      <Card title="Compte de résultat" icon={<Calculator size={18} />}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-3 font-semibold text-slate-700">Poste</th>
                <th className="text-right py-3 px-3 font-semibold text-slate-700">Montant</th>
                <th className="text-right py-3 px-3 font-semibold text-slate-700">% CA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="bg-amber-50/50">
                <td className="py-2.5 px-3 font-medium text-slate-800">Chiffre d'affaires</td>
                <td className="py-2.5 px-3 text-right font-medium">{formatCurrency(results.revenue.annual)}</td>
                <td className="py-2.5 px-3 text-right">100%</td>
              </tr>
              <tr>
                <td className="py-2 px-3 pl-5 text-slate-600">Coût matière</td>
                <td className="py-2 px-3 text-right">-{formatCurrency(results.costs.food)}</td>
                <td className="py-2 px-3 text-right">{formatPercent((results.costs.food / results.revenue.annual) * 100)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 pl-5 text-slate-600">Masse salariale</td>
                <td className="py-2 px-3 text-right">-{formatCurrency(results.costs.laborVariable + results.costs.laborFixed)}</td>
                <td className="py-2 px-3 text-right">{formatPercent((results.costs.laborVariable + results.costs.laborFixed) / results.revenue.annual * 100)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 pl-5 text-slate-600">Frais généraux + emprunt + autres</td>
                <td className="py-2 px-3 text-right">-{formatCurrency(results.costs.overhead + results.costs.loan + results.costs.otherFixed)}</td>
                <td className="py-2 px-3 text-right">{formatPercent((results.costs.overhead + results.costs.loan + results.costs.otherFixed) / results.revenue.annual * 100)}</td>
              </tr>
              <tr className={`font-bold text-base ${isProfitable ? 'text-emerald-700 bg-emerald-50/50' : 'text-red-700 bg-red-50/50'}`}>
                <td className="py-3 px-3">Résultat net</td>
                <td className="py-3 px-3 text-right">{formatCurrency(results.profit.amount)}</td>
                <td className="py-3 px-3 text-right">{formatPercent(results.profit.margin)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

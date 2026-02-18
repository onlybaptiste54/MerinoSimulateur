/**
 * PANNEAU PARAMÈTRES — compact, une seule bande en haut
 */

import { Users, CreditCard, Percent } from 'lucide-react';
import { Card } from './ui/Card';
import { Slider } from './ui/Slider';
import { OperationParams, LoanParams } from '../services/calculator.service';
import { formatCurrency } from '../services/format.service';

interface ParameterPanelProps {
  ops: OperationParams;
  loan: LoanParams;
  monthlyPayment: number;
  onUpdateOps: (updates: Partial<OperationParams>) => void;
  onUpdateLoan: (updates: Partial<LoanParams>) => void;
  readOnly?: boolean;
}

export function ParameterPanel({ ops, loan, monthlyPayment, onUpdateOps, onUpdateLoan, readOnly = false }: ParameterPanelProps) {
  return (
    <Card title="Paramètres de la simulation" icon={<Users size={18} />}>
      <p className="text-slate-600 text-sm mb-6">Ajustez les données ci-dessous, puis consultez les graphiques et indicateurs.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Activité */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Activité</h4>
          <Slider
            label="Couverts / jour"
            value={ops.coversPerDay}
            min={10}
            max={200}
            step={5}
            onChange={readOnly ? () => { } : (v) => onUpdateOps({ coversPerDay: v })}
          />
          <Slider
            label="Ticket moyen (€)"
            value={ops.ticketAvg}
            min={15}
            max={100}
            unit=" €"
            onChange={readOnly ? () => { } : (v) => onUpdateOps({ ticketAvg: v })}
          />
          <Slider
            label="Jours ouverts / an"
            value={ops.daysOpen}
            min={200}
            max={365}
            onChange={readOnly ? () => { } : (v) => onUpdateOps({ daysOpen: v })}
          />
        </div>

        {/* Coûts % */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Coûts (% CA)</h4>
          <Slider
            label="Food cost"
            value={Math.round(ops.cogsRate * 100)}
            min={20}
            max={45}
            unit="%"
            color="rose"
            onChange={readOnly ? () => { } : (v) => onUpdateOps({ cogsRate: v / 100 })}
          />
          <Slider
            label="Masse salariale"
            value={Math.round(ops.laborRate * 100)}
            min={25}
            max={50}
            unit="%"
            color="orange"
            onChange={readOnly ? () => { } : (v) => onUpdateOps({ laborRate: v / 100 })}
          />
          <Slider
            label="Frais généraux"
            value={Math.round(ops.overheadRate * 100)}
            min={10}
            max={25}
            unit="%"
            color="orange"
            onChange={readOnly ? () => { } : (v) => onUpdateOps({ overheadRate: v / 100 })}
          />
          <p className="text-xs text-slate-500">40 % personnel = variable.</p>
        </div>

        {/* Financement */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <CreditCard size={14} /> Financement
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Prêt (€)</label>
              <input
                type="number"
                value={loan.amount}
                onChange={(e) => { if (!readOnly) onUpdateLoan({ amount: Number(e.target.value) || 0 }); }}
                readOnly={readOnly}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-customOrange focus:border-customOrange read-only:bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Taux (% / an)</label>
              <input
                type="number"
                value={loan.rate}
                step="0.1"
                onChange={(e) => { if (!readOnly) onUpdateLoan({ rate: Number(e.target.value) || 0 }); }}
                readOnly={readOnly}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-customOrange focus:border-customOrange read-only:bg-slate-50"
              />
            </div>
          </div>
          <Slider
            label="Durée (années)"
            value={loan.duration}
            min={1}
            max={15}
            unit=" an"
            onChange={readOnly ? () => { } : (v) => onUpdateLoan({ duration: v })}
          />
          <div className="bg-customOrange/10 border border-customOrange/20 rounded-lg p-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Mensualité</span>
              <span className="font-bold text-customOrange">{formatCurrency(monthlyPayment)}</span>
            </div>
          </div>
        </div>

        {/* Autres fixes */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Autres</h4>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Charges fixes (€/an)</label>
            <input
              type="number"
              value={ops.otherFixedCosts}
              onChange={(e) => { if (!readOnly) onUpdateOps({ otherFixedCosts: Number(e.target.value) || 0 }); }}
              readOnly={readOnly}
              placeholder="Loyer, assurances…"
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-customOrange focus:border-customOrange read-only:bg-slate-50"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

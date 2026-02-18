/**
 * AFFICHAGE DES FORMULES MATHÉMATIQUES
 */

import { Calculator, ArrowRight } from 'lucide-react';

interface FormulaProps {
  title: string;
  formula: string;
  variables: { label: string; value: string }[];
  result: string;
}

export function FormulaDisplay({ title, formula, variables, result }: FormulaProps) {
  return (
    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
      <div className="flex items-center gap-2 mb-3">
        <Calculator size={16} className="text-emerald-600" />
        <span className="text-xs font-bold text-slate-700 uppercase">{title}</span>
      </div>
      
      <div className="font-mono text-sm bg-white p-3 rounded border border-slate-200 mb-3 overflow-x-auto">
        {formula}
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        {variables.map((v, i) => (
          <div key={i} className="text-slate-600">
            <span className="font-medium">{v.label}:</span> {v.value}
          </div>
        ))}
      </div>
      
      <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
        <ArrowRight size={14} className="text-emerald-600" />
        <span className="text-sm font-bold text-emerald-700">{result}</span>
      </div>
    </div>
  );
}

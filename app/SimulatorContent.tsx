/**
 * CONTENU DU SIMULATEUR
 * 1. Sélections de données (en haut, compact)
 * 2. Résultats + graphiques (en dessous, pleine largeur)
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSimulation } from './hooks/useSimulation';
import { ParameterPanel } from './components/ParameterPanel';
import { Dashboard } from './components/Dashboard';
import { ChefHat, Loader2 } from 'lucide-react';
import { OperationParams, LoanParams } from './services/calculator.service';

export function SimulatorContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('t') || searchParams.get('token');

  const [loading, setLoading] = useState(!!token);
  const [error, setError] = useState<string | null>(null);
  const [simulationData, setSimulationData] = useState<any>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const {
    ops,
    loan,
    monthlyPayment,
    results,
    updateOps,
    updateLoan,
  } = useSimulation();

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`/api/share/${token}`)
      .then((res) => {
        if (!res.ok) throw new Error('Token invalide ou expiré');
        return res.json();
      })
      .then((data) => {
        const opsData: OperationParams = {
          coversPerDay: data.couvertsParJour,
          ticketAvg: data.ticketMoyen,
          daysOpen: data.joursOuverts,
          cogsRate: data.foodCost / 100,
          laborRate: data.masseSalariale / 100,
          overheadRate: data.fraisGeneraux / 100,
          otherFixedCosts: data.autresFixes,
        };
        const loanData: LoanParams = {
          amount: data.capitalEmprunte,
          rate: data.tauxInteret,
          duration: data.dureeEmprunt,
        };
        updateOps(opsData);
        updateLoan(loanData);
        setSimulationData(data);
        setIsReadOnly(true);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [token, updateOps, updateLoan]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-amber-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Chargement de la simulation…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md">
          <p className="text-red-600 font-semibold mb-2 text-lg">Accès refusé</p>
          <p className="text-slate-600 text-sm mb-6">{error}</p>
          <a
            href="/"
            className="inline-block bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-amber-700 transition-colors"
          >
            Retour au simulateur
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 text-white p-2 rounded-xl">
              <ChefHat size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                {simulationData?.name || 'RestoSim'}
              </h1>
              <p className="text-xs text-slate-500">
                {isReadOnly ? 'Vue partagée (24h)' : 'Simulateur de rentabilité'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isReadOnly && (
              <span className="bg-sky-100 text-sky-700 px-3 py-1.5 rounded-lg text-xs font-medium">
                Accès temporaire
              </span>
            )}
            <span className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg text-sm font-semibold">
              MCV {results.mcv.unit.toFixed(1)} €/couvert
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isReadOnly && (
          <div className="mb-6 bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 text-sm text-sky-800">
            Simulation partagée par votre conseiller — lecture seule.
          </div>
        )}

        {/* 1. Bloc paramètres en haut — compact */}
        <section className="mb-10">
          <ParameterPanel
            ops={ops}
            loan={loan}
            monthlyPayment={monthlyPayment}
            onUpdateOps={isReadOnly ? () => {} : updateOps}
            onUpdateLoan={isReadOnly ? () => {} : updateLoan}
            readOnly={isReadOnly}
          />
        </section>

        {/* 2. Résultats + graphiques en dessous — pleine largeur, plus d’espace */}
        <section className="w-full">
          <Dashboard
            ops={ops}
            results={results}
            loan={loan}
            monthlyPayment={monthlyPayment}
            onUpdateOps={isReadOnly ? () => {} : updateOps}
          />
        </section>
      </main>
    </div>
  );
}

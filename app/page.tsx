/**
 * PAGE PRINCIPALE
 * 
 * Simulateur de rentabilité restaurant
 * Accepte un token en query param pour l'accès client (24h)
 */

import { Suspense } from 'react';
import { SimulatorContent } from './SimulatorContent';

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600">Chargement...</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SimulatorContent />
    </Suspense>
  );
}

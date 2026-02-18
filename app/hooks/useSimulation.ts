/**
 * HOOK PERSONNALISÉ
 * 
 * Gère l'état de la simulation et les calculs dérivés.
 * Optimisé avec useMemo pour éviter les recalculs inutiles.
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  OperationParams,
  LoanParams,
  calculateLoanPayment,
  calculateProfitability
} from '../services/calculator.service';

// Valeurs par défaut réalistes pour un restaurant moyen
const DEFAULT_OPS: OperationParams = {
  coversPerDay: 80,
  ticketAvg: 25,
  daysOpen: 300,
  cogsRate: 0.30,
  laborRate: 0.35,
  overheadRate: 0.15,
  otherFixedCosts: 24000 // 2000€/mois de loyer/assurances
};

const DEFAULT_LOAN: LoanParams = {
  amount: 150000,
  rate: 4.5,
  duration: 7
};

export function useSimulation() {
  // État unique pour tous les paramètres
  const [ops, setOps] = useState<OperationParams>(DEFAULT_OPS);
  const [loan, setLoan] = useState<LoanParams>(DEFAULT_LOAN);
  
  // Calculs dérivés (memoïsés pour performance)
  const monthlyPayment = useMemo(() => calculateLoanPayment(loan), [loan]);
  
  const results = useMemo(() => 
    calculateProfitability(ops, monthlyPayment), 
    [ops, monthlyPayment]
  );
  
  // Helpers pour mettre à jour les paramètres (useCallback pour éviter les re-renders)
  const updateOps = useCallback((updates: Partial<OperationParams>) => {
    setOps(prev => ({ ...prev, ...updates }));
  }, []);
  
  const updateLoan = useCallback((updates: Partial<LoanParams>) => {
    setLoan(prev => ({ ...prev, ...updates }));
  }, []);
  
  return {
    ops,
    loan,
    monthlyPayment,
    results,
    updateOps,
    updateLoan
  };
}

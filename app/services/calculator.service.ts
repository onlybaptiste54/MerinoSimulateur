/**
 * SERVICE DE CALCUL FINANCIER - RestoSim Pro
 * 
 * Contient toutes les formules mathématiques de rentabilité restaurant.
 * Pure functions, pas de state, pas de dépendances externes.
 */

export interface LoanParams {
  amount: number;      // Capital emprunté (€)
  rate: number;        // Taux annuel (%)
  duration: number;    // Durée en années
}

export interface OperationParams {
  coversPerDay: number;    // Couverts journaliers
  ticketAvg: number;       // Ticket moyen HT (€)
  daysOpen: number;        // Jours d'ouverture/an
  cogsRate: number;        // % Food Cost (0.30 = 30%)
  laborRate: number;       // % Masse salariale totale
  overheadRate: number;    // % Frais généraux
  otherFixedCosts: number; // €/an (loyer, assurances...)
}

export interface FinancialResults {
  // Revenus
  revenue: {
    annual: number;
    monthly: number;
    daily: number;
  };
  
  // Structure coûts (décomposition variable/fixe)
  costs: {
    food: number;           // Coût matière (variable)
    laborVariable: number;  // 40% du personnel (variable)
    laborFixed: number;     // 60% du personnel (fixe)
    overhead: number;       // Frais généraux (fixe)
    loan: number;           // Annuité emprunt (fixe)
    otherFixed: number;     // Autres fixes
    total: number;
  };
  
  // Marge et rentabilité
  mcv: {
    total: number;      // Marge sur coûts variables totale
    unit: number;       // MCV par couvert (€)
    rate: number;       // % du CA
  };
  
  fixedCosts: number;   // Total charges fixes
  
  // Résultats
  profit: {
    amount: number;     // Résultat net
    margin: number;     // % marge nette
  };
  
  // Seuil de rentabilité
  breakeven: {
    dailyCovers: number;    // Couverts/jour nécessaires
    annualCovers: number;   // Couverts/an nécessaires
    revenue: number;        // CA seuil (€)
  };
  
  safetyMargin: number;   // % au-dessus/au-dessous du SR
  
  // Ratios métier
  primeCost: number;      // Food + Labor (%)
}

/**
 * Formule PMT - Mensualité emprunt
 * M = C × (t/12) / (1 - (1 + t/12)^(-n))
 */
export function calculateLoanPayment(params: LoanParams): number {
  const { amount, rate, duration } = params;
  
  if (amount <= 0 || duration <= 0) return 0;
  
  const monthlyRate = rate / 100 / 12;
  const months = duration * 12;
  
  if (monthlyRate === 0) return amount / months;
  
  return amount * (monthlyRate * Math.pow(1 + monthlyRate, months)) 
         / (Math.pow(1 + monthlyRate, months) - 1);
}

/**
 * Calcul complet de la rentabilité restaurant
 * Basé sur la méthode de la Marge sur Coûts Variables (MCV)
 */
export function calculateProfitability(
  ops: OperationParams,
  loanMonthly: number
): FinancialResults {
  
  // 1. REVENUS
  const revenueAnnual = ops.coversPerDay * ops.ticketAvg * ops.daysOpen;
  
  // 2. DÉCOMPOSITION DES COÛTS
  // Hypothèse sectorielle : 40% du personnel est variable (extras, saisonniers)
  const LABOR_VARIABLE_RATIO = 0.4;
  
  const costFood = revenueAnnual * ops.cogsRate;
  const costLaborTotal = revenueAnnual * ops.laborRate;
  const costLaborVariable = costLaborTotal * LABOR_VARIABLE_RATIO;
  const costLaborFixed = costLaborTotal * (1 - LABOR_VARIABLE_RATIO);
  const costOverhead = revenueAnnual * ops.overheadRate;
  const costLoan = loanMonthly * 12;
  
  // 3. MARGE SUR COÛTS VARIABLES (MCV)
  // Formule : MCV = CA - Coûts Variables
  const mcvTotal = revenueAnnual - costFood - costLaborVariable;
  const mcvUnit = ops.ticketAvg * (1 - ops.cogsRate) 
                  - (ops.ticketAvg * ops.laborRate * LABOR_VARIABLE_RATIO);
  const mcvRate = revenueAnnual > 0 ? (mcvTotal / revenueAnnual) * 100 : 0;
  
  // 4. CHARGES FIXES
  const fixedCosts = costLaborFixed + costOverhead + costLoan + ops.otherFixedCosts;
  
  // 5. SEUIL DE RENTABILITÉ
  // Formule : SR = Charges Fixes / MCV unitaire
  const breakevenAnnual = mcvUnit > 0 ? fixedCosts / mcvUnit : 0;
  const breakevenDaily = breakevenAnnual / ops.daysOpen;
  const breakevenRevenue = breakevenAnnual * ops.ticketAvg;
  
  // 6. RÉSULTAT NET
  const totalCosts = costFood + costLaborTotal + costOverhead + costLoan + ops.otherFixedCosts;
  const netProfit = revenueAnnual - totalCosts;
  const profitMargin = revenueAnnual > 0 ? (netProfit / revenueAnnual) * 100 : 0;
  
  // 7. INDICATEURS
  const safetyMargin = breakevenDaily > 0 
    ? ((ops.coversPerDay - breakevenDaily) / breakevenDaily) * 100 
    : 0;
  
  const primeCost = ops.cogsRate + ops.laborRate;
  
  return {
    revenue: {
      annual: revenueAnnual,
      monthly: revenueAnnual / 12,
      daily: revenueAnnual / ops.daysOpen
    },
    costs: {
      food: costFood,
      laborVariable: costLaborVariable,
      laborFixed: costLaborFixed,
      overhead: costOverhead,
      loan: costLoan,
      otherFixed: ops.otherFixedCosts,
      total: totalCosts
    },
    mcv: {
      total: mcvTotal,
      unit: mcvUnit,
      rate: mcvRate
    },
    fixedCosts,
    profit: {
      amount: netProfit,
      margin: profitMargin
    },
    breakeven: {
      dailyCovers: breakevenDaily,
      annualCovers: breakevenAnnual,
      revenue: breakevenRevenue
    },
    safetyMargin,
    primeCost
  };
}

/**
 * Génère les données pour le graphique d'amortissement
 */
export function generateAmortization(
  loan: LoanParams,
  monthlyPayment: number
) {
  const schedule = [];
  let balance = loan.amount;
  const monthlyRate = loan.rate / 100 / 12;
  
  for (let year = 1; year <= loan.duration; year++) {
    let yearInterest = 0;
    let yearPrincipal = 0;
    
    for (let m = 1; m <= 12; m++) {
      const interest = balance * monthlyRate;
      const principal = monthlyPayment - interest;
      balance = Math.max(0, balance - principal);
      yearInterest += interest;
      yearPrincipal += principal;
    }
    
    schedule.push({
      year: `An ${year}`,
      balance,
      interest: yearInterest,
      principal: yearPrincipal
    });
  }
  
  return schedule;
}

/**
 * Analyse de sensibilité : impact du taux d'emprunt
 */
export function analyzeRateImpact(
  baseOps: OperationParams,
  baseLoan: LoanParams,
  rates: number[]
) {
  return rates.map(rate => {
    const monthly = calculateLoanPayment({ ...baseLoan, rate });
    const annual = monthly * 12;
    const fixedCosts = baseOps.otherFixedCosts + annual + 
      (baseOps.coversPerDay * baseOps.ticketAvg * baseOps.daysOpen * baseOps.laborRate * 0.6) +
      (baseOps.coversPerDay * baseOps.ticketAvg * baseOps.daysOpen * baseOps.overheadRate);
    
    const mcvUnit = baseOps.ticketAvg * (1 - baseOps.cogsRate) - 
      (baseOps.ticketAvg * baseOps.laborRate * 0.4);
    
    const breakeven = mcvUnit > 0 ? fixedCosts / mcvUnit / baseOps.daysOpen : 0;
    
    return {
      rate: `${rate}%`,
      monthlyPayment: monthly,
      breakevenCovers: Math.ceil(breakeven),
      annualPayment: annual
    };
  });
}

/**
 * Analyse de sensibilité : impact du ticket moyen
 */
export function analyzeTicketImpact(
  baseOps: OperationParams,
  baseLoan: LoanParams,
  tickets: number[]
) {
  const monthlyPayment = calculateLoanPayment(baseLoan);
  const fixedCosts = baseOps.otherFixedCosts + (monthlyPayment * 12) +
    (baseOps.coversPerDay * baseOps.ticketAvg * baseOps.daysOpen * baseOps.laborRate * 0.6) +
    (baseOps.coversPerDay * baseOps.ticketAvg * baseOps.daysOpen * baseOps.overheadRate);
  
  return tickets.map(ticket => {
    const mcvUnit = ticket * (1 - baseOps.cogsRate) - (ticket * baseOps.laborRate * 0.4);
    const breakeven = mcvUnit > 0 ? fixedCosts / mcvUnit / baseOps.daysOpen : 0;
    
    return {
      ticket: `${ticket}€`,
      mcvUnit: mcvUnit.toFixed(2),
      breakevenCovers: Math.ceil(breakeven)
    };
  });
}

// ========== SIMULATION ACTIONNABLE ==========

/**
 * Profit pour une combinaison (ticket, couverts) — reste des paramètres fixes
 * Pour heatmap et courbes d'indifférence
 */
export function profitForTicketCovers(
  ticket: number,
  covers: number,
  baseOps: OperationParams,
  loanMonthly: number
): number {
  const daysOpen = baseOps.daysOpen;
  const ca = covers * ticket * daysOpen;
  const costFood = ca * baseOps.cogsRate;
  const costLaborTotal = ca * baseOps.laborRate;
  const costLaborVariable = costLaborTotal * 0.4;
  const costLaborFixed = costLaborTotal * 0.6;
  const costOverhead = ca * baseOps.overheadRate;
  const costLoan = loanMonthly * 12;
  const totalCosts = costFood + costLaborTotal + costOverhead + costLoan + baseOps.otherFixedCosts;
  return ca - totalCosts;
}

/**
 * Marge de sécurité en % pour la jauge (0% = seuil, 100% = 2× seuil)
 */
export function safetyPercentForGauge(actualCovers: number, breakevenCovers: number): number {
  if (breakevenCovers <= 0) return 100;
  const ratio = (actualCovers - breakevenCovers) / breakevenCovers;
  return Math.round(ratio * 100);
}

/**
 * Données heatmap : grille ticket × couverts → profit
 */
export function generateHeatmapData(
  baseOps: OperationParams,
  loanMonthly: number,
  ticketMin = 15,
  ticketMax = 50,
  coversMin = 20,
  coversMax = 150,
  stepTicket = 2,
  stepCovers = 5
): { ticket: number; covers: number; profit: number }[] {
  const data: { ticket: number; covers: number; profit: number }[] = [];
  for (let t = ticketMin; t <= ticketMax; t += stepTicket) {
    for (let c = coversMin; c <= coversMax; c += stepCovers) {
      data.push({
        ticket: t,
        covers: c,
        profit: profitForTicketCovers(t, c, baseOps, loanMonthly)
      });
    }
  }
  return data;
}

/**
 * Courbes d'indifférence : pour des niveaux de profit cibles, points (ticket, couverts)
 * Profit = CA × (1 - cogs - labor - overhead) - chargesFixes => CA = (Profit + chargesFixes) / (1 - cogs - labor - overhead)
 */
export function generateIndifferenceCurves(
  baseOps: OperationParams,
  loanMonthly: number,
  profitLevels: number[], // ex [0, 20000, 40000]
  ticketRange: number[]    // ex [18, 22, 26, 30, 35, 40]
): { profit: number; points: { ticket: number; covers: number }[] }[] {
  const chargesFixes = baseOps.otherFixedCosts + loanMonthly * 12;
  const rateVariable = baseOps.cogsRate + baseOps.laborRate + baseOps.overheadRate; // tout le reste varie avec CA
  if (rateVariable >= 1) return profitLevels.map((p) => ({ profit: p, points: [] }));

  return profitLevels.map((targetProfit) => {
    const points: { ticket: number; covers: number }[] = [];
    const caNeeded = (targetProfit + chargesFixes) / (1 - rateVariable);
    for (const ticket of ticketRange) {
      const coversAnnual = caNeeded / ticket;
      const coversDaily = coversAnnual / baseOps.daysOpen;
      if (coversDaily >= 10 && coversDaily <= 200) {
        points.push({ ticket, covers: Math.round(coversDaily) });
      }
    }
    return { profit: targetProfit, points };
  });
}

/** Impact des toggles "Et si" (revenus / coûts additionnels) */
export interface EtSiToggle {
  id: string;
  label: string;
  revenueDelta: number;
  costsDelta: number;
}

export const ET_SI_PRESETS: EtSiToggle[] = [
  { id: 'sunday', label: 'Ouvrir le dimanche soir', revenueDelta: 15000, costsDelta: 8000 },
  { id: 'server', label: 'Embaucher un second serveur', revenueDelta: 0, costsDelta: 25000 },
  { id: 'priceUp', label: 'Augmenter les prix de 10%', revenueDelta: 0.1, costsDelta: 0 }, // multiplier CA
  { id: 'loyer', label: 'Négocier le loyer (-5k€)', revenueDelta: 0, costsDelta: -5000 }
];

export function applyEtSiToggles(
  baseProfit: number,
  baseRevenue: number,
  toggles: { id: string; on: boolean }[]
): { profitAfter: number; delta: number } {
  let delta = 0;
  for (const t of toggles) {
    if (!t.on) continue;
    const p = ET_SI_PRESETS.find((x) => x.id === t.id);
    if (!p) continue;
    const rev = p.revenueDelta > 0 && p.revenueDelta < 1 ? baseRevenue * p.revenueDelta : p.revenueDelta;
    delta += rev - p.costsDelta;
  }
  return { profitAfter: baseProfit + delta, delta };
}

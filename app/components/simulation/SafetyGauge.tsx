/**
 * Jauge de sécurité (speedometer) — marge par rapport au seuil
 */

'use client';

import { useMemo } from 'react';
import { Gauge } from 'lucide-react';
import { Card } from '../ui/Card';
import { safetyPercentForGauge } from '../../services/calculator.service';
import { FinancialResults } from '../../services/calculator.service';

interface SafetyGaugeProps {
  results: FinancialResults;
  coversPerDay: number;
}

export function SafetyGauge({ results, coversPerDay }: SafetyGaugeProps) {
  const safety = useMemo(
    () => safetyPercentForGauge(coversPerDay, results.breakeven.dailyCovers),
    [coversPerDay, results.breakeven.dailyCovers]
  );

  const zone = safety < 30 ? 'Danger' : safety < 70 ? 'Surveillance' : safety <= 100 ? 'Confort' : 'Excès';
  const color = safety < 30 ? '#dc2626' : safety < 70 ? '#FB9F73' : safety <= 100 ? '#3C607C' : '#3C607C';
  const needleDeg = Math.min(180, Math.max(0, (safety / 100) * 180)); // 0 = gauche, 180 = droite
  const needleRad = ((180 - needleDeg) * Math.PI) / 180;

  return (
    <Card title="Jauge de sécurité" icon={<Gauge size={18} />} info="Mesure l'écart entre votre activité actuelle et le seuil de rentabilité. 0% = vous êtes exactement à l'équilibre. 100% = vous faites 2× le minimum requis. Zone rouge = danger, orange = surveillance, bleu = confort.">
      <p className="text-slate-600 text-sm mb-4">Distance au seuil de rentabilité. L'aiguille bouge en temps réel.</p>
      <div className="flex flex-col items-center">
        <div className="relative w-64 h-36">
          <svg viewBox="0 0 200 120" className="w-full h-full">
            <defs>
              <linearGradient id="gaugeBg" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#dc2626" />
                <stop offset="30%" stopColor="#FB9F73" />
                <stop offset="70%" stopColor="#3C607C" />
                <stop offset="100%" stopColor="#3C607C" />
              </linearGradient>
            </defs>
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="url(#gaugeBg)"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray="251"
              strokeDashoffset={251 - (needleDeg / 180) * 251}
            />
            <line
              x1="100"
              y1="100"
              x2={100 + 70 * Math.cos(needleRad)}
              y2={100 - 70 * Math.sin(needleRad)}
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="8" fill="#1e293b" />
          </svg>
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-slate-500 px-2">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
        <div className="mt-2 text-center">
          <p className="text-2xl font-bold" style={{ color }}>
            {safety}%
          </p>
          <p className="text-sm text-slate-600">{zone}</p>
          <p className="text-xs text-slate-500 mt-1">
            Seuil : {Math.ceil(results.breakeven.dailyCovers)} couverts/j · Vous : {coversPerDay}
          </p>
        </div>
      </div>
    </Card>
  );
}

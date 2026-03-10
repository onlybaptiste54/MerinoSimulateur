/**
 * Courbe d'indifférence — lignes de niveau (même résultat net), clic pour appliquer ticket/couverts
 */

'use client';

import { useMemo, useCallback, useRef, useState } from 'react';
import { Compass } from 'lucide-react';
import { Card } from '../ui/Card';
import {
  OperationParams,
  generateIndifferenceCurves,
  profitForTicketCovers
} from '../../services/calculator.service';
import { formatCurrency } from '../../services/format.service';

const TICKET_MIN = 18;
const TICKET_MAX = 45;
const COVERS_MIN = 25;
const COVERS_MAX = 120;
const TICKET_RANGE = [18, 22, 26, 30, 35, 40, 45];

interface IndifferenceCurveProps {
  ops: OperationParams;
  loanMonthly: number;
  currentProfit: number;
  onUpdateOps: (u: Partial<OperationParams>) => void;
}

function shortProfit(p: number): string {
  if (p === 0) return '0€';
  if (Math.abs(p) >= 1000) return `${p / 1000 >= 0 ? '+' : ''}${Math.round(p / 1000)}k€`;
  return `${p}€`;
}

export function IndifferenceCurve({ ops, loanMonthly, currentProfit, onUpdateOps }: IndifferenceCurveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);

  const curves = useMemo(
    () => generateIndifferenceCurves(ops, loanMonthly, [0, 10000, 20000, 30000, 50000], TICKET_RANGE),
    [ops, loanMonthly]
  );

  const width = 500;
  const height = 320;
  const padding = { left: 50, right: 55, top: 20, bottom: 40 };

  const xScale = (t: number) => padding.left + ((t - TICKET_MIN) / (TICKET_MAX - TICKET_MIN)) * (width - padding.left - padding.right);
  const yScale = (c: number) => padding.top + ((COVERS_MAX - c) / (COVERS_MAX - COVERS_MIN)) * (height - padding.top - padding.bottom);

  const currentX = xScale(ops.ticketAvg);
  const currentY = yScale(ops.coversPerDay);

  const posFromEvent = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const ticket = TICKET_MIN + ((x - padding.left) / (width - padding.left - padding.right)) * (TICKET_MAX - TICKET_MIN);
    const covers = COVERS_MAX - ((y - padding.top) / (height - padding.top - padding.bottom)) * (COVERS_MAX - COVERS_MIN);
    return {
      t: Math.round(Math.max(TICKET_MIN, Math.min(TICKET_MAX, ticket))),
      c: Math.round(Math.max(COVERS_MIN, Math.min(COVERS_MAX, covers))),
    };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    e.preventDefault();
    setDragging(true);
    const pos = posFromEvent(e.clientX, e.clientY);
    if (pos) onUpdateOps({ ticketAvg: pos.t, coversPerDay: pos.c });
  }, [posFromEvent, onUpdateOps]);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging) return;
    const pos = posFromEvent(e.clientX, e.clientY);
    if (pos) onUpdateOps({ ticketAvg: pos.t, coversPerDay: pos.c });
  }, [dragging, posFromEvent, onUpdateOps]);

  const handlePointerUp = useCallback(() => setDragging(false), []);

  return (
    <Card title="Courbe d'indifférence Prix/Volume" icon={<Compass size={18} />} info="Chaque courbe regroupe toutes les combinaisons ticket × couverts qui donnent le même résultat net. La courbe rouge = seuil de rentabilité (profit = 0). Les courbes bleues = niveaux de profit croissants. Cliquez ou glissez pour repositionner votre scénario.">
      <p className="text-slate-600 text-sm mb-3">
        Même résultat net pour différentes combinaisons. Cliquez sur une zone pour déplacer votre position.
      </p>
      <div ref={containerRef} className="overflow-x-auto">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="border border-slate-200 rounded-lg bg-white cursor-crosshair"
          style={{ touchAction: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {curves.map((curve, i) => {
            if (curve.points.length < 2) return null;
            const pathD = curve.points
              .map((p, j) => `${j === 0 ? 'M' : 'L'} ${xScale(p.ticket)} ${yScale(p.covers)}`)
              .join(' ');
            return (
              <g key={curve.profit}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={curve.profit === 0 ? '#b91c1c' : curve.profit > 0 ? '#3C607C' : '#FB9F73'}
                  strokeWidth={curve.profit === 0 ? 2.5 : 1.5}
                  strokeDasharray={curve.profit === 0 ? 'none' : '4 2'}
                  opacity={0.9}
                />
                {curve.points.length > 0 && (
                  <text
                    x={xScale(curve.points[curve.points.length - 1].ticket) + 6}
                    y={yScale(curve.points[curve.points.length - 1].covers) + i * 1}
                    fontSize={10}
                    fill={curve.profit === 0 ? '#b91c1c' : '#64748b'}
                    fontWeight={curve.profit === 0 ? 'bold' : 'normal'}
                  >
                    {shortProfit(curve.profit)}
                  </text>
                )}
              </g>
            );
          })}
          <circle
            cx={currentX}
            cy={currentY}
            r="8"
            fill="white"
            stroke="#1e293b"
            strokeWidth="2"
            className="animate-pulse"
          />
          <text x={padding.left} y={height - 8} fontSize={11} fill="#64748b">
            Ticket moyen (€) →
          </text>
          <text x={10} y={height / 2} fontSize={11} fill="#64748b" transform={`rotate(-90, 10, ${height / 2})`}>
            Couverts/jour
          </text>
        </svg>
      </div>
      <p className="text-xs text-slate-500 mt-2">
        Position actuelle : {ops.ticketAvg}€ × {ops.coversPerDay} couverts/j → {formatCurrency(currentProfit)}
      </p>
    </Card>
  );
}

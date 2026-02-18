/**
 * Carte de rentabilité — heatmap ticket × couverts, point blanc draggable
 */

'use client';

import { useMemo, useCallback, useRef, useState } from 'react';
import { Map } from 'lucide-react';
import { Card } from '../ui/Card';
import { OperationParams } from '../../services/calculator.service';
import { generateHeatmapData } from '../../services/calculator.service';

const TICKET_MIN = 15;
const TICKET_MAX = 50;
const COVERS_MIN = 20;
const COVERS_MAX = 150;
const STEP_T = 2;
const STEP_C = 5;

function profitToColor(profit: number): string {
  if (profit < -30000) return 'rgb(127, 29, 29)';   // rouge foncé
  if (profit < -10000) return 'rgb(185, 28, 28)';   // rouge
  if (profit < 10000) return 'rgb(251, 159, 115)';   // orange (#FB9F73)
  if (profit < 30000) return 'rgba(60, 96, 124, 0.7)';    // bleu clair (#3C607C avec opacité)
  return 'rgb(60, 96, 124)';                         // bleu foncé (#3C607C)
}

interface RentabilityHeatmapProps {
  ops: OperationParams;
  loanMonthly: number;
  onUpdateOps: (u: Partial<OperationParams>) => void;
}

export function RentabilityHeatmap({ ops, loanMonthly, onUpdateOps }: RentabilityHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const grid = useMemo(() => {
    const data = generateHeatmapData(ops, loanMonthly, TICKET_MIN, TICKET_MAX, COVERS_MIN, COVERS_MAX, STEP_T, STEP_C);
    const byKey: Record<string, number> = {};
    data.forEach((d) => { byKey[`${d.ticket},${d.covers}`] = d.profit; });
    return { data, byKey };
  }, [ops.daysOpen, ops.cogsRate, ops.laborRate, ops.overheadRate, ops.otherFixedCosts, loanMonthly]);

  const tickets = useMemo(() => {
    const t: number[] = [];
    for (let i = TICKET_MIN; i <= TICKET_MAX; i += STEP_T) t.push(i);
    return t;
  }, []);
  const coversList = useMemo(() => {
    const c: number[] = [];
    for (let i = COVERS_MIN; i <= COVERS_MAX; i += STEP_C) c.push(i);
    return c.reverse(); // top = high covers
  }, []);

  const xPercent = ((ops.ticketAvg - TICKET_MIN) / (TICKET_MAX - TICKET_MIN)) * 100;
  const yPercent = ((COVERS_MAX - ops.coversPerDay) / (COVERS_MAX - COVERS_MIN)) * 100; // top = high

  const toTicketCovers = useCallback((clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    const ticket = Math.round(TICKET_MIN + x * (TICKET_MAX - TICKET_MIN));
    const covers = Math.round(COVERS_MAX - y * (COVERS_MAX - COVERS_MIN));
    return {
      ticket: Math.max(TICKET_MIN, Math.min(TICKET_MAX, ticket)),
      covers: Math.max(COVERS_MIN, Math.min(COVERS_MAX, covers))
    };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(true);
    const tc = toTicketCovers(e.clientX, e.clientY);
    if (tc) onUpdateOps({ ticketAvg: tc.ticket, coversPerDay: tc.covers });
  }, [toTicketCovers, onUpdateOps]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const tc = toTicketCovers(e.clientX, e.clientY);
    if (tc) onUpdateOps({ ticketAvg: tc.ticket, coversPerDay: tc.covers });
  }, [dragging, toTicketCovers, onUpdateOps]);

  const handlePointerUp = useCallback(() => setDragging(false), []);
  const handlePointerLeave = useCallback(() => setDragging(false), []);

  return (
    <Card title="Carte de rentabilité" icon={<Map size={18} />}>
      <p className="text-slate-600 text-sm mb-3">Glissez le point blanc pour modifier ticket moyen et couverts/jour.</p>
      <div
        ref={containerRef}
        className="relative w-full aspect-[35/13] max-h-[320px] rounded-lg overflow-hidden border border-slate-200 select-none"
        style={{ touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerUp}
      >
        <div className="absolute inset-0 grid gap-px" style={{
          gridTemplateColumns: `repeat(${tickets.length}, 1fr)`,
          gridTemplateRows: `repeat(${coversList.length}, 1fr)`
        }}>
          {coversList.map((c) =>
            tickets.map((t) => {
              const profit = grid.byKey[`${t},${c}`] ?? 0;
              return (
                <div
                  key={`${t}-${c}`}
                  className="min-w-0 min-h-0"
                  style={{ backgroundColor: profitToColor(profit) }}
                />
              );
            })
          )}
        </div>
        <div
          className="absolute w-5 h-5 rounded-full border-2 border-slate-800 bg-white shadow-lg pointer-events-none"
          style={{ left: `calc(${xPercent}% - 10px)`, top: `calc(${yPercent}% - 10px)` }}
        />
        <div className="absolute bottom-2 left-2 right-2 flex justify-between text-xs text-white/90 font-medium drop-shadow">
          <span>Ticket moyen (€) →</span>
          <span>Couverts/jour ↑</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
        <span><span className="inline-block w-3 h-3 rounded bg-red-900 align-middle mr-1" /> Perte &gt;30k€</span>
        <span><span className="inline-block w-3 h-3 rounded bg-red-600 align-middle mr-1" /> Perte 10-30k€</span>
        <span><span className="inline-block w-3 h-3 rounded bg-customOrange align-middle mr-1" /> Équilibre ±10k€</span>
        <span><span className="inline-block w-3 h-3 rounded bg-customBlue/70 align-middle mr-1" /> Profit 10-30k€</span>
        <span><span className="inline-block w-3 h-3 rounded bg-customBlue align-middle mr-1" /> Profit &gt;30k€</span>
      </div>
    </Card>
  );
}

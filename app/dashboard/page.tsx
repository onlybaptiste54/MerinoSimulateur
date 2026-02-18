/**
 * DASHBOARD AGENT
 * 
 * Gestion des simulations et génération de tokens
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Copy, ExternalLink, Trash2, Edit, Loader2 } from 'lucide-react';
import { ParameterPanel } from '../components/ParameterPanel';
import { Dashboard } from '../components/Dashboard';
import { useSimulation } from '../hooks/useSimulation';
import { OperationParams, LoanParams } from '../services/calculator.service';

interface Simulation {
  id: string;
  name: string;
  couvertsParJour: number;
  ticketMoyen: number;
  joursOuverts: number;
  foodCost: number;
  masseSalariale: number;
  fraisGeneraux: number;
  capitalEmprunte: number;
  tauxInteret: number;
  dureeEmprunt: number;
  autresFixes: number;
  createdAt: string;
  accessTokens?: Array<{ token: string; expiresAt: string }>;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [selectedSimulation, setSelectedSimulation] = useState<Simulation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newSimName, setNewSimName] = useState('');

  const {
    ops,
    loan,
    monthlyPayment,
    results,
    updateOps,
    updateLoan
  } = useSimulation();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadSimulations();
    }
  }, [status]);

  useEffect(() => {
    if (selectedSimulation) {
      const opsData: OperationParams = {
        coversPerDay: selectedSimulation.couvertsParJour,
        ticketAvg: selectedSimulation.ticketMoyen,
        daysOpen: selectedSimulation.joursOuverts,
        cogsRate: selectedSimulation.foodCost / 100,
        laborRate: selectedSimulation.masseSalariale / 100,
        overheadRate: selectedSimulation.fraisGeneraux / 100,
        otherFixedCosts: selectedSimulation.autresFixes,
      };

      const loanData: LoanParams = {
        amount: selectedSimulation.capitalEmprunte,
        rate: selectedSimulation.tauxInteret,
        duration: selectedSimulation.dureeEmprunt,
      };

      updateOps(opsData);
      updateLoan(loanData);
    }
  }, [selectedSimulation, updateOps, updateLoan]);

  const loadSimulations = async () => {
    try {
      const res = await fetch('/api/simulations');
      if (res.ok) {
        const data = await res.json();
        setSimulations(data);
        if (data.length > 0 && !selectedSimulation) {
          setSelectedSimulation(data[0]);
        }
      }
    } catch (error) {
      console.error('Erreur chargement simulations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSimulation = async () => {
    if (!newSimName.trim()) return;

    try {
      const res = await fetch('/api/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSimName,
          couvertsParJour: 80,
          ticketMoyen: 25,
          joursOuverts: 300,
          foodCost: 30,
          masseSalariale: 35,
          fraisGeneraux: 15,
          capitalEmprunte: 150000,
          tauxInteret: 4.5,
          dureeEmprunt: 7,
          autresFixes: 24000,
        }),
      });

      if (res.ok) {
        const newSim = await res.json();
        setSimulations([newSim, ...simulations]);
        setSelectedSimulation(newSim);
        setShowNewForm(false);
        setNewSimName('');
      }
    } catch (error) {
      console.error('Erreur création simulation:', error);
    }
  };

  const handleGenerateToken = async (simId: string) => {
    try {
      const res = await fetch(`/api/simulations/${simId}/token`, {
        method: 'POST',
      });

      if (res.ok) {
        const { shareUrl } = await res.json();
        await navigator.clipboard.writeText(shareUrl);
        alert('Lien copié dans le presse-papier !');
        loadSimulations();
      }
    } catch (error) {
      console.error('Erreur génération token:', error);
    }
  };

  const handleDeleteSimulation = async (simId: string) => {
    if (!confirm('Supprimer cette simulation ?')) return;

    try {
      const res = await fetch(`/api/simulations/${simId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSimulations(simulations.filter(s => s.id !== simId));
        if (selectedSimulation?.id === simId) {
          setSelectedSimulation(simulations.find(s => s.id !== simId) || null);
        }
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedSimulation) return;

    try {
      const res = await fetch(`/api/simulations/${selectedSimulation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          couvertsParJour: ops.coversPerDay,
          ticketMoyen: ops.ticketAvg,
          joursOuverts: ops.daysOpen,
          foodCost: ops.cogsRate * 100,
          masseSalariale: ops.laborRate * 100,
          fraisGeneraux: ops.overheadRate * 100,
          capitalEmprunte: loan.amount,
          tauxInteret: loan.rate,
          dureeEmprunt: loan.duration,
          autresFixes: ops.otherFixedCosts,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setSimulations(simulations.map(s => s.id === updated.id ? updated : s));
        setSelectedSimulation(updated);
        alert('Simulation sauvegardée !');
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">
              Dashboard Agent
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{session.user?.email}</span>
            <button
              onClick={() => handleSaveChanges()}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700"
            >
              Sauvegarder
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar - Liste des simulations */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-800">Simulations</h2>
                <button
                  onClick={() => setShowNewForm(!showNewForm)}
                  className="p-1.5 hover:bg-slate-100 rounded"
                >
                  <Plus size={18} />
                </button>
              </div>

              {showNewForm && (
                <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                  <input
                    type="text"
                    value={newSimName}
                    onChange={(e) => setNewSimName(e.target.value)}
                    placeholder="Nom de la simulation"
                    className="w-full text-sm border border-slate-300 rounded px-2 py-1 mb-2"
                  />
                  <button
                    onClick={handleCreateSimulation}
                    className="w-full bg-emerald-600 text-white text-sm py-1.5 rounded hover:bg-emerald-700"
                  >
                    Créer
                  </button>
                </div>
              )}

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {simulations.map((sim) => (
                  <div
                    key={sim.id}
                    onClick={() => setSelectedSimulation(sim)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedSimulation?.id === sim.id
                        ? 'bg-emerald-50 border-2 border-emerald-500'
                        : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-slate-800">{sim.name}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {sim.couvertsParJour} couverts/jour
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateToken(sim.id);
                          }}
                          className="p-1 hover:bg-white rounded"
                          title="Générer un lien de partage"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSimulation(sim.id);
                          }}
                          className="p-1 hover:bg-white rounded text-red-600"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    {sim.accessTokens && sim.accessTokens.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200">
                        <p className="text-xs text-slate-500">
                          {sim.accessTokens.length} lien(s) actif(s)
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            {selectedSimulation ? (
              <div className="space-y-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {selectedSimulation.name}
                  </h2>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleGenerateToken(selectedSimulation.id)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      <Copy size={16} />
                      Générer un accès client
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-4">
                    <ParameterPanel
                      ops={ops}
                      loan={loan}
                      monthlyPayment={monthlyPayment}
                      onUpdateOps={updateOps}
                      onUpdateLoan={updateLoan}
                    />
                  </div>

                  <div className="lg:col-span-8">
                    <Dashboard
                      ops={ops}
                      results={results}
                      loan={loan}
                      monthlyPayment={monthlyPayment}
                      onUpdateOps={updateOps}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <p className="text-slate-600">Sélectionnez une simulation ou créez-en une nouvelle</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import db, { preparedQueries } from '@/lib/db';
import { z } from 'zod';
import crypto from 'crypto';

const simulationSchema = z.object({
  name: z.string().min(1),
  couvertsParJour: z.number().min(10).max(200),
  ticketMoyen: z.number().min(15).max(100),
  joursOuverts: z.number().min(200).max(365),
  foodCost: z.number().min(20).max(45),
  masseSalariale: z.number().min(25).max(50),
  fraisGeneraux: z.number().min(10).max(25),
  capitalEmprunte: z.number().min(0),
  tauxInteret: z.number().min(0).max(20),
  dureeEmprunt: z.number().min(1).max(15),
  autresFixes: z.number().min(0),
});

// GET - Liste des simulations de l'agent
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Utiliser la requête préparée
    const simulations = preparedQueries.getSimulationsByUserId.all(session.user.id) as any[];

    // Récupérer les tokens actifs pour chaque simulation (utiliser requête préparée)
    const simulationsWithTokens = simulations.map(sim => {
      const tokens = preparedQueries.getTokensBySimulationId.all(sim.id) as any[];
      
      return {
        ...sim,
        accessTokens: tokens.map(t => ({
          id: t.id,
          token: t.token,
          expiresAt: t.expiresAt,
        })),
      };
    });

    return NextResponse.json(simulationsWithTokens);
  } catch (error) {
    console.error('Erreur GET simulations:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle simulation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const data = simulationSchema.parse(body);

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO simulations (
        id, name, userId, couvertsParJour, ticketMoyen, joursOuverts,
        foodCost, masseSalariale, fraisGeneraux, capitalEmprunte,
        tauxInteret, dureeEmprunt, autresFixes, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.name,
      session.user.id,
      data.couvertsParJour,
      data.ticketMoyen,
      data.joursOuverts,
      data.foodCost,
      data.masseSalariale,
      data.fraisGeneraux,
      data.capitalEmprunte,
      data.tauxInteret,
      data.dureeEmprunt,
      data.autresFixes,
      now,
      now
    );

    const simulation = preparedQueries.getSimulationById.get(id);

    return NextResponse.json(simulation, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Erreur POST simulation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

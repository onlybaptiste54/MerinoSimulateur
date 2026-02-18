import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';
import { z } from 'zod';
import crypto from 'crypto';

const simulationSchema = z.object({
  name: z.string().min(1).optional(),
  couvertsParJour: z.number().min(10).max(200).optional(),
  ticketMoyen: z.number().min(15).max(100).optional(),
  joursOuverts: z.number().min(200).max(365).optional(),
  foodCost: z.number().min(20).max(45).optional(),
  masseSalariale: z.number().min(25).max(50).optional(),
  fraisGeneraux: z.number().min(10).max(25).optional(),
  capitalEmprunte: z.number().min(0).optional(),
  tauxInteret: z.number().min(0).max(20).optional(),
  dureeEmprunt: z.number().min(1).max(15).optional(),
  autresFixes: z.number().min(0).optional(),
});

// GET - Récupérer une simulation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const simulation = db.prepare(`
      SELECT * FROM simulations WHERE id = ? AND userId = ?
    `).get(id, session.user.id) as any;

    if (!simulation) {
      return NextResponse.json({ error: 'Simulation non trouvée' }, { status: 404 });
    }

    return NextResponse.json(simulation);
  } catch (error) {
    console.error('Erreur GET simulation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une simulation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que la simulation appartient à l'utilisateur
    const existing = db.prepare(`
      SELECT * FROM simulations WHERE id = ? AND userId = ?
    `).get(id, session.user.id) as any;

    if (!existing) {
      return NextResponse.json({ error: 'Simulation non trouvée' }, { status: 404 });
    }

    const body = await request.json();
    const data = simulationSchema.parse(body);

    // Construire la requête UPDATE dynamiquement
    const updates: string[] = [];
    const values: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (updates.length === 0) {
      return NextResponse.json(existing);
    }

    updates.push('updatedAt = ?');
    values.push(new Date().toISOString());
    values.push(id, session.user.id);

    db.prepare(`
      UPDATE simulations 
      SET ${updates.join(', ')}
      WHERE id = ? AND userId = ?
    `).run(...values);

    const updated = db.prepare(`
      SELECT * FROM simulations WHERE id = ? AND userId = ?
    `).get(id, session.user.id);

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Erreur PUT simulation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une simulation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const result = db.prepare(`
      DELETE FROM simulations WHERE id = ? AND userId = ?
    `).run(id, session.user.id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Simulation non trouvée' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur DELETE simulation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { validateToken } from '@/lib/token';
import { preparedQueries } from '@/lib/db';

// GET - Valider un token et récupérer la simulation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const validation = await validateToken(token);

    if (!validation.valid || !validation.simulationId) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }

    // Utiliser la requête préparée
    const simulation = preparedQueries.getSimulationById.get(validation.simulationId) as any;

    if (!simulation) {
      return NextResponse.json(
        { error: 'Simulation non trouvée' },
        { status: 404 }
      );
    }

    // Cache headers pour réduire les requêtes répétées
    return NextResponse.json(simulation, {
      headers: {
        'Cache-Control': 'private, max-age=300', // Cache 5 minutes
      },
    });
  } catch (error) {
    console.error('Erreur GET share:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

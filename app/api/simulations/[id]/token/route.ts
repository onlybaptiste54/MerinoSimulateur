import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';
import { createAccessToken } from '@/lib/token';

// POST - Générer un token d'accès pour une simulation
export async function POST(
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
    const simulation = db.prepare(`
      SELECT * FROM simulations WHERE id = ? AND userId = ?
    `).get(id, session.user.id) as any;

    if (!simulation) {
      return NextResponse.json({ error: 'Simulation non trouvée' }, { status: 404 });
    }

    const token = await createAccessToken(id);
    const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const shareUrl = `${appUrl}/?t=${token}`;

    return NextResponse.json({ token, shareUrl });
  } catch (error) {
    console.error('Erreur POST token:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

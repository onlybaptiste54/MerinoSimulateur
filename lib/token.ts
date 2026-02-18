import db, { preparedQueries } from './db';
import crypto from 'crypto';

/**
 * Génère un token unique pour l'accès client
 */
export function generateToken(): string {
  return `tk_${crypto.randomBytes(16).toString('hex')}`;
}

/**
 * Crée un token d'accès pour une simulation
 */
export async function createAccessToken(simulationId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24h d'expiration

  const id = crypto.randomUUID();
  
  db.prepare(`
    INSERT INTO access_tokens (id, token, simulationId, expiresAt, isActive)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, token, simulationId, expiresAt.toISOString(), 1);

  return token;
}

/**
 * Valide un token d'accès
 */
export async function validateToken(token: string): Promise<{
  valid: boolean;
  simulationId?: string;
}> {
  // Utiliser la requête préparée
  const accessToken = preparedQueries.getToken.get(token) as any;

  if (!accessToken) {
    return { valid: false };
  }

  const expiresAt = new Date(accessToken.expiresAt);
  if (new Date() > expiresAt) {
    return { valid: false };
  }

  return {
    valid: true,
    simulationId: accessToken.simulationId,
  };
}

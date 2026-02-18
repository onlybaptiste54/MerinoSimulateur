/**
 * Script pour créer un utilisateur admin
 * Usage: npx tsx scripts/create-user.ts <email> <password>
 */

import db from '../lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

async function createUser(email: string, password: string, name?: string) {
  try {
    // Vérifier si l'utilisateur existe déjà
    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    
    if (existing) {
      console.error('❌ Un utilisateur avec cet email existe déjà');
      process.exit(1);
    }

    // Hasher le mot de passe avec bcrypt
    const hashedPassword = await bcrypt.hash(password, 12); // 12 rounds pour sécurité
    
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Créer l'utilisateur
    db.prepare(`
      INSERT INTO users (id, email, password, name, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, email, hashedPassword, name || null, now, now);

    console.log('✅ Utilisateur créé avec succès !');
    console.log(`📧 Email: ${email}`);
    console.log(`👤 ID: ${id}`);
    console.log(`🔐 Mot de passe: ${password.length > 0 ? '***' : 'non défini'}`);
    console.log('\n💡 Vous pouvez maintenant vous connecter avec ces identifiants.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur:', error);
    process.exit(1);
  }
}

// Récupérer les arguments de la ligne de commande
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: npm run create-user <email> <password> [name]');
  console.log('Exemple: npm run create-user admin@example.com MonMotDePasse123!');
  process.exit(1);
}

const [email, password, name] = args;

if (!email || !password) {
  console.error('❌ Email et mot de passe sont requis');
  process.exit(1);
}

if (password.length < 8) {
  console.error('❌ Le mot de passe doit contenir au moins 8 caractères');
  process.exit(1);
}

createUser(email, password, name);

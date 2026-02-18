/**
 * Script interactif pour créer un utilisateur admin
 * Usage: npm run create-user-interactive
 */

import * as readline from 'readline';
import db from '../lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createUserInteractive() {
  try {
    console.log('\n🔐 Création d\'un utilisateur admin\n');

    const email = await question('📧 Email: ');
    if (!email || !email.includes('@')) {
      console.error('❌ Email invalide');
      rl.close();
      process.exit(1);
    }

    // Vérifier si l'utilisateur existe déjà
    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (existing) {
      console.error('❌ Un utilisateur avec cet email existe déjà');
      rl.close();
      process.exit(1);
    }

    const name = await question('👤 Nom (optionnel): ');

    let password = '';
    let passwordConfirm = '';

    do {
      password = await question('🔑 Mot de passe (min 8 caractères): ');
      if (password.length < 8) {
        console.error('❌ Le mot de passe doit contenir au moins 8 caractères');
        continue;
      }

      passwordConfirm = await question('🔑 Confirmer le mot de passe: ');
      if (password !== passwordConfirm) {
        console.error('❌ Les mots de passe ne correspondent pas');
        password = '';
      }
    } while (!password || password.length < 8);

    rl.close();

    // Hasher le mot de passe
    console.log('\n⏳ Création de l\'utilisateur...');
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Créer l'utilisateur
    db.prepare(`
      INSERT INTO users (id, email, password, name, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, email, hashedPassword, name || null, now, now);

    console.log('\n✅ Utilisateur créé avec succès !');
    console.log(`📧 Email: ${email}`);
    if (name) console.log(`👤 Nom: ${name}`);
    console.log(`🆔 ID: ${id}`);
    console.log('\n💡 Vous pouvez maintenant vous connecter avec ces identifiants.');
    console.log('🌐 Accédez à http://localhost:3000/login\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur:', error);
    rl.close();
    process.exit(1);
  }
}

createUserInteractive();

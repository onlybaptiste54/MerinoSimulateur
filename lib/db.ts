import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data', 'merino.db');

// Créer le dossier data s'il n'existe pas
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Configuration optimisée pour réduire la RAM
const db = new Database(dbPath, {
  // Réduire la mémoire utilisée
  verbose: undefined, // Pas de logs en production
});

// Optimisations SQLite pour réduire la RAM
db.pragma('journal_mode = WAL'); // Write-Ahead Logging (meilleure performance)
db.pragma('synchronous = NORMAL'); // Équilibre performance/sécurité
db.pragma('cache_size = -4000');  // 4MB (largement suffisant pour ce volume)
db.pragma('temp_store = MEMORY'); // Utiliser la RAM pour les tables temporaires
db.pragma('mmap_size = 33554432'); // 32MB pour memory-mapped I/O

// Initialiser les tables si elles n'existent pas
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS simulations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    userId TEXT NOT NULL,
    couvertsParJour INTEGER DEFAULT 50,
    ticketMoyen REAL DEFAULT 25.0,
    joursOuverts INTEGER DEFAULT 300,
    foodCost REAL DEFAULT 30.0,
    masseSalariale REAL DEFAULT 35.0,
    fraisGeneraux REAL DEFAULT 15.0,
    capitalEmprunte REAL DEFAULT 0,
    tauxInteret REAL DEFAULT 3.5,
    dureeEmprunt INTEGER DEFAULT 10,
    autresFixes REAL DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS access_tokens (
    id TEXT PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    simulationId TEXT NOT NULL,
    expiresAt DATETIME NOT NULL,
    isActive INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (simulationId) REFERENCES simulations(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_simulations_userId ON simulations(userId);
  CREATE INDEX IF NOT EXISTS idx_access_tokens_token ON access_tokens(token);
  CREATE INDEX IF NOT EXISTS idx_access_tokens_simulationId ON access_tokens(simulationId);
  CREATE INDEX IF NOT EXISTS idx_access_tokens_expiresAt ON access_tokens(expiresAt);
`);

// Préparer les requêtes fréquentes pour meilleure performance
export const preparedQueries = {
  getUserByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
  getUserById: db.prepare('SELECT * FROM users WHERE id = ?'),
  getSimulationById: db.prepare('SELECT * FROM simulations WHERE id = ?'),
  getSimulationsByUserId: db.prepare('SELECT * FROM simulations WHERE userId = ? ORDER BY createdAt DESC'),
  getToken: db.prepare('SELECT * FROM access_tokens WHERE token = ? AND isActive = 1'),
  getTokensBySimulationId: db.prepare('SELECT id, token, expiresAt FROM access_tokens WHERE simulationId = ? AND isActive = 1'),
  deleteExpiredTokens: db.prepare('DELETE FROM access_tokens WHERE expiresAt < ?'),
};

// Nettoyer les tokens expirés au démarrage et périodiquement
const cleanupExpiredTokens = () => {
  try {
    const now = new Date().toISOString();
    preparedQueries.deleteExpiredTokens.run(now);
  } catch (error) {
    console.error('Erreur nettoyage tokens:', error);
  }
};

// Nettoyer au démarrage
cleanupExpiredTokens();

// Nettoyer toutes les heures
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredTokens, 60 * 60 * 1000);
}

export default db;

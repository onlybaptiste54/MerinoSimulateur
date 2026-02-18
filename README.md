# 🍽️ Merino Simulateur - RestoSim Pro

Simulateur de rentabilité restaurant optimisé pour la production - léger et performant.

## 🚀 Démarrage Rapide

**Ubuntu / Linux** :
```bash
npm install
cp .env.example .env
# Éditer .env, puis : openssl rand -base64 32 pour NEXTAUTH_SECRET
npm run create-user-interactive
npm run dev
```

Ou en une commande :
```bash
chmod +x setup.sh && ./setup.sh
npm run dev
```

👉 **Ubuntu** : [README-UBUNTU.md](./README-UBUNTU.md)  
👉 **Détails** : [QUICKSTART.md](./QUICKSTART.md)

## 📋 Prérequis

- Node.js 20.9+ (requis pour Next.js 16)
- npm ou yarn

## 🏗️ Architecture

```
app/
├── services/
│   ├── calculator.service.ts    # Formules mathématiques
│   └── format.service.ts        # Formatage des nombres
├── hooks/
│   └── useSimulation.ts         # Gestion d'état optimisée
├── components/
│   ├── ui/                      # Composants réutilisables
│   ├── Charts.tsx               # Graphiques (lazy loaded)
│   ├── ParameterPanel.tsx       # Panneau de paramètres
│   └── Dashboard.tsx            # Tableau de bord
├── api/
│   ├── auth/                    # Authentification NextAuth
│   ├── simulations/            # CRUD simulations
│   └── share/                   # Partage par token
└── page.tsx                     # Page principale
```

## 🔐 Authentification

### Agent (Dashboard Pro)
- Login/Password standard
- Gestion complète des simulations
- Génération de tokens de partage

### Client (Magic Link)
- Accès via token unique (24h) sur la page principale `/?t=tk_xxx`
- Vue lecture seule
- Aucune création de compte

## 📊 Fonctionnalités

- ✅ Calcul du seuil de rentabilité
- ✅ Analyse MCV (Marge sur Coûts Variables)
- ✅ Graphiques interactifs (Recharts - lazy loaded)
- ✅ Analyse de sensibilité (taux, ticket moyen)
- ✅ Amortissement de l'emprunt
- ✅ Alertes métier automatiques
- ✅ Partage sécurisé par token

## 🛠️ Technologies

- **Next.js 16** - Framework React (Turbopack par défaut)
- **React 19** - Bibliothèque UI
- **TypeScript 5.7** - Typage statique
- **SQLite** (better-sqlite3) - Base de données légère et optimisée
- **NextAuth v4** - Authentification
- **Recharts 3.7** - Graphiques (lazy loaded)
- **Tailwind CSS 3.4** - Styles
- **Lucide React** - Icônes

## ⚡ Optimisations Production

### Performance
- **Lazy loading** des graphiques Recharts
- **Code splitting** automatique
- **Memoization** des calculs avec useMemo
- **Prepared statements** SQLite pour meilleures performances
- **Cache headers** sur les API routes

### Réduction RAM
- **SQLite optimisé** : WAL mode, cache limité à 64MB
- **Tree shaking** activé
- **Standalone output** pour déploiement minimal
- **Nettoyage automatique** des tokens expirés

### Build
- **SWC minification** (plus rapide que Terser)
- **Compression** activée
- **Package imports** optimisés (lucide-react, recharts)
- **Standalone mode** pour Docker

## 📝 Variables d'environnement

```env
DATABASE_URL="file:./data/merino.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
APP_URL="http://localhost:3000"
```

## 🐳 Déploiement Docker

```bash
# Build
docker build -t merino-simulateur .

# Run
docker run -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -e NEXTAUTH_SECRET="your-secret" \
  -e NEXTAUTH_URL="https://your-domain.com" \
  merino-simulateur
```

## 📦 Build Production

```bash
# Build optimisé
npm run build

# Démarrer en production
npm start
```

Le build génère un dossier `.next/standalone` avec uniquement les fichiers nécessaires.

## 🎯 Utilisation

1. **Agent** : Se connecter et créer une simulation
2. **Générer un token** : Cliquer sur "Générer un accès client"
3. **Partager** : Envoyer le lien au client `/?t=tk_xxx`
4. **Client** : Accéder directement à la vue simulation (24h)

## 📖 Documentation

Voir `SPECIFICATIONS.md` pour les détails complets des formules et indicateurs.

## 🔧 Maintenance

- Les tokens expirés sont nettoyés automatiquement toutes les heures
- La base de données SQLite utilise le mode WAL pour de meilleures performances
- Les requêtes fréquentes utilisent des prepared statements

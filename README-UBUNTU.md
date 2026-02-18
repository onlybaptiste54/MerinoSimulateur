# 🐧 Merino Simulateur - Démarrage sur Ubuntu

## Prérequis

```bash
# Node.js 20+ (si pas installé)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérifier
node -v   # v20.x.x
npm -v
```

## Installation et lancement

```bash
# 1. Dépendances
npm install

# 2. Fichier .env
cp .env.example .env
nano .env   # ou vim : remplir NEXTAUTH_SECRET

# Générer un secret
openssl rand -base64 32

# 3. Créer un utilisateur
npm run create-user-interactive

# 4. Lancer
npm run dev
```

## Ou tout en un (script)

```bash
chmod +x setup.sh
./setup.sh
```

Puis :

```bash
npm run dev
```

App : **http://localhost:3000** (ou http://IP_DE_TA_VM:3000 depuis l’extérieur).

## Commandes utiles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lancer en dev |
| `npm run build` | Build prod |
| `npm start` | Lancer en prod |
| `npm run create-user-interactive` | Créer un user |
| `npm run create-user email@domain.com "MotDePasse123!"` | Créer un user en CLI |

## Lancer en arrière-plan (prod)

```bash
npm run build
nohup npm start > app.log 2>&1 &
# ou avec PM2 : pm2 start npm --name merino -- start
```

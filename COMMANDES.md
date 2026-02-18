# 📋 Commandes pour Lancer l'Application

> **Ubuntu / Linux** : voir aussi [README-UBUNTU.md](./README-UBUNTU.md) pour un guide dédié.

## 🚀 Installation et Configuration

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer les variables d'environnement

**Ubuntu / Linux / Mac** :
```bash
cp .env.example .env
```

**Windows (PowerShell)** :
```powershell
Copy-Item .env.example .env
```

Puis éditer le fichier `.env` et remplacer les valeurs :

```env
DATABASE_URL="file:./data/merino.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-tres-securise-changez-moi"
APP_URL="http://localhost:3000"
```

**Générer un secret sécurisé pour NEXTAUTH_SECRET** :

**Windows (PowerShell)** :
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Linux/Mac** :
```bash
openssl rand -base64 32
```

### 3. Créer un utilisateur admin

**Mode interactif (recommandé)** :

```bash
npm run create-user-interactive
```

Vous serez invité à saisir :
- 📧 Email (ex: admin@restosim.com)
- 👤 Nom (optionnel)
- 🔑 Mot de passe (minimum 8 caractères)
- 🔑 Confirmation du mot de passe

**Mode ligne de commande** :

```bash
npm run create-user admin@example.com "MonMotDePasse123!"
```

**Exemple de mot de passe sécurisé** :
```
RestoSim2024!Secure
```

### 4. Lancer l'application

**Mode développement** :

```bash
npm run dev
```

L'application sera accessible sur : **http://localhost:3000**

**Mode production** :

```bash
# Build
npm run build

# Démarrer
npm start
```

## 📝 Commandes Disponibles

| Commande | Description |
|----------|-------------|
| `npm install` | Installer les dépendances |
| `npm run dev` | Lancer en mode développement |
| `npm run build` | Build pour la production |
| `npm start` | Lancer en mode production |
| `npm run create-user-interactive` | Créer un utilisateur (mode interactif) |
| `npm run create-user <email> <password>` | Créer un utilisateur (ligne de commande) |
| `npm run setup` | Installation complète + création utilisateur |

## 🌐 Accès à l'Application

Une fois l'application lancée :

1. **Page principale** : http://localhost:3000
   - Simulateur public
   - Ou simulation partagée si token présent (`/?t=tk_xxx`)

2. **Connexion agent** : http://localhost:3000/login
   - Utilisez l'email et mot de passe créés

3. **Dashboard agent** : http://localhost:3000/dashboard
   - Gestion des simulations
   - Génération de liens de partage

## 🔐 Sécurité du Mot de Passe

Le script utilise **bcrypt avec 12 rounds** pour hasher les mots de passe, ce qui est très sécurisé.

**Recommandations pour un mot de passe fort** :
- ✅ Minimum 8 caractères
- ✅ Mélange de majuscules et minuscules
- ✅ Au moins un chiffre
- ✅ Au moins un caractère spécial (!@#$%^&*)
- ✅ Éviter les mots du dictionnaire

## ⚠️ Dépannage

**Erreur "Database locked"** :
- Fermez toutes les connexions à la base de données
- Redémarrez l'application

**Erreur "User already exists"** :
- L'email est déjà utilisé
- Utilisez un autre email ou supprimez l'utilisateur existant dans la DB

**Port 3000 déjà utilisé** :
```bash
# Changer le port
PORT=3001 npm run dev
```

**Windows - Erreur avec tsx** :
```bash
# Installer tsx globalement si nécessaire
npm install -g tsx
```

## 🐳 Déploiement Docker (optionnel)

```bash
# Build
docker build -t merino-simulateur .

# Run
docker run -p 3000:3000 `
  -v ${PWD}/data:/app/data `
  -e NEXTAUTH_SECRET="votre-secret" `
  -e NEXTAUTH_URL="http://localhost:3000" `
  -e APP_URL="http://localhost:3000" `
  merino-simulateur
```

## 📖 Documentation Complète

Voir [QUICKSTART.md](./QUICKSTART.md) pour le guide détaillé.

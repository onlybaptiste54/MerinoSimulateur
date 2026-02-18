#!/bin/bash
# ─── Déploiement MerinoSimulateur sur la VM ───────────────────────────────────
# Usage : bash deploy.sh
set -e

echo "==> Création du dossier data (si absent)..."
mkdir -p ./data

echo "==> Vérification .env.prod..."
if [ ! -f .env.prod ]; then
  echo "ERREUR : .env.prod manquant. Copie .env.prod.example et remplis les valeurs."
  exit 1
fi

if grep -q "REMPLACE_MOI" .env.prod; then
  echo "ERREUR : NEXTAUTH_SECRET non renseigné dans .env.prod"
  echo "Lance : openssl rand -base64 32  puis colle le résultat dans .env.prod"
  exit 1
fi

echo "==> Build + lancement..."
docker compose -f docker-compose.prod.yml up -d --build

echo "==> Attente démarrage (20s)..."
sleep 20

echo "==> Status :"
docker compose -f docker-compose.prod.yml ps

echo "==> Logs récents :"
docker compose -f docker-compose.prod.yml logs --tail=20 merino

echo ""
echo "✓ Déployé sur https://merino.agenceaetheria.com"

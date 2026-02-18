#!/bin/bash

echo "========================================"
echo "  Merino Simulateur - Setup"
echo "========================================"
echo ""

echo "[1/4] Installation des dépendances..."
npm install
if [ $? -ne 0 ]; then
    echo "Erreur lors de l'installation des dépendances"
    exit 1
fi

echo ""
echo "[2/4] Configuration de l'environnement..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Fichier .env créé. Pensez à éditer NEXTAUTH_SECRET !"
else
    echo "Fichier .env existe déjà."
fi

echo ""
echo "[3/4] Génération d'un secret pour NEXTAUTH_SECRET..."
SECRET=$(openssl rand -base64 32)
echo "Secret généré: $SECRET"
echo "Pensez à mettre ce secret dans votre fichier .env !"

echo ""
echo "[4/4] Création d'un utilisateur admin..."
echo ""
npm run create-user-interactive

echo ""
echo "========================================"
echo "  Setup terminé !"
echo "========================================"
echo ""
echo "Pour lancer l'application :"
echo "  npm run dev"
echo ""

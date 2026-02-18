# 🎯 Simulateur de Rentabilité Restaurant

## Objectif
Simulateur de rentabilité restaurant permettant de calculer instantanément le seuil de rentabilité et le résultat net selon les paramètres opérationnels et financiers.

## ⚙️ Paramètres d'Entrée

| Catégorie | Paramètre | Plage | Description |
|-----------|-----------|-------|-------------|
| **Opérationnel** | Couverts/jour | 10 - 200 | Volume de clients journalier |
| | Ticket moyen | 15€ - 100€ | Panier moyen hors taxes |
| | Jours ouverts/an | 200 - 365 | Jours d'activité |
| **Coûts** | Food Cost | 20% - 45% | % du CA |
| | Masse salariale | 25% - 50% | % du CA (40% variable / 60% fixe) |
| | Frais généraux | 10% - 25% | % du CA |
| **Financement** | Capital emprunté | € libre | Montant du prêt |
| | Taux d'intérêt | % libre | Taux annuel |
| | Durée | 1 - 15 ans | Amortissement |
| | Autres fixes | € libre | Loyer, assurances... |

## 📊 Indicateurs de Sortie

| Indicateur | Formule | Seuil Critique |
|------------|---------|----------------|
| CA Annuel | Couverts × Ticket × Jours | - |
| MCV Unitaire | Ticket × (1 - Food%) - (Ticket × Labor% × 40%) | > 0€ |
| Seuil Rentabilité | Charges Fixes / MCV Unitaire | ≤ Couverts réels |
| Résultat Net | CA - Charges Totales | > 0€ |
| Marge Nette | (Résultat Net / CA) × 100 | > 5-10% |
| Prime Cost | Food% + Labor% | < 60% |
| Marge Sécurité | ((Couverts - SR) / SR) × 100 | > 10% |

## 🔢 Formules Mathématiques

### 1. Mensualité Emprunt (PMT)

```
M = C × (t/12) / (1 - (1 + t/12)^(-n))
```

| Variable | Description |
|----------|-------------|
| M | Mensualité (€) |
| C | Capital emprunté |
| t | Taux annuel (décimal) |
| n | Nombre de mensualités |

### 2. Marge sur Coûts Variables (MCV)

| Niveau | Formule |
|--------|---------|
| Unitaire | MCV = Ticket × (1 - Food%) - (Ticket × Labor% × 40%) |
| Totale | MCV Total = CA - (Coût Matière + Labor Variable) |
| Taux | Taux MCV = (MCV Total / CA) × 100 |

**Hypothèse :** 40% du personnel est variable (extras), 60% est fixe.

### 3. Seuil de Rentabilité

```
SR (couverts/jour) = Charges Fixes / (MCV Unitaire × Jours Ouverts)
```

Où Charges Fixes =

```
Labor Fixe + Frais Généraux + Annuité Emprunt + Autres Fixes
```

### 4. Résultat Net

```
Résultat Net = CA - (Coûts Variables + Charges Fixes)
             = CA - (Food + Labor Var + Labor Fixe + Overhead + Emprunt + Autres)
```

## 📈 Visualisations

| Graphique | Type | Utilité |
|-----------|------|---------|
| Structure des coûts | Donut | Répartition du CA |
| Impact taux d'emprunt | Barres | SR selon taux (2.5% → 7.5%) |
| Impact ticket moyen | Courbes | SR et MCV selon ticket (20€ → 35€) |
| Amortissement | Aire | Capital restant dû année par année |

## 🚨 Alertes Métier

| Situation | Condition | Action |
|-----------|-----------|--------|
| Rentable | Résultat Net > 0 | Vert - Maintenir |
| Déficitaire | Résultat Net < 0 | Rouge - Augmenter volume ou prix |
| Seuil critique | Marge Sécurité < 10% | Orange - Surveiller la trésorerie |
| Prime Cost élevé | Food% + Labor% > 65% | Rouge - Optimiser coûts |

## 💡 Cas d'Usage Typique

**Problème :** Mon banquier me propose un prêt à 5.5% au lieu de 3.5%. Combien de couverts supplémentaires dois-je faire pour garder la même rentabilité ?

**Solution :**
1. Saisir les paramètres actuels
2. Modifier le taux de 3.5% → 5.5%
3. Lire le nouveau seuil de rentabilité dans le graphique "Impact du Taux"
4. **Résultat :** Passage de 48 à 52 couverts/jour nécessaires (+8.3%).

## 🔐 Système d'Authentification

### 1. Pour l'Agent (Le Dashboard Pro)
- L'agent est le seul à posséder un compte classique.
- **Identification :** Login standard (Email/Password ou Google Auth).
- **Fonctionnalité :** Un bouton "Générer un accès client" sur chaque simulation.
- **Action :** Le système crée un Token unique en base de données, lié à cette simulation spécifique.
- **Sortie :** L'agent obtient un lien court à copier/coller (ex: aetheria.app/s/tk_84j29...).

### 2. Pour le Client (L'Accès "Magic Link")
- Aucune création de compte, aucun mot de passe à retenir.
- **Entrée :** Le client clique sur le lien reçu par SMS ou Email.
- **Validation :** L'app vérifie deux conditions :
  - Le token existe-t-il en base ?
  - La date actuelle est-elle inférieure à created_at + 24h ?
- **Expérience :** Si OK, le client accède directement à la vue "Lecteur" de sa simulation.

### 3. Comparatif des flux d'accès

| Utilisateur | Type d'accès | Durée | Droits |
|-------------|--------------|-------|--------|
| Agent | Login / Password | Persistant | Création, Édition, Suppression, Partage |
| Client | Token (URL unique) | 24 heures | Lecture seule (ou édition limitée) |

### 4. Logique de sécurité "Aetheria"

Pour garantir la robustesse sans alourdir le code, voici la structure de données minimale :

**Table access_tokens :**
- `token_id` (UUID / Hash)
- `simulation_id` (FK vers la table simulation)
- `expires_at` (Timestamp : Now + 24h)
- `is_active` (Boolean pour permettre à l'agent de couper l'accès manuellement)

**Note technique :** Pour éviter que le client perde son accès s'il rafraîchit la page, stocke le token dans le sessionStorage du navigateur lors de la première visite.

### Points à vérifier / Limites possibles

- **Le "Délai de réflexion" :** 24h est court pour un projet immo. Si le client veut revoir les chiffres 3 jours plus tard, l'agent devra générer un nouveau lien. Est-ce un comportement souhaité pour garder le contact ou une friction inutile ?
- **Sécurité par l'obscurité :** Le lien est la seule clé. Si l'agent se trompe de destinataire dans son mail, le mauvais client verra les chiffres.
- **Multi-terminaux :** Si le client ouvre le lien sur son PC puis veut le montrer sur son mobile 2h après, le lien fonctionnera toujours (tant que les 24h ne sont pas passées).

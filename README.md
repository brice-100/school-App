# 🏫 ÉcoleManager

> Plateforme complète de gestion d'une école primaire — React · Node.js · MySQL

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://mysql.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

---

## 📋 Table des matières

- [Aperçu](#-aperçu)
- [Fonctionnalités](#-fonctionnalités)
- [Stack technique](#-stack-technique)
- [Architecture du projet](#-architecture-du-projet)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Base de données](#-base-de-données)
- [Lancer l'application](#-lancer-lapplication)
- [Rôles et permissions](#-rôles-et-permissions)
- [Structure des dossiers](#-structure-des-dossiers)
- [Routes API](#-routes-api)
- [Déploiement](#-déploiement)
- [Sécurité](#-sécurité)

---

## 🌟 Aperçu

ÉcoleManager est une application web full-stack permettant de gérer efficacement une école primaire. Elle propose un tableau de bord centralisé pour l'administrateur (directeur), les enseignants et les parents, avec des modules complets pour la gestion des élèves, des notes, des paiements, du planning et bien plus.

**Captures d'écran :**

| Dashboard Admin | Notes | Planning |
|---|---|---|
| Graphiques Recharts | Saisie par enseignant | Calendrier hebdomadaire |

---

## ✨ Fonctionnalités

### 👨‍💼 Administrateur
- Dashboard avec statistiques, graphiques et récapitulatif
- Gestion des comptes (validation, suspension, suppression)
- Gestion des élèves, enseignants, parents
- Emploi du temps (planning hebdomadaire par classe)
- Suivi des paiements de scolarité avec tranches
- Gestion des salaires des enseignants
- Envoi de notifications aux parents
- Génération de bulletins PDF

### 👩‍🏫 Enseignant
- Inscription autonome (validée par l'admin)
- Saisie des notes de ses élèves
- Consultation de son planning
- Visualisation des bulletins

### 👨‍👩‍👧 Parent
- Inscription autonome (validée par l'admin)
- Suivi des notes et bulletins de son enfant
- Suivi de ses paiements de scolarité
- Réception de notifications en temps réel (son + badge)

---

## 🛠 Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS 3 |
| Backend | Node.js, Express.js |
| Base de données | MySQL 8 |
| Authentification | JWT (jsonwebtoken) |
| Upload fichiers | Multer |
| Graphiques | Recharts |
| Formulaires | React Hook Form + Zod |
| PDF | PDFKit |
| Sécurité | Helmet, express-rate-limit, express-validator |
| HTTP client | Axios |

---

## 🏗 Architecture du projet

```
school-management/
├── client/                  # Frontend React
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── layout/      # Sidebar, MainLayout
│       │   └── common/      # NotifBell, composants partagés
│       ├── context/         # AuthContext (gestion session)
│       ├── hooks/           # useNotifications (polling + son)
│       ├── pages/
│       │   ├── auth/        # Login, Register
│       │   ├── dashboard/   # Dashboard avec graphiques
│       │   ├── students/    # Liste + formulaire élèves
│       │   ├── teachers/    # Liste + formulaire enseignants
│       │   ├── parents/     # Liste + formulaire parents
│       │   ├── grades/      # Saisie et validation des notes
│       │   ├── planning/    # Calendrier hebdomadaire
│       │   ├── bulletins/   # Aperçu + téléchargement PDF
│       │   ├── payments/    # Suivi paiements + tranches
│       │   ├── salaries/    # Fiches de salaire
│       │   ├── notifications/ # Envoi (admin) / réception (parent)
│       │   ├── references/  # Classes & Matières
│       │   └── admin/       # Gestion des comptes
│       ├── routes/          # PrivateRoute, RoleRoute, RolesRoute
│       └── services/        # Appels API (Axios)
│
└── server/                  # Backend Express
    ├── docs/
    │   └── swagger.yaml     # Documentation API OpenAPI 3.0
    ├── uploads/             # Fichiers uploadés (photos, reçus)
    └── src/
        ├── config/
        │   ├── db.js        # Pool de connexions MySQL
        │   └── admin.js     # Credentials admin (en dur)
        ├── controllers/     # Logique métier
        ├── middleware/
        │   ├── authMiddleware.js    # Vérification JWT
        │   ├── roleMiddleware.js    # Contrôle des rôles
        │   ├── uploadMiddleware.js  # Multer (photos, reçus)
        │   └── validateMiddleware.js # express-validator
        ├── models/          # Requêtes SQL
        ├── routes/          # Définition des endpoints
        └── utils/
            ├── asyncHandler.js  # Wrapper try/catch
            ├── jwtHelper.js     # Génération/vérification JWT
            └── swagger.js       # Montage Swagger UI
```

---

## 🚀 Installation

### Prérequis

- **Node.js** 18+ — [télécharger](https://nodejs.org)
- **MySQL** 8.0+ — [télécharger](https://dev.mysql.com/downloads/)
- **Git** — [télécharger](https://git-scm.com)

### Cloner le projet

```bash
git clone https://github.com/ton-user/school-management.git
cd school-management
```

### Installer les dépendances

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

---

## ⚙️ Configuration

### Backend — `server/.env`

Crée le fichier `server/.env` à partir du modèle :

```bash
cp server/.env.example server/.env
```

Remplis les valeurs :

```env
# Serveur
PORT=5000
NODE_ENV=development

# Base de données MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=ton_mot_de_passe_mysql
DB_NAME=school_db
DB_PORT=3306

# JWT
JWT_SECRET=une_cle_secrete_tres_longue_et_complexe_2024!
JWT_EXPIRES_IN=7d

# Administrateur (directeur) — défini en dur
ADMIN_EMAIL=admin@ecole.com
ADMIN_PASSWORD=Admin@1234

# Frontend (pour CORS)
FRONTEND_URL=http://localhost:5173
```

> ⚠️ **Important** : Ne jamais committer le fichier `.env` sur Git. Il est déjà dans `.gitignore`.

### Frontend — `client/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🗄 Base de données

### Créer la base

Dans MySQL (VS Code extension ou terminal) :

```sql
CREATE DATABASE IF NOT EXISTS school_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### Importer le schéma

Exécute les scripts SQL dans l'ordre suivant :

```bash
# Via MySQL CLI
mysql -u root -p school_db < server/database/schema.sql
```

Ou copie-colle le contenu dans l'extension MySQL de VS Code.

**Tables créées :**

| Table | Description |
|---|---|
| `users` | Enseignants et parents (rôle + statut) |
| `students` | Élèves inscrits |
| `classes` | Classes de l'école |
| `salles` | Salles de classe |
| `matieres` | Matières enseignées |
| `teacher_matieres` | Affectation enseignant ↔ matière |
| `notes` | Notes des élèves |
| `planning` | Emploi du temps |
| `paiements` | Paiements de scolarité |
| `salaires` | Fiches de salaire des enseignants |
| `notifications` | Messages admin → parents |

### Relation entre les tables

```
users (teacher/parent)
  ├──< classes (via teacher_id)
  ├──< teacher_matieres
  ├──< notes (via teacher_id)
  ├──< salaires
  └──< notifications (via destinataire_id)

students
  ├── classes
  ├── users (parent_id)
  ├──< notes
  └──< paiements

classes ──< planning ──< matieres
                    └──< users (teacher)
```

---

## ▶️ Lancer l'application

### Développement (deux terminaux)

**Terminal 1 — Backend :**
```bash
cd server
npm run dev
# → ✅ MySQL connecté
# → ✅ Serveur → http://localhost:5000
```

**Terminal 2 — Frontend :**
```bash
cd client
npm run dev
# → http://localhost:5173
```

### Tester que tout fonctionne

```bash
curl http://localhost:5000/api/health
# → {"success":true,"message":"Serveur OK ✅"}
```

Ouvrir le navigateur sur **http://localhost:5173** et se connecter avec :

| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur | admin@ecole.com | Admin@1234 |
| Enseignant | (créer via /register) | — |
| Parent | (créer via /register) | — |

---

## 👥 Rôles et permissions

L'application gère **3 rôles** avec des droits distincts :

### 🔴 Administrateur (Directeur)
- Défini directement dans le code via les variables d'environnement
- Accès complet à toutes les fonctionnalités
- Valide / suspend les comptes enseignants et parents
- Configure les classes, matières, planning
- Génère les fiches de salaire
- Envoie des notifications aux parents

### 🟢 Enseignant
- S'inscrit lui-même sur `/register` (validation admin requise)
- Saisit les notes de ses élèves
- Consulte son planning hebdomadaire
- Accède aux bulletins

### 🔵 Parent
- S'inscrit lui-même sur `/register` (validation admin requise)
- Consulte les notes et bulletins de son enfant
- Suit ses paiements de scolarité
- Reçoit les notifications de l'école (son + badge en temps réel)

### Flux d'inscription

```
/register → Choix rôle (Enseignant / Parent)
         → Formulaire d'inscription
         → Compte créé avec statut "en_attente"
         → Admin valide dans /users
         → Connexion possible
```

---

## 📡 Routes API

La documentation complète est disponible via Swagger UI :

```
http://localhost:5000/api-docs
```

### Récapitulatif des endpoints

| Groupe | Endpoints principaux |
|---|---|
| **Auth** | `POST /auth/login` · `POST /auth/register/teacher` · `POST /auth/register/parent` · `GET /auth/me` |
| **Élèves** | `GET/POST /students` · `GET/PUT/DELETE /students/:id` |
| **Enseignants** | `GET/POST /teachers` · `GET/PUT/DELETE /teachers/:id` |
| **Parents** | `GET/POST /parents` · `GET/PUT/DELETE /parents/:id` |
| **Notes** | `GET/POST /grades` · `PATCH /grades/valider` · `GET /grades/student/:id` |
| **Planning** | `GET /planning/classe/:id` · `GET /planning/mine` · `POST /planning` |
| **Bulletins** | `GET /bulletins/:id` · `GET /bulletins/:id/pdf` |
| **Paiements** | `GET/POST /payments` · `PUT /payments/:id/tranche` |
| **Salaires** | `GET/POST /salaries` · `POST /salaries/generer-mois` · `PATCH /salaries/:id/payer` |
| **Stats** | `GET /stats/overview` · `GET /stats/notes-by-classe` · `GET /stats/payments-by-month` |
| **Notifications** | `POST /notifications/send` · `GET /notifications/mine` · `PATCH /notifications/:id/read` |
| **Référentiels** | `GET/POST /classes` · `GET/POST /matieres` · `GET/POST /salles` |

### Authentification

Toutes les routes protégées nécessitent le header :

```
Authorization: Bearer <token_jwt>
```

Le token est obtenu via `POST /api/auth/login` et stocké dans `localStorage`.

---

## 🌐 Déploiement

### Option recommandée — Railway (tout-en-un)

1. Pousser le code sur GitHub
2. Créer un compte sur [railway.app](https://railway.app)
3. Créer un nouveau projet avec 3 services : **MySQL**, **Backend**, **Frontend**
4. Configurer les variables d'environnement sur chaque service
5. Importer le schéma SQL dans le service MySQL

```bash
# Variables à configurer sur Railway (Backend)
DB_HOST        = (fourni automatiquement par Railway)
DB_USER        = (fourni automatiquement)
DB_PASSWORD    = (fourni automatiquement)
DB_NAME        = school_db
JWT_SECRET     = ta_cle_secrete_production
ADMIN_EMAIL    = admin@tonecole.com
ADMIN_PASSWORD = MotDePasseSolide123!
NODE_ENV       = production
FRONTEND_URL   = https://ton-frontend.railway.app
```

```bash
# Variables à configurer (Frontend)
VITE_API_URL = https://ton-backend.railway.app/api
```

### Option alternative — Services séparés

| Service | Héberge | Lien |
|---|---|---|
| **Vercel** | Frontend React | [vercel.com](https://vercel.com) |
| **Render** | Backend Node.js | [render.com](https://render.com) |
| **PlanetScale** | MySQL Cloud | [planetscale.com](https://planetscale.com) |

---

## 🔒 Sécurité

L'application intègre plusieurs couches de sécurité :

| Mesure | Description |
|---|---|
| **Helmet.js** | Sécurise les headers HTTP |
| **JWT** | Tokens signés avec expiration 7 jours |
| **Bcrypt** | Hash des mots de passe (sel 10 rounds) |
| **Rate limiting** | 200 req/15min globalement, 10 tentatives de login |
| **express-validator** | Validation et sanitisation de tous les inputs |
| **CORS** | Restreint aux origines autorisées |
| **Rôles** | Vérification du rôle sur chaque endpoint sensible |
| **Statut compte** | Connexion bloquée si `en_attente` ou `suspendu` |

---

## 🧩 Variables d'environnement — récapitulatif

| Variable | Où | Description |
|---|---|---|
| `PORT` | server | Port du serveur (défaut: 5000) |
| `NODE_ENV` | server | `development` ou `production` |
| `DB_HOST` | server | Hôte MySQL |
| `DB_USER` | server | Utilisateur MySQL |
| `DB_PASSWORD` | server | Mot de passe MySQL |
| `DB_NAME` | server | Nom de la base (`school_db`) |
| `JWT_SECRET` | server | Clé secrète JWT (min 32 chars) |
| `JWT_EXPIRES_IN` | server | Durée du token (ex: `7d`) |
| `ADMIN_EMAIL` | server | Email du directeur |
| `ADMIN_PASSWORD` | server | Mot de passe du directeur |
| `FRONTEND_URL` | server | URL du frontend (pour CORS) |
| `VITE_API_URL` | client | URL complète de l'API backend |

---

## 📦 Scripts disponibles

### Backend

```bash
npm run dev    # Démarrage avec nodemon (rechargement automatique)
npm start      # Démarrage en production
```

### Frontend

```bash
npm run dev    # Serveur de développement Vite
npm run build  # Build de production (génère dist/)
npm run preview # Prévisualiser le build de production
```

---

## 🤝 Contribuer

1. Fork le projet
2. Crée une branche : `git checkout -b feature/ma-fonctionnalite`
3. Commit tes changements : `git commit -m 'feat: ajoute ma fonctionnalité'`
4. Push : `git push origin feature/ma-fonctionnalite`
5. Ouvre une Pull Request

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 👨‍💻 Auteur

Développé avec ❤️ pour la gestion scolaire en Afrique francophone.

---

*Documentation générée pour ÉcoleManager v1.0.0*

# Clinique - Plateforme de gestion médicale

Application complète de gestion de clinique médicale : administrateurs, médecins
(internes / externes), patients, rendez-vous, consultations, ordonnances, cabinets
médicaux et pharmacies (centrale + partenaires).

- **Frontend** : Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend** : NestJS + Mongoose
- **Base de données** : MongoDB

## Structure du projet

```
clinic-app/
├── backend/          # API NestJS
│   └── src/
│       ├── auth/            # Authentification JWT (login, register)
│       ├── users/           # Comptes utilisateurs (tous rôles)
│       ├── doctors/         # Médecins internes / externes
│       ├── cabinets/        # Cabinets médicaux (médecins internes)
│       ├── patients/        # Patients et dossiers médicaux
│       ├── appointments/    # Rendez-vous
│       ├── consultations/   # Consultations médicales
│       ├── prescriptions/   # Ordonnances
│       ├── medications/     # Médicaments (référentiel par pharmacie)
│       └── pharmacies/      # Pharmacie centrale + pharmacies partenaires
├── frontend/         # Application Next.js
│   └── src/
│       ├── app/
│       │   ├── login/, register/          # Authentification
│       │   └── dashboard/
│       │       ├── admin/                 # Espace administrateur
│       │       ├── doctor/                # Espace médecin (interne/externe)
│       │       ├── patient/               # Espace patient
│       │       └── pharmacy/              # Espace pharmacie
│       ├── components/ProtectedLayout.tsx # Layout protégé par rôle
│       └── lib/                           # Client API + contexte d'authentification
└── docker-compose.yml  # MongoDB en local
```

## Rôles gérés

| Rôle | Description |
|---|---|
| `admin` | Gestion complète de la plateforme |
| `doctor_internal` | Médecin interne, rattaché à un cabinet de la clinique |
| `doctor_external` | Médecin indépendant, gère ses propres patients |
| `patient` | Prend rendez-vous, consulte son dossier et ses ordonnances |
| `pharmacy_central` | Pharmacie centrale de la clinique |
| `pharmacy_partner` | Pharmacie partenaire externe |

## Installation

### 1. Base de données (MongoDB)

Avec Docker :
```bash
docker compose up -d
```
Ou utilisez une instance MongoDB locale / Atlas et mettez à jour `MONGODB_URI`.

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed        # crée un compte admin : admin@clinic.com / Admin123!
npm run start:dev   # démarre l'API sur http://localhost:3001/api
```

### 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev          # démarre le site sur http://localhost:3000
```

## Compte administrateur par défaut

Après `npm run seed` dans `backend/` :

- Email : `admin@clinic.com`
- Mot de passe : `Admin123!`

Connectez-vous avec ce compte pour créer les médecins, patients, cabinets et
pharmacies depuis l'API (des formulaires de création avancés peuvent être
ajoutés dans le dashboard admin selon vos besoins).

## Flux principaux déjà implémentés

- **Auth** : inscription patient, connexion (JWT), routes protégées par rôle
  (`RolesGuard` côté backend, `ProtectedLayout` côté frontend).
- **Admin** : vue d'ensemble médecins / patients / rendez-vous / ordonnances /
  pharmacies (lecture). Les endpoints CRUD complets existent déjà côté API pour
  brancher des formulaires de création/édition.
- **Médecin** (interne ou externe) : liste de ses patients, prise de notes
  médicales, gestion de ses rendez-vous (accepter / refuser).
- **Patient** : ses rendez-vous, ses ordonnances, recherche de médicaments et
  des pharmacies où ils sont disponibles.
- **Pharmacie** (centrale ou partenaire) : gestion de son propre stock de
  médicaments (ajout, mise à jour de quantité, suppression).

## Points d'extension suggérés

- Formulaires admin pour créer médecins / patients / cabinets / pharmacies
  directement depuis l'UI (les endpoints backend existent déjà : `POST /doctors`,
  `POST /patients`, `POST /cabinets`, `POST /pharmacies`).
- Prise de rendez-vous côté patient (recherche de médecin + créneau).
- Création de consultation + ordonnance depuis l'espace médecin.
- Statistiques (nombre de consultations, médicaments en rupture, etc.).
- Téléchargement PDF des ordonnances.

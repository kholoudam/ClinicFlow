# ClinicFlow

ClinicFlow est une application PERN de gestion des patients et rendez-vous pour une petite clinique. Le projet est organisé en monorepo avec PostgreSQL, Express/Node.js et React/Vite.

## Prérequis

- Node.js 22+
- npm 10+
- PostgreSQL 16+
- Ports libres `5432`, `4000`, `5173`

## Installation locale

### PostgreSQL

Créer une base `clinicflow`, puis configurer `backend/.env` à partir de `.env.example`.

```bash
cd backend
cp .env.example .env
npm install
npm run migrate
npm run seed
npm run dev
```

Dans un second terminal :

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Variables d'environnement

Backend : `NODE_ENV`, `PORT`, `DATABASE_URL`, `JWT_SECRET` (au moins 32 caractères), `JWT_EXPIRES_IN`, `CORS_ORIGIN`, `DB_POOL_MAX`.
Frontend : `VITE_API_URL`.

## Comptes de test

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | `admin@clinicflow.local` | `Admin123!` |
| Staff | `staff1@clinicflow.local` | `Staff123!` |
| Staff | `staff2@clinicflow.local` | `Staff456!` |

Le seed est idempotent : il utilise des `UPSERT` pour les utilisateurs/patients et évite de recréer les mêmes rendez-vous.

## Commandes

Backend :

```bash
npm run migrate
npm run seed
npm run dev
npm test
npm run lint
npm run format:check
```

Frontend :

```bash
npm run dev
npm run build
npm run lint
npm run format:check
```

## API

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/patients`
- `GET /api/patients?search=&page=&limit=`
- `GET /api/patients/:id`
- `PUT /api/patients/:id`
- `DELETE /api/patients/:id` — admin uniquement
- `GET /api/patients/:id/appointments`
- `POST /api/appointments`
- `GET /api/appointments?date=&status=`
- `PATCH /api/appointments/:id/status`
- `GET /api/dashboard/stats`
- `GET /api/docs`

## Format des erreurs

Toutes les erreurs applicatives suivent :

```json
{"error":{"code":"CONFLICT","message":"...","details":{}}}
```

Codes utilisés : `400`, `401`, `403`, `404`, `409`, `500`.

## Choix de conception

- UUID PostgreSQL avec `gen_random_uuid()` pour toutes les clés métier.
- `patients.cin` et `users.email` sont uniques.
- Les rôles et statuts sont des ENUM PostgreSQL.
- Les patients sont supprimés logiquement avec `deleted_at`; cela préserve l'historique des rendez-vous. La FK `appointments.patient_id` utilise donc `ON DELETE RESTRICT` comme garde-fou supplémentaire.
- `appointments.created_by` utilise `ON DELETE RESTRICT` afin de conserver l'identité historique du créateur.
- `audit_logs.user_id` utilise `SET NULL` afin de conserver les événements même si un compte utilisateur est retiré dans une évolution future.
- Les recherches patients utilisent `ILIKE`; `pg_trgm` ajoute un index GIN adapté aux recherches textuelles partielles sur `full_name`.
- Les rendez-vous utilisent des index sur patient/date/statut et `(patient_id, appointment_date)` pour la vérification de proximité.
- La règle des 30 minutes est appliquée à la création confirmée et lors du passage vers `confirmed`. Un advisory transaction lock par patient sérialise les confirmations concurrentes.
- L'architecture backend suit `routes -> controllers -> services -> repositories`; les contrôleurs ne contiennent aucune requête SQL.
- JWT contient uniquement `id` et `role`, expire par défaut après 30 minutes et n'est jamais renvoyé avec le mot de passe.

## Règle des 30 minutes

La fenêtre est inclusive : un rendez-vous confirmé exactement 30 minutes avant ou après un autre rendez-vous confirmé est un conflit (`409 Conflict`). Lors d'un PATCH, le rendez-vous courant est exclu de la recherche.

## Tests

`backend/tests/api.test.js` utilise Jest + Supertest et couvre login, `/me`, contrôle admin/staff, pagination et les cas de la règle des 30 minutes : conflit, borne exacte de 30 minutes et confirmation d'un rendez-vous en mise à jour. Les tests d'intégration sont automatiquement ignorés si PostgreSQL n'est pas disponible, afin que la suite de vérifications statiques puisse être exécutée sans base locale.

## Limites connues

- Pas de gestion des disponibilités d'un médecin : le modèle métier ne contient volontairement pas de table `doctors`.
- Pas de refresh token : l'objectif du test est un JWT court et simple.
- Le soft-delete concerne les patients uniquement.
- Les tests d'intégration nécessitent une base PostgreSQL initialisée avec migration + seed.
- L'application n'embarque pas de dépendance UI lourde : CSS natif + React.

## Checklist d'évaluation

- [x] Tables `users`, `patients`, `appointments` + `audit_logs`.
- [x] PK UUID avec `gen_random_uuid()`.
- [x] Unicité `users.email` et `patients.cin`.
- [x] ENUM `user_role` et `appointment_status`.
- [x] `ON DELETE RESTRICT` documenté sur patient/creator ; `SET NULL` sur audit actor.
- [x] Index recherche patients, filtres rendez-vous et composite patient/date.
- [x] `deleted_at`, `audit_logs`, `created_at`/`updated_at`.
- [x] ERD Mermaid et justifications dans `docs/DESIGN.md`.
- [x] Règle des 30 minutes sur création confirmée et PATCH vers confirmed.
- [x] Transaction + advisory lock PostgreSQL contre les race conditions.
- [x] Exclusion de l'appointment courant en mise à jour.
- [x] `409 Conflict` avec message explicite.
- [x] Suppression patient réservée à admin.
- [x] Dashboard par agrégations COUNT.
- [x] Architecture routes/controllers/services/repositories.
- [x] Zod pour body/params/query.
- [x] Requêtes SQL paramétrées.
- [x] AppError + async wrapper + error handler global.
- [x] Pagination SQL avec `page`, `limit`, `total`, `totalPages`, limite 100.
- [x] JOIN patient pour les rendez-vous, pas de N+1.
- [x] React Router, contexte auth, Axios et interception 401.
- [x] Pages Login, Dashboard, Patients, détails patient, Appointments.
- [x] Validation client, loading/empty, erreurs API et affichage du 409.
- [x] Suppression visible uniquement pour admin.
- [x] bcrypt cost 11, JWT court, helmet, CORS et rate limit login.
- [x] Login générique en cas d'identifiants invalides.
- [x] Seed idempotent : 1 admin, 2 staff, 5 patients, 10 rendez-vous.
- [x] Swagger/OpenAPI sur `/api/docs`.
- [x] Jest + Supertest.
- [x] ESLint + Prettier.

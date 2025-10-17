# Tontine Management API

API REST pour la gestion de tontines avec authentification JWT, vérification KYC et distribution automatique des fonds.

## Fonctionnalités

- Inscription et authentification avec JWT
- Vérification KYC avec upload d'images
- Création et gestion de groupes de tontine
- Système de contributions avec distribution automatique
- Score de fiabilité des membres
- Messagerie de groupe
- Système de tickets support
- Dashboard administrateur

## Technologies

- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Multer (Upload fichiers)
- Bcrypt (Hashing)
- Docker + Docker Compose

## Prérequis

### Sans Docker
- Node.js v16+
- MongoDB v5+
- npm

### Avec Docker
- Docker Desktop
- Docker Compose

## Installation

### Cloner le projet
```bash
git clone <repository-url>
cd tontine-api
```

### Installer les dépendances
```bash
npm install
```

### Créer le dossier uploads
```bash
mkdir -p public/uploads/kyc
```

## Configuration

Créer un fichier `.env` à la racine:
```env
MONGO_URI=mongodb://localhost:27017/tontine_db
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=604800
PORT=3001
```

## Utilisation avec Docker

### Démarrer
```bash
docker-compose up
```

### Démarrer en arrière-plan
```bash
docker-compose up -d
```

### Arrêter
```bash
docker-compose down
```

### Rebuild
```bash
docker-compose up --build
```

### Voir les logs
```bash
docker-compose logs -f
```

## Utilisation sans Docker

### Démarrer MongoDB
```bash
mongod
```

### Lancer le serveur
```bash
npm start
```

### Mode développement
```bash
npm run dev
```

## API Documentation

### Base URL
```
http://localhost:3001
```

### Authentication

La plupart des endpoints nécessitent un token JWT dans le header:
```
token: YOUR_JWT_TOKEN
```

### Endpoints

#### Authentication
```
POST   /register              - Inscription
POST   /login                 - Connexion
GET    /profile               - Profil (auth required)
```

Exemple Register:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456",
  "confirmPassword": "123456",
  "role": "user"
}
```

Exemple Login:
```json
{
  "email": "john@example.com",
  "password": "123456"
}
```

#### KYC Verification
```
POST   /kyc/submit            - Soumettre KYC (auth required)
GET    /kyc/status            - Statut KYC (auth required)
GET    /kyc/all               - Liste KYC (admin only)
PUT    /kyc/:kycId/status     - Valider KYC (admin only)
```

Submit KYC (multipart/form-data):
```
cinNumber: AB123456
cinImage: [file]
selfieImage: [file]
```

Update Status:
```json
{
  "status": "approved"
}
```

#### Groups
```
POST   /groups                - Créer groupe (auth required)
GET    /groups                - Liste groupes (auth required)
GET    /groups/my             - Mes groupes (auth required)
GET    /groups/:groupId       - Détails groupe (auth required)
POST   /groups/:groupId/join  - Rejoindre (auth required)
POST   /groups/:groupId/start-round  - Démarrer tour (auth required)
```

Create Group:
```json
{
  "name": "Groupe Amis",
  "description": "Tontine entre amis",
  "contributionAmount": 1000,
  "paymentDeadline": 5,
  "maxMembers": 5
}
```

#### Contributions
```
POST   /contributions/pay                      - Payer (auth required)
GET    /contributions/my                       - Mes contributions (auth required)
GET    /contributions/group/:groupId           - Contributions groupe (auth required)
GET    /contributions/round-status/:groupId    - Statut du tour (auth required)
GET    /distributions/group/:groupId           - Distributions groupe (auth required)
GET    /distributions/my                       - Mes distributions (auth required)
```

Pay Contribution:
```json
{
  "groupId": "GROUP_ID"
}
```

#### Messages
```
POST   /messages/send              - Envoyer message (auth required)
GET    /messages/group/:groupId    - Messages groupe (auth required)
```

Send Message:
```json
{
  "groupId": "GROUP_ID",
  "content": "Hello everyone!"
}
```

#### Tickets
```
POST   /tickets                       - Créer ticket (auth required)
GET    /tickets/my                    - Mes tickets (auth required)
GET    /tickets/all                   - Tous tickets (admin only)
PUT    /tickets/:ticketId/status      - Changer statut (admin only)
POST   /tickets/:ticketId/respond     - Répondre (auth required)
```

Create Ticket:
```json
{
  "groupId": "GROUP_ID",
  "subject": "Payment issue",
  "description": "Cannot make payment"
}
```

#### Admin
```
GET    /admin/dashboard           - Dashboard (admin only)
GET    /admin/users               - Liste utilisateurs (admin only)
DELETE /admin/users/:userId       - Supprimer user (admin only)
GET    /admin/groups              - Liste groupes (admin only)
```

## Structure du projet
```
tontine-api/
├── app/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── AdminController.js
│   │   ├── AuthController.js
│   │   ├── ContributionController.js
│   │   ├── GroupController.js
│   │   ├── KycController.js
│   │   ├── MessageController.js
│   │   └── TicketController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── multer.js
│   └── models/
│       ├── Contribution.js
│       ├── Distribution.js
│       ├── Group.js
│       ├── GroupMember.js
│       ├── Kyc.js
│       ├── Message.js
│       ├── Ticket.js
│       └── User.js
├── routes/
│   └── web.js
├── utils/
│   └── jwt.js
├── public/
│   └── uploads/
├── .env
├── .dockerignore
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── index.js
├── package.json
└── README.md
```

## Flux de fonctionnement

### Inscription et vérification
```
Utilisateur s'inscrit → Soumet KYC → Admin valide → Compte vérifié
```

### Création d'un groupe
```
User créé groupe → Définit montant/délai → Autres rejoignent → Groupe complet
```

### Tours de contribution
```
Créateur démarre → Round 1 → Membres paient → Distribution automatique → Round 2
```

### Distribution automatique
```
Tous payent → Système calcule → Envoie au bénéficiaire → Round suivant
```

## Fonctionnalités clés

### Distribution automatique
Dès que tous les membres ont payé, le système distribue automatiquement les fonds au bénéficiaire selon l'ordre d'adhésion.

### Score de fiabilité
- Score initial: 100
- +5 points par paiement
- Influence l'ordre de passage

### Traçabilité
Toutes les opérations sont enregistrées avec timestamp.

## Sécurité

- Mots de passe hashés avec bcrypt
- Authentication JWT
- Validation KYC obligatoire
- Upload sécurisé des fichiers
- Middleware de vérification des rôles

## Variables d'environnement
```
MONGO_URI      - URI MongoDB
JWT_SECRET     - Clé secrète JWT
JWT_EXPIRE     - Durée token (secondes)
PORT           - Port serveur
```

## Scripts
```bash
npm start       # Démarrer le serveur
npm run dev     # Mode développement
```

## Commandes Docker utiles
```bash
docker ps                      # Voir containers
docker-compose logs -f         # Voir logs
docker-compose restart api     # Redémarrer API
docker exec -it tontine_api sh # Entrer dans container
```

## Licence

Projet scolaire

## Auteur

Votre Nom - Tontine API
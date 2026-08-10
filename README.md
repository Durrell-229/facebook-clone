# SyntaxHub

SyntaxHub — le réseau social des développeurs 🔥

Une plateforme **temps réel** axée sur la **programmation**, la **cybersécurité** et le **développement web**. Données réelles : utilisateurs connectés (email, GitHub, Google), fil alimenté par les vraies API GitHub / Dev.to / Reddit / Hacker News / Stack Overflow / Hashnode / Lobste.rs, messagerie et notifications en direct, **Syntax AI** (assistant développeur intégré).

## Fonctionnalités

- **Authentification réelle** : email + mot de passe, ou connexion via **GitHub OAuth** et **Google OAuth** (Supabase Auth)
- **Landing page** : accueil public avec image de fond et icône du projet
- **Fil d'actualité temps réel** : posts, likes, commentaires, bookmarks synchronisés en direct (websockets Supabase Realtime)
- **Flux dev en direct** : GitHub Trending, Dev.to, Reddit (r/programming, r/webdev, r/devops, r/cybersecurity), Hacker News, Stack Overflow, Hashnode et Lobste.rs
- **Tendances** : hashtags populaires extraits des posts
- **Enregistrements** : sauvegardez des posts pour les retrouver sur votre profil
- **Syntax AI** : assistant IA intégré (clé API côté serveur, jamais exposée)
- **Messagerie temps réel** : conversations et messages en direct
- **Notifications temps réel** : compteur non lus en direct
- **Emplois & Projets** : offres de recrutement, missions freelance et projets open-source
- **Communautés** : espaces dédiés aux langages, frameworks et sujets cyber
- **Défis & Compétitions** : challenges de code, CTF et tournois
- **Shorts** : tutoriels et astuces en vidéo courte
- **Actus** : dernières nouvelles tech, versions et événements
- **Sécurité** : en-têtes CSP/X-Frame sur le déploiement, assainissement XSS du contenu, RLS partout, clés IA et service role exclusivement côté serveur

## Architecture

- **Frontend** : React 18, TypeScript, Vite, Tailwind CSS
- **Backend / BDD** : [Supabase](https://supabase.com) (PostgreSQL + Auth + Realtime)
- **Sources de données externes** : GitHub API, Dev.to API, Reddit (JSON), Hacker News (Algolia), Stack Overflow (StackExchange), Hashnode (GraphQL), Lobste.rs

## Installation

### 1. Créer le projet Supabase

Créez un projet [Supabase](https://supabase.com/dashboard).

Dans le **SQL Editor**, exécutez successivement le contenu de :
- [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) — tables, RLS, triggers, compteurs
- [`supabase/migrations/0002_bookmarks_hashtags.sql`](supabase/migrations/0002_bookmarks_hashtags.sql) — posts enregistrés + hashtags tendance

### 2. Variables d'environnement

Copiez `.env.example` vers `.env` et renseignez vos clés :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon
```

Les clés se trouvent dans **Settings → API** de votre projet Supabase.

### 3. Activer la connexion GitHub et Google

- Dashboard Supabase → **Authentication → Providers** → activez `GitHub` et `Google`
- Créez une OAuth App GitHub ([ici](https://github.com/settings/developers)) et un OAuth Client Google ([ici](https://console.cloud.google.com/apis/credentials)) avec comme URL de callback :
  `https://votre-projet.supabase.co/auth/v1/callback`
- Renseignez le Client ID / Secret correspondants dans Supabase.

### 4. Activer le temps réel

Dashboard Supabase → **Database → Replication** → activez les tables `posts`, `likes`, `comments`, `messages`, `conversations`, `notifications`, `profiles`, `news`, `jobs`, `communities`, `community_posts`, `challenges`, `shorts`, `saved_posts`, `trending_hashtags`.

### 5. Fournir les images (landing + icône)

Déposez vos fichiers dans `public/assets/` :
- `public/assets/landing-bg.jpg` — image de fond de la landing page
- `public/assets/icon.png` — icône du projet (favicon + logo)

Vous pouvez aussi pointer vers des URLs distantes via `VITE_LANDING_BG_URL` / `VITE_APP_ICON_URL` (voir `.env.example`).

### 6. Déployer la synchronisation des sources externes

Alimente le fil avec les vraies données (GitHub, Dev.to, Reddit, Hacker News, Stack Overflow, Hashnode, Lobste.rs) :

```bash
npm install -g supabase
supabase login
supabase link --project-ref VOTRE_PROJET_REF
supabase functions deploy sync-feeds --no-verify-jwt
```

Puis déclenchez la synchro (une fois de suite) :

```bash
curl -X POST https://votre-projet.supabase.co/functions/v1/sync-feeds \
  -H "Authorization: Bearer VOTRE_SERVICE_ROLE_KEY"
```

### 7. Déployer Syntax AI (assistant IA)

Ajoutez les secrets dans Supabase → **Edge Functions → syntax-ai → Secrets** :

```bash
AI_API_KEY=sk-votre-cle            # OpenAI, Mistral, Groq, OpenRouter…
AI_BASE_URL=https://api.openai.com/v1   # compatible OpenAI
AI_MODEL=gpt-4o-mini
```

Puis :

```bash
supabase functions deploy syntax-ai
```

La clé IA reste côté serveur ; le frontend n'envoie que des messages via le JWT de session.

### 8. Lancer l'application

```bash
npm install
npm run dev
```

## Scripts

```bash
npm run dev        # démarre le serveur de dev
npm run typecheck  # vérifie les types TypeScript
npm run lint       # ESLint
npm run build      # build de production
```

## Déploiement

- **Vercel** : `vercel.json` inclut les en-têtes de sécurité (CSP, X-Frame-Options: DENY, nosniff, Referrer-Policy, Permissions-Policy).
- **Supabase** : les migrations et edge functions se trouvent dans `supabase/`.

## Contribution

Votre contribution sera la bienvenue ! <3

Envoyez simplement une PR avec vos changements.

Montrez un peu de ❤️ en ⭐ le projet.

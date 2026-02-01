# 🚀 Déploiement sur Railway

## 📁 Structure des fichiers

```
votre-projet/
├── server.js          # Backend Node.js
├── package.json       # Dépendances
├── .env              # Configuration (mot de passe)
├── railway.json      # Config Railway
├── .gitignore
└── public/           # Frontend (créer ce dossier)
    ├── index.html
    ├── style.css
    └── app.js
```

## 🔧 Installation

### 1. Créer la structure

1. Créez un dossier `pronostics-telegram`
2. Créez un sous-dossier `public` dedans
3. Placez les fichiers:
   - À la racine: `server.js`, `package.json`, `.env`, `railway.json`, `.gitignore`
   - Dans `public/`: `index.html`, `style.css`, `app.js`

### 2. Modifier le mot de passe

Dans le fichier `.env`, changez:
```
ADMIN_PASSWORD=VotreMotDePasseSecret123
```

### 3. Déployer sur Railway

1. Allez sur https://railway.app
2. Connectez-vous avec GitHub
3. Cliquez sur "New Project" → "Deploy from GitHub repo"
4. Sélectionnez votre repository (uploadez d'abord sur GitHub)
5. Railway détecte automatiquement Node.js
6. Ajoutez la variable d'environnement:
   - Cliquez sur votre projet → Variables
   - Ajoutez `ADMIN_PASSWORD` avec votre mot de passe

### 4. Obtenir l'URL

1. Railway génère une URL automatiquement (ex: `votre-app.up.railway.app`)
2. Copiez cette URL

### 5. Connecter à Telegram

1. Ouvrez @BotFather dans Telegram
2. `/mybots` → Choisir votre bot
3. "Web App" ou "/newapp"
4. Entrez l'URL Railway
5. Terminé ! 🎉

## 🔒 Sécurité

- Le mot de passe admin est dans les variables d'environnement Railway
- Seul vous avez accès à l'admin via le mot de passe
- Les utilisateurs voient uniquement les matchs publiés
- Les matchs ne sont PAS cliquables (juste informatif)

## 📝 Utilisation

### Pour vous (Admin):
1. Ouvrez votre mini app
2. Cliquez sur l'onglet Admin
3. Entrez votre mot de passe
4. Ajoutez vos matchs

### Pour les utilisateurs:
1. Ils voient les matchs dans l'onglet Matchs
2. Aucun bouton cliquable
3. Juste les infos: équipes, ligue, heure, pronostic, cote

## 🆙 Mise à jour

Pour mettre à jour l'app:
1. Modifiez vos fichiers
2. Poussez sur GitHub
3. Railway redéploie automatiquement

## 💡 Astuce

Pour tester localement avant Railway:
```bash
npm install
npm start
```
Ouvrez http://localhost:3000

## ⚠️ Important

- Changez TOUJOURS le mot de passe par défaut
- Ne partagez JAMAIS votre mot de passe admin
- Les matchs sont stockés en mémoire (redémarrage = perte)
- Pour stockage permanent, ajoutez MongoDB/PostgreSQL

## 📞 Contact

Modifiez vos infos dans `public/index.html` section Contact.

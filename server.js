const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Mot de passe admin (à changer dans .env)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Base de données simple en mémoire (pour production, utilisez MongoDB/PostgreSQL)
let matches = [];

// Route principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API: Récupérer tous les matchs (PUBLIC)
app.get('/api/matches', (req, res) => {
    res.json({ success: true, matches: matches });
});

// API: Vérifier le mot de passe admin
app.post('/api/admin/verify', (req, res) => {
    const { password } = req.body;

    if (password === ADMIN_PASSWORD) {
        res.json({ success: true, message: 'Accès autorisé' });
    } else {
        res.json({ success: false, message: 'Mot de passe incorrect' });
    }
});

// API: Ajouter un match (ADMIN uniquement)
app.post('/api/admin/matches', (req, res) => {
    const { password, match } = req.body;

    if (password !== ADMIN_PASSWORD) {
        return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const newMatch = {
        id: Date.now(),
        ...match,
        createdAt: new Date().toISOString()
    };

    matches.unshift(newMatch);
    res.json({ success: true, match: newMatch });
});

// API: Supprimer un match (ADMIN uniquement)
app.delete('/api/admin/matches/:id', (req, res) => {
    const { password } = req.body;
    const matchId = parseInt(req.params.id);

    if (password !== ADMIN_PASSWORD) {
        return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    matches = matches.filter(m => m.id !== matchId);
    res.json({ success: true, message: 'Match supprimé' });
});

app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur le port ${PORT}`);
});
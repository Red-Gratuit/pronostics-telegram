// Initialisation Telegram
let tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Variables globales
let adminPassword = '';
let isAdminLoggedIn = false;

// Rendre les fonctions globales pour onclick
window.showPage = showPage;
window.showAdminPage = showAdminPage;
window.closeAdminModal = closeAdminModal;
window.verifyAdminPassword = verifyAdminPassword;
window.logoutAdmin = logoutAdmin;
window.addMatch = addMatch;
window.deleteMatch = deleteMatch;

// Navigation entre pages
function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    document.getElementById('page-' + pageName).classList.add('active');

    // Activer le bon onglet
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        if (tab.textContent.includes('Matchs') && pageName === 'matches') tab.classList.add('active');
        if (tab.textContent.includes('Info') && pageName === 'info') tab.classList.add('active');
        if (tab.textContent.includes('Contact') && pageName === 'contact') tab.classList.add('active');
        if (tab.textContent.includes('Admin') && pageName === 'admin') tab.classList.add('active');
    });

    if (typeof tg.HapticFeedback !== 'undefined') {
        tg.HapticFeedback.impactOccurred('light');
    }
}

// Afficher la modal admin
function showAdminPage() {
    if (isAdminLoggedIn) {
        showPage('admin');
        loadAdminMatches();
    } else {
        document.getElementById('admin-modal').classList.add('active');
        document.getElementById('admin-password-input').value = '';
        document.getElementById('admin-error').style.display = 'none';
    }
}

// Fermer la modal admin
function closeAdminModal() {
    document.getElementById('admin-modal').classList.remove('active');
}

// Vérifier le mot de passe admin
async function verifyAdminPassword() {
    const password = document.getElementById('admin-password-input').value;
    const errorDiv = document.getElementById('admin-error');

    if (!password) {
        errorDiv.textContent = 'Veuillez entrer un mot de passe';
        errorDiv.style.display = 'block';
        return;
    }

    try {
        const response = await fetch('/api/admin/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });

        const data = await response.json();

        if (data.success) {
            adminPassword = password;
            isAdminLoggedIn = true;
            closeAdminModal();
            showPage('admin');
            loadAdminMatches();
            if (typeof tg.HapticFeedback !== 'undefined') {
                tg.HapticFeedback.notificationOccurred('success');
            }
        } else {
            errorDiv.textContent = '❌ Mot de passe incorrect';
            errorDiv.style.display = 'block';
            if (typeof tg.HapticFeedback !== 'undefined') {
                tg.HapticFeedback.notificationOccurred('error');
            }
        }
    } catch (error) {
        errorDiv.textContent = 'Erreur de connexion au serveur';
        errorDiv.style.display = 'block';
    }
}

// Déconnexion admin
function logoutAdmin() {
    isAdminLoggedIn = false;
    adminPassword = '';
    showPage('matches');
    alert('Déconnecté avec succès');
}

// Charger les matchs (PUBLIC)
async function loadMatches() {
    const loading = document.getElementById('loading');
    const matchesList = document.getElementById('matches-list');
    const emptyState = document.getElementById('empty-matches');

    loading.classList.add('active');
    matchesList.innerHTML = '';
    emptyState.style.display = 'none';

    try {
        const response = await fetch('/api/matches');
        const data = await response.json();

        loading.classList.remove('active');

        if (data.success && data.matches.length > 0) {
            data.matches.forEach(match => {
                const card = document.createElement('div');
                card.className = 'match-card';

                card.innerHTML = `
                    <div class="match-header">
                        <span class="league-badge">${match.league}</span>
                        <span class="match-time">🕐 ${match.time}</span>
                    </div>
                    <div class="match-teams">
                        <span class="team">${match.homeTeam}</span>
                        <span class="vs">VS</span>
                        <span class="team">${match.awayTeam}</span>
                    </div>
                    <div class="match-prediction">
                        <div class="prediction-label">Notre pronostic</div>
                        <div class="prediction-value">⭐ ${match.prediction}</div>
                        ${match.odds ? `<span class="match-odds">💰 Cote: ${match.odds}</span>` : ''}
                    </div>
                `;

                matchesList.appendChild(card);
            });
        } else {
            emptyState.style.display = 'block';
        }
    } catch (error) {
        loading.classList.remove('active');
        emptyState.style.display = 'block';
        console.error('Erreur:', error);
    }
}

// Ajouter un match (ADMIN)
async function addMatch() {
    const league = document.getElementById('admin-league').value.trim();
    const homeTeam = document.getElementById('admin-home').value.trim();
    const awayTeam = document.getElementById('admin-away').value.trim();
    const time = document.getElementById('admin-time').value;
    const prediction = document.getElementById('admin-prediction').value.trim();
    const odds = document.getElementById('admin-odds').value.trim();

    if (!league || !homeTeam || !awayTeam || !time || !prediction) {
        alert('⚠️ Veuillez remplir tous les champs obligatoires');
        return;
    }

    const match = {
        league, homeTeam, awayTeam, time, prediction, odds
    };

    try {
        const response = await fetch('/api/admin/matches', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: adminPassword, match })
        });

        const data = await response.json();

        if (data.success) {
            // Réinitialiser le formulaire
            document.getElementById('admin-league').value = '';
            document.getElementById('admin-home').value = '';
            document.getElementById('admin-away').value = '';
            document.getElementById('admin-time').value = '';
            document.getElementById('admin-prediction').value = '';
            document.getElementById('admin-odds').value = '';

            await loadMatches();
            await loadAdminMatches();

            if (typeof tg.HapticFeedback !== 'undefined') {
                tg.HapticFeedback.notificationOccurred('success');
            }
            alert('✅ Match publié avec succès !');
        } else {
            alert('❌ Erreur lors de l\'ajout du match');
        }
    } catch (error) {
        alert('❌ Erreur de connexion au serveur');
    }
}

// Charger les matchs dans l'admin
async function loadAdminMatches() {
    const adminList = document.getElementById('admin-matches-list');

    try {
        const response = await fetch('/api/matches');
        const data = await response.json();

        if (data.success && data.matches.length > 0) {
            adminList.innerHTML = '';

            data.matches.forEach(match => {
                const item = document.createElement('div');
                item.className = 'admin-match-item';

                // Créer le bouton supprimer avec addEventListener
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.textContent = '🗑️ Supprimer';
                deleteBtn.addEventListener('click', function() {
                    deleteMatch(match.id);
                });

                const content = document.createElement('div');
                content.innerHTML = `
                    <h4>${match.league}</h4>
                    <p><strong>${match.homeTeam} vs ${match.awayTeam}</strong></p>
                    <p>🕐 ${match.time}</p>
                    <p>⭐ ${match.prediction}</p>
                    ${match.odds ? `<p>💰 Cote: ${match.odds}</p>` : ''}
                `;

                item.appendChild(deleteBtn);
                item.appendChild(content);
                adminList.appendChild(item);
            });
        } else {
            adminList.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center; padding: 32px;">Aucun match publié</p>';
        }
    } catch (error) {
        adminList.innerHTML = '<p style="color: #ff6b6b; text-align: center; padding: 32px;">Erreur de chargement</p>';
    }
}

// Supprimer un match (ADMIN) - VERSION ULTRA SIMPLIFIÉE
async function deleteMatch(matchId) {
    console.log('Suppression du match ID:', matchId);

    const confirmed = confirm('Êtes-vous sûr de vouloir supprimer ce match ?');

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/matches/${matchId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: adminPassword })
        });

        const data = await response.json();

        console.log('Réponse suppression:', data);

        if (data.success) {
            alert('✅ Match supprimé avec succès !');
            await loadMatches();
            await loadAdminMatches();

            if (typeof tg.HapticFeedback !== 'undefined') {
                tg.HapticFeedback.notificationOccurred('success');
            }
        } else {
            alert('❌ Erreur: ' + (data.message || 'Suppression impossible'));
        }
    } catch (error) {
        console.error('Erreur suppression:', error);
        alert('❌ Erreur de connexion au serveur');
    }
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
    loadMatches();

    // Support touche Entrée pour le mot de passe
    const passwordInput = document.getElementById('admin-password-input');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                verifyAdminPassword();
            }
        });
    }
});

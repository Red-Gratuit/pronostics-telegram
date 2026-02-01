// Initialisation Telegram
let tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Variables globales
let adminPassword = '';
let isAdminLoggedIn = false;

// Navigation entre pages
function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    document.getElementById('page-' + pageName).classList.add('active');

    // Trouver et activer le bon onglet
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        if (tab.textContent.includes('Matchs') && pageName === 'matches') tab.classList.add('active');
        if (tab.textContent.includes('Info') && pageName === 'info') tab.classList.add('active');
        if (tab.textContent.includes('Contact') && pageName === 'contact') tab.classList.add('active');
        if (tab.textContent.includes('Admin') && pageName === 'admin') tab.classList.add('active');
    });

    tg.HapticFeedback.impactOccurred('light');
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
            tg.HapticFeedback.notificationOccurred('success');
        } else {
            errorDiv.textContent = '❌ Mot de passe incorrect';
            errorDiv.style.display = 'block';
            tg.HapticFeedback.notificationOccurred('error');
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
    tg.showAlert('Déconnecté avec succès');
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
        tg.showAlert('⚠️ Veuillez remplir tous les champs obligatoires');
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

            loadMatches();
            loadAdminMatches();

            tg.HapticFeedback.notificationOccurred('success');
            tg.showPopup({
                message: '✅ Match publié avec succès !',
                buttons: [{type: 'ok'}]
            });
        } else {
            tg.showAlert('❌ Erreur lors de l\'ajout du match');
        }
    } catch (error) {
        tg.showAlert('❌ Erreur de connexion au serveur');
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

                item.innerHTML = `
                    <button class="delete-btn" onclick="deleteMatch(${match.id})">🗑️ Supprimer</button>
                    <h4>${match.league}</h4>
                    <p><strong>${match.homeTeam} vs ${match.awayTeam}</strong></p>
                    <p>🕐 ${match.time}</p>
                    <p>⭐ ${match.prediction}</p>
                    ${match.odds ? `<p>💰 Cote: ${match.odds}</p>` : ''}
                `;

                adminList.appendChild(item);
            });
        } else {
            adminList.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center; padding: 32px;">Aucun match publié</p>';
        }
    } catch (error) {
        adminList.innerHTML = '<p style="color: #ff6b6b; text-align: center; padding: 32px;">Erreur de chargement</p>';
    }
}

// Supprimer un match (ADMIN) - VERSION CORRIGÉE
async function deleteMatch(matchId) {
    // Vérifier si on est dans Telegram
    if (typeof tg.showConfirm === 'function') {
        tg.showConfirm('Êtes-vous sûr de vouloir supprimer ce match ?', async (confirmed) => {
            if (confirmed) {
                await performDelete(matchId);
            }
        });
    } else {
        // Fallback pour navigateur normal
        if (confirm('Êtes-vous sûr de vouloir supprimer ce match ?')) {
            await performDelete(matchId);
        }
    }
}

// Fonction pour effectuer la suppression
async function performDelete(matchId) {
    try {
        const response = await fetch(`/api/admin/matches/${matchId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: adminPassword })
        });

        const data = await response.json();

        if (data.success) {
            await loadMatches();
            await loadAdminMatches();

            if (typeof tg.HapticFeedback !== 'undefined') {
                tg.HapticFeedback.notificationOccurred('success');
            }

            if (typeof tg.showPopup === 'function') {
                tg.showPopup({
                    message: '✅ Match supprimé !',
                    buttons: [{type: 'ok'}]
                });
            } else {
                alert('✅ Match supprimé !');
            }
        } else {
            if (typeof tg.showAlert === 'function') {
                tg.showAlert('❌ Erreur lors de la suppression');
            } else {
                alert('❌ Erreur lors de la suppression');
            }
        }
    } catch (error) {
        console.error('Erreur:', error);
        if (typeof tg.showAlert === 'function') {
            tg.showAlert('❌ Erreur de connexion');
        } else {
            alert('❌ Erreur de connexion');
        }
    }
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
    loadMatches();

    // Gérer la touche Entrée dans le champ mot de passe
    const passwordInput = document.getElementById('admin-password-input');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                verifyAdminPassword();
            }
        });
    }
});

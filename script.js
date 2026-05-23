// ===================================================
// DÜSTERWALD 2.0 ENGINE (Universelle Spiellogik)
// ===================================================
const ROLES_DATABASE = [];

// Globale Registrierungsfunktion für Rollen-Dateien
function registerRole(roleObject) {
    ROLES_DATABASE.push(roleObject);
}

let playersList = [];      
let activeGameRoles = [];  
let roleCountsLimit = {};  
let activePlayersState = []; 

// 1. Initialisierung: Zeige Rollen auf der Startseite mit Mengen-Eingebefeld an
function renderRolesSelection() {
    const container = document.getElementById('roles-container');
    container.innerHTML = '';

    ROLES_DATABASE.forEach(role => {
        // Standardmäßig Dorfbewohner und Werwolf aktiviert
        const isChecked = (role.id === "dorfbewohner" || role.id === "werwolf") ? "checked" : "";
        const defaultQty = role.defaultCount || "1";
        
        container.innerHTML += `
            <div class="role-option team-${role.team}">
                <div class="role-option-left">
                    <input type="checkbox" id="role-${role.id}" ${isChecked} data-role-id="${role.id}">
                    <div>
                        <strong style="display:block;">${role.name}</strong>
                        <div class="role-info">${role.description}</div>
                    </div>
                </div>
                <div>
                    <input type="text" id="role-qty-${role.id}" value="${defaultQty}" class="role-qty-input" title="Anzahl (z.B. 1, 25% oder Rest)">
                </div>
            </div>
        `;
    });
}

// 2. Wechsel zum Zuweisungs-Bildschirm mit Prozent- & Mengenkalkulation
function goToAssignScreen() {
    const playerInput = document.getElementById('player-input').value;
    playersList = playerInput.split(',')
                             .map(name => name.trim())
                             .filter(name => name !== "");

    const totalPlayers = playersList.length;
    if (totalPlayers === 0) {
        alert("Bitte trage mindestens einen Spielernamen ein!");
        return;
    }

    const selectedRoleIds = Array.from(document.querySelectorAll('#roles-container input[type="checkbox"]:checked'))
                                 .map(input => input.dataset.roleId);

    if (selectedRoleIds.length === 0) {
        alert("Bitte wähle mindestens eine Rolle aus!");
        return;
    }

    const selectedRoles = ROLES_DATABASE.filter(r => selectedRoleIds.includes(r.id));
    activeGameRoles = [];

    // Finde die Rolle, die als "Rest"-Auffüller dient
    const fallbackRole = selectedRoles.find(r => r.defaultCount === "Rest") || ROLES_DATABASE.find(r => r.id === "dorfbewohner");

    let allocatedCount = 0;
    const tempAllocations = [];

    // 2a. Berechne die genauen Kartenmengen für alle ausgewählten Rollen (außer dem Rest-Auffüller)
    selectedRoles.forEach(role => {
        if (role.id === fallbackRole.id) return; // Überspringe den Auffüller für diesen Schritt

        const inputVal = document.getElementById(`role-qty-${role.id}`).value.trim();
        let targetCount = 0;

        if (inputVal.endsWith('%')) {
            // Prozentuale Berechnung (z.B. "25%")
            const percent = parseFloat(inputVal) || 0;
            targetCount = Math.round((totalPlayers * percent) / 100);
        } else {
            // Absolute Zahl (z.B. "1" oder "2")
            targetCount = parseInt(inputVal) || 0;
        }

        // Stelle sicher, dass das definierte Limit der Rolle nicht überschritten wird
        const roleLimit = role.limit || 1;
        if (targetCount > roleLimit) {
            targetCount = roleLimit;
        }

        if (targetCount > 0) {
            tempAllocations.push({ role, count: targetCount });
            allocatedCount += targetCount;
        }
    });

    // Validierung: Wenn mehr Karten verlangt werden als Spieler vorhanden sind
    if (allocatedCount > totalPlayers) {
        alert(`Fehler: Es wurden insgesamt ${allocatedCount} Rollen angefordert, aber es spielen nur ${totalPlayers} Spieler mit! Bitte passe die Anzahl- oder Prozentwerte an.`);
        return;
    }

    // Weise die berechneten Rollen zu
    tempAllocations.forEach(alloc => {
        for (let i = 0; i < alloc.count; i++) {
            activeGameRoles.push(alloc.role);
        }
    });

    // 2b. Fülle alle verbleibenden Plätze mit der Auffüller-Rolle auf
    const remainingSpots = totalPlayers - activeGameRoles.length;
    for (let i = 0; i < remainingSpots; i++) {
        activeGameRoles.push(fallbackRole);
    }

    // Limits für das Zuweisungs-Interface im zweiten Schritt festlegen
    roleCountsLimit = {};
    activeGameRoles.forEach(role => {
        roleCountsLimit[role.id] = (roleCountsLimit[role.id] || 0) + 1;
    });

    renderPlayerAssignmentRows();
    updateRoleLimitsAndPoolStatus(); // Initiale Errechnung des Status und Limits

    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('assign-screen').classList.remove('hidden');
}

// 2c. Generiert Dropdowns für jeden Spieler
function renderPlayerAssignmentRows() {
    const container = document.getElementById('player-role-assignment');
    container.innerHTML = '';

    playersList.forEach((playerName, index) => {
        let optionsHTML = "";
        const uniqueRolesInGame = [...new Set(activeGameRoles.map(r => r.id))];
        
        uniqueRolesInGame.forEach((roleId, optIndex) => {
            const roleObj = ROLES_DATABASE.find(r => r.id === roleId);
            const hasDorfbewohner = uniqueRolesInGame.includes("dorfbewohner");
            const isSelected = (hasDorfbewohner && roleId === "dorfbewohner") || (!hasDorfbewohner && optIndex === 0) ? "selected" : "";
            
            optionsHTML += `<option value="${roleId}" ${isSelected}>${roleObj.name}</option>`;
        });

        container.innerHTML += `
            <div class="assign-row">
                <span>${playerName}</span>
                <select id="assign-player-${index}" onchange="updateRoleLimitsAndPoolStatus()">
                    ${optionsHTML}
                </select>
            </div>
        `;
    });
}

// 2d. Dynamische Echtzeit-Berechnung des Zuweisungsstapels und Sperrung voller Rollen
function updateRoleLimitsAndPoolStatus() {
    // 1. Zählen, was aktuell in den Dropdowns vom Spielleiter ausgewählt ist
    const currentSelections = {};
    playersList.forEach((_, index) => {
        const selectEl = document.getElementById(`assign-player-${index}`);
        if (selectEl) {
            const val = selectEl.value;
            if (val) {
                currentSelections[val] = (currentSelections[val] || 0) + 1;
            }
        }
    });

    // 2. Karten-Statusboxen generieren und farblich markieren
    const poolContainer = document.getElementById('cards-pool-status');
    poolContainer.innerHTML = '';

    for (const [roleId, limit] of Object.entries(roleCountsLimit)) {
        const roleObj = ROLES_DATABASE.find(r => r.id === roleId);
        if (!roleObj) continue;

        const assigned = currentSelections[roleId] || 0;
        const remaining = limit - assigned;

        let statusClass = "incomplete";
        let statusText = `${remaining} übrig`;

        if (remaining === 0) {
            statusClass = "complete";
            statusText = "Zuweisung passt!";
        } else if (remaining < 0) {
            statusClass = "overallocated";
            statusText = `${Math.abs(remaining)} zu viel!`;
        }

        poolContainer.innerHTML += `
            <div class="pool-card ${statusClass}">
                <div>
                    <div class="pool-card-title">${roleObj.name}</div>
                    <div style="font-size: 11px; opacity: 0.8; margin-top: 2px;">${statusText}</div>
                </div>
                <div class="pool-card-count">${assigned} / ${limit}</div>
            </div>
        `;
    }

    // 3. Dropdowns sperren, wenn das Zuweisungslimit für eine bestimmte Rolle voll ist
    playersList.forEach((_, index) => {
        const select = document.getElementById(`assign-player-${index}`);
        if (!select) return;
        const currentValue = select.value;

        Array.from(select.options).forEach(option => {
            const roleId = option.value;
            if (!roleId) return;

            const limit = roleCountsLimit[roleId] || 0;
            const currentCount = currentSelections[roleId] || 0;
            const roleObj = ROLES_DATABASE.find(r => r.id === roleId);

            if (currentCount >= limit && roleId !== currentValue) {
                option.disabled = true;
                if (roleObj) {
                    option.text = `${roleObj.name} (Voll)`;
                }
            } else {
                option.disabled = false;
                if (roleObj) {
                    option.text = roleObj.name;
                }
            }
        });
    });
}

function backToSetup() {
    document.getElementById('assign-screen').classList.add('hidden');
    document.getElementById('setup-screen').classList.remove('hidden');
}

// 3. Spiel starten
function startGame() {
    activePlayersState = [];

    const currentSelections = {};
    for (let i = 0; i < playersList.length; i++) {
        const selectEl = document.getElementById(`assign-player-${i}`);
        if (selectEl) {
            const selectedRoleId = selectEl.value;
            currentSelections[selectedRoleId] = (currentSelections[selectedRoleId] || 0) + 1;
        }
    }

    for (const [roleId, limit] of Object.entries(roleCountsLimit)) {
        const allocated = currentSelections[roleId] || 0;
        if (allocated !== limit) {
            const roleName = ROLES_DATABASE.find(r => r.id === roleId).name;
            alert(`Fehler bei der Zuteilung: Es müssen genau ${limit}x "${roleName}" verteilt werden (aktuell: ${allocated}).`);
            return;
        }
    }

    for (let i = 0; i < playersList.length; i++) {
        const selectEl = document.getElementById(`assign-player-${i}`);
        if (!selectEl) continue;
        const selectedRoleId = selectEl.value;
        const roleObj = ROLES_DATABASE.find(r => r.id === selectedRoleId);

        const playerObj = {
            name: playersList[i],
            role: roleObj,
            status: "alive"
        };

        // Ruft die optionale Initialisierung der Rolle auf
        if (roleObj.initPlayer) {
            roleObj.initPlayer(playerObj);
        }

        activePlayersState.push(playerObj);
    }

    document.getElementById('assign-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    document.getElementById('win-banner').classList.add('hidden'); 

    renderGameTable();
}

// 3a. Generiert die Spielleiter-Oberfläche
function renderGameTable() {
    const tbody = document.getElementById('game-table-body');
    tbody.innerHTML = '';

    let aliveCount = 0;

    activePlayersState.forEach((player, index) => {
        const isAlive = player.status === "alive";
        if (isAlive) aliveCount++;

        let teamLabel = "Neutral";
        let badgeClass = "badge-neutral";
        if (player.role.team === "dorf") {
            teamLabel = "Dorf";
            badgeClass = "badge-dorf";
        } else if (player.role.team === "werwolf") {
            teamLabel = "Werwölfe";
            badgeClass = "badge-werwolf";
        }

        // Nutzt die Render-Funktion der Rolle, falls vorhanden
        const infoHTML = player.role.renderInfo 
            ? player.role.renderInfo(player, index) 
            : player.role.description;

        // Visuelles Design der Zeile für verstorbene Spieler anpassen
        const rowStyle = isAlive ? "" : "opacity: 0.45; background-color: rgba(9, 9, 11, 0.45);";
        const nameStyle = isAlive ? "" : "text-decoration: line-through; color: #71717a;";

        // Generiere Steuerungselemente je nach Lebensstatus
        let statusControlHTML = "";
        if (isAlive) {
            statusControlHTML = `
                <div style="display: flex; gap: 6px;">
                    <button class="status-btn" style="margin: 0; padding: 6px 10px; font-size: 11px; background: linear-gradient(135deg, #f43f5e, #be123c); color: white; width: auto;" onclick="killPlayer(${index}, 'werwolf')">
                        🐺 Gefressen
                    </button>
                    <button class="status-btn" style="margin: 0; padding: 6px 10px; font-size: 11px; background: linear-gradient(135deg, #eab308, #ca8a04); color: white; width: auto;" onclick="killPlayer(${index}, 'dorf')">
                        ⚖️ Gelyncht
                    </button>
                </div>
            `;
        } else {
            const isWerwolfKill = player.status === "dead_night";
            const badgeClassDead = isWerwolfKill ? "badge-werwolf" : "badge-neutral";
            const badgeTextDead = isWerwolfKill ? "☠️ Gefressen" : "🪦 Gelyncht";
            
            statusControlHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%;">
                    <span class="badge ${badgeClassDead}" style="font-size: 11px;">${badgeTextDead}</span>
                    <button class="status-btn btn-secondary" style="margin: 0; padding: 4px 10px; font-size: 11px; width: auto;" onclick="revivePlayer(${index})">
                        ↩️ Rückgängig
                    </button>
                </div>
            `;
        }

        tbody.innerHTML += `
            <tr style="${rowStyle}">
                <td style="${nameStyle}"><strong>${player.name}</strong></td>
                <td style="${!isAlive ? 'color: #71717a;' : ''}">${player.role.name}</td>
                <td><span class="badge ${badgeClass}">${teamLabel}</span></td>
                <td style="font-size: 13px; color: #a1a1aa; vertical-align: middle;">${infoHTML}</td>
                <td style="vertical-align: middle;">${statusControlHTML}</td>
            </tr>
        `;
    });

    document.getElementById('player-count').innerText = `Lebende Spieler: ${aliveCount} / ${activePlayersState.length}`;
}

// Globaler Empfänger für Interaktionen aus den Rollen-UIs
function executeRoleAction(roleId, playerIndex, action, value) {
    const role = ROLES_DATABASE.find(r => r.id === roleId);
    const player = activePlayersState[playerIndex];
    if (role && role.handleAction) {
        role.handleAction(player, playerIndex, action, value);
    }
}


// Funktion um einen Spieler gezielt zu töten (mit automatischer Rollen-Logik)
function killPlayer(index, method) {
    let player = activePlayersState[index];
    if (!player || player.status !== "alive") return; // Sicherheitsprüfung: Darf nur Lebende treffen

    // Spezial-Logik nur bei Werwolf-Angriffen ("Gefressen")
    if (method === "werwolf") {
        
        // 1. ROTKÄPPCHEN SCHUTZ-CHECK
        if (player.role && player.role.id === "rotkaeppchen") {
            // Prüfe, ob im aktuellen Spiel noch ein lebender Jäger existiert
            const isJaegerAlive = activePlayersState.some(p => p.role && p.role.id === "jaeger" && p.status === "alive");
            
            if (isJaegerAlive) {
                alert(`🐺 Rotkäppchen (${player.name}) kann nicht gefressen werden, solange der Jäger noch lebt!`);
                return; // Abbrechen: Rotkäppchen stirbt nicht
            }
        }

        // 2. BODYGUARD SCHUTZ-CHECK
        if (player.bodyguardProtectedBy !== undefined && player.bodyguardProtectedBy !== null) {
            const bodyguardIndex = player.bodyguardProtectedBy;
            const bodyguard = activePlayersState[bodyguardIndex];

            // Schutz greift nur, wenn der Bodyguard selbst noch am Leben ist
            if (bodyguard && bodyguard.status === "alive" && bodyguard.role && bodyguard.role.id === "bodyguard") {
                alert(`🛡️ Der Bodyguard (${bodyguard.name}) schützt ${player.name} vor den Werwölfen! Der Bodyguard stirbt stattdessen.`);
                
                // Wir lenken den Zeiger auf das Bodyguard-Objekt um
                player = bodyguard; 
            }
        }
    }

    // Führe den Tod für das (eventuell umgelenkte) Ziel aus
    if (method === "werwolf") {
        player.status = "dead_night";
    } else if (method === "dorf") {
        player.status = "lynched";
    }

    // --- NEU: AMOR LIEBESPAAR-TOD (PARTNER-KUMMER) ---
    // Wenn der gestorbene Spieler verkuppelt war, stirbt sein Partner vor Kummer mit
    if (player.loverName) {
        const lover = activePlayersState.find(p => p.name === player.loverName);
        
        // Der Partner stirbt nur, wenn er aktuell noch lebt
        if (lover && lover.status === "alive") {
            alert(`💔 Aus Kummer über den Tod von ${player.name} nimmt sich auch sein Partner ${lover.name} das Leben!`);
            
            const loverIndex = activePlayersState.indexOf(lover);
            // Wir rufen killPlayer rekursiv für den Partner auf
            killPlayer(loverIndex, method);
        }
    }

    // Aktualisiere die Ansicht und prüfe die Siegbedingungen
    renderGameTable();
    checkWinConditions();
}

// Funktion um eine Tötung rückgängig zu machen
function revivePlayer(index) {
    const player = activePlayersState[index];
    if (!player) return;

    player.status = "alive";

    renderGameTable();
    checkWinConditions();
}

// 4. Siegprüfung (Universell ausgelagert)
function checkWinConditions() {
    const winBanner = document.getElementById('win-banner');

    // 4a. Prüfe, ob eine Rolle ihre eigene Siegbedingung triggert
    for (const player of activePlayersState) {
        if (player.role.checkWin) {
            const result = player.role.checkWin(player, activePlayersState);
            if (result) {
                winBanner.innerHTML = result.message;
                winBanner.className = `win-banner ${result.bannerClass}`;
                winBanner.classList.remove('hidden');
                return;
            }
        }
    }

    // 4b. Standard-Team-Siegprüfung
    let aliveDorf = 0;
    let aliveWerwolf = 0;

    activePlayersState.forEach(player => {
        if (player.role.team === "dorf" && player.status === "alive") aliveDorf++;
        if (player.role.team === "werwolf" && player.status === "alive") aliveWerwolf++;
    });

    const wolvesWereInGame = activePlayersState.some(p => p.role.team === "werwolf");
    if (aliveWerwolf === 0 && wolvesWereInGame) {
        displayTeamWin("🎉 DAS DORF HAT GEWONNEN! Alle Werwölfe wurden erfolgreich eliminiert!", "banner-dorf");
        return;
    }

    const dorfWereInGame = activePlayersState.some(p => p.role.team === "dorf");
    if (aliveDorf === 0 && dorfWereInGame) {
        displayTeamWin("🎉 DIE WERWÖLFE HABEN GEWONNEN! Alle Dorfbewohner wurden gefressen!", "banner-werwolf");
        return;
    }

    winBanner.classList.add('hidden');
}

function displayTeamWin(message, bannerClass) {
    const winBanner = document.getElementById('win-banner');
    winBanner.innerHTML = message;
    winBanner.className = `win-banner ${bannerClass}`;
    winBanner.classList.remove('hidden');
}

function resetGame() {
    if (confirm("Möchtest du das aktuelle Spiel wirklich beenden? Alle Daten werden gelöscht.")) {
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('setup-screen').classList.remove('hidden');
    }
}

// Wählt zufällig eine Kombination aus Sonderrollen aus
function randomizeSetup() {
    ROLES_DATABASE.forEach(role => {
        const checkbox = document.getElementById(`role-${role.id}`);
        if (!checkbox) return;

        // Dorfbewohner und Werwolf bleiben immer aktiv
        if (role.id === "dorfbewohner" || role.id === "werwolf") {
            checkbox.checked = true;
        } else {
            // 50% Chance, dass eine Sonderrolle aktiviert wird
            checkbox.checked = Math.random() < 0.5;
        }
    });
}

// Verteilt den berechneten Kartenstapel zufällig auf alle Spieler
function randomizeAssignments() {
    if (activeGameRoles.length === 0) return;

    // Kopie des berechneten Kartenstapels erstellen
    const poolToShuffle = [...activeGameRoles];

    // Mischen des Stapels (Fisher-Yates Shuffle)
    for (let i = poolToShuffle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [poolToShuffle[i], poolToShuffle[j]] = [poolToShuffle[j], poolToShuffle[i]];
    }

    // Dropdowns der Spieler befüllen
    playersList.forEach((_, index) => {
        const select = document.getElementById(`assign-player-${index}`);
        
        // Optionen temporär entsperren, um Fehler beim Zuweisen zu vermeiden
        Array.from(select.options).forEach(opt => opt.disabled = false);
        
        // Zufällige Rolle aus dem Stapel zuweisen
        select.value = poolToShuffle[index].id;
    });

    // Benutzeroberfläche und Sperren aktualisieren
    updateRoleLimitsAndPoolStatus();
}

window.addEventListener('DOMContentLoaded', () => {
    renderRolesSelection();
});
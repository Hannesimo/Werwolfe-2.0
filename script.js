const ROLES_DATABASE = [];

// Globale Registrierungsfunktion für Rollen-Dateien
function registerRole(roleObject) {
    ROLES_DATABASE.push(roleObject);
}

let playersList = [];      
let activeGameRoles = [];  
let roleCountsLimit = {};  
let activePlayersState = []; 

// Dynamische CSS-Styles für die modernen Hover- und Glow-Effekte der Karten injizieren
const customStyles = document.createElement('style');
customStyles.innerHTML = `
    .role-option {
        cursor: pointer;
        transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
        user-select: none;
    }
    .role-option:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
    }
    .role-option.selected.team-dorf {
        border-color: var(--accent-dorf);
        box-shadow: 0 0 10px rgba(6, 182, 212, 0.25);
        background-color: rgba(6, 182, 212, 0.05);
    }
    .role-option.selected.team-werwolf {
        border-color: var(--accent-werwolf);
        box-shadow: 0 0 10px rgba(244, 63, 94, 0.25);
        background-color: rgba(244, 63, 94, 0.05);
    }
    .role-option.selected.team-neutral {
        border-color: var(--accent-neutral);
        box-shadow: 0 0 10px rgba(234, 179, 8, 0.25);
        background-color: rgba(234, 179, 8, 0.05);
    }
    .role-library-card:hover {
        transform: translateY(-3px);
        border-color: var(--input-focus) !important;
        box-shadow: 0 8px 16px rgba(0,0,0,0.4) !important;
    }
`;
document.head.appendChild(customStyles);

// 1. Initialisierung: Zeige Rollen auf der Startseite sortiert nach Fraktionen an
function renderRolesSelection() {
    const container = document.getElementById('roles-container');
    container.innerHTML = '';

    // Definition der Fraktions-Kategorien
    const categories = [
        { title: "🏘️ Dorfbewohner & Verbündete", team: "dorf" },
        { title: "🐺 Werwölfe & Fraktion", team: "werwolf" },
        { title: "✨ Neutrale Rollen", team: "neutral" }
    ];

    categories.forEach(cat => {
        const rolesInCat = ROLES_DATABASE.filter(r => r.team === cat.team);
        if (rolesInCat.length === 0) return;

        // Sortierung: Hauptkarten zuerst, danach alphabetisch
        rolesInCat.sort((a, b) => {
            if (a.isFiller) return -1;
            if (b.isFiller) return 1;
            return a.name.localeCompare(b.name);
        });

        // Kategorie-Überschrift
        container.innerHTML += `
            <div class="category-header" style="grid-column: 1 / -1; margin-top: 25px; margin-bottom: 5px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                <h3 style="margin: 0; color: #fff; display: flex; align-items: center; gap: 8px;">${cat.title}</h3>
            </div>
        `;

        rolesInCat.forEach(role => {
            const isChecked = (role.id === "dorfbewohner" || role.id === "werwolf") ? "checked" : "";
            const defaultQty = role.defaultCount || "1";
            const isSelectedClass = isChecked ? "selected" : "";
            
            container.innerHTML += `
                <div class="role-option team-${role.team} ${isSelectedClass}" onclick="toggleRoleOption(event, '${role.id}')" 
                     style="position: relative; overflow: hidden; display: flex; align-items: center; justify-content: space-between;">
                    
                    <!-- Transparentes, weich auslaufendes Hintergrundbild im Karten-Hintergrund -->
                    <div style="position: absolute; right: -15px; bottom: -15px; width: 130px; height: 130px; 
                                background-image: url('pics/${role.id}.png'), url('pics/default.png'); 
                                background-size: cover; background-position: center; 
                                opacity: 0.15; pointer-events: none; z-index: 0;
                                filter: grayscale(15%);
                                mask-image: linear-gradient(to left, rgba(0,0,0,1) 15%, rgba(0,0,0,0) 100%);
                                -webkit-mask-image: linear-gradient(to left, rgba(0,0,0,1) 15%, rgba(0,0,0,0) 100%);">
                    </div>

                    <!-- Vordergrund: Interaktive Elemente & Text -->
                    <div class="role-option-left" style="align-items: center; flex: 1; z-index: 1; position: relative; pointer-events: none;">
                        <!-- Checkbox klickbar halten -->
                        <input type="checkbox" id="role-${role.id}" ${isChecked} data-role-id="${role.id}" 
                               style="margin: 0; cursor: pointer; width: 18px; height: 18px; pointer-events: auto;">
                        
                        <div style="margin-left: 15px;">
                            <strong style="display:block; color: #fff; font-size: 14px;">${role.name}</strong>
                            <div class="role-info" style="font-size: 11px; margin-top: 3px; max-width: 85%;">${role.description}</div>
                        </div>
                    </div>
                    
                    <div style="z-index: 1; position: relative;">
                        <input type="text" id="role-qty-${role.id}" value="${defaultQty}" class="role-qty-input" title="Anzahl" 
                               style="width: 50px; padding: 6px; text-align: center; border-radius: 8px;">
                    </div>
                </div>
            `;
        });
    });
}

// Ermöglicht das Anklicken der gesamten Karte zum Auswählen
function toggleRoleOption(event, roleId) {
    // Klick auf das Mengen-Eingabefeld soll die Checkbox nicht umschalten
    if (event.target.classList.contains('role-qty-input') || event.target.closest('.role-qty-input')) {
        return;
    }

    const checkbox = document.getElementById(`role-${roleId}`);
    if (checkbox) {
        // Wenn auf die Checkbox selbst geklickt wurde, hat der Browser sie bereits umgeschaltet.
        // Andernfalls schalten wir sie manuell um.
        if (event.target !== checkbox) {
            checkbox.checked = !checkbox.checked;
        }

        // Visuelle Glow-Klasse aktualisieren
        const card = checkbox.closest('.role-option');
        if (card) {
            if (checkbox.checked) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        }
    }
}

// 1b. Einzelne Rollenseite für NFC-Scan generieren
function showStandaloneRolePage(roleId) {
    const role = ROLES_DATABASE.find(r => r.id === roleId);
    
    if (!role) {
        document.body.innerHTML = `
            <div class="container" style="display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; box-sizing: border-box;">
                <div class="card" style="max-width: 450px; width: 100%; text-align: center;">
                    <h2>Rolle nicht gefunden 😢</h2>
                    <p style="color: var(--text-muted);">Die gesuchte Rolle existiert leider nicht.</p>
                    <a href="index.html" class="btn-secondary" style="display: inline-block; text-decoration: none; padding: 12px 20px; border-radius: 10px; margin-top: 15px;">Zurück zum Hauptmenü</a>
                </div>
            </div>
        `;
        return;
    }

    let teamLabel = "Neutral";
    let badgeClass = "badge-neutral";
    if (role.team === "dorf") {
        teamLabel = "Dorfbewohner";
        badgeClass = "badge-dorf";
    } else if (role.team === "werwolf") {
        teamLabel = "Werwölfe";
        badgeClass = "badge-werwolf";
    }

    document.body.innerHTML = `
        <div class="container" style="display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; box-sizing: border-box;">
            <div class="card" style="max-width: 480px; width: 100%; text-align: center; border: 2px solid var(--border-color); box-shadow: 0 20px 40px rgba(0,0,0,0.6); animation: popIn 0.4s ease;">
                
                <img src="pics/${role.id}.png" alt="${role.name}" onerror="this.src='pics/default.png'; this.onerror=null;" 
     style="max-width: 240px; width: 100%; height: auto; object-fit: contain; margin: 0 auto 20px; display: block;">
                
                <h1 style="margin-bottom: 10px; font-size: 2.1rem; color: #fff;">${role.name}</h1>
                <span class="badge ${badgeClass}" style="font-size: 13px; padding: 6px 14px; margin-bottom: 20px;">Team: ${teamLabel}</span>
                
                <div style="background-color: var(--bg-dark); padding: 20px; border-radius: 12px; border: 1px solid var(--border-color); margin-top: 15px; text-align: left; line-height: 1.6; color: var(--text-light); font-size: 15px;">
                    ${role.description}
                </div>
                
                <!-- Navigation zurück zur Spielleitung oder zur globalen Rollen-Bibliothek -->
                <div style="display: flex; gap: 12px; margin-top: 25px; justify-content: center;">
                    <a href="index.html" class="btn-secondary" style="margin: 0; padding: 10px 18px; text-decoration: none; font-size: 13px; font-weight: 600; border-radius: 8px; display: inline-flex; align-items: center; width: auto; background: linear-gradient(135deg, #1f1f23, #27272a);">🏡 Spielleitung</a>
                    <a href="index.html?overview=true" class="btn-secondary" style="margin: 0; padding: 10px 18px; text-decoration: none; font-size: 13px; font-weight: 600; border-radius: 8px; display: inline-flex; align-items: center; width: auto; background-color: rgba(255,255,255,0.03);">📚 Alle Rollen</a>
                </div>
            </div>
        </div>
    `;
}

// 1c. Globale Übersicht aller Rollen generieren (Bibliothek)
function showRolesOverviewPage() {
    const categories = [
        { title: "🏘️ Dorfbewohner & Verbündete", team: "dorf", badge: "badge-dorf", label: "Dorfbewohner" },
        { title: "🐺 Werwölfe", team: "werwolf", badge: "badge-werwolf", label: "Werwölfe" },
        { title: "✨ Neutrale Rollen", team: "neutral", badge: "badge-neutral", label: "Neutral" }
    ];

    let htmlContent = `
        <div class="container" style="max-width: 900px; padding: 40px 20px; box-sizing: border-box;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="margin-bottom: 10px;">📚 Düsterwald Rollenbibliothek</h1>
                <p style="color: var(--text-muted); font-size: 15px;">Durchsuche alle verfügbaren Rollen und ihre Fähigkeiten.</p>
                <a href="index.html" class="btn-secondary" style="display: inline-flex; width: auto; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; margin-top: 10px;">🏡 Zurück zur Spielleitung</a>
            </div>
    `;

    categories.forEach(cat => {
        const rolesInCat = ROLES_DATABASE.filter(r => r.team === cat.team);
        if (rolesInCat.length === 0) return;

        rolesInCat.sort((a, b) => {
            if (a.isFiller) return -1;
            if (b.isFiller) return 1;
            return a.name.localeCompare(b.name);
        });

        htmlContent += `
            <div style="margin-top: 40px; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                <h2 style="margin: 0; color: #fff; font-size: 1.5rem; display: flex; align-items: center; gap: 8px;">${cat.title}</h2>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px;">
        `;

        rolesInCat.forEach(role => {
            htmlContent += `
                <div class="card role-library-card" style="margin-bottom: 0; padding: 20px; display: flex; flex-direction: column; align-items: center; text-align: center; cursor: pointer; transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;" 
                     onclick="window.location.search = '?role=${role.id}'">
                    
                    <img src="pics/${role.id}.png" alt="${role.name}" onerror="this.src='pics/default.png'; this.onerror=null;" 
     style="max-width: 120px; width: 100%; height: auto; object-fit: contain; margin-bottom: 12px; display: block;">
                    
                    <strong style="color: #fff; font-size: 16px; display: block; margin-bottom: 6px;">${role.name}</strong>
                    <span class="badge ${cat.badge}" style="font-size: 10px; padding: 4px 10px; margin-bottom: 10px;">${cat.label}</span>
                    
                    <div style="font-size: 12px; color: var(--text-muted); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; margin-bottom: 15px;">
                        ${role.description}
                    </div>
                    
                    <span style="margin-top: auto; font-size: 12px; font-weight: 600; color: var(--accent-dorf); display: inline-flex; align-items: center; gap: 4px;">🔍 Details ansehen</span>
                </div>
            `;
        });

        htmlContent += `</div>`;
    });

    htmlContent += `</div>`;
    document.body.innerHTML = htmlContent;
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
        
        // Glow für alle Checkboxen im Setup updaten
        const card = checkbox.closest('.role-option');
        if (card) {
            if (checkbox.checked) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
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

// Router beim Laden der Seite initialisieren (für NFC-Scans & App-Start)
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role');
    const overviewParam = urlParams.get('overview');

    if (roleParam) {
        // standalone NFC-Einzelansicht anzeigen
        showStandaloneRolePage(roleParam);
    } else if (overviewParam === "true") {
        // Die neue globale Rollen-Bibliothek anzeigen
        showRolesOverviewPage();
    } else {
        // Standard-Lobby laden
        renderRolesSelection();
    }
});
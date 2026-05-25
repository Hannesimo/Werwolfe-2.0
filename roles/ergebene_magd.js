registerRole({
    id: "ergebene_magd",
    name: "Ergebene Magd",
    team: "dorf",
    limit: 1,
    description: "Kann sich opfern, um die Rolle eines gerade verstorbenen Mitspielers zu übernehmen. Der verstorbene Spieler wird stattdessen nachträglich als 'Ergebene Magd' aufgedeckt.",

    initPlayer: function(player) {
        player.magdUsed = false;
    },

    renderInfo: function(player, index) {
        if (player.powersLost) {
            return `<div style="color: #ef4444; font-size: 11px; font-weight: bold;">⚠️ Fähigkeiten verloren (Gram über den Alten)</div>`;
        }
        
        if (player.magdUsed) {
            return `
                <div style="color: #10b981; font-size: 12px; font-style: italic;">
                    🧹 Hat die Identität gewechselt! Ihre alte Rolle wurde geoffenbart.
                </div>
            `;
        }

        // Liste alle toten Spieler auf, deren Rollen übernommen werden können
        let optionsHTML = `<option value="">-- Toten Spieler wählen --</option>`;
        let hasDeadPlayers = false;

        if (typeof activePlayersState !== "undefined" && Array.isArray(activePlayersState)) {
            activePlayersState.forEach((p, pIndex) => {
                if (p.status !== "alive" && pIndex !== index) {
                    hasDeadPlayers = true;
                    optionsHTML += `<option value="${p.name}">${p.name} (${p.role.name})</option>`;
                }
            });
        }

        if (!hasDeadPlayers) {
            return `
                <div style="font-size: 11px; color: var(--text-muted);">
                    Wartet darauf, dass ein Spieler stirbt, um seine Rolle zu übernehmen...
                </div>
            `;
        }

        return `
            <div class="magd-box" style="background: rgba(0, 0, 0, 0.15); padding: 10px; border-radius: 8px; border: 1px solid var(--border-color);">
                <strong style="color:#fff; font-size:12px; display:block; margin-bottom:6px;">🧹 Rolle übernehmen</strong>
                <select id="magd-select-${index}" style="width:100%; font-size:12px; padding: 4px; margin-bottom: 6px;">
                    ${optionsHTML}
                </select>
                <button class="status-btn" style="margin: 0; padding: 6px 12px; font-size: 11px; background: linear-gradient(135deg, #a855f7, #7c3aed); color: white; width: 100%;" 
                        onclick="executeRoleAction('ergebene_magd', ${index}, 'takeOver', document.getElementById('magd-select-${index}').value)">
                    ✨ Rolle annehmen
                </button>
            </div>
        `;
    },

    handleAction: function(player, index, action, targetName) {
        if (action === "takeOver" && targetName) {
            if (player.powersLost) {
                alert("Deine Fähigkeiten wurden blockiert!");
                return;
            }

            const victim = activePlayersState.find(p => p.name === targetName);
            if (!victim || victim.status === "alive") return;

            const magdRole = ROLES_DATABASE.find(r => r.id === "ergebene_magd");
            const targetRole = victim.role;

            if (magdRole && targetRole) {
                // Der verstorbene Spieler wird im Nachhinein als Ergebene Magd geoutet
                victim.role = magdRole;

                // Die lebende Magd übernimmt die Rolle des Toten vollständig
                player.role = targetRole;
                player.magdUsed = true;

                // Initialisiere die neue Rolle für die ehemalige Magd
                if (targetRole.initPlayer) {
                    targetRole.initPlayer(player);
                }

                alert(`✨ Die Ergebene Magd hat sich geoffenbart! Sie übernimmt die Rolle "${targetRole.name}" von ${targetName}. ${targetName} wird ab jetzt als Ergebene Magd angezeigt.`);

                if (typeof renderGameTable === "function") {
                    renderGameTable();
                }
            }
        }
    }
});
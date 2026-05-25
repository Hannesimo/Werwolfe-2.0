registerRole({
    id: "barbier",
    name: "Barbier",
    team: "dorf",
    limit: 1,
    description: "Kann einmalig am Tag einen Mitspieler mit seinem Rasiermesser eliminieren. War das Opfer ein Werwolf, überlebt der Barbier. War es ein unschuldiger Bürger, stirbt der Barbier sofort ebenfalls vor Schuldgefühlen.",

    initPlayer: function(player) {
        player.barbierUsed = false;
    },

    renderInfo: function(player, index) {
        if (player.powersLost) {
            return `<div style="color: #ef4444; font-size: 11px; font-weight: bold;">⚠️ Fähigkeiten verloren (Gram über den Alten)</div>`;
        }

        if (player.barbierUsed) {
            return `
                <div style="color: #a1a1aa; font-size: 12px; font-style: italic;">
                    ✂️ Rasiermesser bereits benutzt.
                </div>
            `;
        }

        let optionsHTML = `<option value="">-- Opfer wählen --</option>`;
        if (typeof activePlayersState !== "undefined" && Array.isArray(activePlayersState)) {
            activePlayersState.forEach((p, pIndex) => {
                if (p.status === "alive" && pIndex !== index) {
                    optionsHTML += `<option value="${p.name}">${p.name}</option>`;
                }
            });
        }

        return `
            <div class="barbier-box" style="background: rgba(0, 0, 0, 0.15); padding: 10px; border-radius: 8px; border: 1px solid var(--border-color);">
                <strong style="color:#fff; font-size:12px; display:block; margin-bottom:6px;">🪒 Rasiermesser (Einmalig)</strong>
                <select id="barbier-select-${index}" style="width:100%; font-size:12px; padding: 4px; margin-bottom: 6px;">
                    ${optionsHTML}
                </select>
                <button class="status-btn" style="margin: 0; padding: 6px 12px; font-size: 11px; background: linear-gradient(135deg, #ef4444, #991b1b); color: white; width: 100%;" 
                        onclick="executeRoleAction('barbier', ${index}, 'shave', document.getElementById('barbier-select-${index}').value)">
                    🩸 Kehle durchschneiden
                </button>
            </div>
        `;
    },

    handleAction: function(player, index, action, targetName) {
        if (action === "shave" && targetName) {
            if (player.powersLost) {
                alert("Du hast deine Fähigkeiten aus Gram verloren!");
                return;
            }

            const victim = activePlayersState.find(p => p.name === targetName);
            if (!victim || victim.status !== "alive") return;

            player.barbierUsed = true;
            const victimIndex = activePlayersState.indexOf(victim);

            // Prüfen, ob das Opfer zu den Werwölfen gehört
            const isWolf = (victim.role.team === "werwolf") || (victim.role.id.includes("werwolf"));

            if (isWolf) {
                alert(`🩸 Der Barbier (${player.name}) schneidet ${targetName} die Kehle durch... Es war ein Werwolf! Das Dorf gratuliert dem Barbier.`);
                killPlayer(victimIndex, 'dorf'); // Tagstod
            } else {
                alert(`💀 Katastrophe! Der Barbier (${player.name}) hat einen Unschuldigen (${targetName}, Rolle: ${victim.role.name}) getötet! Vor Schuldgefühlen nimmt sich der Barbier ebenfalls sofort das Leben.`);
                killPlayer(victimIndex, 'dorf'); // Opfer stirbt
                killPlayer(index, 'dorf'); // Barbier stirbt ebenfalls
            }

            if (typeof renderGameTable === "function") {
                renderGameTable();
            }
        }
    }
});
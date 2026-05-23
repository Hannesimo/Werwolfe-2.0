registerRole({
    id: "bodyguard",
    name: "Bodyguard",
    team: "dorf",
    limit: 1,
    description: "Wählt jede Nacht einen Spieler zum Schutz. Wird dieser durch einen Angriff getötet, stirbt stattdessen der Bodyguard. Solange der Bodyguard lebt, werden Rollen verstorbener Spieler nicht aufgedeckt.",

    initPlayer: function(player) {
        player.bodyguardTargetName = null;
        player.bodyguardActive = true;
    },

    renderInfo: function(player, index) {
        let optionsHTML = `<option value="">-- Niemand geschützt --</option>`;
        
        // Generiere dynamisch für jeden aktiven Spieler eine Option im Dropdown
        if (typeof activePlayersState !== "undefined" && Array.isArray(activePlayersState)) {
            activePlayersState.forEach(p => {
                const isSelected = player.bodyguardTargetName === p.name ? "selected" : "";
                optionsHTML += `<option value="${p.name}" ${isSelected}>${p.name}</option>`;
            });
        }

        return `
            <div class="bodyguard-control" style="background: rgba(0, 0, 0, 0.15); padding: 10px; border-radius: 8px; border: 1px solid var(--border-color);">
                <strong style="color:#fff; font-size:12px; display:block; margin-bottom:6px;">🛡️ Bodyguard Schutz</strong>
                <select onchange="executeRoleAction('bodyguard', ${index}, 'protect', this.value)" style="width:100%; font-size:12px; padding: 6px;">
                    ${optionsHTML}
                </select>
                <div style="font-size:11px; color:var(--text-muted); margin-top:6px;">
                    Schützt die ausgewählte Person vor dem nächsten Werwolf-Angriff.
                </div>
            </div>
        `;
    },

    handleAction: function(player, index, action, value) {
        if (action === "protect") {
            player.bodyguardTargetName = value === "" ? null : value;

            // Engine-Interaktion zur Verwaltung des Schutzes
            if (typeof activePlayersState !== "undefined" && Array.isArray(activePlayersState)) {
                // Alten Schutz von allen Spielern entfernen
                activePlayersState.forEach(p => {
                    if (p.bodyguardProtectedBy === index) {
                        p.bodyguardProtectedBy = null;
                    }
                });

                // Neuen Schutz setzen, falls ein valider Name ausgewählt wurde
                if (player.bodyguardTargetName) {
                    const targetPlayer = activePlayersState.find(p => p.name === player.bodyguardTargetName);
                    if (targetPlayer) {
                        targetPlayer.bodyguardProtectedBy = index;
                    }
                }
            }
        }
    },

    checkWin: function(player, allPlayers) {
        return null;
    }
});
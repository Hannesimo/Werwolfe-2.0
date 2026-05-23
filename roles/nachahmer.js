registerRole({
    id: "nachahmer",
    name: "Nachahmer",
    team: "neutral",
    limit: 1,
    description: "Kann nachts einmal die Fähigkeit eines anderen Spielers kopieren, ohne dass dieser es bemerkt. Solange der Nachahmer lebt, werden die Rollen verstorbener Spieler nicht aufgedeckt.",

    initPlayer: function(player) {
        player.nachahmerCopiedPlayerName = "";
        player.nachahmerUsed = false;
    },

    renderInfo: function(player, index) {
        let optionsHTML = `<option value="">-- Spieler wählen --</option>`;
        if (typeof activePlayersState !== "undefined" && Array.isArray(activePlayersState)) {
            activePlayersState.forEach((p, pIndex) => {
                if (pIndex !== index) { // Verhindert, dass er sich selbst kopiert
                    const isSelected = player.nachahmerCopiedPlayerName === p.name ? "selected" : "";
                    optionsHTML += `<option value="${p.name}" ${isSelected}>${p.name} (${p.role.name})</option>`;
                }
            });
        }

        return `
            <div class="nachahmer-box" style="background: rgba(0, 0, 0, 0.15); padding: 10px; border-radius: 8px; border: 1px solid var(--border-color);">
                <strong style="color:#fff; font-size:12px; display:block; margin-bottom:4px;">🎭 Nachahmer</strong>
                
                <label style="display:block; margin-top:4px;">
                    Kopierter Spieler:
                    <select 
                        onchange="executeRoleAction('nachahmer', ${index}, 'copyPlayer', this.value)"
                        style="width:100%; margin-top:2px; font-size:12px; padding: 6px;"
                    >
                        ${optionsHTML}
                    </select>
                </label>

                <label style="display:block; margin-top:8px;">
                    <input 
                        type="checkbox"
                        ${player.nachahmerUsed ? 'checked' : ''}
                        onchange="executeRoleAction('nachahmer', ${index}, 'used', this.checked)"
                        style="width:auto; margin-right:4px;"
                    >
                    Fähigkeit bereits benutzt
                </label>

                <div style="margin-top:6px; font-size:11px; color:#bbb;">
                    Solange der Nachahmer lebt, bleiben Rollen verstorbener Spieler verborgen.
                </div>
            </div>
        `;
    },

    handleAction: function(player, index, action, value) {
        if (action === 'copyPlayer') {
            player.nachahmerCopiedPlayerName = value;
        }

        if (action === 'used') {
            player.nachahmerUsed = value;
        }
    },

    checkWin: function(player, allPlayers) {
        if (player.status !== "alive") return null;

        const livingPlayers = allPlayers.filter(p => p.status === "alive");

        // Neutraler Solo-Sieg:
        // Gewinnt wenn nur noch 2 Spieler leben und er darunter ist
        if (livingPlayers.length === 2 && livingPlayers.includes(player)) {
            return {
                message: `🎭 Der Nachahmer (${player.name}) hat bis zum Schluss überlebt und gewinnt alleine!`,
                bannerClass: "banner-neutral"
            };
        }

        return null;
    }
});
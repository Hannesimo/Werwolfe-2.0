registerRole({
    id: "saboteur",
    name: "Saboteur",
    team: "werwolf",
    limit: 1,
    description: "Ein Werwolf, der einmal pro Runde die Diskussion am Tag sofort stoppen kann.",

    // Initialisiert den Zustand beim Spielstart
    initPlayer: function(player) {
        player.saboteurUsedThisRound = false;
    },

    // Rendert die Steuerung in der Spielleiter-Tabelle
    renderInfo: function(player, index) {
        const isAlive = player.status === "alive";
        
        // Wenn der Saboteur tot ist, kann er keine Sabotage mehr nutzen
        if (!isAlive) {
            return `<div style="color: #71717a; font-size: 12px; font-style: italic;">Spezialfähigkeit inaktiv (Saboteur ist tot)</div>`;
        }

        // Anzeige, wenn die Sabotage in dieser Runde bereits genutzt wurde
        if (player.saboteurUsedThisRound) {
            return `
                <div class="saboteur-box" style="border-color: var(--accent-werwolf); background: rgba(244, 63, 94, 0.05); padding: 10px; border-radius: 8px; border: 1px solid var(--accent-werwolf);">
                    <strong style="color: var(--accent-werwolf); font-size: 12px; display: block; margin-bottom: 2px;">⚠️ Diskussion gestoppt!</strong>
                    <span style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 8px;">Die Sabotage wurde für diese Runde aktiviert.</span>
                    <button class="btn-secondary" style="margin: 0; padding: 6px 10px; font-size: 11px; width: auto; height: auto;" onclick="executeRoleAction('saboteur', ${index}, 'reset')">
                        🔄 Für neue Runde aufladen
                    </button>
                </div>
            `;
        }

        // Anzeige, wenn die Sabotage bereit ist
        return `
            <div class="saboteur-box" style="padding: 10px; border-radius: 8px; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color);">
                <strong style="color: #fff; font-size: 12px; display: block; margin-bottom: 8px;">📢 Sabotage bereit:</strong>
                <button class="btn-danger" style="margin: 0; padding: 8px 12px; font-size: 12px; width: 100%;" onclick="executeRoleAction('saboteur', ${index}, 'stop')">
                    🛑 Diskussion sofort stoppen!
                </button>
            </div>
        `;
    },

    // Verarbeitet die Aktionen und aktualisiert die Ansicht sofort
    handleAction: function(player, index, action) {
        if (action === "stop") {
            player.saboteurUsedThisRound = true;
            if (typeof renderGameTable === "function") {
                renderGameTable();
            }
        }
        if (action === "reset") {
            player.saboteurUsedThisRound = false;
            if (typeof renderGameTable === "function") {
                renderGameTable();
            }
        }
    },

    checkWin: function(player, allPlayers) {
        // Keine eigene Siegbedingung nötig, er gewinnt automatisch mit den Werwölfen
        return null;
    }
});
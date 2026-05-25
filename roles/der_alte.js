registerRole({
    id: "der_alte",
    name: "Der Alte",
    team: "dorf",
    limit: 1,
    description: "Überlebt den ersten Angriff der Werwölfe (hat 2 Leben gegen sie). Wird er jedoch vom Dorf gelyncht, verlieren alle Dorfbewohner dauerhaft ihre Spezialfähigkeiten.",

    initPlayer: function(player) {
        player.alteLives = 2;
    },

    renderInfo: function(player, index) {
        const isAlive = player.status === "alive";
        if (!isAlive) {
            return `<div style="color: #71717a; font-size: 12px; font-style: italic;">Der Alte ist verstorben.</div>`;
        }

        return `
            <div style="background: rgba(0, 0, 0, 0.15); padding: 10px; border-radius: 8px; border: 1px solid var(--border-color);">
                <strong style="color: #fff; font-size: 12px; display: block; margin-bottom: 4px;">👴 Lebensenergie (Werwolf-Schutz)</strong>
                <div style="font-size: 13px; font-weight: bold; color: #38bdf8; margin-bottom: 4px;">
                    ${"❤️ ".repeat(player.alteLives)}${"🖤 ".repeat(2 - player.alteLives)} (${player.alteLives} Leben verbleibend)
                </div>
                <span style="font-size: 11px; color: var(--text-muted);">
                    Werwolf-Attacken ziehen nur 1 Leben ab. Dorflynch tötet ihn sofort und blockiert dauerhaft alle Dorf-Kräfte!
                </span>
            </div>
        `;
    }
});

// Integrierter Hook für die globale Engine zur Abwicklung der Spezialregeln
if (typeof window !== "undefined" && !window.killPlayer_patched_der_alte) {
    const originalKillPlayer = window.killPlayer;
    window.killPlayer = function(index, method) {
        const player = activePlayersState[index];
        if (player && player.status === "alive" && player.role && player.role.id === "der_alte") {
            
            // 1. Doppelte Widerstandskraft gegen Werwölfe
            if (method === "werwolf") {
                if (player.alteLives > 1) {
                    player.alteLives--;
                    alert(`🛡️ Der Alte (${player.name}) wurde von Werwölfen angegriffen, überlebt aber dank seiner doppelten Widerstandskraft! (Noch ${player.alteLives} Leben)`);
                    if (typeof renderGameTable === "function") {
                        renderGameTable();
                    }
                    return; // Stoppt den Tod
                }
            }
            
            // 2. Dorf-Lynchzug führt zum Gram-Verlust aller Fähigkeiten im Dorf
            if (method === "dorf") {
                alert("🪦 Oh nein! Der Alte wurde vom Dorf gelyncht! Aus Gram verlieren alle Dorfbewohner sofort und dauerhaft ihre Spezialfähigkeiten!");
                if (Array.isArray(activePlayersState)) {
                    activePlayersState.forEach(p => {
                        if (p.role && p.role.team === "dorf" && p.role.id !== "der_alte") {
                            p.powersLost = true;
                        }
                    });
                }
            }
        }
        originalKillPlayer(index, method);
    };
    window.killPlayer_patched_der_alte = true;
}
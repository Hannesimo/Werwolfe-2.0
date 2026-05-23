registerRole({
    id: "blocker",
    name: "Blocker",
    team: "werwolf",
    limit: 1,
    description: "Solange der Blocker lebt, werden die Rollen verstorbener Spieler nicht aufgedeckt.",

    initPlayer: function(player) {
        player.blockerActive = true;
    },

    renderInfo: function(player, index) {
        const isActive = player.status === "alive";
        return `
            <div class="blocker-info">
                <strong style="color: #ff5555; font-size: 12px;">
                    🕶️ Rollenaufdeckung blockiert: 
                    ${isActive ? 'AKTIV' : 'INAKTIV'}
                </strong>
            </div>
        `;
    },

    checkWin: function(player, allPlayers) {
        return null;
    }
});
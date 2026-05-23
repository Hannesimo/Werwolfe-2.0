registerRole({
    id: "hexe",
    name: "Hexe",
    team: "dorf",
    limit: 1, // Maximal einmal pro Spiel
    description: "Besitzt einen Heil- und einen Giftsack. Kann einmal pro Spiel retten oder töten.",
    
    // Initialisiert Tränke auf dem jeweiligen Spieler
    initPlayer: function(player) {
        player.hexeHealUsed = false;
        player.hexePoisonUsed = false;
    },
    
    // Rendert das Trank-Interface
    renderInfo: function(player, index) {
        return `
            <div class="witch-potions">
                <strong style="color: #fff; font-size: 12px; margin-bottom: 2px;">🧙‍♀️ Hexen-Tränke:</strong>
                <label>
                    <input type="checkbox" ${player.hexeHealUsed ? 'checked' : ''} onchange="executeRoleAction('hexe', ${index}, 'heal', this.checked)">
                    🟢 Heiltrank benutzt
                </label>
                <label>
                    <input type="checkbox" ${player.hexePoisonUsed ? 'checked' : ''} onchange="executeRoleAction('hexe', ${index}, 'poison', this.checked)">
                    🔴 Gifttrank benutzt
                </label>
            </div>
        `;
    },
    
    // Verarbeitet Änderungen an den Checkboxen
    handleAction: function(player, index, action, value) {
        if (action === 'heal') player.hexeHealUsed = value;
        if (action === 'poison') player.hexePoisonUsed = value;
    }
});
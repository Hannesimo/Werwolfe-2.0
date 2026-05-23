registerRole({
    id: "dieb",
    name: "Dieb",
    team: "neutral",
    limit: 1,
    description: "Kann am Anfang des Spiels die Rolle eines anderen Spielers stehlen. Er übernimmt diese Rolle, während das Opfer zum einfachen Dorfbewohner wird.",

    initPlayer: function(player) {
        player.diebStolen = false;
        player.diebTargetName = "";
    },

    renderInfo: function(player, index) {
        // Wenn der Dieb bereits bestohlen hat, wird nur noch das Ergebnis angezeigt
        if (player.diebStolen) {
            return `
                <div style="color: #a1a1aa; font-size: 12px; font-style: italic;">
                    🎒 Hat erfolgreich die Rolle von <strong>${player.diebTargetName}</strong> gestohlen!
                </div>
            `;
        }

        let optionsHTML = `<option value="">-- Spieler wählen --</option>`;
        if (typeof activePlayersState !== "undefined" && Array.isArray(activePlayersState)) {
            activePlayersState.forEach((p, pIndex) => {
                if (pIndex !== index) { // Er kann sich nicht selbst bestehlen
                    optionsHTML += `<option value="${p.name}">${p.name} (${p.role.name})</option>`;
                }
            });
        }

        return `
            <div class="dieb-box" style="background: rgba(0, 0, 0, 0.15); padding: 10px; border-radius: 8px; border: 1px solid var(--border-color);">
                <strong style="color:#fff; font-size:12px; display:block; margin-bottom:6px;">🎒 Rolle stehlen</strong>
                <select id="dieb-select-${index}" style="width:100%; font-size:12px; padding: 6px; margin-bottom: 6px;">
                    ${optionsHTML}
                </select>
                <button class="status-btn" style="margin: 0; padding: 6px 12px; font-size: 11px; background: linear-gradient(135deg, #10b981, #059669); color: white; width: 100%;" 
                        onclick="executeRoleAction('dieb', ${index}, 'steal', document.getElementById('dieb-select-${index}').value)">
                    ⚡ Bestehlen
                </button>
            </div>
        `;
    },

    handleAction: function(player, index, action, targetName) {
        if (action === "steal" && targetName) {
            const victim = activePlayersState.find(p => p.name === targetName);
            if (!victim) return;

            const stolenRole = victim.role;
            const dorfbewohnerRole = ROLES_DATABASE.find(r => r.id === "dorfbewohner");

            if (stolenRole && dorfbewohnerRole) {
                // 1. Das Opfer wird zum Dorfbewohner degradiert
                victim.role = dorfbewohnerRole;

                // 2. Der Dieb übernimmt die Rolle und markiert den Diebstahl als erledigt
                player.role = stolenRole;
                player.diebStolen = true;
                player.diebTargetName = targetName;

                // 3. Ruft optionale Initialisierungen der neuen Rolle für den Dieb auf
                if (stolenRole.initPlayer) {
                    stolenRole.initPlayer(player);
                }

                alert(`⚡ Der Dieb hat die Rolle "${stolenRole.name}" von ${targetName} gestohlen! ${targetName} ist jetzt ein einfacher Dorfbewohner.`);

                // Spielleiter-Ansicht neu laden, damit die Rollenwechsel sichtbar werden
                if (typeof renderGameTable === "function") {
                    renderGameTable();
                }
            }
        }
    },

    checkWin: function(player, allPlayers) {
        // Er gewinnt mit dem Team der Rolle, die er gestohlen hat
        return null;
    }
});
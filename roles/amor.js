registerRole({
    id: "amor",
    name: "Amor",
    team: "dorf",
    limit: 1,
    description: "Wählt zu Beginn des Spiels zwei Verliebte aus. Wenn einer der beiden stirbt, stirbt der andere sofort vor Kummer mit. Besteht das Paar aus einem Werwolf und einem Dorfbewohner, bilden sie ein eigenes Team und gewinnen, wenn sie als Einzige überleben.",

    initPlayer: function(player) {
        player.amorUsed = false;
        player.amorTarget1 = "";
        player.amorTarget2 = "";
    },

    renderInfo: function(player, index) {
        // Wenn Amor bereits verkuppelt hat, zeigen wir das Ergebnis an
        if (player.amorUsed) {
            return `
                <div style="color: #fb7185; font-size: 12px; font-weight: 600;">
                    💖 ${player.amorTarget1} & ${player.amorTarget2} sind unsterblich verliebt!
                </div>
            `;
        }

        // Generiere Dropdowns für beide Liebende
        let optionsHTML = `<option value="">-- Spieler wählen --</option>`;
        if (typeof activePlayersState !== "undefined" && Array.isArray(activePlayersState)) {
            activePlayersState.forEach(p => {
                optionsHTML += `<option value="${p.name}">${p.name}</option>`;
            });
        }

        return `
            <div class="amor-box" style="background: rgba(0, 0, 0, 0.15); padding: 10px; border-radius: 8px; border: 1px solid var(--border-color);">
                <strong style="color:#fff; font-size:12px; display:block; margin-bottom:6px;">🏹 Amor Pfeil</strong>
                <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 6px;">
                    <select id="amor-select1-${index}" style="width:100%; font-size:11px; padding: 4px;">
                        ${optionsHTML}
                    </select>
                    <select id="amor-select2-${index}" style="width:100%; font-size:11px; padding: 4px;">
                        ${optionsHTML}
                    </select>
                </div>
                <button class="status-btn" style="margin: 0; padding: 6px 12px; font-size: 11px; background: linear-gradient(135deg, #ec4899, #db2777); color: white; width: 100%;" 
                        onclick="const val1 = document.getElementById('amor-select1-${index}').value; const val2 = document.getElementById('amor-select2-${index}').value; executeRoleAction('amor', ${index}, 'couple', val1 + '|' + val2)">
                    💖 Verkuppeln
                </button>
            </div>
        `;
    },

    handleAction: function(player, index, action, value) {
        if (action === "couple" && value) {
            const parts = value.split("|");
            const name1 = parts[0];
            const name2 = parts[1];

            if (!name1 || !name2 || name1 === name2) {
                alert("Bitte wähle zwei unterschiedliche Spieler aus!");
                return;
            }

            const p1 = activePlayersState.find(p => p.name === name1);
            const p2 = activePlayersState.find(p => p.name === name2);

            if (p1 && p2) {
                // Verknüpfe die Liebenden über Eigenschaften auf ihren Spielerobjekten
                p1.isInLove = true;
                p1.loverName = name2;

                p2.isInLove = true;
                p2.loverName = name1;

                player.amorUsed = true;
                player.amorTarget1 = name1;
                player.amorTarget2 = name2;

                alert(`💖 ${name1} und ${name2} wurden von Amor verkuppelt! Sie teilen ab jetzt ihr Leben.`);

                if (typeof renderGameTable === "function") {
                    renderGameTable();
                }
            }
        }
    },

    // Siegbedingung für das gemischte Liebespaar (Werwolf + Dorfbewohner)
    checkWin: function(player, allPlayers) {
        const lovers = allPlayers.filter(p => p.isInLove === true);
        
        if (lovers.length === 2) {
            const [l1, l2] = lovers;

            // Beide müssen am Leben sein
            const bothAlive = l1.status === "alive" && l2.status === "alive";

            // Prüfen, ob es ein gemischtes Paar ist (Einer Werwolf, einer Dorf)
            const isMixed = (l1.role.team === "werwolf" && l2.role.team === "dorf") || 
                            (l1.role.team === "dorf" && l2.role.team === "werwolf");

            if (bothAlive && isMixed) {
                // Prüfen, ob alle anderen lebenden Spieler tot sind
                const otherLivingPlayers = allPlayers.filter(p => p !== l1 && p !== l2 && p.status === "alive");

                if (otherLivingPlayers.length === 0) {
                    return {
                        message: `💖 DAS LIEBESPAAR GEWINNT! ${l1.name} und ${l2.name} haben als Werwolf & Dorfbewohner alle anderen überlebt!`,
                        bannerClass: "banner-neutral"
                    };
                }
            }
        }
        return null;
    }
});
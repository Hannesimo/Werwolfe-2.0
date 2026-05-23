registerRole({
    id: "neugieriger_nachbar",
    name: "Neugieriger Nachbar",
    team: "dorf",
    limit: 1,
    description: "Ein neugieriger Dorfbewohner, der immer alles mitbekommen will. Wenn er stirbt, kommen vielleicht Informationen zu Tage.",

    initPlayer: function(player) {
        player.neighborInfo = "";
        player.neighborInfoGiven = false;
    },

    renderInfo: function(player, index) {
        const isAlive = player.status === "alive";
        return `
            <div class="neugieriger-nachbar-panel">
                <strong style="color:#fff; font-size:12px; display:block; margin-bottom:4px;">
                    👀 Neugieriger Nachbar
                </strong>

                ${
                    isAlive
                    ? `
                        <div style="font-size:11px; color:#9ad19a;">
                            Lauscht ständig an Wänden und Fenstern.
                        </div>
                    `
                    : `
                        <div style="font-size:11px; color:#ffcc66; margin-bottom:6px;">
                            ☠️ Der Neugierige Nachbar ist gestorben
                        </div>

                        ${
                            !player.neighborInfoGiven
                            ? `
                                <textarea
                                    placeholder="Geheime Informationen über die Nachbarn eintragen..."
                                    style="width:100%; min-height:70px;"
                                    onchange="executeRoleAction('neugieriger_nachbar', ${index}, 'setInfo', this.value)"
                                >${player.neighborInfo || ''}</textarea>

                                <label style="display:block; margin-top:6px; font-size:11px;">
                                    <input
                                        type="checkbox"
                                        onchange="executeRoleAction('neugieriger_nachbar', ${index}, 'infoGiven', this.checked)"
                                    >
                                    Informationen veröffentlicht
                                </label>
                            `
                            : `<div style="font-size:11px; color:#aaa;">✔ Informationen bereits veröffentlicht</div>`
                        }
                    `
                }
            </div>
        `;
    },

    handleAction: function(player, index, action, value) {
        if (action === "setInfo") {
            player.neighborInfo = value;
        }

        if (action === "infoGiven") {
            player.neighborInfoGiven = value;
        }
    },

    checkWin: function() {
        return null;
    }
});
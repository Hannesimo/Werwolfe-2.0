registerRole({
    id: "narr",
    name: "Narr",
    team: "neutral",
    limit: 1, // Maximal einmal pro Spiel
    description: "Spielt alleine. Gewinnt das Spiel sofort, wenn er am Tag vom Dorf gelyncht (abgewählt) wird.",
    
    // Prüft, ob der Narr gelyncht wurde
    checkWin: function(player, allPlayers) {
        if (player.status === "lynched") {
            return {
                message: `🎉 DER NARR (${player.name}) HAT GEWONNEN! Er wurde erfolgreich vom Dorf gelyncht!`,
                bannerClass: "banner-neutral"
            };
        }
        return null;
    }
});
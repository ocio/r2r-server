function getPlayerIdByPlayerIndex({ game_id, player_index }) {
    const game = state.games[game_id]
    for (const player_id in game.players)
        if (game.players[player_id] === player_index) return player_id
}

function Player({ id, node, nickname }) {
    return {
        id,
        // node,
        nickname,
        games: {} // <game_id> games is currently playing
    }
}

module.exports = Player

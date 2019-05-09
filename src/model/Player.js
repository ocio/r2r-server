function Player({ id, node, nickname }) {
    this.id = id
    // this.node = node
    this.nickname = nickname
    this.games = {} // <game_id> games is currently playing
}

module.exports = Player

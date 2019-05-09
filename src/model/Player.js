const dop = require('dop')

function Player({ node, nickname }) {
    this.id = 'Player_' + dop.util.uuid(16)
    // this.node = node
    this.nickname = nickname
    this.games = [] // <game_id> games is currently playing
}

module.exports = Player

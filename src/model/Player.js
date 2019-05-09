const dop = require('dop')

function Player({ node, nickname }) {
    this.id = dop.util.uuid(16)
    this.node = node
    this.nickname = nickname
    // this.game_id
}

module.exports = Player

const dop = require('dop')
const { GAME_STATUS } = require('../const')

function Game({ public }) {
    this.id = 'Game_' + dop.util.uuid(16)
    this.public = public
    this.status = GAME_STATUS.WAITING_PLAYERS
    this.players = [] // <player_id>
}

module.exports = Game

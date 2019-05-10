const dop = require('dop')
const { GAME_STATUS } = require('../const')
const { uuid } = require('../utils')

function Game({ id, public }) {
    this.id = id
    this.public = public
    this.players = {
        // [player_id]: index_id
    }
    this.sub = dop.register({
        status: GAME_STATUS.WAITING_PLAYERS,
        players: {}
    })
}

Game.prototype.addPlayer = function({ player_id, nickname }) {
    const index = uuid(2, this.sub.players)
    this.players[player_id] = index
    this.sub.players[index] = { nickname }
    return index
}

Game.prototype.removePlayer = function({ player_id }) {
    const index = this.players[player_id]
    delete this.players[player_id]
    delete this.sub.players[index]
    return index
}

module.exports = Game

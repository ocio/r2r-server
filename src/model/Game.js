const dop = require('dop')
const { GAME_STATUS } = require('../const')

function Game({ public = true }) {
    const id = dop.util.uuid(16)
    const game = {
        id,
        public,
        status: GAME_STATUS.WAITING_PLAYERS,
        players: []
    }
    state.games[id] = game
    return game
}

module.exports = Game

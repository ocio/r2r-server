const dop = require('dop')
const { GAME_STATUS } = require('../const')
const { uuid } = require('../utils')

function Game({ id, public }) {
    const players = {}
    const sub = dop.register({
        id,
        status: GAME_STATUS.WAITING_PLAYERS,
        players: {},
        starts_at: undefined,
        get players_total() {
            return Object.keys(this.players).length
        }
    })
    return {
        id,
        public,
        players,
        sub,
        addPlayer: ({ player_id, nickname }) => {
            const index = uuid(2, sub.players)
            players[player_id] = index
            sub.players[index] = { nickname }
            return index
        },
        removePlayer: ({ player_id }) => {
            const index = players[player_id]
            delete players[player_id]
            delete sub.players[index]
            return index
        }
    }
}

module.exports = Game

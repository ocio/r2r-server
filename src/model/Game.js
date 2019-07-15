const { GAME_STATUS } = require('runandrisk-common/const')
const { uuid, now } = require('runandrisk-common/utils')

function Game({ id, public }) {
    const players = {}
    const sub = {
        id,
        status: GAME_STATUS.WAITING_PLAYERS,
        created_at: undefined,
        starts_at: undefined,
        recruiting: false,
        recruit_start: Infinity,
        recruit_end: Infinity,
        troops: {},
        players: {}
        // get players_total() {
        //     return Object.keys(this.players).length
        // }
    }
    return {
        id,
        public,
        players,
        sub,
        addPlayer: ({ player_id, nickname }) => {
            const index = uuid(2, sub.players)
            players[player_id] = index
            sub.players[index] = {
                joined: now(),
                nickname,
                units: 0,
                power: 0,
                kills: 0
            }
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

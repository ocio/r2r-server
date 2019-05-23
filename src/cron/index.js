const { GAME_STATUS } = require('runandrisk-common/const')
const { GAME_MATCHMAKING } = require('../const/parameters')
const state = require('../store/state')
const { startGame } = require('../store/actions')
const { now } = require('runandrisk-common/utils')

function startCron() {
    const interval = setInterval(() => {
        launchGames()
    }, 1000)
}

function launchGames() {
    const n = now()
    const { games } = state
    for (const game_id in games) {
        const game = games[game_id]
        if (
            game.sub.status === GAME_STATUS.WAITING_PLAYERS &&
            game.sub.players_total >= GAME_MATCHMAKING.MIN_PLAYERS &&
            game.sub.starts_at - n < 0
        ) {
            startGame({ game })
        }
    }
}

module.exports = {
    startCron
}

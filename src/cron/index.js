const { GAME_STATUS } = require('runandrisk-common/const')
const { GAME_MATCHMAKING } = require('../const/parameters')
const state = require('../store/state')
const { startGame, changeTileUnits, deleteTroops } = require('../store/actions')
const { now } = require('runandrisk-common/utils')

function startCron() {
    const interval = setInterval(() => {
        launchGames()
        updateTroops()
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
            startGame({ game_id })
        }
    }
}

function updateTroops() {
    const n = now()
    const { games } = state
    for (const game_id in games) {
        const game = games[game_id]
        const troops = game.sub.troops
        for (const troop_id in troops) {
            const troop = troops[troop_id]
            // const total_diff = troop.arrives_at - troop.leaves_at
            const current_diff = troop.arrives_at - n
            if (current_diff < 1) {
                const player_index = troop.player_index
                const units = troop.units
                const tile_id = troop.tile_id_to
                changeTileUnits({ game_id, tile_id, player_index, units })
                deleteTroops({ game_id, troop_id })
            }
        }
    }
}

module.exports = {
    startCron
}

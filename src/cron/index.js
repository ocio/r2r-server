const { collect } = require('dop')
const { GAME_STATUS } = require('runandrisk-common/const')
const { now } = require('runandrisk-common/utils')
const Combinatorics = require('js-combinatorics')
const { GAME_MATCHMAKING } = require('../const/parameters')
const state = require('../store/state')
const {
    startGame,
    changeTileUnits,
    updateFight,
    deleteTroops,
    changeRecruitmentTimes
} = require('../store/actions')
const { getOwnerFromTile } = require('../store/getters')
const { diceFight } = require('../rules')

function startCron() {
    const interval = setInterval(() => {
        launchGames()
        updateTroops()
        makeFights()
        startRecruiting()
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

function makeFights() {
    const { games } = state
    for (const game_id in games) {
        const collector = collect()
        const game = games[game_id]
        const board = game.sub.board
        for (const tile_id in board) {
            const tile = board[tile_id]
            const owners = Object.keys(tile.owner)
            const player_owner = getOwnerFromTile({ game_id, tile_id })
            if (owners.length > 1) {
                const combinations = Combinatorics.combination(owners, 2)
                // console.log
                combinations.forEach(cmb => {
                    if (tile.owner[cmb[0]] === undefined) {
                        console.log('cmb[0]', {
                            id: cmb[0],
                            owners,
                            new_owners: Object.keys(tile.owner)
                        })
                    } else if (tile.owner[cmb[1]] === undefined) {
                        console.log('cmb[1]', {
                            id: cmb[1],
                            owners,
                            new_owners: Object.keys(tile.owner)
                        })
                    } else {
                        const [player1, player2] = diceFight({
                            player1: {
                                id: cmb[0],
                                is_owner: player_owner === cmb[0],
                                units: tile.owner[cmb[0]].units
                            },
                            player2: {
                                id: cmb[1],
                                is_owner: player_owner === cmb[1],
                                units: tile.owner[cmb[1]].units
                            }
                        })
                        if (player1.add < 0) {
                            updateFight({
                                game_id,
                                tile_id,
                                player_looser: player1.id,
                                player_winner: player2.id
                            })
                        } else if (player2.add < 0) {
                            updateFight({
                                game_id,
                                tile_id,
                                player_looser: player2.id,
                                player_winner: player1.id
                            })
                        }
                    }
                    // console.log(result)
                })
            }
        }
        collector.emit()
        // console.log(game.sub.players)
    }
}

function startRecruiting() {
    const n = now()
    const { games } = state
    for (const game_id in games) {
        const collector = collect()
        const game = games[game_id]
        const sub = game.sub
        const recruit_start = sub.recruit_start
        const recruit_end = sub.recruit_end
        const recruiting = sub.recruiting
        if (!recruiting && n >= recruit_start) {
            // console.log('start recruitment', new Date(recruit_start * 1000))
            sub.recruiting = true
            const players = sub.players
            for (const player_index in players) {
                players[player_index].clicks = 0
            }
        } else if (recruiting && n >= recruit_end) {
            // console.log('end recruitment', new Date(recruit_end * 1000))
            changeRecruitmentTimes({ game_id })
        }
        // else if (game.sub.recruiting) {
        // console.log('recruiting!', new Date(n * 1000))
        // }
        collector.emit()
    }
}

module.exports = {
    startCron
}

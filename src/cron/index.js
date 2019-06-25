const { collect } = require('dop')
const { GAME_STATUS } = require('runandrisk-common/const')
const { now } = require('runandrisk-common/utils')
const Combinatorics = require('js-combinatorics')
const { GAME } = require('../const/parameters')
const state = require('../store/state')
const { changeTileUnitsFilter } = require('../store/filters')
const {
    startGame,
    changeTileUnits,
    updateFight,
    deleteTroops,
    changeRecruitmentTimes,
    deployUnits
} = require('../store/actions')
const { getOwnerFromTile } = require('../store/getters')
const { diceFight } = require('../rules')
const { calcRecruitment } = require('runandrisk-common/rules')

function startCron() {
    const interval = setInterval(() => {
        finishGame()
        launchGames()
        updateTroops()
        makeFights()
        startRecruiting()
    }, GAME.CRON_INTERVAL)
}

function finishGame() {
    const n = now()
    const { games, players } = state
    for (const game_id in games) {
        const game = games[game_id]
        if (n > game.sub.ends_at) {
            for (const player_id in game.players) {
                delete players[player_id]
            }
            delete games[game_id]
        } else {
            game.sub.now = n
            // console.log('recruit_start', game.sub.recruit_start - game.sub.now)
            // console.log('recruit_end', game.sub.recruit_end - game.sub.now)
            // console.log('ends_at', game.sub.ends_at - game.sub.now)
            // console.log('----')
        }
    }
}

function launchGames() {
    const n = now()
    const { games } = state
    for (const game_id in games) {
        const game = games[game_id]
        if (
            game.sub.status === GAME_STATUS.WAITING_PLAYERS &&
            game.sub.players_total >= GAME.MIN_PLAYERS &&
            game.sub.starts_at - n === 0
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
                        // console.log('cmb[0]', {
                        //     id: cmb[0],
                        //     owners,
                        //     new_owners: Object.keys(tile.owner)
                        // })
                    } else if (tile.owner[cmb[1]] === undefined) {
                        // console.log('cmb[1]', {
                        //     id: cmb[1],
                        //     owners,
                        //     new_owners: Object.keys(tile.owner)
                        // })
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
        collector.emit(changeTileUnitsFilter({ game_id }))
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
        const players = sub.players
        if (!recruiting && n >= recruit_start) {
            sub.recruiting = true
            for (const player_index in players) {
                players[player_index].clicks = 0
                players[player_index].recruited = 0
            }
        } else if (recruiting && n >= recruit_end) {
            changeRecruitmentTimes({ game_id })
            for (const player_index in players) {
                const player = players[player_index]
                player.recruited = calcRecruitment(player)
            }
            deployUnits({ game_id })
        }
        collector.emit(changeTileUnitsFilter({ game_id }))
    }
}

module.exports = {
    startCron
}

const { createObserver } = require('dop')
const { randomInt } = require('runandrisk-common/utils')
const { distance } = require('runandrisk-common/board')
const NICKNAMES = require('./nicknames')
const { getMaxUnitsFromTile, getOwnerFromTile } = require('../store/getters')

const TIME_BETWEEN_ATTACKS = 3000
const MIN_UNITS_TO_SEND_EMPTY = 5

function Bot({ createPlayer, joinPublicGame, changeTileUnits, createTroops }) {
    const node = {}
    const nickname = NICKNAMES[randomInt(0, NICKNAMES.length)]
    const player = createPlayer({ node, nickname })
    const player_id = player.id
    const { player_index, game } = joinPublicGame({ player_id })
    const sub = game.sub
    const game_id = game.id

    const observerStart = createObserver(() => {
        const board = sub.board
        const tile_units = {}
        let last_attack = 0
        const interval = setInterval(() => {
            for (const tile_id1 in board) {
                const tile1 = board[tile_id1]
                if (tile1.fighters.hasOwnProperty(player_index)) {
                    const fighters_from = Object.keys(tile1.fighters)
                    const units_from = tile1.fighters[player_index].units
                    for (const tile_id2 in board) {
                        const tile2 = board[tile_id2]
                        const fighters_to = Object.keys(tile2.fighters)

                        if (
                            tile_id1 !== tile_id2 &&
                            Date.now() - last_attack > TIME_BETWEEN_ATTACKS &&
                            distance({ tile1, tile2 }) === 1
                        ) {
                            let units = 0

                            if (units === 0) {
                                units = isTileEmpty({
                                    units_from,
                                    fighters_to,
                                    tile_units,
                                    tile_id2
                                })
                            }

                            if (units === 0) {
                                units = isNotOwnerAndIsLosing({
                                    units_from,
                                    game_id,
                                    tile_id: tile_id1,
                                    player_index
                                })
                            }

                            if (units > 0) {
                                last_attack = Date.now()
                                console.log({
                                    units_from,
                                    units,
                                    tile_id1,
                                    tile_id2
                                })
                                changeTileUnits({
                                    game_id,
                                    tile_id: tile_id1,
                                    player_index,
                                    units: -units
                                })
                                createTroops({
                                    game_id,
                                    player_index,
                                    tile_id_from: tile_id1,
                                    tile_id_to: tile_id2,
                                    units
                                })
                                tile_units[tile_id2] = units
                            }
                        }
                    }
                }
            }
        }, 1000)
        observerStart.destroy()
    })
    observerStart.observeProperty(sub, 'status')
}

function isTileEmpty({ units_from, fighters_to, tile_units, tile_id2 }) {
    return fighters_to.length === 0 && tile_units[tile_id2] === undefined
        ? Math.round(units_from / 2)
        : 0
}

function isNotOwnerAndIsLosing({ units_from, game_id, tile_id, player_index }) {
    const owner = getOwnerFromTile({
        game_id,
        tile_id
    })
    const units_max = getMaxUnitsFromTile({
        game_id,
        tile_id
    })
    return owner !== player_index && units_max / units_from > 2 ? units_from : 0
}

module.exports = { Bot }

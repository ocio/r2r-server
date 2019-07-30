const { createObserver } = require('dop')
const { randomInt } = require('runandrisk-common/utils')
const { distance } = require('runandrisk-common/board')
const { GAME_STATUS } = require('runandrisk-common/const')
const NICKNAMES = require('./nicknames')
const { getMaxUnitsFromTile, getOwnerFromTile } = require('../store/getters')
const { maxClicksBySecond } = require('../rules')

const TIME_INTERVAL = 1000
const TIME_BETWEEN_ATTACKS = 3000

function Bot({ createPlayer, joinPublicGame, changeTileUnits, createTroops }) {
    const node = {}
    const nickname = NICKNAMES[randomInt(0, NICKNAMES.length)]
    const player = createPlayer({ node, nickname })
    const player_id = player.id
    const { player_index, game } = joinPublicGame({ player_id })
    const sub = game.sub
    const game_id = game.id
    const max_clicks_by_second = maxClicksBySecond(1)
    const observerStart = createObserver(() => {
        const board = sub.board
        const temp_units = {}
        let last_attack = 0
        let interval
        if (sub.status === GAME_STATUS.PLAYING) {
            interval = setInterval(() => {
                if (sub.status === GAME_STATUS.PLAYING) {
                    // RECRUITING
                    if (
                        sub.now <= sub.recruit_end &&
                        sub.now >= sub.recruit_start
                    ) {
                        sub.players[player_index].clicks += randomInt(
                            Math.round(max_clicks_by_second / 2),
                            max_clicks_by_second
                        )
                    }
                    // MOVING
                    else {
                        for (const tile_id_from in board) {
                            const tile_from = board[tile_id_from]
                            if (
                                tile_from.fighters.hasOwnProperty(player_index)
                            ) {
                                for (const tile_id_to in board) {
                                    const tile_to = board[tile_id_to]
                                    if (
                                        tile_id_from !== tile_id_to &&
                                        Date.now() - last_attack >
                                            TIME_BETWEEN_ATTACKS &&
                                        distance({
                                            tile1: tile_from,
                                            tile2: tile_to
                                        }) === 1
                                    ) {
                                        let units = 0
                                        let type
                                        if (units === 0) {
                                            type = 'ifTileEmpty'
                                            units = ifTileEmpty({
                                                tile_from,
                                                tile_to,
                                                player_index,
                                                temp_units
                                            })
                                        }

                                        if (units === 0) {
                                            type = 'ifNotOwnerAndIsLosing'
                                            units = ifNotOwnerAndIsLosing({
                                                tile_from,
                                                tile_to,
                                                player_index,
                                                game_id
                                            })
                                        }

                                        if (units === 0) {
                                            type = 'ifConqueredTileNeedsHelp'
                                            units = ifConqueredTileNeedsHelp({
                                                tile_from,
                                                tile_to,
                                                player_index,
                                                game_id
                                            })
                                        }

                                        if (units === 0) {
                                            type = 'ifTileIsVeryAttackable'
                                            units = ifTileIsVeryAttackable({
                                                tile_from,
                                                tile_to,
                                                player_index,
                                                game_id
                                            })
                                        }

                                        if (units > 0) {
                                            last_attack = Date.now()
                                            // console.log({
                                            //     type,
                                            //     units_from:
                                            //         tile_from.fighters[player_index]
                                            //             .units,
                                            //     units,
                                            //     tile_id_from,
                                            //     tile_id_to
                                            // })
                                            changeTileUnits({
                                                game_id,
                                                tile_id: tile_id_from,
                                                player_index,
                                                units: -units
                                            })
                                            createTroops({
                                                game_id,
                                                player_index,
                                                tile_id_from: tile_id_from,
                                                tile_id_to: tile_id_to,
                                                units
                                            })
                                            temp_units[tile_id_to] = units
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }, TIME_INTERVAL)
        } else if (sub.status === GAME_STATUS.FINISHED) {
            clearInterval(interval)
            observerStart.destroy()
        }
    })
    observerStart.observeProperty(sub, 'status')
}

function ifTileEmpty({ tile_from, tile_to, player_index, temp_units }) {
    const units_from = tile_from.fighters[player_index].units
    return Object.keys(tile_to.fighters).length === 0 &&
        temp_units[tile_to.id] === undefined
        ? Math.round(units_from / 2)
        : 0
}

function ifNotOwnerAndIsLosing({ tile_from, tile_to, player_index, game_id }) {
    const units_from = tile_from.fighters[player_index].units
    const owner = getOwnerFromTile({
        game_id,
        tile_id: tile_from.id
    })
    const units_max = getMaxUnitsFromTile({
        game_id,
        tile_id: tile_from.id
    })
    return Object.keys(tile_from.fighters).length > 1 &&
        owner !== player_index &&
        units_max / units_from > 2
        ? units_from
        : 0
}

function ifConqueredTileNeedsHelp({
    tile_from,
    tile_to,
    player_index,
    game_id
}) {
    if (!tile_to.fighters.hasOwnProperty(player_index)) {
        return 0
    }
    const owner_to = getOwnerFromTile({
        game_id,
        tile_id: tile_to.id
    })
    const units_from = tile_from.fighters[player_index].units
    const units_to = tile_to.fighters[player_index].units
    const units_max = getMaxUnitsFromTile({
        game_id,
        tile_id: tile_from.id
    })
    return owner_to === player_index &&
        units_max / units_to > 2 &&
        Object.keys(tile_to.fighters).length > 1 &&
        Object.keys(tile_from.fighters).length === 1
        ? Math.round(units_from / 2)
        : 0
}

function ifTileIsVeryAttackable({ tile_from, tile_to, player_index, game_id }) {
    const units_from = tile_from.fighters[player_index].units
    const units_max = getMaxUnitsFromTile({
        game_id,
        tile_id: tile_to.id
    })
    return units_from > 30 &&
        Object.keys(tile_to.fighters).length > 0 &&
        Object.keys(tile_from.fighters).length === 1 &&
        units_from / units_max > 3
        ? Math.round(units_from / 2)
        : 0
}

module.exports = { Bot }

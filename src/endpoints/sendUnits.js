const { isLogged, isValidGame, isPlayerInGame } = require('../validators')
const { getPlayerFromArgs, getGame } = require('../store/getters')
const { distance } = require('runandrisk-common/board')

function sendUnits({ game_id, tile_id_from, tile_id_to, units }, ...args) {
    if (typeof tile_id_from !== 'string') {
        throw '`tile_id_from` must be passed'
    }
    if (typeof tile_id_to !== 'string') {
        throw '`tile_id_to` must be passed'
    }
    if (typeof units !== 'number') {
        throw 'A number of `units` must be passed'
    }
    if (units < 1) {
        throw 'You must send at least one unit'
    }
    const player = getPlayerFromArgs(args)
    const game = getGame({ game_id })
    const player_index = game.players[player.id]
    const board = game.sub.board
    const tile_from = board[tile_id_from]
    const tile_to = board[tile_id_to]
    if (tile_from === undefined) {
        throw 'Invalid `tile_id_from`'
    }
    if (tile_to === undefined) {
        throw 'Invalid `tile_id_to`'
    }
    if (distance({ tile1: tile_from, tile2: tile_to }) !== 1) {
        throw 'Invalid distance to send units'
    }
    if (tile_from.owner[player_index] === undefined) {
        throw 'No units in this tile yet'
    }
    const units_availables = tile_from.owner[player_index].units
    if (units > units_availables) {
        throw 'Not enough units to send'
    }
    return { tile_id_from, tile_id_to, units, units_availables }
}

module.exports = isLogged(isValidGame(isPlayerInGame(sendUnits)))

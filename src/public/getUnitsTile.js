const { isLogged, isValidGame, isPlayerInGame } = require('../validators')
const { getPlayerFromArgs, getGame } = require('../store/getters')

function getUnitsTile({ game_id, tile_id }, ...args) {
    if (typeof tile_id !== 'string') {
        throw '`tile_id` must be passed'
    }
    const player = getPlayerFromArgs(args)
    const game = getGame({ game_id })
    const player_index = game.players[player.id]
    const board = game.sub.board
    const tile = board[tile_id]
    if (tile === undefined) {
        throw 'Invalid `tile_id`'
    }
    if (!tile.owner.hasOwnProperty(player_index)) {
        throw "You don't have units on this tile"
    }
    return tile.owner
}

module.exports = isLogged(isValidGame(isPlayerInGame(getUnitsTile)))

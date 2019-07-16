const { getNode } = require('dop')
const state = require('../store/state')
const rules = require('runandrisk-common/rules')

function getPlayer({ player_id }) {
    return state.players[player_id]
}

function getGame({ game_id }) {
    return state.games[game_id]
}

function getPlayerFromArgs(args) {
    const { player_id } = getNode(args)
    return getPlayer({ player_id })
}

function getOwnerFromTile({ game_id, tile_id }) {
    const game = state.games[game_id]
    const tile = game.sub.board[tile_id]
    const fighters = tile.fighters
    for (const player_index in fighters) {
        if (fighters[player_index].conquered === 100) {
            return player_index
        }
    }
}

// common
function isAllowedToSendUnits({
    game_id,
    player_index,
    tile_id_from,
    tile_id_to
}) {
    if (tile_id_from === tile_id_to) return false
    const owner_from = getOwnerFromTile({ game_id, tile_id: tile_id_from })
    const owner_to = getOwnerFromTile({ game_id, tile_id: tile_id_to })
    return rules.isAllowedToSendUnits({ owner_from, owner_to, player_index })
}

// function getPlayerIdByPlayerIndex({ game_id, player_index }) {}

// function getPlayerIdByPlayerIndex({ game_id, player_index }) {
//     const game = state.games[game_id]
//     for (const player_id in game.players)
//         if (game.players[player_id] === player_index) return player_id
// }

module.exports = {
    getPlayer,
    getGame,
    getPlayerFromArgs,
    getOwnerFromTile,
    isAllowedToSendUnits
}

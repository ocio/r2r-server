const { getNode } = require('dop')
const state = require('../store/state')

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

// common
function getOwnerFromTile({ game_id, tile_id }) {
    const game = state.games[game_id]
    const tile = game.sub.board[tile_id]
    const owner = tile.owner
    let player_index
    let index = Infinity
    for (const id in owner) {
        if (owner[id].index < index) {
            player_index = id
            index = owner[id].index
        }
    }
    return player_index
}

function isAllowedToSendUnits({
    game_id,
    player_index,
    tile_id_from,
    tile_id_to
}) {
    if (tile_id_from === tile_id_to) return false
    const owner_from = getOwnerFromTile({ game_id, tile_id: tile_id_from })
    const owner_to = getOwnerFromTile({ game_id, tile_id: tile_id_to })
    return (
        owner_from === player_index ||
        owner_to === player_index ||
        owner_to === undefined
    )
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

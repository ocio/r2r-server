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

// function getPlayerIdByPlayerIndex({ game_id, player_index }) {}

// function getPlayerIdByPlayerIndex({ game_id, player_index }) {
//     const game = state.games[game_id]
//     for (const player_id in game.players)
//         if (game.players[player_id] === player_index) return player_id
// }

module.exports = { getPlayer, getGame, getPlayerFromArgs }

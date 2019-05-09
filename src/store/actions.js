const state = require('./state')
const Player = require('../model/Player')
const { GAME_STATUS } = require('../const')

function createPlayer({ node, nickname }) {
    const player = new Player({ node, nickname })
    const id = player.id
    node.id = id
    state.players[id] = player
    console.log('createPlayer', Object.keys(state.players))
    return player
}

function getPlayer({ id }) {
    return state.players[id]
}

function deletePlayer({ id }) {
    const player = state.players[id]
    if (player !== undefined) {
        const game = state.games[player.game_id]
        if (game === undefined || (game !== undefined && !game.active)) {
            console.log('delete player')
            delete state.players[id]
        }
    }
    console.log('deletePlayer', Object.keys(state.players))
}

function getGame({ id }) {
    return state.games[id]
}

function joinNewGame({ player_id }) {
    const games = state.games
    for (let game_id in games) {
        const game = games[game_id]
        if (game.public && game.status === GAME_STATUS.WAITING_PLAYERS) {
            // add player logic
            // return game
        }
    }
}

module.exports = {
    createPlayer,
    getPlayer,
    deletePlayer,
    getGame,
    joinNewGame
    // addPlayer
}

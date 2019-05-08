const dop = require('dop')
const state = require('./state')

function createPlayer({ node, nickname }) {
    const id = dop.util.uuid(16)
    const player = {
        id,
        node, // node object
        nickname,
        game_id: undefined // current playing game
    }
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
        if (game.public && game.status === 'WAITING_FOR_PLAYERS') {
            // add player logic
            // return game
        }
    }
}

function createGame({ public = true }) {
    const id = dop.util.uuid(16)
    const game = {
        id,
        public,
        status: 'WAITING_FOR_PLAYERS',
        players: []
    }
    state.games[id] = game
    return game
}

module.exports = {
    createPlayer,
    getPlayer,
    deletePlayer,
    getGame,
    joinNewGame
    // addPlayer
}

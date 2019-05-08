const dop = require('dop')
const state = require('./state')

function createUser({ nickname }) {
    const id = dop.util.uuid(16) // this must be from the database
    const user = { id, nickname }
    state.users[id] = user
    return user
}

function createGame() {
    const id = dop.util.uuid(16)
    const game = { id, players: [] }
    state.matching_game_id = id
    state.games[id] = game
    return game
}

function getGame(game_id) {
    return state.games[game_id]
}

function getMatchingGameOrCreate() {
    return getGame(state.matching_game_id) === undefined
        ? createGame()
        : getGame(state.matching_game_id)
}

function addPlayer(game_id, player_id) {
    const game = getGame(game_id)
    game.players[player_id]
}

module.exports = {
    createUser,
    createGame,
    getGame,
    getMatchingGameOrCreate,
    addPlayer
}

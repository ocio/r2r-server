const state = require('./state')
const Player = require('../model/Player')
const Game = require('../model/Game')
const { GAME_STATUS } = require('../const')

function createPlayer({ node, nickname }) {
    const player = new Player({ node, nickname })
    const id = player.id
    node.player_id = id
    state.players[id] = player
    console.log('createPlayer')
    return player
}

function getPlayer({ player_id }) {
    return state.players[player_id]
}

function deletePlayer({ player_id }) {
    const player = getPlayer({ player_id })
    // Checking if player has a playing game
    let isPlaying = false
    player.games.forEach(game_id => {
        const game = getGame({ game_id })
        if (game.status === GAME_STATUS.WAITING_PLAYERS)
            deletePlayerFromGame({ game, player_id })
        else if (game.status === GAME_STATUS.PLAYING) {
            isPlaying = true
        }
    })
    if (!isPlaying) {
        delete state.players[player_id]
        console.log('deletePlayer', state.players, state.games)
    }
}

function createGame() {
    const game = new Game({ public: true })
    const id = game.id
    state.games[id] = game
    return game
}

function getGame({ game_id }) {
    return state.games[game_id]
}

function joinPublicGame({ player_id }) {
    const games = state.games
    for (const game_id in games) {
        const game = games[game_id]
        if (game.public && game.status === GAME_STATUS.WAITING_PLAYERS) {
            addPlayerToGame({ game, player_id })
            return game
        }
    }
    // Creating a new game and looping again
    createGame()
    return joinPublicGame({ player_id })
}

function addPlayerToGame({ game, player_id }) {
    const player = getPlayer({ player_id })
    game.players.push(player_id)
    player.games.push(game.id)
    console.log('addPlayerToGame', state.players, state.games)
}

function deletePlayerFromGame({ game, player_id }) {
    const player = getPlayer({ player_id })
    const index_player = game.players.indexOf(player_id)
    game.players.splice(index_player, 1)
    const index_game = player.games.indexOf(game.id)
    player.games.splice(index_game, 1)
    console.log('deletePlayerFromGame')
}

module.exports = {
    createPlayer,
    getPlayer,
    deletePlayer,
    getGame,
    joinPublicGame
    // addPlayer
}

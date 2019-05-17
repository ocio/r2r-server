const { action } = require('dop')
const { uuid } = require('../utils')
const state = require('./state')
const Player = require('../model/Player')
const Game = require('../model/Game')
const { GAME_STATUS, GAME_MATCHMAKING } = require('../const')

function createPlayer({ node, nickname }) {
    const id = 'Player_' + uuid(16, state.players)
    const player = new Player({ id, node, nickname })
    node.player_id = id
    state.players[id] = player
    return player
}

function getPlayer({ player_id }) {
    return state.players[player_id]
}

function deletePlayer({ player_id }) {
    const player = getPlayer({ player_id })
    // Checking if player has a playing game
    let isPlaying = false
    if (player !== undefined) {
        for (const game_id in player.games) {
            const game = getGame({ game_id })
            if (game.sub.status === GAME_STATUS.WAITING_PLAYERS)
                deletePlayerFromGame({ game, player_id })
            else if (game.sub.status === GAME_STATUS.PLAYING) {
                isPlaying = true
            }
        }
        if (!isPlaying) {
            delete state.players[player_id]
        }
    }
}

function createGame() {
    const id = 'Game_' + uuid(16, state.games)
    const game = new Game({ id, public: true })
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
        if (
            game.public &&
            game.sub.status === GAME_STATUS.WAITING_PLAYERS &&
            game.sub.players_total < GAME_MATCHMAKING.MAX_PLAYERS
        ) {
            const player_index = addPlayerToGame({ game, player_id })
            return { game, player_index }
        }
    }
    // Creating a new game and looping again
    createGame()
    return joinPublicGame({ player_id })
}

const addPlayerToGame = action(function({ game, player_id }) {
    const player = getPlayer({ player_id })
    const player_index = game.addPlayer({
        player_id,
        nickname: player.nickname
    })
    player.games[game.id] = player_index
    // If enough players we set the time the game will start
    if (
        game.sub.starts_at === undefined &&
        game.sub.players_total >= GAME_MATCHMAKING.MIN_PLAYERS
    ) {
        game.sub.starts_at = Date.now() + GAME_MATCHMAKING.TIMEOUT_TO_START
    }
    return player_index
})

const deletePlayerFromGame = action(({ game, player_id }) => {
    const player = getPlayer({ player_id })
    const player_index = game.removePlayer({ player_id })
    // If not enough players we set the time the game will start
    if (
        game.sub.starts_at !== undefined &&
        game.sub.players_total < GAME_MATCHMAKING.MIN_PLAYERS
    ) {
        delete game.sub.starts_at
    }
    delete player.games[player_index]
})

const startGame = action(({ game }) => {
    console.log('START GAME!!', game)
    game.sub.status = GAME_STATUS.PLAYING
})

module.exports = {
    createPlayer,
    getPlayer,
    deletePlayer,
    getGame,
    joinPublicGame,
    startGame
}

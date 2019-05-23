const { action } = require('dop')
const { uuid, shuffle } = require('../utils')
const state = require('./state')
const Player = require('../model/Player')
const Game = require('../model/Game')
const Instruction = require('../model/Instruction')
const {
    GAME_STATUS,
    GAME_MATCHMAKING,
    TILE_TYPE,
    INSTRUCTION
} = require('../const')
const generateBoard = require('../rules/generateBoard')
const getInitialUnits = require('../rules/getInitialUnits')
const getVillagesByPlayers = require('../rules/getVillagesByPlayers')

function createPlayer({ node, nickname }) {
    const id = 'Player_' + uuid(16, state.players)
    const player = Player({ id, node, nickname })
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
    const game = Game({ id, public: true })
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
    const players = game.sub.players
    const villages_total = getVillagesByPlayers({
        players: game.sub.players_total
    })
    const board = generateBoard({ villages: villages_total })
    const villages = shuffle(
        Object.keys(board).filter(
            board_id => board[board_id].type === TILE_TYPE.VILLAGE
        )
    )
    // console.log('START GAME!!', game, villages)
    game.sub.status = GAME_STATUS.PLAYING
    game.sub.board = board
    let index = 0
    for (const player_id in players) {
        const tile_id = villages[index]
        game.addInstruction(
            Instruction({
                type: INSTRUCTION.CONQUEST,
                data: { player_id, tile_id }
            })
        )
        game.addInstruction(
            Instruction({
                type: INSTRUCTION.ADD,
                data: { player_id, tile_id, units: getInitialUnits() }
            })
        )
        index += 1
    }
})

module.exports = {
    createPlayer,
    getPlayer,
    deletePlayer,
    getGame,
    joinPublicGame,
    startGame
}

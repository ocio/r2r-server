const { register, action } = require('dop')
const { uuid, sortByCount, now } = require('runandrisk-common/utils')
const state = require('./state')
const { getGame, getPlayer } = require('./getters')
const Player = require('../model/Player')
const Game = require('../model/Game')
const { TILE, GAME_STATUS } = require('runandrisk-common/const')
const { GAME_MATCHMAKING } = require('../const/parameters')
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
    game.sub = register(game.sub)
    state.games[id] = game
    return game
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
        game.sub.starts_at = now() + GAME_MATCHMAKING.TIMEOUT_TO_START
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

const startGame = ({ game_id }) => {
    const game = state.games[game_id]
    const sub = game.sub
    const players = sub.players
    const villages_total = getVillagesByPlayers({
        players: sub.players_total
    })
    const board = generateBoard({ villages: villages_total })
    const villages = sortByCount(
        Object.keys(board)
            .filter(board_id => board[board_id].type === TILE.VILLAGE)
            .map(board_id => board[board_id]),
        'power'
    )
    // console.log('START GAME!!', villages)

    action(() => {
        sub.status = GAME_STATUS.PLAYING
        sub.board = board
    })()

    let index = 0
    action(() => {
        for (const player_id in players) {
            const village = villages[index++]
            const tile_id = village.id
            changeTileUnits({
                game_id,
                tile_id,
                player_id,
                units: getInitialUnits()
            })
        }
    })()
}

const changeTileUnits = action(({ game_id, tile_id, player_id, units }) => {
    const game = state.games[game_id]
    const board = game.sub.board
    const tile = board[tile_id]
    if (tile.units[player_id] === undefined) {
        tile.units[player_id] = { units, index: tile.owner_index++ }
    } else {
        const new_units = (tile.units[player_id].units += units)
        if (new_units > 0) {
            tile.units[player_id].units = new_units
        } else {
            delete tile.units[player_id]
        }
    }
})

module.exports = {
    createPlayer,
    deletePlayer,
    joinPublicGame,
    startGame
}

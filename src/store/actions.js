const { register, collect, util } = require('dop')
const { uuid, sortByCount, now } = require('runandrisk-common/utils')
const state = require('./state')
const { getGame, getPlayer, getOwnerFromTile } = require('./getters')
const { changeTileUnitsFilter } = require('./filters')
const Player = require('../model/Player')
const Game = require('../model/Game')
const Troop = require('../model/Troop')
const { TILE, GAME_STATUS } = require('runandrisk-common/const')
const {
    nextRecruitment,
    stopRecruitment,
    gameStartsAt,
    gameEndsAt
} = require('../rules')
const { GAME } = require('../const/parameters')
const {
    generateBoard,
    getInitialUnits,
    getVillagesByPlayers,
    troopsArrivesAt
} = require('../rules')

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
            if (game !== undefined) {
                if (game.sub.status === GAME_STATUS.WAITING_PLAYERS)
                    deletePlayerFromGame({ game, player_id })
                else if (game.sub.status === GAME_STATUS.PLAYING) {
                    isPlaying = true
                }
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
            game !== undefined &&
            game.public &&
            game.sub.status === GAME_STATUS.WAITING_PLAYERS &&
            game.sub.players_total < GAME.MAX_PLAYERS
        ) {
            const player_index = addPlayerToGame({ game, player_id })
            return { game, player_index }
        }
    }
    // Creating a new game and looping again
    createGame()
    return joinPublicGame({ player_id })
}

function addPlayerToGame({ game, player_id }) {
    const collector = collect()
    const player = getPlayer({ player_id })
    const player_index = game.addPlayer({
        player_id,
        nickname: player.nickname
    })
    player.games[game.id] = player_index
    // If enough players we set the time the game will start
    if (
        game.sub.starts_at === undefined &&
        game.sub.players_total >= GAME.MIN_PLAYERS
    ) {
        game.sub.created_at = now()
        game.sub.starts_at = gameStartsAt(game.sub.created_at)
        game.sub.ends_at = gameEndsAt(game.sub.starts_at)
    }
    collector.emit()
    return player_index
}

function deletePlayerFromGame({ game, player_id }) {
    const collector = collect()
    const player = getPlayer({ player_id })
    const player_index = game.removePlayer({ player_id })
    // If not enough players we set the time the game will start
    if (
        game.sub.starts_at !== undefined &&
        game.sub.players_total < GAME.MIN_PLAYERS
    ) {
        delete game.sub.starts_at
    }
    delete player.games[player_index]
    collector.emit()
}

function startGame({ game_id }) {
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

    const collector = collect()
    sub.status = GAME_STATUS.PLAYING
    sub.board = board
    changeRecruitmentTimes({ game_id })
    collector.emit()

    const collector2 = collect()
    let index = 0
    for (const player_index in players) {
        const village = villages[index++]
        const tile_id = village.id
        const units = getInitialUnits()
        changeTileUnits({
            game_id,
            tile_id,
            player_index,
            units
        })
        changeGameUnits({
            game_id,
            player_index,
            units
        })
    }
    collector2.emit(changeTileUnitsFilter({ game_id }))
}

function changeRecruitmentTimes({ game_id }) {
    const collector = collect()
    const game = state.games[game_id]
    const sub = game.sub
    sub.recruiting = false
    sub.recruit_last = now()
    sub.recruit_start = nextRecruitment(sub.recruit_last)
    sub.recruit_end = stopRecruitment(sub.recruit_start)
    collector.emit()
}

function deployUnits({ game_id }) {
    const collector = collect()
    const game = state.games[game_id]
    const board = game.sub.board
    const players = game.sub.players
    const temp = {}
    for (const tile_id in board) {
        const tile = board[tile_id]
        const player_index = getOwnerFromTile({ game_id, tile_id })
        if (player_index !== undefined) {
            const { power, recruited } = players[player_index]
            const units = Math.round((tile.power * recruited) / power)
            if (temp[player_index] === undefined)
                temp[player_index] = { recruited, rest: recruited, tile_id }
            temp[player_index].rest -= units
            changeTileUnits({ game_id, tile_id, player_index, units })
        }
    }
    for (const player_index in temp) {
        const { recruited, rest, tile_id } = temp[player_index]
        changeGameUnits({ game_id, player_index, units: recruited })
        if (rest > 0) {
            changeTileUnits({ game_id, tile_id, player_index, units: rest })
        }
    }
    collector.emit(changeTileUnitsFilter({ game_id }))
}

function changeTileUnits({ game_id, tile_id, player_index, units }) {
    const collector = collect()
    const game = state.games[game_id]
    const tile = game.sub.board[tile_id]
    if (tile.owner[player_index] === undefined) {
        addOwnerTile({ game_id, tile_id, player_index, units })
    } else {
        const new_units = tile.owner[player_index].units + units
        if (new_units > 0) {
            tile.owner[player_index].units = new_units
        } else {
            removeOwnerTile({ game_id, tile_id, player_index })
        }
    }
    collector.emit(changeTileUnitsFilter({ game_id }))
}

function addOwnerTile({ game_id, tile_id, player_index, units }) {
    const collector = collect()
    const game = state.games[game_id]

    const tile = game.sub.board[tile_id]
    tile.owner[player_index] = { units, index: tile.owner_index++ }

    // const tile = game.sub.board[tile_id]
    // const owners = util.merge({}, tile.owner)
    // owners[player_index] = { units, index: tile.owner_index++ }
    // tile.owner = owners

    if (Object.keys(tile.owner).length === 1) {
        const power = tile.power
        changeGamePower({ game_id, player_index, power })
    }
    collector.emit()
}

function removeOwnerTile({ game_id, tile_id, player_index }) {
    const collector = collect()
    const game = state.games[game_id]
    const tile = game.sub.board[tile_id]
    const power = tile.power
    const owner_before = getOwnerFromTile({ game_id, tile_id })
    delete tile.owner[player_index]
    const owner_after = getOwnerFromTile({ game_id, tile_id })
    if (player_index === owner_before) {
        changeGamePower({ game_id, player_index: owner_before, power: -power })
    }
    if (owner_after !== undefined && owner_after !== owner_before) {
        changeGamePower({ game_id, player_index: owner_after, power: power })
    }
    collector.emit()
}

function changeGameUnits({ game_id, player_index, units }) {
    const players = state.games[game_id].sub.players
    if (players[player_index].units + units > -1) {
        players[player_index].units += units
    }
}

function changeGameKills({ game_id, player_index, kills }) {
    const players = state.games[game_id].sub.players
    players[player_index].kills += kills
}

function changeGamePower({ game_id, player_index, power }) {
    const players = state.games[game_id].sub.players
    players[player_index].power += power
}

function updateFight({
    game_id,
    tile_id,
    player_looser,
    player_winner,
    kills = 1
}) {
    const collector = collect()
    changeGameKills({
        game_id,
        player_index: player_winner,
        kills
    })
    changeGameUnits({
        game_id,
        player_index: player_looser,
        units: -kills
    })
    changeTileUnits({
        game_id,
        tile_id,
        player_index: player_looser,
        units: -kills
    })
    collector.emit()
}

function createTroops({
    game_id,
    player_index,
    tile_id_from,
    tile_id_to,
    units
}) {
    const collector = collect()
    const game = state.games[game_id]
    const id = 'Troop_' + uuid(16, game.sub.troops)
    const leaves_at = now()
    const arrives_at = troopsArrivesAt(leaves_at)
    const troop = Troop({
        id,
        player_index,
        tile_id_from,
        tile_id_to,
        units,
        leaves_at,
        arrives_at
    })
    game.sub.troops[id] = troop
    collector.emit((mts, node) =>
        mts.filter(m => game.players[node.player_id] === player_index)
    )
}

function deleteTroops({ game_id, troop_id }) {
    const game = state.games[game_id]
    delete game.sub.troops[troop_id]
}

module.exports = {
    createPlayer,
    deletePlayer,
    joinPublicGame,
    startGame,
    changeTileUnits,
    changeGameUnits,
    changeGameKills,
    updateFight,
    createTroops,
    deleteTroops,
    changeRecruitmentTimes,
    deployUnits
}

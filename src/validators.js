const { getPlayerFromArgs, getGame } = require('./store/getters')

function isLogged(f) {
    return (...args) => {
        if (getPlayerFromArgs(args) === undefined) throw 'Not logged'
        return f(...args)
    }
}

function isValidGame(f) {
    return (...args) => {
        const { game_id } = args[0]
        if (getGame({ game_id }) === undefined) throw 'Game not found'
        return f(...args)
    }
}

function isPlayerInGame(f) {
    return (...args) => {
        const player = getPlayerFromArgs(args)
        const { game_id } = args[0]
        const game = getGame({ game_id })
        if (game.players[player.id] === undefined)
            throw 'Player not found in this game'
        return f(...args)
    }
}

module.exports = { isLogged, isValidGame, isPlayerInGame }

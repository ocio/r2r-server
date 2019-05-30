const { isLogged, isValidGame } = require('../validators')
const { getGame } = require('../store/getters')

function gameSubscription({ game_id }, ...args) {
    const game = getGame({ game_id })
    return game.sub
}

module.exports = isLogged(isValidGame(gameSubscription))

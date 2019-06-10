const { isLogged } = require('../validators')
const { getPlayerFromArgs } = require('../store/getters')
const { joinPublicGame } = require('../store/actions')

function findGame(...args) {
    const player = getPlayerFromArgs(args)
    const player_id = player.id
    // We must remove this when we want multiple games per player
    if (Object.keys(player.games).length === 0) {
        const { game, player_index } = joinPublicGame({ player_id })
        return { game_id: game.id, player_index }
    } else {
        throw 'This player is already playing'
    }
}

module.exports = isLogged(findGame)

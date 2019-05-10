const { getNode } = require('dop')
const { getPlayer, getGame } = require('../store/actions')

function gameSubscription({ game_id }, ...args) {
    const node = getNode(args)
    const player_id = node.player_id
    const player = getPlayer({ player_id })
    if (player === undefined) {
        throw 'Not logged'
    }
    const game = getGame({ game_id })
    if (game === undefined) {
        throw 'Game not found'
    }
    return game.sub
}

module.exports = gameSubscription

const { getNode } = require('dop')
const { getPlayer, joinPublicGame } = require('../store/actions')

function findGame(...args) {
    const node = getNode(args)
    const player_id = node.player_id
    if (getPlayer({ player_id }) === undefined) {
        throw 'Not logged'
    }
    const player = getPlayer({ player_id })
    // We must remove this when we want multiple games per player
    if (Object.keys(player.games).length === 0) {
        const { game, player_index } = joinPublicGame({ player_id })
        return { game_id: game.id, player_index }
    } else {
        throw 'This player is already playing'
    }
}

module.exports = findGame

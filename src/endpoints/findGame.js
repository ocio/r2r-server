const { getNode } = require('dop')
const { getPlayer, joinPublicGame } = require('../store/actions')

function findGame(...args) {
    const node = getNode(args)
    if (
        node === undefined ||
        getPlayer({ player_id: node.player_id }) === undefined
    ) {
        throw 'Not logged'
    }
    const player_id = node.player_id
    const player = getPlayer({ player_id })
    // We must remove this when we want multiple games per player
    if (player.games.length === 0) {
        const game = joinPublicGame({ player_id })
        return game.id
    } else {
        throw 'This player is already playing'
    }
}

module.exports = findGame

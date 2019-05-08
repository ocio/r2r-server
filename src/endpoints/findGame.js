const { getNode } = require('dop')
const { getPlayer, getGame, joinNewGame } = require('../store/actions')

function findGame(...args) {
    const node = getNode(args)
    if (node === undefined || getPlayer({ id: node.id }) === undefined)
        throw 'Not logged'
    const player = getPlayer({ id: node.id })
    const player_id = player.game_id
    const game_id = player.game_id
    if (game_id === undefined) {
        return joinNewGame({ player_id })
    } else {
        return getGame({ id: game_id })
    }
}

module.exports = findGame

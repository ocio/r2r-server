const { getNode } = require('dop')
// const state = require('../store/state')
const { getMatchingGameOrCreate, addPlayer } = require('../store/actions')

function joinGame(...args) {
    const gameId = args[0]
    if (typeof gameId == 'string') {
    } else {
        const game = getMatchingGameOrCreate()
        const node = getNode(args)
        const output = { game_id: game.id, player_id: node.token }
        addPlayer(output)
        return output
    }
}

module.exports = joinGame

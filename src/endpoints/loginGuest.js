const { getNode } = require('dop')
const { createPlayer } = require('../store/actions')

function loginGuest({ nickname }, ...args) {
    if (typeof nickname !== 'string') throw '`nickname` must be passed'
    const node = getNode(args)
    const player = createPlayer({ node, nickname })
    return player.id
}

module.exports = loginGuest

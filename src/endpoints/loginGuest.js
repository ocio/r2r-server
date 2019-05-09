const { getNode } = require('dop')
const { createPlayer } = require('../store/actions')

function loginGuest({ nickname }, ...args) {
    if (typeof nickname !== 'string') throw '`nickname` must be passed'
    const node = getNode(args)
    const player = createPlayer({ node, nickname })
    return {
        player_id: player.id,
        nickname: player.nickname,
        games: player.games
    }
}

module.exports = loginGuest

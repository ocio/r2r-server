const { register, collect, util } = require('dop')

function Bot({ createPlayer, joinPublicGame, game }) {
    console.log('Bot()')
    const node = {}
    const nickname = 'Pacopil' + Math.random()
    const player = createPlayer({ node, nickname })
    const player_id = player.id
    joinPublicGame({ player_id })
}

module.exports = { Bot }

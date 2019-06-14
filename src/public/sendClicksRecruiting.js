const { now } = require('runandrisk-common/utils')
const { isLogged, isValidGame, isPlayerInGame } = require('../validators')
const { getPlayerFromArgs, getGame } = require('../store/getters')

function sendClicksRecruiting({ game_id }, ...args) {
    const game = getGame({ game_id })
    const n = now()
    if (!(n >= game.sub.recruit_start && n <= game.sub.recruit_end)) {
        throw 'Game is not in recruiting phase'
    }
    const player = getPlayerFromArgs(args)
    const player_index = game.players[player.id]
    game.sub.players[player_index].clicks += 1
    // console.log({ player_index })
}

module.exports = isLogged(isValidGame(isPlayerInGame(sendClicksRecruiting)))

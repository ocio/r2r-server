const { now } = require('runandrisk-common/utils')
const { isLogged, isValidGame, isPlayerInGame } = require('../validators')
const { getPlayerFromArgs, getGame } = require('../store/getters')
const { maxClicksBySecond } = require('../rules')

function sendClicksRecruiting({ game_id }, ...args) {
    const game = getGame({ game_id })
    const n = now()
    if (!(n >= game.sub.recruit_start && n <= game.sub.recruit_end)) {
        throw 'Game is not in recruiting phase'
    }
    const player = getPlayerFromArgs(args)
    const player_index = game.players[player.id]
    const seconds = n + 1 - game.sub.recruit_start
    const max = maxClicksBySecond(seconds)
    const clicks = game.sub.players[player_index].clicks
    if (clicks + 1 < max) {
        game.sub.players[player_index].clicks += 1
        // console.log({ player_index, seconds, max, clicks })
    }
}

module.exports = isLogged(isValidGame(isPlayerInGame(sendClicksRecruiting)))

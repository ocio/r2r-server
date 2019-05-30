const { isLogged } = require('../validators')
const { getPlayerFromArgs } = require('../store/getters')

function sendUnits({ game_id, tile_id_from, tile_id_to, units }, ...args) {
    if (typeof tile_id_from !== 'string') throw '`tile_id_from` must be passed'
    if (typeof tile_id_to !== 'string') throw '`tile_id_to` must be passed'
    if (typeof units !== 'number') throw 'A number of `units` must be passed'
    const player = getPlayerFromArgs(args)
    const player_id = player.id
    return { player_id, tile_id_from, tile_id_to, units }
}

module.exports = isLogged(sendUnits)

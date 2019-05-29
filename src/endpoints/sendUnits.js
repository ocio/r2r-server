const { getNode } = require('dop')
// const { createPlayer } = require('../store/actions')

function sendUnits({ tile_id_from, tile_id_to, units }, ...args) {
    if (typeof tile_id_from !== 'string') throw '`tile_id_from` must be passed'
    if (typeof tile_id_to !== 'string') throw '`tile_id_to` must be passed'
    if (typeof units !== 'number') throw 'A number of `units` must be passed'
    const node = getNode(args)
}

module.exports = sendUnits

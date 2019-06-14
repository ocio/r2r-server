const { util } = require('dop')
const state = require('./state')

function changeTileUnitsFilter({ game_id }) {
    return (mts, node) => {
        return mts
            .map(m => {
                const mutation = util.merge({}, m)
                mutation.object = m.object
                return mutation
            })
            .filter(m => {
                if (m.path[3] === 'owner' && m.hasOwnProperty('value')) {
                    const game = state.games[game_id]
                    const node_player_index = game.players[node.player_id]
                    const tile_id = m.path[2]
                    const tile = game.sub.board[tile_id]
                    const player_index = m.path[4] || m.prop
                    if (
                        node_player_index !== player_index &&
                        !tile.owner.hasOwnProperty(node_player_index)
                    ) {
                        // Arrival
                        if (m.value.hasOwnProperty('units'))
                            m.value.units = null
                        // Update
                        else return false
                    }
                }
                return true
            })
    }
}

module.exports = { changeTileUnitsFilter }

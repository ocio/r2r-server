function Tile({ id, col, row, type }) {
    return {
        id,
        col,
        row,
        type,
        units: {
            // [<player_id]: 1000
        }
    }
}

module.exports = Tile

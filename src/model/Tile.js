function Tile({ id, col, row, type }) {
    return {
        id,
        col,
        row,
        type,
        owner: null, // player_index,
        fighters: {
            // [<player_index]: {units:1000, index:0}
        }
    }
}

module.exports = Tile

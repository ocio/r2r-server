function Troop({
    id,
    player_index,
    tile_id_from,
    tile_id_to,
    units,
    leaves_at,
    arrives_at
}) {
    return {
        id,
        player_index,
        tile_id_from,
        tile_id_to,
        units,
        leaves_at,
        arrives_at
    }
}

module.exports = Troop

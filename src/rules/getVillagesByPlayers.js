function getVillagesByPlayers({ players = 2 }) {
    return players * 2
    const villages = {
        2: 4,
        3: 6,
        4: 8,
        5: 10,
        6: 12,
        7: 14,
        8: 16
    }
    return villages[players]
}

module.exports = getVillagesByPlayers

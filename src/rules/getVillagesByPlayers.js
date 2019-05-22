function getVillagesByPlayers({ players = 2 }) {
    const villages = {
        2: 4,
        3: 6,
        4: 8,
        5: 9,
        6: 10,
        7: 12,
        8: 14
    }
    return villages[players]
}

module.exports = getVillagesByPlayers

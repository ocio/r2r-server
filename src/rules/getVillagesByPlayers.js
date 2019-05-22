function getVillagesByPlayers({ players = 2 }) {
    const villages = {
        2: 4,
        3: 6,
        4: 8,
        5: 10,
        6: 12
    }
    return villages[players]
}

module.exports = getVillagesByPlayers

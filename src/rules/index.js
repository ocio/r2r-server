const generateBoard = require('./generateBoard')

function getVillagesByPlayers({ players = 2 }) {
    return players * 2
    // const villages = {
    //     2: 4,
    //     3: 6,
    //     4: 8,
    //     5: 10,
    //     6: 12,
    //     7: 14,
    //     8: 16
    // }
    // return villages[players]
}

function getInitialUnits() {
    return 1000
}

function troopsArrivesAt({ leaves_at }) {
    return leaves_at + 30
}

module.exports = {
    generateBoard,
    getVillagesByPlayers,
    getInitialUnits,
    troopsArrivesAt
}

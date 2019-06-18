const generateBoard = require('./generateBoard')
const { minOrMax, getBestDice } = require('runandrisk-common/utils')

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

function nextRecruitment(n) {
    return n + 3 * 60 // timestamp + minutes * seconds
}

function stopRecruitment(n) {
    return n + 30 // timestamp + seconds
}

function calcRecruitment({ power, clicks }) {
    return Math.round((power * clicks) / 10)
}

function getInitialUnits() {
    return 1000
}

function troopsArrivesAt(leaves_at) {
    return leaves_at + 15 // seconds
}

function diceFight({ player1, player2 }) {
    const factor1 = Math.round(player1.units / player2.units)
    const factor2 = Math.round(player2.units / player1.units)
    const min = 1
    const max_dices = 6
    const dice_size = 6
    const throws1 = minOrMax({ number: factor1, min, max: max_dices })
    const throws2 = minOrMax({ number: factor2, min, max: max_dices })
    const dices1 = getBestDice({ throws: throws1, dice_size })
    const dices2 = getBestDice({ throws: throws2, dice_size })
    const dice1 = dices1.dice
    const dice2 = dices2.dice
    return [
        {
            id: player1.id,
            add:
                dice1 < dice2 || (dice1 === dice2 && player2.is_owner) ? -1 : 0,
            dice: dice1,
            dices: dices1.dices
        },
        {
            id: player2.id,
            add:
                dice2 < dice1 || (dice1 === dice2 && player1.is_owner) ? -1 : 0,
            dice: dice2,
            dices: dices2.dices
        }
    ]
}

module.exports = {
    generateBoard,
    getVillagesByPlayers,
    getInitialUnits,
    troopsArrivesAt,
    diceFight,
    nextRecruitment,
    stopRecruitment,
    calcRecruitment
}

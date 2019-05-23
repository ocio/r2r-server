const Honeycomb = require('honeycomb-grid')
const { BOARD } = require('../const/parameters')
const { TILE } = require('runandrisk-common/const')
const { shuffle } = require('../utils')
const Tile = require('../model/Tile')
const Grid = Honeycomb.defineGrid()

function generateBoard({ villages = 0 }) {
    const tiles = generateBoardRecursive({
        tiles: {},
        col: 0,
        row: 0,
        villages_inc: 0,
        villages
    })
    let range = 0
    for (const id in tiles) {
        const tile = tiles[id]
        delete tile.checked
        if (tile.type === TILE.VILLAGE) {
            Grid.hexagon({
                radius: 1,
                center: [tile.col, tile.row]
            }).forEach(hex => {
                const id = getIdTile(hex)
                const max = Math.max(Math.abs(hex.x), Math.abs(hex.y))
                if (max > range) range = max
                if (tiles[id] === undefined) {
                    tiles[id] = Tile({
                        id,
                        col: hex.x,
                        row: hex.y,
                        type: TILE.COTTAGE
                    })
                }
            })
        }
    }

    // console.log(Math.max(2, range - 2))
    for (const id in tiles) {
        const tile = tiles[id]
        const neighbors = calcPower({
            tiles,
            id,
            range: BOARD.RANGE_NEIGHBORS //Math.max(2, range - 1)
        })
        tile.power = neighbors
    }

    return tiles
}

function calcPower({ tiles, id, range }) {
    const { col, row, type } = tiles[id]
    let cottages = 0
    let villages_inc = 0
    Grid.hexagon({
        radius: range,
        center: [col, row]
    })
        .filter(
            hex =>
                tiles[getIdTile(hex)] !== undefined &&
                !(hex.x === col && hex.y === row)
        )
        .forEach(hex => {
            const tile = tiles[getIdTile(hex)]
            if (tile.type === TILE.COTTAGE) cottages += 1
            else villages_inc += 1
        })
    return (
        (cottages * BOARD.COTTAGE_MULTIPLY_NEIGHBORS +
            villages_inc * BOARD.VILLAGE_MULTIPLY_NEIGHBORS) *
        (type === TILE.COTTAGE
            ? BOARD.COTTAGE_MULTIPLY
            : BOARD.VILLAGE_MULTIPLY)
    )
}

function generateBoardRecursive({ tiles, col, row, villages_inc, villages }) {
    shuffle(
        Grid.hexagon({
            radius: 1,
            center: [col, row]
        })
    ).forEach(hex => {
        const id = getIdTile(hex)
        if (tiles[id] === undefined) {
            const type =
                villages_inc >= villages ||
                hasVillageNeighbors(tiles, hex.x, hex.y)
                    ? TILE.COTTAGE
                    : TILE.VILLAGE
            tiles[id] = Tile({
                id,
                col: hex.x,
                row: hex.y,
                type
            })
            if (type === TILE.VILLAGE) villages_inc += 1
        }
        if (hex.x === col && hex.y === row) {
            tiles[id].checked = true
        }
    })
    if (villages_inc < villages) {
        const tile = getUncheckedTile(tiles)
        return generateBoardRecursive({
            tiles,
            col: tile.col,
            row: tile.row,
            villages_inc,
            villages
        })
    }
    return tiles
}

function getUncheckedTile(tiles) {
    for (const id in tiles) {
        if (!tiles[id].checked) return tiles[id]
    }
}

function getIdTile(hex) {
    return `${hex.x}.${hex.y}`
}

function hasVillageNeighbors(tiles, col, row) {
    const hexs = Grid.hexagon({
        radius: 1,
        center: [col, row]
    })
    for (let i = 0; i < hexs.length; ++i) {
        const hex = hexs[i]
        const id = getIdTile(hex)
        if (
            tiles[id] !== undefined &&
            tiles[id].type === TILE.VILLAGE &&
            !(hex.x === col && hex.y === row)
        ) {
            return true
        }
    }
    return false
}

module.exports = generateBoard

// console.log(generateBoard({ villages: 6 }))

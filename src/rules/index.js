const Honeycomb = require('honeycomb-grid')
const { TILE_TYPE, BOARD } = require('../const')
const { shuffle } = require('../utils')
const Grid = Honeycomb.defineGrid()

function generateBoard({ maxVillages }) {
    const tiles = generateBoardRecursive({
        tiles: {},
        col: 0,
        row: 0,
        villages: 0,
        maxVillages
    })
    let range = 0
    for (const id in tiles) {
        const tile = tiles[id]
        delete tile.checked
        if (tile.type === TILE_TYPE.VILLAGE) {
            Grid.hexagon({
                radius: 1,
                center: [tile.col, tile.row]
            }).forEach(hex => {
                const id = getIdTile(hex)
                const max = Math.max(Math.abs(hex.x), Math.abs(hex.y))
                if (max > range) range = max
                if (tiles[id] === undefined) {
                    tiles[id] = {
                        id,
                        col: hex.x,
                        row: hex.y,
                        type: TILE_TYPE.COTTAGE
                    }
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
    let villages = 0
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
            if (tile.type === TILE_TYPE.COTTAGE) cottages += 1
            else villages += 1
        })
    return (
        (cottages * BOARD.NEIGHBORS_MULTIPLY_COTTAGE +
            villages * BOARD.NEIGHBORS_MULTIPLY_VILLAGE) *
        (type === TILE_TYPE.COTTAGE
            ? BOARD.COTTAGE_MULTIPLY
            : BOARD.VILLAGE_MULTIPLY)
    )
}

function generateBoardRecursive({ tiles, col, row, villages, maxVillages }) {
    shuffle(
        Grid.hexagon({
            radius: 1,
            center: [col, row]
        })
    ).forEach(hex => {
        const id = getIdTile(hex)
        if (tiles[id] === undefined) {
            const type =
                villages >= maxVillages ||
                hasVillageNeighbors(tiles, hex.x, hex.y)
                    ? TILE_TYPE.COTTAGE
                    : TILE_TYPE.VILLAGE
            tiles[id] = {
                id,
                checked: false,
                col: hex.x,
                row: hex.y,
                type
            }
            if (type === TILE_TYPE.VILLAGE) villages += 1
        }
        if (hex.x === col && hex.y === row) {
            tiles[id].checked = true
        }
    })
    if (villages < maxVillages) {
        const tile = getUncheckedTile(tiles)
        return generateBoardRecursive({
            tiles,
            col: tile.col,
            row: tile.row,
            villages,
            maxVillages
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
            tiles[id].type === TILE_TYPE.VILLAGE &&
            !(hex.x === col && hex.y === row)
        ) {
            return true
        }
    }
    return false
}

module.exports = { generateBoard }

console.log(generateBoard({ maxVillages: 6 }))

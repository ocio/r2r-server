const generateBoard = require('../src/rules/generateBoard')

test('generateBoard is a function', () => {
    expect(typeof generateBoard).toBe('function')
})

test('Returns an object', () => {
    expect(typeof generateBoard({ maxVillages: 0 })).toBe('object')
})

test('Empty', () => {
    const board = generateBoard({ maxVillages: 0 })
    const keys = Object.keys(board)
    const tile = board[keys[0]]
    expect(typeof tile.id).toBe('string')
    expect(typeof tile.type).toBe('number')
    expect(typeof tile.col).toBe('number')
    expect(typeof tile.row).toBe('number')
})

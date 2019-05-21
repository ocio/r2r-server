const { generateBoard } = require('../src/rules')

test('generateBoard is a function', () => {
    expect(typeof generateBoard).toBe('function')
})

test('adds 1 + 2 to equal 3', () => {
    expect(generateBoard({ players: 3 })).toBe(3)
})

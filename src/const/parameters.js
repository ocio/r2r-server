const GAME = {
    CRON_INTERVAL: 1000, // ms
    MAX_PLAYERS: 4,
    MIN_PLAYERS: 2,
    GAME_STARTS_2: 1, // seconds
    GAME_STARTS_3: 1, // seconds
    GAME_ENDS_AT: 10 * 60, // minutes
    NEXT_RECRUITMENT: 2 * 60, // minutes
    STOP_RECRUITMENT: 20,
    INITIAL_UNITS: 300,
    TROOPS_ARRIVES_AT: 15,
    MAX_CLICKS_PER_SECOND: 10
}

const BOARD = {
    RANGE_NEIGHBORS: 3,
    COTTAGE_MULTIPLY_NEIGHBORS: 1,
    VILLAGE_MULTIPLY_NEIGHBORS: 2,
    COTTAGE_MULTIPLY: 1,
    VILLAGE_MULTIPLY: 5
}

module.exports = {
    GAME,
    BOARD
}

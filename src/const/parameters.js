const GAME = {
    CRON_INTERVAL: 500, // ms
    MIN_PLAYERS: 2,
    MAX_PLAYERS: 4,
    GAME_STARTS_AT: 5, // seconds
    GAME_ENDS_AT: 9 * 60, // minutes
    NEXT_RECRUITMENT: 3 * 60, // minutes
    STOP_RECRUITMENT: 20,
    INITIAL_UNITS: 1000,
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

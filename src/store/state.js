const { register } = require('dop')

const state = {
    matching_game_id: undefined,
    users: {}, // users connected
    games: {
        // [id]: {
        //     id,
        //     players: [
        //         { nickname: 'Paco' }
        //     ]
        // }
    }
}

module.exports = state

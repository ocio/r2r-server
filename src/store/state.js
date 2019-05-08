const { register } = require('dop')

const state = {
    players: {}, // players connected
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

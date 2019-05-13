const { onSubscribe, listen } = require('dop')
const { deletePlayer } = require('./store/actions')
const endpointsSubscription = require('./subscriptions/endpointsSubscription')
const gameSubscription = require('./subscriptions/gameSubscription')

const transport = listen({ port: 4444 })

onSubscribe((...args) => {
    const { type } = args[0]
    if (type === 'game') {
        return gameSubscription(...args)
    }
    return endpointsSubscription(...args)
})

transport.on('message', (node, message) => {
    report('(onmessage) ' + node.player_id + ' ' + message)
})

transport.on('disconnect', node => {
    deletePlayer({ player_id: node.player_id })
    report('(ondisconnect) ' + node.player_id)
})

function report(type) {
    console.log('')
    console.log(type)
    console.log('------------------------------------')
    const state = require('./store/state')
    console.log('GAMES:')
    Object.keys(state.games).forEach(game_id => {
        const game = state.games[game_id]
        console.log({
            game_id,
            players: Object.keys(game.players).length,
            state: game.sub.status
        })
    })
    console.log('PLAYERS:')
    Object.keys(state.players).forEach(player_id => {
        const player = state.players[player_id]
        console.log({ player_id, games: Object.keys(player.games).length })
    })
    console.log('-------------------------------------')
    console.log('')
}

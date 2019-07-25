const dop = require('dop')
const { onSubscribe, listen } = require('dop')
const { startCron } = require('./cron/')
const { deletePlayer } = require('./store/actions')
const endpointsSubscription = require('./public/endpointsSubscription')
const gameSubscription = require('./public/gameSubscription')

const port = 4444
const transport = listen({ port })
console.log({ port })
// startCron
startCron()

onSubscribe((...args) => {
    const { type } = args[0]
    if (type === 'game') {
        return gameSubscription(...args)
    }
    return endpointsSubscription(...args)
})

transport.on('message', (node, message) => {
    // report('(onmessage) ' + node.player_id + ' ' + message)
    // node.disconnect()
})

transport.on('disconnect', node => {
    deletePlayer({ player_id: node.player_id })
    // report('(ondisconnect) ' + node.player_id)
})

// setInterval(report, 10000)
function report(type = '') {
    console.log('------------------------------------')
    console.log(new Date().toString())

    // dop.util.path(dop.data.node, (source, prop, value, destiny, path, t) => {
    //     if (
    //         ((prop === 'requests' && path.length === 2) ||
    //             prop === 'pending') &&
    //         value &&
    //         typeof value == 'object'
    //     )
    //         console.log(path.join('.'), Object.keys(value).length) //
    // })

    const getFirst = o => {
        for (let i in o) return i
    }
    // console.log('')
    const { heapTotal, heapUsed } = process.memoryUsage()
    const state = require('./store/state')
    console.log({
        heapTotal: Math.round(heapTotal / (1024 * 1024)),
        heapUsed: Math.round(heapUsed / (1024 * 1024))
        // dop: JSON.stringify(dop.data).length
        // state: JSON.stringify(state).length,
    })

    console.log('dop:', {
        nodes: Object.keys(dop.data.node).length,
        paths: Object.keys(dop.data.path).length,
        observers: Object.keys(dop.data.observers).length
    })

    console.log('state:', {
        games: Object.keys(state.games).length,
        players: Object.keys(state.players).length,
        games_inc: state.games_inc
    })

    // console.log(JSON.stringify(dop.data.path).length)
    // console.log(dop.data.path)

    // console.log('')
    // console.log('GAMES:')
    // Object.keys(state.games).forEach(game_id => {
    //     const game = state.games[game_id]
    //     console.log({
    //         game_id,
    //         players: game.sub.players_total,
    //         state: game.sub.status
    //     })
    // })
    // console.log('')
    // console.log('PLAYERS:')
    // Object.keys(state.players).forEach(player_id => {
    //     const player = state.players[player_id]
    //     console.log({
    //         player_id,
    //         games: Object.keys(player.games).length,
    //         game: getFirst(player.games)
    //     })
    // })
    // console.log('-------------------------------------')
    // console.log('')
}

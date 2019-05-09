const { onSubscribe, listen } = require('dop')
const { deletePlayer } = require('./store/actions')
const endpointsSubscription = require('./subscriptions/endpointsSubscription')
const gameSubscription = require('./subscriptions/gameSubscription')

//
const transport = listen({ port: 4444 })

onSubscribe((...args) => {
    const { type } = args[0]
    if (type === 'game') {
        return gameSubscription(...args)
    }
    return endpointsSubscription(...args)
})

transport.on('disconnect', node => {
    console.log('onDisconnect')
    deletePlayer({ player_id: node.player_id })
})

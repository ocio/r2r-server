const { onSubscribe, listen } = require('dop')
const { deletePlayer } = require('./store/actions')
const endpoints = require('./endpoints')
const transport = listen({ port: 4444 })

onSubscribe(() => {
    return endpoints
})

transport.on('disconnect', node => {
    console.log('ondisconnect')
    deletePlayer({ id: node.id })
})

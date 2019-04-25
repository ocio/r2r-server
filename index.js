const dop = require('dop')
const transport = dop.listen({ port: 4444 })
transport.on('connect', () => {
    console.log('connect')
})
dop.onSubscribe(() => {
    console.log('onSubscribe')
    return {
        mola: function() {}
    }
})

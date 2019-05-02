const dop = require('dop')
const endpoints = require('./endpoints')
const transport = dop.listen({ port: 4444 })

dop.onSubscribe((...args) => {
    // const { node } = dop.getRequest(args)
    return endpoints
})

// transport.on('connect', node => {
//     const objects = Object.keys(dop.data.object).length
//     const nodes = Object.keys(dop.data.node).length
//     console.log('connect', { objects, nodes })
// })
// transport.on('message', (node, message) => {
//     // console.log('message', message)
// })
// transport.on('disconnect', node => {
//     console.log('disconnect')
// })

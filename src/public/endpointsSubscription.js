const endpoints = {
    loginGuest: require('../public/loginGuest'),
    findGame: require('../public/findGame'),
    sendUnits: require('../public/sendUnits')
}

function endpointsSubscription(...args) {
    return endpoints
}

module.exports = endpointsSubscription

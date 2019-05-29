const endpoints = {
    loginGuest: require('../endpoints/loginGuest'),
    findGame: require('../endpoints/findGame'),
    sendUnits: require('../endpoints/sendUnits')
}

function endpointsSubscription(...args) {
    return endpoints
}

module.exports = endpointsSubscription

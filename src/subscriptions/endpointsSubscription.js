const endpoints = {
    loginGuest: require('../endpoints/loginGuest'),
    findGame: require('../endpoints/findGame')
}

function endpointsSubscription(...args) {
    return endpoints
}

module.exports = endpointsSubscription

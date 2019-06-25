const endpoints = {
    loginGuest: require('../public/loginGuest'),
    findGame: require('../public/findGame'),
    sendUnits: require('../public/sendUnits'),
    sendClicksRecruiting: require('../public/sendClicksRecruiting'),
    getUnitsTile: require('../public/getUnitsTile')
}

function endpointsSubscription(...args) {
    return endpoints
}

module.exports = endpointsSubscription

const { createUser } = require('../store/actions')

function login({ nickname }) {
    if (typeof nickname !== 'string') throw '`nickname` must be passed'
    const user = createUser({ nickname })
    return user.id
}

module.exports = login

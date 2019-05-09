const dop = require('dop')

function uuid(length = 16, object = {}) {
    let id
    do {
        id = dop.util.uuid(length)
    } while (typeof object[id] == 'object')
    return id
}

module.exports = { uuid }

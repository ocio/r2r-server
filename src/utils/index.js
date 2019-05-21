const dop = require('dop')

function uuid(length = 16, object = {}) {
    let id
    do {
        id = dop.util.uuid(length)
    } while (typeof object[id] == 'object')
    return id
}

function randomInt(min, max) {
    const i = (Math.random() * 32768) >>> 0
    return (i % (min - max)) + min
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

module.exports = { uuid, randomInt, shuffle }

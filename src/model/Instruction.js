const { now } = require('../utils')

function Instruction({ type, data }) {
    return [now(), type, data]
}

module.exports = Instruction

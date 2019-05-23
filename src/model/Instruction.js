const { now } = require('runandrisk-common/utils')

function Instruction({ type, data }) {
    return [now(), type, data]
}

module.exports = Instruction

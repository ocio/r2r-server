const { now } = require('runandrisk-common/utils')

function Instruction({ type, data }) {
    return { time: now(), type, data }
}

module.exports = Instruction

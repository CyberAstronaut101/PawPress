const util = require('util')

/**
 * Deep logs out a object to console
 * @param {Any Object} object
 */
const objectLog = (object) => {
    console.log(util.inspect(object, false, null, true))
}

module.exports = objectLog

const mongoose = require('../config/mongoose')
const { toJSON, paginate } = require('./plugins')

const audioSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        description: {
            type: String
        },
        file: {
            type: String,
            required: true,
        }
    }
)

audioSchema.plugin(toJSON)

/**
 * @typedef Audio
 */
const Audio = mongoose.model('Audio', audioSchema)

module.exports = Audio
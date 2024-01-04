const mongoose = require('../config/mongoose')

const { toJSON } = require('./plugins')

const nodeSchema = mongoose.Schema(
    {
        ip_address: {
            type: String,
            required: true,
            unique: true
        },
        mac_address: {
            type: String,
            required: true,
            unique: true
        },
        description: {
            type: String
        },
        number_buttons: {
            type: Number,
            required: true
        },
        adopted: {
            type: Boolean,
            required: true,
            default: false
        },
        adopted_at: {
            type: Date
        },
    }
)

nodeSchema.plugin(toJSON)

/**
 * @typedef ControlNode
 */
const ControlNode = mongoose.model('ControlNode', nodeSchema)

module.exports = ControlNode
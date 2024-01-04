const mongoose = require('../config/mongoose')

const { toJSON, paginate } = require('./plugins')

const buttonSchema = mongoose.Schema(
    {
        button_number: {
            type: Number,
            required: true,
        },
        name: {
            type: String,
        },
        icon: {
            type: String,
        },
        description: {
            type: String
        },
        sound: {
            type: String,
        },
        control_node: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'ControlNode',
            required: true
        }
    }
)

buttonSchema.plugin(toJSON)

/**
 * @typedef Button
 */
const Button = mongoose.model('Button', buttonSchema)

module.exports = Button
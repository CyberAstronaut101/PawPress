const mongoose = require('../config/mongoose')

const { toJSON, paginate } = require('./plugins')

const buttonSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        icon: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        sound: {
            type: String,
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
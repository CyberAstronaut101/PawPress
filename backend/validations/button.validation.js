const Joi = require('joi');
const { objectId } = require('./custom.validation')

const updateButton = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        icon: Joi.string().required(),
        description: Joi.string().required(),
        sound: Joi.string().required(),
    })
}

const validIdParam = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId)
    })
}

module.exports = {
    validIdParam,
    updateButton
}
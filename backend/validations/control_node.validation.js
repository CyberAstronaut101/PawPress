const Joi = require('joi');
const { objectId } = require('./custom.validation')

const identifyNode = {
    body: Joi.object().keys({
        mac_address: Joi.string().required(),
        ip_address: Joi.string().required(),
        number_buttons: Joi.number().required()
    })
}

const adoptNode = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId)
    })
}

module.exports = {
    identifyNode,
    adoptNode
}
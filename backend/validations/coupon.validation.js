const Joi = require('joi');
const { objectId, ethAddress } = require('./custom.validation');

const userClaimCoupon = {
    body: Joi.object().keys({
        token_address: Joi.string().required().custom(ethAddress),
        token_id: Joi.number().required(),
        store_id: Joi.string().required().custom(objectId),
        campaign_id: Joi.string().required().custom(objectId),
        generation_group_id: Joi.string().required().custom(objectId),
    })
}

module.exports = {
    userClaimCoupon
}
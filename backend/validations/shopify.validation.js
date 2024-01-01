const Joi = require('joi')

const shopifyAuth = {
    query: Joi.object().keys({
        shop: Joi.string().required(),
        timestamp: Joi.string().required(),
        hmac: Joi.string().required(),
    }),
}

const getShop = {
    params: Joi.object().keys({
        shopId: Joi.string().required(),
    }),
}

const getShopCouponCollections = {
    params: Joi.object().keys({
        shopId: Joi.string().required(),
    }),
}

module.exports = {
    shopifyAuth,
    getShop,
    getShopCouponCollections,
}

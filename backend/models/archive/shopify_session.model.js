const mongoose = require('../config/mongoose')

const shopifySessionTokenSchema = mongoose.Schema({
    offline_session_token: { type: String, required: true },
    shop_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'ShopifyStore',
        required: true,
    }
})

const ShopifySessionToken = mongoose.model('ShopifySessionToken', shopifySessionTokenSchema)

module.exports = ShopifySessionToken;
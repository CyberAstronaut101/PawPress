const mongoose = require('../config/mongoose')

const claimedCouponSchema = mongoose.Schema({
    token_address: {
        type: String, required: true
    },
    token_id: {
        type: String, required: true
    },
    redeemer_address: {
        type: String, required: true
    },
    redeemer_user_id: {
        type: String
    },
    platform: {
        type: String,
        enum: ['shopify', 'unknown'],
        required: true,
        default: 'shopify'
    },
    shop_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'ShopifyStore',
        required: true,
    },
    campaign_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'CouponCampaign',
        required: true,
    },
    coupon_code: {
        type: String, required: true
    },
    date_redeemed: {
        type: Date
    },
    value_summary: {
        type: String
    }
})

// TODO possibly some validation strings
// doesClaimedCouponExist?

const ClaimedCoupon = mongoose.model('ClaimedCoupon', claimedCouponSchema);
module.exports = ClaimedCoupon;
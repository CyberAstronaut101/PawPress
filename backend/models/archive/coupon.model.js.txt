const mongoose = require('../config/mongoose')
const { toJSON, paginate } = require('./plugins')

const couponSchema = mongoose.Schema({
    nft_address: { type: String, required: true },
    nft_token_id: { type: String, required: true },
    coupon_code: { type: String, required: true },
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
    target_collection_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'TargetNftCollection',
        required: true,
    },
    shopify_metadata: {
        coupon_gid: String,
    },
    redeam_metadata: {
        has_redeemed: { type: Boolean, default: false },
        redeam_date: Date,
        redeam_by: {
            wallet_address: String,
            signature: String,
        },
    },
})

couponSchema.plugin(toJSON)
couponSchema.plugin(paginate)

couponSchema.statics.ensureCouponCodeIsUnique = async function (
    couponCode,
    shopId
) {
    const coupon = await this.findOne({
        coupon_code: couponCode,
        shop_id: shopId,
    })
    if (coupon) {
        throw new Error('Coupon code already exists for this shop')
    }
    return !!coupon
}

const NFTCoupon = mongoose.model('NFTCoupon', couponSchema)
module.exports = NFTCoupon

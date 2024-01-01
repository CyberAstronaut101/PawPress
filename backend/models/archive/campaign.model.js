const mongoose = require('../config/mongoose')

const couponCampaignSchema = new mongoose.Schema({
    owner_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'ShopifyShop',
        required: true,
    },
    targetCollectionId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'TargetNftCollection',
        required: true,
    },
    targetCollectionAddress: {
        type: String,
        required: true,
    },
    campaign_title: {
        type: String,
        required: true,
        default: 'Default_NFT_Coupon_Campaign_Title',
    },
    active: {
        type: Boolean,
        default: false,
    },
    coupon_generation_details: [
        {
            target_name: {
                type: String,
                required: true,
                default: 'single_target_group', // if multiple groups, this is then set as the matching_bin target name
            },
            token_min_id: Number,
            token_max_id: Number,
            generate_code_count: Number,
            generate_code_length: Number,
            discount_type: {
                type: String,
                enum: ['discountPercentage', 'discountAmount'],
            },
            discount_value: Number,
            applies_to: {
                target_type: {
                    type: String,
                    enum: [
                        'entire_order',
                        'specific_collections',
                        'specific_products',
                    ],
                },
                target_values: [],
            },
            minimum_requirements: {
                requirement_type: {
                    type: String,
                    enum: ['none', 'minPurchaseAmount', 'minQuantity'],
                },
                min_requirements_value: {
                    type: Number,
                    default: 1,
                },
            },
            discount_applies_to_collections: [],
            discount_applies_to_products: [],
            usage_limits: {
                limit_total_use: Boolean,
                limit_per_user: Boolean,
                total_use_count: {
                    type: Number,
                    default: 1,
                },
            },
            active_dates: {
                start_date: {
                    type: Date,
                    required: true,
                    default: Date.now(),
                },
                has_end_date: {
                    type: Boolean,
                    required: true,
                    default: false,
                },
                end_date: Date,
            },
            coupon_metadata: {
                platform: {
                    type: String,
                    enum: ['shopify', 'uploaded'],
                    default: 'shopify',
                },
                priceRuleId: {
                    type: String,
                    default: ''
                },
            },
        },
    ],
})



/**================================================== *
 * ==========  Campaign Model Static Functions  ========== *
 * ================================================== */

/**
 * 
 * @param {Shop ObjectID} id 
 * @param {String} campaign_title 
 * @returns True if campaign title is unique for the shop, false if campaign title already exists
 */
couponCampaignSchema.methods.isTitleUniqueToOwner = async function (id, campaign_title) {
    const unique = await this.findOne({
        owner_id: id,
        campaign_title: campaign_title
    })

    return !!unique

}


/* =======  End of Campaign Model Static Functions  ======= */


module.exports = mongoose.model('CouponCampaign', couponCampaignSchema)

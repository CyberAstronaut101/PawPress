const mongoose = require('../config/mongoose')

const { toJSON, paginate } = require('./plugins')

const { subscriptions } = require('../config/subscription_levels')

/* =====================================================

=====================================================*/

const shopifyStoreSchema = mongoose.Schema(
    {
        shopify_id: { type: String },
        name: { type: String }, // Name of the shop
        email: { type: String }, // Email that shopify users to contact owner
        shop_owner: { type: String }, // Shop owner's name
        myshopify_domain: { type: String }, // Domain of the shop
        domain: { type: String }, // Domain of the shop
        subscription_level: {
            type: String,
            enum: subscriptions,
            default: 'free',
        }, // Subscription level of the shop (Our Packages)
    },
    {
        timestamps: true,
    }
)

shopifyStoreSchema.plugin(toJSON)
shopifyStoreSchema.plugin(paginate)

/**
 * Check if the Store has entry in the DB
 * Used to check if the store is already registered, or if first time installing
 * @param {ObjectID} myshopify_domain
 * @returns {Promise<boolean>}
 */
shopifyStoreSchema.statics.hasStoreInstalled = async function (
    myshopify_domain
) {
    console.log('Checking if store has ever installed ' + myshopify_domain)
    const shop = await this.findOne({ myshopify_domain: myshopify_domain })
    return !!shop
}

/**
 * @typedef ShopifyStore
 */
const ShopifyStore = mongoose.model('ShopifyStore', shopifyStoreSchema)

module.exports = ShopifyStore

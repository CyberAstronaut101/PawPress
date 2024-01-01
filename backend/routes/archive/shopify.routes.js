const express = require('express')
const router = express.Router()

const validate = require('../../middleware/validate')
const { shopifyValidation } = require('../../validations')

const shopifyController = require('../../controllers/shopify.controller')
const { shopAuth } = require('../../middleware/auth')

/*********  Shopify OAuth Methods  **********/
// Base URL /api/v1/shopify/auth -- URL set under the shopify partners page
// moved to shopify auth controller/auth routes
// router.route('/auth')
//     .get( shopifyController.installShopify)
// router.route('/callback')
//     .get(shopifyController.shopifyCallback)

/********* Shop Info **********/
// Get info about the current auth shop
router
    .route('/shop/:shopId')
    .get(
        shopAuth(),
        validate(shopifyValidation.getShop),
        shopifyController.getStore
    )

// TODO other routes that interact with Shopify API Specifically

/*********  Shopify Coupon Management  **********/

// /api/v1/shopify/coupon

// Get the coupons for the current shop
router
    .route('/coupon/:shopId')
    .get(
        shopAuth(),
        validate(shopifyValidation.getShopCoupons),
        shopifyController.getStoreCoupons
    )

// router.route('/coupon/batchCallback/:shopId/:campaignId')
// .get()

// router.route('/coupon/test/:shopId')
//     .get(shopAuth(), shopifyController.createSingleTestCoupon)

// router.route('/coupon/test/batch/:shopId')
//     .get(shopAuth(), shopifyController.createBatchedCoupons)

/*********  Shopify Coupon Campaign Create **********/
router
    .route('/campaign-init/:shopId/:campaignId')
    .get(shopAuth(), shopifyController.createCampaignCoupons)

// Callbacks for Shopify Bulk Mutations
// router.route('/coupon/batchCallback')
//     .post(shopifyController.shopifyBatchCallback)

module.exports = router

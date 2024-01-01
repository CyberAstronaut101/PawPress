const express = require('express')

const { shopAuth } = require('../../middleware/auth')
const validate = require('../../middleware/validate')

const campaignValidation = require('../../validations/campaign.validation')
const campaignController = require('../../controllers/campaign.controller')

const nftController = require('../../controllers/nft_collection.controller')

const shopifyController = require('../../controllers/shopify.controller')

// const targetNftCollectionController = require('../../controllers/target_collection.controller')

// Root Route: /api/v1/campaign/

const router = express.Router()

// Owner Routes

// Admin Routes

// router.get("/:userId", )
// router.get("/:userId")

/********* Coupon Campaign Management Routes **********/

// router.get("/:userId", auth(), validate(campaignValidation.getOwnedCampaigns), campaignController.getAllCampaigns);

// /api/v1/campaign/:shopId
router
    .route('/:shopId')
    .get(shopAuth(), campaignController.getShopCampaigns)
    .post(shopAuth(), campaignController.createCampaign)

// /api/v1/campaign/:shopId/:campaignId
router
    .route('/:shopId/:campaignId')
    .delete(shopAuth(), campaignController.deleteCampaign)

// === Shopify Coupon Management ===
// /api/v1/campaign/shopify/coupon/
router
    .route('/shopify/pricerule/:shopId')
    .get(shopAuth(), shopifyController.createPriceRuleTest)

/*********  Target NFT Collection  **********/

// router.route("/target/")
//     .get(auth(), targetNftCollectionController.getAllTargetNftCollections)
// .get(auth(), campaignController.)
// .post("/")

/*********  NFT Target Collection  **********/
// Search/Validate collections by contract address
// Base URL /api/v1/campaign/nft/

// Create controller for

// require auth

// - Requests below require auth and paid-user role
// Create Target Collection
// Update Target Collection
// Delete Target Collection
// View Current Owned Collections

/**
 * @swagger
 * /campaign/nft/search:
 *   post:
 *     summary: Search for NFT Collections
 *     description: Search for NFT Collections by Contract Address
 *     tags: [NFT Coupon Campaigns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contractAddress
 *               - chain
 *             properties:
 *               contractAddress:
 *                 type: string
 *                 format: address
 *                 description: Address of the NFT Smart Contract
 *               chain:
 *                 type: string
 *                 description: Chain of the NFT Smart Contract
 */
router.post(
    '/nft/search',
    validate(campaignValidation.searchSmartContract),
    nftController.searchForNFTCollection
)

module.exports = router

/**
 * @swagger
 * tags:
 *  name: NFT Coupon Campaigns
 *  description: Routes for Store Owners Managing Coupon Campaigns
 */

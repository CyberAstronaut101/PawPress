const logger = require('../config/logger')
const { Campaign, ShopifyStore } = require('../models')
const {
    getErrorMessage,
    getSuccessMessage,
} = require('../utils/PrimeNgMessage')

const {
    campaignService,
    shopifyService,
    targetNftService,
    // targetNftService,
    // couponService,
} = require('../services')
const httpStatus = require('http-status')
const catchAsync = require('../utils/catchAsync')

const getShopCampaigns = catchAsync(async (req, res) => {
    // Only return campaigns that belong to user requesting
    const shopCampaigns = await campaignService.getShopCouponCampaigns(
        req.shop.id
    )
    res.status(httpStatus.OK).json({
        message: getSuccessMessage('Shop Campaigns retrieved successfully', ''),
        campaigns: shopCampaigns,
    })
})

// ================================================================

const getAllCampaigns = catchAsync(async (req, res) => {
    // console.log("GET @ /campaign/")
    console.log(req.params)
    console.log(req.user)

    if (req.params.userId !== req.user.id) {
        logger.warn(
            'User ' +
            req.user.id +
            ' tried to access campaigns for user ' +
            req.params.userId
        )
        return res.status(403).json({
            message: getErrorMessage(
                '403',
                'Not Authorized to access campaigns for other users'
            ),
        })
    }

    this.campaignService.getShopCouponCampaigns(req.user)
})

const util = require('util')
// const objectLog = require('../utils/objectLog')
// const { createCouponCodeToNFTMapping } = require('../services/coupon.service')

const createCampaign = async (req, res) => {
    console.log('Creating New NFT Campaign for shop: ', req.shop.id)

    // Ensure the req.shop.id matches req.params.shopId
    if (req.shop.id !== req.params.shopId) {
        logger.warn(
            'User ' +
            req.user.id +
            ' tried to create campaign for shop ' +
            req.params.shopId
        )
        return res.status(403).json({
            message: getErrorMessage(
                '403',
                'Not Authorized to create campaign shop'
            ),
        })
    }

    // Requester account is creating a campaign for their own shop

    console.log('create campaign req.body')
    req.body.owner_id = req.shop.id
    // console.log(req.body);
    console.log(util.inspect(req.body, false, null, true))

    // Manipulations to get the body into form expected for the service

    // The campaign title *must* be unique for the shop,
    let isTitleUnique = await campaignService.isCampaignTitleUniqueToOwner(
        req.shop.id,
        req.body.campaign_title
    )

    console.log('isTitleUnique: ' + isTitleUnique)

    if (!isTitleUnique) {
        console.info("rejecting campaign creation due to duplicate title")
        return res.status(200).json({
            status: "failed",
            message: getErrorMessage(
                'Duplicate Campaign Title',
                'Campaign title must be unique for the shop, please input a unique campaign title'
            )
        })
    }

    // Verify that the TargetNftCollection exists for the shop
    let targetNftCollection = await targetNftService.getTargetCollectionByShopAndId(
        req.shop.id,
        req.body.targetCollectionId);

    if (!targetNftCollection) {
        console.info("rejecting campaign creation due to missing target collection or collection not owned by shop");
        return res.status(200).json({
            status: "failed",
            message: getErrorMessage(
                'Specified Target Collection Not Found',
                'Target NFT Collection does not exist for the shop ' + req.body.targetCollectionId + '.')
        })
    }

    // If it does exist, add the address to the campaign body
    req.body.targetCollectionAddress = targetNftCollection.contract_metadata.token_address;

    // Save a campaign MongoDB document
    let campaignObject = await campaignService.createCampaign(
        req.shop.id,
        req.body
    )

    console.log('Campaign Object: ' + campaignObject)

    // Create the price_rules for each coupon_generation_details
    // adds PR_GID to corresponding coupon_generation_details that the PR was created for
    await shopifyService.createCampaignPriceRules(
        req.shop.id,
        req.shop.domain,
        campaignObject._id.toString()
    )


    // If here, all good?
    return res.status(201).json({
        status: "success",
        campaign: campaignObject,
        message: getSuccessMessage('Campaign created successfully', ''),
    })

    /*
  
  let targetCollectionObject = await targetNftService.getTargetCollectionById(
    campaignObject.targetCollectionId
  );
  
  console.log(targetCollectionObject);
  
  console.log("After Campaign Create");
  console.log(util.inspect(campaignObject, false, null, true));
  
  // This just creates the campaign object, then call /api/v1/shopify/coupon-campaign/
  
  // If the campaignObject was a success and we have a _id, then we can create the coupon campaign
  
  let couponCreateResults = await shopifyService.createCampaignCoupons(
    req.shop.id,
    req.shop.domain,
    campaignObject._id.toString()
  );
  
  console.log("After Coupon Create");
  objectLog(couponCreateResults);
  
  // Do final checks here? Make sure that the correct number of coupons were created for the campaign?
  // Maybe that happens within the shopify service?
  
  let saveCouponNFTMapping = await createCouponCodeToNFTMapping(
    targetCollectionObject,
    couponCreateResults
  );
   
   console.log(saveCouponNFTMapping);
  
  console.log("After Save Coupon NFT Mapping");
  
  */

    // Update the campaign with the coupon codes??

    // return res.status(200).json({ message: 'In Development' })
}

const updateCampaign = async (req, res) => {
    // Validate req.body fields

    Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .then((result) => {
            console.log('updated Campaign')
            res.status(200).json({
                message: {
                    severity: 'success',
                    message: 'Campaign updated successfully',
                    detail: 'Updated',
                },
                campaign: result,
            })
        })
        .catch((err) => {
            console.log('Error updating campaign: ' + err)
            res.status(500).json({
                message: {
                    severity: 'error',
                    message: 'Error updating campaign',
                    detail: err,
                },
            })
        })
}

const deleteCampaign = async (req, res) => {
    console.log(
        'Deleting Campaign ' +
        req.params.campaignId +
        ' request from user ' +
        req.shop.id
    )

    console.log(req.shop)

    // Make sure the req.params.shopId matches the req.shop.id
    if (req.params.shopId !== req.shop.id) {
        logger.warn(
            'User ' +
            req.user.id +
            ' tried to delete campaign for shop ' +
            req.params.shopId
        )
        return res.status(403).json({
            message: getErrorMessage(
                '403',
                'Not Authorized to delete campaign for other shops'
            ),
        })
    }

    // Make sure that the campaign trying to be deleted belongs to the shop
    const campaign = await campaignService.getCampaign(req.params.campaignId)

    console.log('Campaign return from DB: ' + campaign)

    if (campaign.owner_id.toString() !== req.shop.id) {
        logger.warn(
            'User ' +
            req.shop.id +
            ' tried to delete campaign for shop ' +
            req.params.shopId
        )
        return res.status(403).json({
            message: getErrorMessage('403', 'Not owner of campaign to delete'),
        })
    }

    console.log('Requested delete')

    /*********  Delete all the Coupon Entries for the campaign  **********/

    /*********  Delete the campaign entry  **********/
    let deleteReturn = await campaignService.deleteCampaign(
        req.params.campaignId
    )

    console.log('Delete Return: ' + deleteReturn)

    return res.status(200).json('OK);')

    // TEMP just delete the campaign for now with no verification checks
}

module.exports = {
    // Shop Owner Requests
    getShopCampaigns,

    // Admin Controllers
    getAllCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
}

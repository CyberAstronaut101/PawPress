// const httpStatus = require('http-status')
const { Campaign } = require('../models')
const ApiError = require('../utils/ApiError')
// const ApiError = require('../utils/ApiError')

/**================================================== *
 * ==========  Campaign CRUD Operations  ========== *
 * ================================================== */

const getCampaign = async (campaignId) => {
    console.log('CampaignService::getCampaign(' + campaignId + ')')
    return Campaign.findById(campaignId)
}

const getShopCouponCampaigns = async (shopId) => {
    console.log('CampaignService::getShopCouponCampaigns(' + shopId + ')')
    return Campaign.find({ owner_id: shopId })
}

const createCampaign = async (shopId, campaignData) => {
    console.log(
        'CampaignService::createCampaign(' + shopId + ', ' + campaignData + ')'
    )
    return Campaign.create(campaignData)
}

const deleteCampaign = async (campaignId) => {
    console.log('CampaignService::deleteCampaign(' + campaignId + ')')
    return Campaign.deleteOne({ _id: campaignId })
}

const isCampaignTitleUniqueToOwner = async (shopId, campaignTitle) => {
    const unique = await Campaign.findOne({
        owner_id: shopId,
        campaign_title: campaignTitle
    })
    return !unique
}



/*********  Add Shopify PriceRules to Campaign coupon_generation_details  **********/


/* =======  End of Campaign CRUD Operations  ======= */

/**================================================== *
 * ==========  Coupon Tracking   ========== *
 * ================================================== */
// Add the list of codes to a campaign specific coupon_generation_details object

/**
 *
 * @param {CampaignID object} campaignId
 * @param {Coupon_Generation_Details ID Object} generationDetailId
 * @param {string[] of codes associated with specific generation details group} codes
 * @returns
 */
const addCodesToCampaignGenerationDetails = async (
    campaignId,
    generationDetailId,
    codes
) => {
    return Campaign.updateOne(
        {
            _id: campaignId,
            coupon_generation_details: {
                $elemMatch: { _id: generationDetailId },
            },
        },
        {
            $set: {
                'coupon_generation_details.$.shopify_metadata.shopify_codes':
                    codes,
            },
        }
    )
}

/**
 * Adds the corresponding Shopify PriceRuleID to the Campaign's coupon_generation_details
 * that has the value of the generation group.
 * 
 * @param {CouponCampaign} campaignId 
 * @param {coupon_generation_details} generationGroupId 
 * @param {Shopify::PriceRule} priceRuleGID 
 * @returns 
 */
const add_shopify_priceRuleGID_to_campaign = async (
    campaignId,
    generationGroupId,
    priceRuleGID
) => {
    console.log("CampaignService::add_shopify_priceRuleGID_to_campaign(" + campaignId + ", " + generationGroupId + ", " + priceRuleGID + ")")
    // console.log("CampaignID: ", campaignId);
    // console.log("GenerationGroupId: ", generationGroupId);
    // console.log("PriceRuleGID: ", priceRuleGID);

    let results = await Campaign.findOneAndUpdate(
        {
            _id: campaignId,
            'coupon_generation_details._id': generationGroupId
        },
        {
            $set: { 'coupon_generation_details.$.coupon_metadata.priceRuleId': priceRuleGID }
        });



    console.log("Results from Update Campaign with PriceRuleID: ");
    console.log(results);

    return (results);
}

// Accepts array of targetNftCollection ObjectIds
// This will need to be changed 
const getCampaignsUsingTargetNftCollections = async (targetNftCollections) => {
    let campaigns = await Campaign.aggregate([
        {
            $match: {
                active: true,
                targetCollectionId: { $in: targetNftCollections.map((collection) => collection._id) }
            }
        },
        {
            $lookup: {
                from: 'shopifystores',
                // localField: 'owner_id',
                // foreignField: '_id',
                let: { shop_id: '$owner_id' },
                as: 'shop',
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ['$_id', '$$shop_id']
                            }
                        }
                    },
                    {
                        $project: {
                            name: 1,
                            domain: 1
                        }
                    }
                ]
            }
        },
        {
            $project: {
                owner_id: 1,
                targetCollectionId: 1,
                campaign_title: 1,
                active: 1,
                coupon_generation_details: 1,
                shop: { $arrayElemAt: ['$shop', 0] }
            }
        }
    ]);

    return campaigns;

}

/* =======  End of Coupon Tracking   ======= */



/**================================================== *
 * ==========  Boolean Validators  ========== *
 * ================================================== */

/**
 * Checks if there is an *active* campaign with the given id
 * 
 * That also targets the specified target NFT collection address
 * 
 * @param {CouponCampaign ObjectID} campaignId 
 * @param {NFT Contract Address} targetCollectionAddress 
 * @returns {Boolean} if campaign found that matches, false if not 
 */
const does_active_campaign_id_with_target_address_exist = async (campaignId, targetCollectionAddress) => {
    console.log("CampaignService::does_campaign_id_with_target_address_exist(" + campaignId + ", " + targetCollectionAddress + ")")
    let campaign = await Campaign.findOne({
        _id: campaignId,
        targetCollectionAddress: targetCollectionAddress,
        active: true
    }, { limit: 1 })

    if (!campaign) {
        return false;
    } else {
        return true;
    }
}

/**
 * Only call after confirming that the NFT collection is part of a campaign using does_active_campaign_id_with_target_address_exist
 * This validates that the token can be redeemed using a specified generationGroupID
 * 
 * If the token is a part of this group, then return the coupon_generation_details.coupon_metadata.priceRuleId
 * Else, return false
 * 
 * @param {NFT Token ID} tokenid 
 * @param {CouponCampaign ObjectID} campaignID
 * @param {CouponCampaign.coupon_generation_details._id} generationGroupId 
 * @returns PriceRuleID if token part of group, false if not
 */
const is_tokenid_valid_for_coupon_generation_group = async (tokenid, campaignId, generationGroupId) => {
    console.log("CampaignService::is_tokenid_valid_for_coupon_generation_group(" + tokenid + ", " + campaignId + ", " + generationGroupId + ")")

    let campaign = await Campaign.findOne({ _id: campaignId })

    // * Get the generation group
    let generationGroup = campaign.coupon_generation_details.find(
        (generationGroup) => generationGroup._id.toString() === generationGroupId.toString()
    )

    // * If the generation group does not exist, return false
    if (!generationGroup) return false;

    // * Generation group has a token_min_id and a token_max_id, make sure the passed tokenid is within the range
    if (tokenid < generationGroup.token_min_id || tokenid > generationGroup.token_max_id) {
        console.log("Token ID ", tokenid, " is not within the range of ", generationGroup.token_min_id, " and ", generationGroup.token_max_id)
        return false
    }

    // * If the token is part of the generation group, return the priceRuleId
    // TODO this would need to be extended when we add additional platforms..
    if (generationGroup.coupon_metadata.platform == "shopify") {
        // if the coupon_metadata.priceRuleId is not set, then return false
        if (!generationGroup.coupon_metadata.priceRuleId) {
            throw new ApiError(500, "Generation Group does not have a priceRuleId set, unable to create coupon")
        } else {
            return {
                platform: generationGroup.coupon_metadata.platform,
                priceRuleId: generationGroup.coupon_metadata.priceRuleId,
                code_length: generationGroup.generate_code_length
            }
        }
    } else {
        throw new ApiError(500, "Generation Group had unsupported platform: ", generationGroup.coupon_metadata.platform)
    }

    // throw new ApiError(500, "is_tokenid_valid_for_coupon_generation_group Failed to reach return condition. Fatal Error")
}


/* =======  End of Boolean Validators  ======= */


module.exports = {
    getCampaign,
    getShopCouponCampaigns,
    createCampaign,
    deleteCampaign,
    // createUser,
    // queryUsers,
    // getUserById,
    // getUserByEmail,
    // updateUserById,
    // deleteUserById,
    addCodesToCampaignGenerationDetails,
    isCampaignTitleUniqueToOwner,


    getCampaignsUsingTargetNftCollections,
    add_shopify_priceRuleGID_to_campaign,

    // Validation Checks
    does_active_campaign_id_with_target_address_exist,
    is_tokenid_valid_for_coupon_generation_group
}

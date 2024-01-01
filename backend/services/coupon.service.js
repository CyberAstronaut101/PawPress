const httpStatus = require('http-status')
const { Campaign, TargetNftCollection, ClaimedCoupon } = require('../models')
const ApiError = require('../utils/ApiError')


// const { NFTCoupon } = require('../models')
const objectLog = require('../utils/objectLog')
const { campaignService } = require('.')

/**================================================== *
 * ==========  NFTCoupon CRUD Operations  ========== *
 * ================================================== */
// ! All Depricated with generate on demand model
// const getCoupon = async (couponId) => {
//     console.log('CouponService::getCoupon(' + couponId + ')')
//     return NFTCoupon.findById(couponId)
// }

// const createCoupon = async (couponData) => {
//     console.log('CouponService::createCoupon(' + couponData + ')')
//     return NFTCoupon.create(couponData)
// }

// const deleteCoupon = async (couponId) => {
//     console.log('CouponService::deleteCoupon(' + couponId + ')')
//     return NFTCoupon.deleteOne({ _id: couponId })
// }

/* =======  End of NFTCoupon CRUD Operations  ======= */

// const createCouponCodeToNFTMapping = async (
//     targetCollection,
//     createdCoupons
// ) => {
//     // We need the campaignId,
//     console.log('========== CreateCouponCodeToNFTMapping ============')
//     console.log(targetCollection)
//     console.log(createdCoupons)

//     // Make sure we have targetCollection.contract_metadata.token_address
//     if (!targetCollection.contract_metadata.token_address) {
//         throw new ApiError(
//             httpStatus.BAD_REQUEST,
//             'Cannot create coupon code to NFT mapping without a token address'
//         )
//     }

//     let nft_address = targetCollection.contract_metadata.token_address

//     // === For each created coupon group, create the document that will be used to insert ===
//     // let all_docs_to_insert = [];

//     console.log('\n\nCreating all docs to insert...')
//     createdCoupons.forEach(async (couponDetail) => {
//         let coupon_group_inserts = []

//         // couponDetail.codes holds the codes generated for the group
//         // couponDetail.priceRuleId is the shopify_metadata.coupon_gid
//         console.log(couponDetail)

//         // Need to add nft_token_id and coupon_code in codes forEach
//         let obj = {
//             nft_address: nft_address,
//             shop_id: targetCollection.owner_id.toString(),
//             campaign_id: couponDetail.campaignId,
//             target_collection_id: targetCollection._id.toString(),
//             shopify_metadata: {
//                 coupon_gid: couponDetail.priceRuleId,
//             },
//         }

//         let token_start_id = couponDetail.token_min_id

//         couponDetail.codes.forEach((code) => {
//             let tmp = { ...obj }
//             tmp.nft_token_id = token_start_id
//             tmp.coupon_code = code

//             coupon_group_inserts.push(tmp)

//             token_start_id++
//         })

//         // Make async call to insert all docs
//         let insertResults = await NFTCoupon.insertMany(all_docs_to_insert)
//         // TODO make sure insertResults.insertedCount === couponDetail.codes.length

//         // Add the IDs of the newly inserted docs to the campaign Object
//     })

//     // Take all_docs_to_insert and do a NFTCoupon.collection.insert() call

//     return 'Return from create coupon code to NFT mapping'
// }

// const getCouponsFromAddressAndIds = async (ownedTokensObject) => {
//     console.log('CouponService::getCouponsFromAddressAndIds()')
//     console.log(ownedTokensObject)

//     // https://stackoverflow.com/questions/23384244/mongodb-multiple-aggregations-in-single-operation

//     // First aggregate on the token_address
//     // Then on the input array of token_ids

//     let available_coupons = await NFTCoupon.aggregate([
//         {
//             $match: {
//                 nft_address: ownedTokensObject.token_address,
//                 nft_token_id: { $in: ownedTokensObject.token_ids },
//             },
//         },
//         // https://stackoverflow.com/questions/53710203/project-in-lookup-mongodb
//         {
//             $lookup: {
//                 from: 'shopifystores',
//                 // localField: "shop_id",
//                 // foreignField: "_id",
//                 let: { shop_id: '$shop_id' },
//                 pipeline: [
//                     {
//                         $match: {
//                             $expr: {
//                                 $eq: ['$_id', '$$shop_id'],
//                             },
//                         },
//                     },
//                     {
//                         $project: {
//                             name: 1,
//                             domain: 1,
//                         },
//                     },
//                 ],
//                 as: 'shop',
//             },
//         },
//         {
//             // Final project to remove the coupon codes and any unnnecessary data
//             $project: {
//                 nft_address: 1,
//                 nft_token_id: 1,
//                 shop: { $arrayElemAt: ['$shop', 0] },
//             },
//         },
//     ])

//     // console.log("Available coupons: ");
//     // objectLog(available_coupons)

//     return available_coupons
// }



/**================================================== *
 * ==========  Available Coupons for User  ========== *
 * ================================================== */
const buildCouponMetadataForTokens = async (ownedTokensByContract) => {
    console.log("CouponService::buildCouponMetadataForTokens()")
    console.log("Looking for campaigns associated with ", ownedTokensByContract.length, " unique token contracts");
    console.log(ownedTokensByContract);

    let return_data = [];

    // Using for in b/c of async nature
    await Promise.all(ownedTokensByContract.map(async (ownedToken) => {
        console.log("Building Return for ", ownedToken)

        // Make sure that the ownedToken.token_ids has at least 1 element
        if (ownedToken.token_ids.length === 0) {
            console.error("OwnedToken element had 0 length token_ids", ownedToken.contract_address)
            return;
        }

        // ** Get all TargetNFTCollectionst that Reference Token Contract **
        let targetCollections = await TargetNftCollection.find(
            { 'contract_metadata.token_address': ownedToken.token_address }
        );

        console.log("Found ", targetCollections.length, " target collections for token ", ownedToken.token_address);
        objectLog(targetCollections);
        if (targetCollections.length === 0) {
            console.log("No target collections found for token ", ownedToken.token_address);
            return;
        }

        // Search across campaigns that are active and reference any of the targetCollections
        // TODO might need to check the start/end dates as well -- might move this logic to campaign service??
        // DONE - getCampaignsUsingTargetNftCollections
        let campaigns = await Campaign.aggregate([
            {
                $match: {
                    active: true,
                    targetCollectionId: { $in: targetCollections.map((collection) => collection._id) }
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

        console.log("Found ", campaigns.length, "active campaigns that use targetNFTCollections that ownedToken is part of ");
        objectLog(campaigns);

        if (campaigns.length === 0) {
            console.log("No campaigns found that use targetNFTCollections that ownedToken is part of");
            return;
        }

        /*
            If we have gotten here, that means that this specific token has at least one campaign that is active
            that targets the NFTCollection. Next step is to make sure that the tokenID is actually part of 
            the campaign.

            If the token is part of the campaign, 

            NFTCollection => Shop => Campaign => Coupon Card
        */

        let nft_collection_details = ownedToken.token_ids[0];

        let ownedTokenRenderData = {
            collection_name: nft_collection_details.name,
            collection_type: nft_collection_details.contract_type,
            collection_symbol: nft_collection_details.symbol,
            collection_contract_address: nft_collection_details.token_address,
            shops_with_offers: [] // will contain campaign objects // campaign objects hold nft coupon card details
        }

        // Need to iterate over the token_ids if length greater than 1, actually I think it will always be  alist
        // Then for each TokenID push a new object to the coupon_metadata with the data we need to dispaly

        // Check if the campaign is using groupings or if its all tokens
        // Either way, make sure that the token_matching_rules min_id and max_id contain the token_id trying to 


        // Iterate over each campaign that requester might have a coupon for
        campaigns.forEach(campaign => {
            console.log("Campaign: ", campaign.campaign_title);

            // Get the TargetNFTCollection that the campaign is using
            let targetNftCollection = targetCollections.find(collection => collection._id.toString() === campaign.targetCollectionId.toString());

            console.log("uses the TNFTC: ", targetNftCollection);

            let campaign_render_data = {
                campaign_id: campaign._id,
                campaign_title: campaign.campaign_title,
                // campaign_description: campaign.campaign_description,
                // Maybe render start/end dates?
                campaign_nft_coupons: []
            }

            let valid_tokens_for_campaign = [];

            // For each of the token_ids included, check if the owned tokens is in the range
            ownedToken.token_ids.forEach((token) => {
                console.log("\nChecking if the token is part of campaign: ", token.token_id);

                if (token.token_id < targetNftCollection.token_matching_rules.collection_min_id || token.token_id > targetNftCollection.token_matching_rules.collection_max_id) {
                    console.log("Token is not part of campaign: ", token);
                    return;
                }

                console.log("token part of campaign");

                // If here, then we need to build the shop -> campaign -> coupon card data
                // Check if there is a shop object in the nft_collection_campaigns yet
                //  If not, add it

                // Parse the token metadata to get name, and image
                let token_metadata = JSON.parse(token.metadata);

                // TODO NEED TO DO A CATCH HERE IF JSON PARSE FAILS/NO DATA

                let nft_coupon_data = {
                    token_address: token.token_address,
                    token_id: token.token_id,
                    token_name: token_metadata.name,
                    token_description: token_metadata.description,
                    token_image: token_metadata.image,
                }

                // console.log("pushing nft_coupon_data ", nft_coupon_data);

                valid_tokens_for_campaign.push(nft_coupon_data);

            })

            campaign_render_data.campaign_nft_coupons = valid_tokens_for_campaign;

            // Check if ownedTokenRenderData.shops_with_offers contains an element with the shop_id
            // If not, add it

            // If there are no shop entries, just add without checking
            if (ownedTokenRenderData.shops_with_offers.length === 0) {
                console.log("Array length 0 -- adding shop")
                ownedTokenRenderData.shops_with_offers.push({
                    shop_id: campaign.shop._id,
                    shop_name: campaign.shop.name,
                    shop_domain: campaign.shop.domain,
                    campaigns: [campaign_render_data]
                })
            } else {
                console.log("chekcing if shop exists in return array")
                // Check if a shop entry already exists, if so push to campaigns
                let shop_index = ownedTokenRenderData.shops_with_offers.findIndex(shop => shop.shop_id.toString() === campaign.shop._id.toString());

                if (shop_index === -1) {
                    // This shop not added yet, add it
                    console.log("pushing campaign data to new shop index")
                    ownedTokenRenderData.shops_with_offers.push({
                        shop_id: campaign.shop._id,
                        shop_name: campaign.shop.name,
                        shop_domain: campaign.shop.domain,
                        campaigns: [campaign_render_data]
                    })
                } else {
                    console.log("pushing campaign data to existing shop index")
                    ownedTokenRenderData.shops_with_offers[shop_index].campaigns.push(campaign_render_data);
                }
            }

        })

        return_data.push(ownedTokenRenderData);
    }));

    // console.log("AFTER ")

    console.log("=======================")
    console.log("Results for return_data")
    objectLog(return_data);
    console.log("=======================")



    /*********  Optional Sorting Stuff..  **********/
    // For each element in return data, sort the shops_with_offers array by shop_name
    return_data.forEach(element => {
        element.shops_with_offers.sort((a, b) => {
            if (a.shop_name < b.shop_name) {
                return -1;
            }
            if (a.shop_name > b.shop_name) {
                return 1;
            }
            return 0;
        }
        )
    }
    )

    return return_data;
}

/**
 * accepts list of token addressess and the owned ids of a user NFT collection
 * searches for all available coupons for the specific NFTs
 * @param {[{token_address, token_ids[]}]} ownedTokensByContract 
 */
const build_available_coupon_offerings = async (ownedTokensByContract) => {
    let return_data = [];

    await Promise.all(ownedTokensByContract.map(async (ownedTokensUnderCollection) => {
        // console.log("Building Return for ", ownedTokensUnderCollection)

        // Make sure that the ownedToken.token_ids has at least 1 element
        if (ownedTokensUnderCollection.token_ids.length === 0) {
            console.error("OwnedToken element had 0 length token_ids", ownedTokensUnderCollection.contract_address)
            return;
        }

        // ** Get all TargetNFTCollectionst that Reference Token Contract **
        let targetCollections = await TargetNftCollection.find(
            { 'contract_metadata.token_address': ownedTokensUnderCollection.token_address }
        );

        console.log("Found", targetCollections.length, "target collections for token ", ownedTokensUnderCollection.token_address);
        // objectLog(targetCollections);
        if (targetCollections.length === 0) {
            console.log("No target collections found for token", ownedTokensUnderCollection.token_address);
            return;
        }

        let campaigns = await campaignService.getCampaignsUsingTargetNftCollections(targetCollections);

        console.log("Found", campaigns.length, "active campaigns that could have an offering for token");
        // objectLog(campaigns);

        if (campaigns.length === 0) {
            console.log("No campaigns found that use targetNFTCollections that ownedToken is part of");
            return;
        }

        ownedTokensUnderCollection.token_ids.forEach((token) => {

            let token_offerings_return = {
                token_metadata: {},
                offering_metadata: {},
                available_coupons: []
            };

            // Add token metadata for frontend to return
            token_offerings_return.token_metadata = build_token_metadata(token);

            // For each of the campaigns using any targetNFTCollection that targets the token,
            // Check if we are actually are eligable for the coupon based on campaign rules

            campaigns.forEach(campaign => {
                // console.log("Checking if token is eligible for campaign", campaign.campaign_title);
                if (!token_eligible_for_campaign(token.token_id, campaign.coupon_generation_details)) return;

                token_offerings_return.available_coupons.push(get_eligible_token_offering_return(token.token_id, campaign))
            })

            // Calculate some additional metdata for offerings
            // *Total Stores providing an offer
            token_offerings_return.offering_metadata.store_count = [...new Set(token_offerings_return.available_coupons.map(coupon => coupon.store.id))].length;

            // *Total Offers available
            token_offerings_return.offering_metadata.total_offer_count = token_offerings_return.available_coupons.length
            // token_offerings_return.offering_metadata.total_offer_count = token_offerings_return.available_coupons.reduce(((sum, array) => sum + array.length), 0);

            // Push the final results of all offerings for this token to the return_data
            return_data.push(token_offerings_return);
        })




    }));

    // console.log("=======================")
    // console.log("Results for return_data")
    // // objectLog(return_data);
    // console.log(return_data);
    // console.log("=======================")

    return return_data;

    // 
}

/**
 * After a user successfully requests a coupon code for a specific token, under an active campaign,
 * this will generate a receipt that the user has redeemed an offer
 */
const create_redeemed_coupon_receipt = async (createObjectBody) => {
    // Make sure the createObjectBody has all required fields?
    console.log("create_redeemed_coupon_receipt() with ");
    console.log(createObjectBody);
    return ClaimedCoupon.create(createObjectBody);
}

/**
 * Get all the Claimed Coupons that have been redeemed by a web3 user wallet address
 * @param {Web3 Wallet Address} user_address 
 * @returns 
 */
const get_users_redeemed_coupon_receipts = async (user_address) => {
    return ClaimedCoupon.find({ redeemer_address: user_address });
}

const get_campaign_total_redeemed_coupons = async (campaign_id) => {
    return "TODO"
}

const get_shop_total_redeemed_coupons = async (shop_id) => {
    return "TODO"
}

const get_users_total_redeemed_coupons = async (user_address) => {
    return "TODO"
}

const get_total_coupons_claimed_on_date = async (date) => {
    return "TODO"
}

/**
 * Check if a specific user has redeemed an offer for a token under a specific campaign
 * Return the claimed receipt if exists, false if not
 * @param {NFT ETH Address} token_address 
 * @param {NFT ID} token_id 
 * @param {Web3 Wallet Address} redeemer_address 
 * @param {ShopifyStore ObjectID} shop_id 
 * @param {CouponCampaign ObjectID} campaign_id 
 * @returns false if no claim exists, or ClaimedCoupon object if does exist
 */
const does_coupon_claim_receipt_exist = async (
    token_address,
    token_id,
    redeemer_address,
    shop_id,
    campaign_id
) => {

    let claim_receipt = await ClaimedCoupon.findOne({
        token_address: token_address,
        token_id: token_id,
        redeemer_address: redeemer_address,
        shop_id: shop_id,
        campaign_id: campaign_id
    })

    // if claim_receipt does not exist
    if (!claim_receipt) {
        return false;
    } else {
        return claim_receipt;
    }
}

/* =======  End of Available Coupons for User  ======= */



/**================================================== *
 * ==========  Helper Functions  ========== *
 * ================================================== */
const build_token_metadata = (tokenObject) => {

    // Initially build object with data we know will be present in the moralis NFT return
    let returnObject = {
        address: tokenObject.token_address ? tokenObject.token_address : "NO_ADDRESS",
        id: tokenObject.token_id ? tokenObject.token_id : "NO_ID",
        collection_name: tokenObject.name ? tokenObject.name : "NO_COLLECTION_NAME",
    }

    // Attempt to parse the tokenObject.metadata, which is JSON
    try {
        let token_metadata_parsed = JSON.parse(tokenObject.metadata);
        returnObject.name = token_metadata_parsed.name ? token_metadata_parsed.name : "PARSED_NO_METADATA_NAME";
        returnObject.image = token_metadata_parsed.image ? token_metadata_parsed.image : "PARSED_NO_METADATA_IMAGE_URL";
    } catch (e) {
        console.error("Failed Parsing Token Metadata for token", tokenObject.address, "ID:", tokenObject.token_id, "filling with bare minmmum data");
        // Maybe add dummy data here -- image is just the link to the token metata uri that failed?
        returnObject.name = "PARSE_FAILED_NO_METADATA_NAME"
        returnObject.image = "PARSE_FAILED_NO_METADATA_IMAGE_URL"
    }

    return returnObject;
}

const token_eligible_for_campaign = (tokenId, campaignGenerationDetails) => {
    // If the length of the campaignGenerationDetails.token_ids is 0, then we can't use it
    if (campaignGenerationDetails.length === 0) return false;

    let found_valid_generation_group = false;
    campaignGenerationDetails.forEach(generationGroup => {
        // tokenId must be greater than or equal to generationGroup.token_min_id
        // tokenID must be less than or equal to generationGroup.token_max_id
        if (tokenId >= generationGroup.token_min_id && tokenId <= generationGroup.token_max_id) {
            found_valid_generation_group = true;
        }

    })

    return found_valid_generation_group;
}

const get_eligible_token_offering_return = (tokenId, campaign) => {

    let offeringReturn = {
        store: {
            id: campaign.shop._id ? campaign.shop._id.toString() : "NO_STORE_ID",
            name: campaign.shop.name ? campaign.shop.name : "NO_shop_NAME",
            domain: campaign.shop.domain ? campaign.shop.domain : "NO_shop_DOMAIN",
            image: campaign.shop.image ? campaign.shop.image : "NO_shop_IMAGE",
        },
        campaign: {
            id: campaign._id ? campaign._id.toString() : "NO_CAMPAIGN_ID",
            name: campaign.campaign_title ? campaign.campaign_title : "NO_CAMPAIGN_NAME",
            value: "VALUE_PLACEHOLDER_TODO",
        }
    }

    campaign.coupon_generation_details.forEach(generationGroup => {
        if (tokenId >= generationGroup.token_min_id && tokenId <= generationGroup.token_max_id) {
            offeringReturn.campaign.generationGroupId = generationGroup._id;

            // Add the end-date if the coupon has a duration
            if (generationGroup.active_dates.has_end_date) {
                offeringReturn.campaign.end_date = generationGroup.active_dates.endDate ? generationGroup.active_dates.endDate : "NO_END_DATE";
            }
        }
    })

    return offeringReturn;
}



/* =======  End of Helper Functions  ======= */




module.exports = {
    // ! Depricated with generate on demand
    // getCoupon,
    // createCoupon,
    // deleteCoupon,
    // =======================
    // createCouponCodeToNFTMapping,
    // getCouponsFromAddressAndIds,
    buildCouponMetadataForTokens,
    build_available_coupon_offerings,

    // Claimed Coupon Interaction
    create_redeemed_coupon_receipt,
    does_coupon_claim_receipt_exist,
    get_users_redeemed_coupon_receipts
}

// const Moralis = require('moralis/node')

// const logger = require('../config/logger')
const catchAsync = require('../utils/catchAsync')
// const objectLog = require('../utils/objectLog')

// TODO import any services required
// const { NFTCoupon } = require('../models')
// const { getCouponsFromAddressAndIds } = require('../services/coupon.service')
const { getSuccessMessage, getErrorMessage, getInfoMessage } = require('../utils/PrimeNgMessage')
const { couponService, shopifyCouponService } = require('../services')
const { get_nfts_from_user_address, validate_user_owns_nft } = require('../services/moralis/moralis_nft.service')
const { does_active_campaign_id_with_target_address_exist, is_tokenid_valid_for_coupon_generation_group } = require('../services/campaign.service')
const objectLog = require('../utils/objectLog')

const { ShopifyCouponService, create_coupon_code_for_pricerule } = require('../services/shopify/shopify-coupon.service');

// const {couponService} = require("../services");

// given a web3 user address, return all NFTs that have coupon camapigns
const getUserCoupons = catchAsync(async (req, res) => {
    // Moralis Auth Middleware should have taken a session token
    // And validated, returning the user object for the requester
    console.log('CouponController::getUserCoupons()')
    // console.log(req.params.address);
    // console.log(req.body.address);
    console.log(req.web3User)

    // TODO Prepare a return that includes the metadata for all the owned NFTs to save a Web3API call

    const options = {
        chain: req.web3User.chain, // TODO this needs to come from the authSession req.user stuff..
        address: req.web3User.address,
    }

    const userNftsResults = await get_nfts_from_user_address(req.web3User.chain, req.web3User.address);

    // Return containing the Moralis NFT metadata list
    // objectLog(userNftsResults)

    if (userNftsResults.total === 0) {
        // return info message
        return res.status(200).json({
            coupons: [],
            message: {
                type: 'info',
                text: 'No NFTs found for this user',
                detail:
                    'No NFTs found for address ' +
                    req.web3User.address +
                    ' on the ' +
                    options.chain +
                    ' chain',
            },
        })
    }

    if (userNftsResults.total > userNftsResults.page_size) {
        console.log('More than one page of NFTs for this user')
        console.log(userNfts.total)
        console.log(userNfts.page_size)
        // throw error
        return res.status(500).json({
            message: getErrorMessage(
                '500',
                'More than one page of NFTs for this user - Backend not implemented to handle this yet'
            ),
        })
    }

    let userNfts = userNftsResults.result

    // TODO check if the returned results are less than the total that the user owns
    // ! This should actually be a coupon service call..
    // if userNfts.total < userNfts.page_size ==> We dont need to preform multiple requests

    // console.log('=== Building owned token address list ===')

    let ownedTokens = []

    // let tokensGroupedByContract = []

    userNfts.forEach((nft) => {
        // If there is already an object in ownedTokens with the same address, push token_id to token_ids array
        // Else create a new object with the address as the key and token_id as the value

        if (ownedTokens.find((token) => token.address === nft.address)) {
            ownedTokens
                .find((token) => token.address === nft.address)
                .token_ids.push(nft)
        } else {
            // TODO extract the NFT image URI and pass in this object

            ownedTokens.push({
                token_address: nft.token_address,
                token_ids: new Array(1).fill(nft),
            })
        }
    })

    // console.log(ownedTokens)


    // let possibleCoupons = await couponService.buildCouponMetadataForTokens(ownedTokens);

    let nft_coupon_offerings = await couponService.build_available_coupon_offerings(ownedTokens);

    console.log('=== Coupon offerings ===')
    console.log(nft_coupon_offerings);

    // Calculate complete coupon offering stats
    let offering_metadata = {};

    // * Total Unique Stores offering coupons
    offering_metadata.total_stores = nft_coupon_offerings.length;

    res.status(200).json({
        message: getSuccessMessage('Retrieved Active NFTCoupon Offerings', ''),
        nft_coupons: nft_coupon_offerings,
        nft_offering_metadata: offering_metadata
    })
})

const userClaimCoupon = catchAsync(async (req, res) => {
    //! LMFAO this is the goal amirite?

    console.log("User Claim Coupon Controller Called");
    console.log(req.body);
    /*
    POST Request
    Body has the following (ensured by validator):
        - token_address
        - token_id
        - campaign_id
        - generation_group_id
        - store_id

    Contained in req.web3User after success Moralis session validation
        - web3User.address == address
        - web3User.chain == chain
    */

    // * Check if the specified campaign is active and the targetCollectionAddress matches the specified token_address passed
    let is_campaign_valid = await does_active_campaign_id_with_target_address_exist(req.body.campaign_id, req.body.token_address);
    console.log("is_campaign_valid: " + is_campaign_valid);

    if (!is_campaign_valid) {
        console.log("Invalid Coupon Campaign ")
        return res.status(400).json({
            message: getErrorMessage('400', 'Invalid Coupon Campaign'),
        })
    }

    // * Check if the token_id is valid for the specified coupon_generation_details group
    let token_valid_for_generation_group = await is_tokenid_valid_for_coupon_generation_group(req.body.token_id, req.body.campaign_id, req.body.generation_group_id);
    console.log("token_valid_for_generation_group: ");
    objectLog(token_valid_for_generation_group);

    if (!token_valid_for_generation_group) {
        console.log("Invalid Coupon Generation Group for specified NFT Token")
        return res.status(400).json({
            message: getErrorMessage('400', 'Invalid Coupon Generation Group for specified NFT Token'),
        })
    }

    // * Check the owner of the NFT, make sure it matches req.user.address
    let does_user_own_nft = await validate_user_owns_nft(req.web3User.chain, req.web3User.address, req.body.token_address, req.body.token_id);
    console.info("User owns the requested NFT", does_user_own_nft);

    if (!does_user_own_nft) {
        return res.status(400).json({
            message: getErrorMessage('400', 'User does not own the requested NFT. ' + req.body.token_address + ":" + req.body.token_id),
        })
    }

    // * Check if the owner has already requested a coupon for this specific NFT/Campaign
    let has_user_already_claimed_offer = await couponService.does_coupon_claim_receipt_exist(
        req.body.token_address,
        req.body.token_id,
        req.web3User.address,
        req.body.store_id,
        req.body.campaign_id
    )

    console.log("Response from has_user_already_claimed_offer");
    console.log(has_user_already_claimed_offer)

    // * If they have already claimed, then return the already existing coupon
    if (has_user_already_claimed_offer) {
        console.log("User has already claimed the offer");
        // TODO Make response

        has_user_already_claimed_offer = has_user_already_claimed_offer.toObject()
        has_user_already_claimed_offer.type = "previous";

        console.log(has_user_already_claimed_offer)
        console.log(typeof has_user_already_claimed_offer)

        return res.status(200).json({
            message: getInfoMessage('Offer previously claimed', 'This coupon will only be valid if you have not already used it.'),
            coupon_claim: has_user_already_claimed_offer
        })
    }

    // ! If Havent claimed, can generate the coupon and return it

    // * If all these things pass, then generate a coupon code from the coupon_generation_details price_rule GID on the associated platform
    // Determine what service we need to invoke to generate new code
    if (token_valid_for_generation_group.platform === 'shopify') {
        let codeGenerationResults = await shopifyCouponService.create_coupon_code_for_pricerule(
            req.body.store_id,
            token_valid_for_generation_group.priceRuleId,
            token_valid_for_generation_group.code_length
        )

        console.log("AFTER codeGenerationResults");
        console.log(codeGenerationResults);

        // * Once the code is generated, build an audit record for the redemption and store it in the DB
        // Using ClaimedCoupon Mongoose Schema
        let coupon_receipt_obj = {
            token_address: req.body.token_address,
            token_id: req.body.token_id,
            redeemer_address: req.web3User.address,
            redeemer_user_id: 'tmp_moralis_user_id',
            platform: 'shopify',
            shop_id: req.body.store_id,
            campaign_id: req.body.campaign_id,
            coupon_code: codeGenerationResults.priceRuleDiscountCode.code,
            date_redeemed: new Date(),
            value_summary: 'tmp_implement_value_summary_function_from_generation_group_id'
        }

        let redeemed_receipt = await couponService.create_redeemed_coupon_receipt(coupon_receipt_obj);
        // tmp MAKE SURE THIS RETURNS A VALUE, NOT NULL
        console.log("AFTER redeemed_receipt object created");
        console.log(redeemed_receipt);

        redeemed_receipt = redeemed_receipt.toObject();
        redeemed_receipt.type = "new";

        return res.status(200).json({
            message: getSuccessMessage("Coupon Code Generated", "Claimed coupon offering successfully"),
            coupon_claim: redeemed_receipt
        })

    }



    // * Return the coupon code to the user


    /**
     * Return Values
     *  - New Generated Code
     */

    res.status(200).send('NOT FULLY IMPLEMENTED YET')
})

module.exports = {
    getUserCoupons,
    userClaimCoupon,
}

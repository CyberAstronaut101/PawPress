const ApiError = require('../utils/ApiError');
const { ShopifyStore, ShopifySessionToken } = require("../models");
const { Shopify } = require('../config/shopify');

const { generateCodes,
  priceRuleMutationFromGenDetails,
  buildDiscountRedeemCodeBulkInputs,
  arraysHaveCommonItems,
  generateRandomString } = require('../utils/CouponGenHelper');
// Honestly might just handle all the shopify stuff in the controller

const objectLog = require("../utils/objectLog");
// const util = require("util");
// const { getErrorMessage } = require("../utils/PrimeNgMessage");
// const httpStatus = require("http-status");

const { getCampaign, add_shopify_priceRuleGID_to_campaign } = require('./campaign.service');
const { getTargetCollectionById } = require('./target_collection.service');

const {
  // STAGED_UPLOADS_CREATE_MUTATION,
  // DISCOUNT_CODE_BASIC_CREATE,
  PRICE_RULE_CREATE_MUTATION,
  PRICE_RULE_DISCOUNT_CODE_CREATE_MUTATION,
  DISCOUNT_REDEEM_CODE_BULK_ADD_MUTATION,
} = require("../lib/shopify_graphql_constants");



/**================================================== *
 * ==========  Shopify Store Account Management  ========== *
 * ================================================== */

// TODO UPDATE ALL REFERENCES TO SHOP-MANAGEMENT.service.ts
//https://shopify.dev/api/admin-rest/2021-10/resources/shop#resource_object
const getShopifyStoreDetails = async (shopify_store, shopify_session_token) => {
  // Shopify Session should have .shop and a .accessToken
  console.log("ShopifyService::GetShopifyStoreDetails");
  console.log(shopify_store, shopify_session_token);

  const client = new Shopify.Clients.Rest(shopify_store, shopify_session_token);

  // console.log(client);

  // We just collect the bare mienimum data from the shopify store to create a local ShopifyStore DB entry

  const shopDetails = await client.get({
    path: 'shop',
    query: { "fields": "id,name,email,shop_owner,myshopify_domain,domain,subscription_level" }
    // query: {"fields" : "name%2Cemail%2Cshop%5Fowner%2Cmyshopify%5Fdomain"}
  })

  console.log("Get Shopify Store Details Return");
  console.log(shopDetails.body.shop);

  return shopDetails.body.shop;
}
// TODO UPDATE ALL REFERENCES TO SHOP-MANAGEMENT.service.ts
const getShopifyStoreByDomain = async (shopify_store_domain) => {
  return ShopifyStore.findOne({ myshopify_domain: shopify_store_domain })
}
// TODO UPDATE ALL REFERENCES TO SHOP-MANAGEMENT.service.ts
const getShopifyStoreById = async (shopifyStoreId) => {
  return ShopifyStore.findById(shopifyStoreId);
}
// TODO UPDATE ALL REFERENCES TO SHOP-MANAGEMENT.service.ts
const createShopifyStore = async (store_body) => {
  // Make sure to not create duplicate entry
  if (!await ShopifyStore.hasStoreInstalled(store_body.myshopify_domain)) {

    console.log("ShopifyService::CreateShopifyStore for new store installing our app");
    console.log(store_body);

    return ShopifyStore.create({
      shopify_id: store_body.id,
      name: store_body.name,
      email: store_body.email,
      shop_owner: store_body.shop_owner,
      myshopify_domain: store_body.myshopify_domain,
      domain: store_body.domain,
      subscription_level: 'free'
    })

  } else {
    console.log("CreateShopifyStore called when store already exists  in our DB");
    return false;
  }

}
// TODO UPDATE ALL REFERENCES TO SHOP-MANAGEMENT.service.ts
const hasShopifyStoreInstalled = async (shopify_store_domain) => {
  return ShopifyStore.hasStoreInstalled(shopify_store_domain);
}

/* =======  End of Shopify Store Account Management  ======= */



/**================================================== *
 * ==========  Shopify Coupon Management  ========== *
 * ================================================== */
const getShopDiscountCodes = async (session, shopifyStoreId) => {
  // How do we get the shopify session??
  console.log("ShopifyService::GetShopDiscountCodes");
  console.log(shopifyStoreId);

  // Make Call

  const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
  const data = await client.get({
    path: 'discount_codes/count'
  })

  console.log("Shop Coupon Code Count: " + data.body.count);

  // Get the list of the discount codes


  /*********  Testing out some GraphQL  **********/
  const graphQL_Client = new Shopify.Clients.Graphql(session.shop, session.accessToken);

  const query = `{
        priceRules (first: 100) {
          edges {
            node {
              id
              title
              target
              status
              usageLimit
              oncePerCustomer
              createdAt
              discountCodesCount
            }
          }
        }
      }`;

  const response = await graphQL_Client.query({
    data: query
  });

  console.log("GraphQL Response");
  console.log(response.body);
  console.log(response.body.data.priceRules.edges)

  // return data;
  return 'return_from_coupon_count_call'

}

/**
 * Called after a coupon campaign object is created
 * will iterate over each coupon_generation_details and create
 * a shopify `priceRule` and a single test coupon code.
 * Resulting priceRule GID is used during claiming process to generate
 * coupon codes on the fly when a customer tries to claim, as opposed to
 * generating 10,000 codes upfront. 
 * @param {ObjectID} shopId 
 * @param {string} shopDomain 
 * @param {ObjectID} campaignId 
 */
const createCampaignPriceRules = async (shopId, shopDomain, campaignId) => {
  console.log("ShopifyService::createCampaignPriceRules");
  console.log(shopId, shopDomain, campaignId);

  const campaign = await getCampaign(campaignId);
  const session = await Shopify.Utils.loadOfflineSession(shopDomain);
  const client = new Shopify.Clients.Graphql(session.shop, session.accessToken);

  console.log("Campaign has " + campaign.coupon_generation_details.length + " coupon generation details");

  // Make sure we have at least one coupon generation detail
  if (campaign.coupon_generation_details.length == 0) return;

  // Get the targetNFTCollection details

  let targetNFTCollectionDetails = await getTargetCollectionById(campaign.targetCollectionId);
  console.log(targetNFTCollectionDetails);

  // Iterate over each coupon_generation_details
  for (const generationGroup of campaign.coupon_generation_details) {

    console.log(generationGroup)

    // Build PriceRule Name
    let priceRuleName = campaign.campaign_title + "_" + targetNFTCollectionDetails.target_label + "_" + generationGroup.target_name;

    // Build the Shopify GraphQL Query to create PriceRule
    let priceRuleMutation = priceRuleMutationFromGenDetails(
      priceRuleName,
      generationGroup
    );

    // Make GraphQL Mutation Call
    let priceRuleCreateResponse = await client.query({
      data: {
        query: PRICE_RULE_CREATE_MUTATION,
        variables: {
          priceRule: priceRuleMutation
        }
      }
    });

    console.log("Price Rule Create Response");
    objectLog(priceRuleCreateResponse.body);

    // Check if the mutation was successful
    if (!priceRuleCreateResponse.body.data.priceRuleCreate.priceRule.id)
      throw new ApiError("PriceRule Create Failed", 500);

    let priceRuleId = priceRuleCreateResponse.body.data.priceRuleCreate.priceRule.id;
    let test_code = "INIT_TEST_" + generateRandomString(generationGroup.generate_code_length)
    // Create the test coupon code under the newly created PriceRule
    let testCouponCodeResponse = await client.query({
      data: {
        query: PRICE_RULE_DISCOUNT_CODE_CREATE_MUTATION,
        variables: {
          priceRuleId: priceRuleId,
          code: test_code
        }
      }
    })

    console.log("Test Coupon Code Response");
    objectLog(testCouponCodeResponse.body)

    // Check if the mutation was successful
    if (!testCouponCodeResponse.body.data.priceRuleDiscountCodeCreate.priceRuleDiscountCode.code == test_code)
      throw new ApiError("PriceRule Create Failed", 500);


    // Update the campaign coupon group object with metadata about the newly created PriceRule

    // TODO PICKUP HERE
    console.log("Adding generated PriceRulGID to campaign");
    console.log(campaignId);
    console.log(generationGroup._id.toString());
    console.log(priceRuleId)
    let results = await add_shopify_priceRuleGID_to_campaign(campaignId, generationGroup._id.toString(), priceRuleId);

    console.log("Results from adding PriceRuleGID to campaign");
    console.log(results);
  }

  // Return something/??

  // If here, all pricerules for campaign created and 




}

// ! DEPRICATED: This function is no longer used: codes are generated on the fly at time of claim
const createCampaignCoupons = async (shopId, shopDomain, campaignId) => {
  throw ApiError(500, "Depricated: shopifyService::createCampaignCoupons --This function is no longer used: codes are generated on the fly at time of claim");
}

/* =======  End of Shopify Coupon Management  ======= */


/**================================================== *
 * ==========  Shopify Offline Session Tokens  ========== *
 * ================================================== */

/**
 * Called during the 0Auth callback. Ensures that we have a copy of the 
 * Shopify Offline Session token saved in persistent storage for use when
 * we need to generate codes when a shop owner might be offline and not currently
 * connected to the webapp.
 * 
 * Creates the token if does not exist for shop
 * If exists, ensures that the token is up to date by updating if different
 * @param {Shop ObjectId} shopId 
 * @param {Shopify 0Auth offline session token} currentSessionToken 
 */
const ensureShopSessionToken = async (shopId, currentSessionToken) => {
  // Check if the shop has a session token
  // If it does, check if the session token matches the currentSessionToken
  // If it does not, then update the token
  // If it does not have a token, add an entry with the currentSessionToken
  let sessionReturn = await ShopifySessionToken.find({ shop_id: shopId });
  console.log(sessionReturn.length, " number of session tokens for shop " + shopId);

  if (sessionReturn.length > 0) {
    // Shop has session token, check if it matches the passed token
    if (sessionReturn[0].offline_session_token != currentSessionToken) {
      // Session token does not match, update it
      await ShopifySessionToken.updateOne({ shop_id: shopId }, { offline_session_token: currentSessionToken });
    }
  } else if (sessionReturn.length == 0) {
    // Shop has no session token, add one with the passed token
    let newSessionToken = new ShopifySessionToken({
      shop_id: shopId,
      offline_session_token: currentSessionToken
    });
    await newSessionToken.save();
  }
}

const saveShopifySessionToken = async (shopId, sessionToken) => {
  // Make sure shop exists
  let shop = await getShopifyStoreById(shopId);
  if (!shop) throw new ApiError("Shop not found when saving session token", 404);
  let shopifySession = new ShopifySessionToken({
    shopId: shopId,
    offline_session_token: sessionToken,
  });

  await shopifySession.save();
}




/* =======  End of Shopify Offline Session Tokens  ======= */

module.exports = {
  // Store Related
  getShopifyStoreDetails,
  createShopifyStore,
  getShopifyStoreByDomain,
  getShopifyStoreById,
  hasShopifyStoreInstalled,
  ensureShopSessionToken,
  saveShopifySessionToken,



  // Coupon Service Calls
  getShopDiscountCodes,

  // Campaign Generation
  createCampaignCoupons,
  createCampaignPriceRules
}
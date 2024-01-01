// const ApiError = require('../utils/ApiError');
// const { Shopify } = require('../config/shopify');

const { default: Shopify } = require("@shopify/shopify-api");
const { response } = require("express");
const { shopifyShopManagementService } = require("..");
const { QUERY_PRICERULE_BY_ID, PRICE_RULE_DISCOUNT_CODE_CREATE_MUTATION } = require("../../lib/shopify_graphql_constants");
const ApiError = require("../../utils/ApiError");
const { generateRandomString } = require("../../utils/CouponGenHelper");
const objectLog = require("../../utils/objectLog");

// const { getShopifySessionToken } = require("./shop-management.service");

// const { ShopifyShopManagementService } = require('./shop-management.service');


// Create a PriceRule
// HealthCheck PriceRule validate

// Create a coupon code under a PriceRule
const create_coupon_code_for_pricerule = async (storeId, priceRuleGID, codeLength) => {
    // * Need a shopID to get the offline session token
    const session = await shopifyShopManagementService.getShopifySessionToken(storeId);
    console.log("SESSION TOKEN FOR GENERATE COUPON: ");
    console.log(session);

    // If session does not exist, throw error
    if (!session) {
        // TODO Maybe have an email sent to shop owner?
        // This will only happen if we do not have a session token for the shop
        // Possible that the shop has not installed our app, or have deleted?
        throw new Error("Unable to build session to Shopify ");
    }

    // * Verify that the specified PriceRuleID exists
    // Create the GraphQL connection
    const graphQL_Client = new Shopify.Clients.Graphql(session.store, session.offline_session_token);
    // First Test if the priceRuleGID Exists
    const pricerule_exists_test = await graphQL_Client.query({
        data: {
            query: QUERY_PRICERULE_BY_ID,
            variables: {
                priceRuleGid: priceRuleGID
                // priceRuleGid: "fake_gid_for_testing"
            }
        }
    })

    // If pricerule_exists_test.error has length
    if (pricerule_exists_test.body.errors) {
        console.log("!! ERROR RETURNED FROM PRICERULE EXISTS CHECK !!");
        throw new ApiError(500, "Unable to generate coupon code for non-existent PriceRule");
    }

    // Dont need to reduntandly check if the priceRuleGID matches, the query will confirm that
    // if (pricerule_exists_test.body.)
    // if (pricerule_exists_test.body.data.priceRule.id != priceRuleGID) {
    //     console.log("PriceRule Exists and matches input PriceRuleGID");
    // }

    // * Generate a coupon code and create it under the PriceRule

    let attempt_count = 0;
    let attmpt_limit = 5

    let generated_coupon_code_status = false;
    let successful_coupon_results;
    while (!generated_coupon_code_status) {

        attempt_count++;
        if (attempt_count > attmpt_limit) {
            // Limit the number of attempts to 5
            throw new ApiError(500, "Unable to create coupon on Shopify. Attempts exceeded with no success");
        }

        // Generate the code
        let couponCode = generateRandomString(codeLength);
        console.log('COUPON CODE: ', couponCode);

        // Attempt to create the code
        let queryData = {
            query: PRICE_RULE_DISCOUNT_CODE_CREATE_MUTATION,
            variables: {
                code: couponCode,
                // code: "known_same_code_for_testing",
                priceRuleId: priceRuleGID
            }
        }

        let coupon_create_response = await graphQL_Client.query({
            data: queryData
        })

        console.log("==== Response from Coupon Code Create ====");
        objectLog(coupon_create_response.body);

        // If coupon_create_response.body.data.priceRuleDiscountCodeCreate.priceRuleUserErrors.length > 0
        if (coupon_create_response.body.data.priceRuleDiscountCodeCreate.priceRuleUserErrors.length > 0) {
            let error_message = coupon_create_response.body.data.priceRuleDiscountCodeCreate.priceRuleUserErrors[0].message;
            console.log("!! ERROR RETURNED FROM COUPON CODE CREATE !!");
            // throw new ApiError(500, "Unable to generate coupon code for PriceRule - Possible duplicate code");

            // If the error_message contains 'must be unique'
            if (error_message.includes("must be unique")) {
                console.log("- Coupon Code is a duplicate, will try again");
            }
        }

        // Check if we were successful
        if (coupon_create_response.body.data.priceRuleDiscountCodeCreate.priceRuleDiscountCode !== null && coupon_create_response.body.data.priceRuleDiscountCodeCreate.priceRuleDiscountCode.code === couponCode) {
            console.log("Coupon Code Created Successfully");
            generated_coupon_code_status = true;
            successful_coupon_results = coupon_create_response.body.data.priceRuleDiscountCodeCreate;
        }

    }

    console.log("=========== After Successful Coupon Code Create ===========");
    console.log(successful_coupon_results)

    return successful_coupon_results;
}





module.exports = {
    create_coupon_code_for_pricerule
}
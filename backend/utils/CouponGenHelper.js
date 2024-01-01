/*
    Coupon Generator Helper Class

    Coupon Model
    {
        id
        shop_id
        campaign_id
        target_collection_id
        nft_address
        nft_token_id
        coupon
    }

    coupon needs to be unique to the shop_id coupon list..

*/
// const createCouponMutationFromGenerationDetails = (generationDetails) => {
//     console.log('createCouponMutationFromGenerationDetails', generationDetails);
// const fs = require('fs');

const ApiError = require('./ApiError')

//     // Need to create all the mutations for this specific group of coupons
//     // Return that array of mutations

//     // generateCodes(generationDetails.generate_code_count, generationDetails.generate_code_length);
//     // let codes = generateCodes(10000, 12);

//     return "todo_implement_mutation_from_gendetails"
// }

const arraysHaveCommonItems = (array1, array2) => {
    for (let i = 0; i < array1.length; i++) {
        for (let j = 0; j < array2.length; j++) {
            if (array1[i] === array2[j]) return true
        }
    }
    return false
}

/**================================================== *
 * ==========  Coupon Mutation Helpers  ========== *
 * ================================================== */
const createCouponMutationFromGenerationDetails = (generationDetails) => {
    console.log('createCouponMutationFromGenerationDetails', generationDetails)

    let returnMutation = {
        code: 'BUG_IF_NOT_REPLACED',
        title: 'BUG_IF_NOT_REPLACED_SHOWN_IN_SHOPIFY_ADMIN',
        customerGets: customerGetsBuild(generationDetails),
        customerSelection: {
            all: true,
        },
        startsAt: new Date(),
    }

    return returnMutation
}

const priceRuleMutationFromGenDetails = (priceRuleTitle, gen_details) => {
    /*
        Expected Output (MINIMUM TO CREATE)
        {
            "allocationMethod": "ACROSS",
            "customerSelection": {
                "forAllCustomers": true
                },
            "oncePerCustomer": true,
            "shippingEntitlements": {
                "targetAllShippingLines": true
                },
            "itemEntitlements": {
                "targetAllLineItems": true
                },
            "target": "LINE_ITEM",
            "title": "NEW TEST",
            "usageLimit": 1,
            "validityPeriod": {
            "start": "2020-01-01T00:00:00-05:00"
            },
            "value": {
            "percentageValue": -15
            }
        }
    */
    let ret = {
        title: priceRuleTitle,
        target: 'LINE_ITEM',
        allocationMethod: 'ACROSS',
    }

    /*--------  Determine Price Rule Value  --------*/
    // #region
    if (gen_details.discount_type == 'discountPercentage') {
        // discount Value needs to be between -100 and 0
        let discountValue = 0 - gen_details.discount_value

        // Edge Case Check
        if (discountValue < -100) discountValue = -100
        if (discountValue > 0) discountValue = 0

        ret.value = {
            percentageValue: discountValue,
        }
    } else if (gen_details.discount_type == 'discountAmount') {
        ret.value = {
            fixedAmountValue: gen_details.discount_value,
        }
    } else {
        throw new ApiError(
            'Invalid Discount Type: ' + gen_details.discount_type,
            400
        )
    }
    // #endregion Build PriceRule Value

    /*--------  Determine Usage Limits   --------*/
    // #region

    // PriceRule has to be valid for any user
    ret.customerSelection = {
        forAllCustomers: true,
    }

    if (gen_details.usage_limits.limit_total_use) {
        // Limit Each Code Total Times can be used
        // Make sure that the total_use_count is valid
        if (!gen_details.usage_limits.total_use_count)
            throw new ApiError(
                'Generation specified limit_total_use, but no total_use_count',
                400
            )

        ret.usageLimit = gen_details.usage_limits.total_use_count
    }

    // Coupon under Price rule could have multiple uses, but only once per customer (per email used)
    if (gen_details.usage_limits.limit_per_user) ret.oncePerCustomer = true

    // #endregion Build Usage Limits

    /*--------  Active Dates   --------*/
    // #region

    if (gen_details.active_dates.end_date) {
        ret.validityPeriod = {
            start: gen_details.active_dates.start_date,
            end: gen_details.active_dates.end_date,
        }
    } else {
        ret.validityPeriod = {
            start: gen_details.active_dates.start_date,
        }
    }

    // #endregion Active Dates

    //! TODO NOT FULLY IMPLEMENTED on FRONTEND
    /*--------  Item Entitlements  --------*/
    // #region

    if (gen_details.applies_to.target_type == 'entire_order') {
        // No Entitlements
        ret.itemEntitlements = {
            targetAllLineItems: true,
        }
    } else if (gen_details.applies_to.target_type == 'specific_collections') {
        // Add Entitlements
        // ! NOT IMPLEMENTED ON FRONTEND !
    } else if (gen_details.applies_to.target_type == 'specific_products') {
        // ! NOT IMPLEMENTED ON FRONTEND !
    }

    // #endregion Product Limits

    //! NOT FULLY IMPLEMENTED ON FRONTEND - TODO add input field???? WTF
    /*-------- Minimum Requirements  --------*/
    // #region

    // Default is none, if so, do not need to add a prerequisite to mutation

    // If a Min Purchase Amount
    if (
        gen_details.minimum_requirements.requirement_type == 'minPurchaseAmount'
    ) {
        if (!gen_details.minimum_requirements.min_requirements_value)
            throw new ApiError(
                'Minimum Purchase Amount Value not specified',
                400
            )

        ret.prerequisiteSubtotalRange = {
            greaterThanOrEqualTo:
                gen_details.minimum_requirements.min_requirements_value,
        }
    }

    if (gen_details.minimum_requirements.requirement_type == 'minQuantity') {
        if (!gen_details.minimum_requirements.min_requirements_value)
            throw new ApiError('Minimum Quantity Value not specified', 400)

        ret.prerequisiteQuantityRange = {
            greaterThanOrEqualTo:
                gen_details.minimum_requirements.min_requirements_value,
        }
    }

    // #endregion Minimum Requirements

    return ret
}

const buildDiscountRedeemCodeBulkInputs = (mutations) => {
    let returnInputs = []

    mutations.forEach((mutation) => {
        if (mutation.code_count !== mutation.codes.length)
            return new ApiError(
                'Mutation code count does not match code array length',
                400
            )

        if (mutation.code_count > 100) {
            // TODO split into max codes length of 100 per input object

            console.log(
                '-- Have count of ' +
                mutation.code_count +
                ' and max of 100, splitting into multiple inputs'
            )

            // How many groups will we need to generate?
            let groupCount = Math.ceil(mutation.code_count / 100)
            console.log('-- Group Count: ' + groupCount)

            for (let i = 0; i < groupCount; i++) {
                let startIndex = i * 100
                let endIndex = startIndex + 100

                console.log(
                    '-- Generating Inputs for index range: ' +
                    startIndex +
                    ' to ' +
                    endIndex
                )

                let groupCodes = mutation.codes.slice(startIndex, endIndex)
                let codesInput = []

                groupCodes.forEach((code) => {
                    codesInput.push({
                        code: code,
                    })
                })

                let newInput = {
                    codes: codesInput,
                    discountId: mutation.priceRuleId,
                }

                returnInputs.push(newInput)
            }
        } else {
            // Just making a single input object

            let codesInput = []
            // for each code in mutation.codes, add object {"code": code} to codesInput
            mutation.codes.forEach((code) => {
                codesInput.push({
                    code: code,
                })
            })

            returnInputs.push({
                codes: codesInput,
                discountId: mutation.priceRuleId,
            })
        }

        // End each mutation
    })

    // console.log("Discount Redeem Code Bulk Inputs");
    // console.log(returnInputs);
    return returnInputs
}

const pricerule_coupon_bulk_input_jsonl = (mutations) => {
    // Limit to 100 codes per mutation input JSONL Line..

    let returnJSON = []

    mutations.forEach((mutation) => {
        if (mutation.code_count !== mutation.codes.length)
            return new ApiError(
                'Mutation code count does not match code array length',
                400
            )

        if (mutation.code_count > 100) {
            // Need to split into multiple mutations
            // TODO implement this logic
            // For loop, then build codeLine return
        } else {
            // No need to split, just build the JSONL with one line
            let codeLine = {}

            // Build the codes array
            let codes = []
            mutation.codes.forEach((code) => {
                codes.push({
                    code: code,
                })
            })

            codeLine.codes = codes
            codeLine.discountId = mutation.priceRuleId
            console.log(codeLine)

            returnJSON.push(codeLine)
        }
    })

    console.log(returnJSON)

    console.log(JSON.stringify(returnJSON))

    // With all mutation input, create JSONL format
    // console.log(returnJSON);
    let returnJSONL = JSON.stringify(returnJSON)
        .replace('[', '')
        .replace(']', '')
        .replaceAll('},{', '}\n{')
    // console.log("Returning JSONL");
    console.log(returnJSONL)

    // let returnJSONL = returnJSON.map(x=>JSON.stringify(x)).join('\n');

    console.log('BITCHASS')

    return returnJSONL
}

// const customerGetsBuild = (gen_details) => {
//     var retObj = {
//         items: {},
//         value: {}
//     }
//     /*********  Build Items Object  **********/
//     // either entire order, specific products, or specific collections
//     if(gen_details.applies_to.target_type == 'entire_order') {
//         console.log("- Discount Can Apply to Any Products or Collections");
//         retObj.items = {
//             all: true
//         }
//     } else if (gen_details.applies_to.target_type == 'specific_collections') {
//         // applies_to.target_values is an array of collection ids
//         // add retObj.items.collections.add = [1,2,3]
//         // ! NOT IMPLEMENTED ON FRONTEND
//     } else if (gen_details.applies_to.target_type == 'specific_products') {
//         // applies_to.target_values is an array of collection ids
//         // add retObj.items.products.productsToAdd = [1,2,3]
//         // ! NOT IMPLEMENTED ON FRONTNED
//     }

//     /*********  Build Discount Value Object  **********/
//     // value.discountAmount
//     // value.discountOnQuantity
//     // percentage - is this whole number or decimal from frontend..?
//     if (gen_details.discount_type == 'discountPercentage') {
//         console.log("- Percentage Discount");

//         // Make sure that gen_details.discount_value is a float between 0 and 1.00
//         if (gen_details.discount_value > 1.00) {
//             gen_details.discount_value = gen_details.discount_value / 100;
//         } else if (gen_details.discount_value < 0) {
//             gen_details.discount_value = 0;
//         }
//         retObj.value.percentage = gen_details.discount_value;

//     } else if (gen_details.discount_type == 'discountAmount') {
//         console.log("- Amount Discount of " + gen_details.discount_value + " on order");
//         retObj.value.discountAmount = {
//             amount: gen_details.discount_value,
//             appliesOnEachItem: false
//         }
//     }

//     return retObj;
// }

/* =======  End of Coupon Mutation Helpers  ======= */

/**================================================== *
 * ==========  Coupon Code Generation  ========== *
 * ================================================== */
// #region
const generateCodes = (couponCodeCount, couponCodeLength) => {
    // Generate array of length couponCodeCount of random strings of length couponCodeLength
    returnArray = []

    for (i = 0; i < couponCodeCount; i++) {
        let randomString = generateRandomString(couponCodeLength)
        // if the new random string is not already in the return array, push
        if (!returnArray.includes(randomString)) {
            returnArray.push(randomString)
            // console.log(randomString, randomString.length)
        }
        // if the new random string is already in the return array, generate a new random string
        else {
            console.log('duplicate found, generating new random string')
            i--
        }
    }

    console.log('ReturnArrayLength: ', returnArray.length)
    return returnArray
}

const generateRandomString = (length) => {
    let result = '',
        seeds

    for (let i = 0; i < length; i++) {
        //Generate seeds array, that will be the bag from where randomly select generated char
        seeds = [
            Math.floor(Math.random() * 10) + 48,
            Math.floor(Math.random() * 25) + 65,
            Math.floor(Math.random() * 25) + 97,
        ]

        //Pick randomly from seeds, convert to char and append to result
        result += String.fromCharCode(seeds[Math.floor(Math.random() * 3)])
    }

    return result.toUpperCase()
}
// #endregion
/* =======  End of Coupon Code Generation  ======= */

const build_jsonl_from_mutation_array = (mutations) => {
    // convert array of json objects to jsonl
    // https://stackoverflow.com/questions/10865025/merge-flatten-an-array-of-json-objects-into-a-single-json-object

    /*
    contents of mutation object
        {
            code_count
            code_length
            mutation: {}
            codes: {}
        }
    */

    let allJsonl = []

    mutations.forEach((mutationObject) => {
        if (mutationObject.code_count !== mutationObject.codes.length) {
            console.error(
                '! Cannot generate JSONL: codes.length !== code_count'
            )
            return
        }

        let currentGenerationOutput = []

        mutationObject.codes.forEach((code) => {
            let push = { ...mutationObject.mutation }
            push.code = code
            currentGenerationOutput.push(push)
        })

        allJsonl = allJsonl.concat(currentGenerationOutput)
    })

    console.log('====== JSONL OUTPUT ======')
    // console.log(allJsonl);

    let jsonLOutput = JSON.stringify(allJsonl)
        .replace('[', '')
        .replace(']', '')
        .replaceAll('},{', '}\n{')

    // TODO figure out wtf to do with this in order to make the Shopify request..
    // fs.writeFile("output.jsonl", jsonLOutput, 'utf8', function (err) {
    //     if (err) {
    //         console.log("An error occured while writing JSONL file")
    //         return console.log(err);
    //     }

    //     console.log("JSONL File saved");
    // })

    return jsonLOutput
}

module.exports = {
    createCouponMutationFromGenerationDetails,
    generateCodes,
    generateRandomString,
    build_jsonl_from_mutation_array,
    // Price Rule Mutation
    priceRuleMutationFromGenDetails,
    pricerule_coupon_bulk_input_jsonl,
    buildDiscountRedeemCodeBulkInputs,
    arraysHaveCommonItems,
}

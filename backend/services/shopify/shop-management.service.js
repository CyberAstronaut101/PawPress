const { ShopifyStore, ShopifySessionToken } = require('../../models')
const { Shopify } = require('../../config/shopify')
var mongoose = require('mongoose')
const objectLog = require('../../utils/objectLog')


/**================================================== *
 * ==========  NFTC ShopifyStores Collection   ========== *
 * ================================================== */
//#region NFTC ShopifyStores Collection Management

const getShopifyStoreByDomain = async (shopify_store_domain) => {
    return ShopifyStore.findOne({ myshopify_domain: shopify_store_domain })
}

const getShopifyStoreById = async (shopifyStoreId) => {
    return ShopifyStore.findById(shopifyStoreId)
}

const createShopifyStore = async (store_body) => {
    // Make sure to not create duplicate entry
    if (!(await ShopifyStore.hasStoreInstalled(store_body.myshopify_domain))) {
        console.log(
            'ShopifyService::CreateShopifyStore for new store installing our app'
        )
        console.log(store_body)

        return ShopifyStore.create({
            shopify_id: store_body.id,
            name: store_body.name,
            email: store_body.email,
            shop_owner: store_body.shop_owner,
            myshopify_domain: store_body.myshopify_domain,
            domain: store_body.domain,
            subscription_level: 'free',
        })
    } else {
        console.log(
            'CreateShopifyStore called when store already exists  in our DB'
        )
        return false
    }
}

const hasShopifyStoreInstalled = async (shopify_store_domain) => {
    return ShopifyStore.hasStoreInstalled(shopify_store_domain)
}

// ! =================== Shop Offline Token Management ===================

/**
 * Retrieves the Shopify Session Token for the shop
 * @param shopId ShopifyStore to get the session token for
 * @returns {ShopifySessionToken}
 */
const getShopifySessionToken = async (shopId) => {
    // Given a ShopID, check for a session token in the ShopifySessionToken Collection
    // If it exists, return the token
    // If it does not exist, return null

    console.log("GetShopifySsessionToken for Shop_id: " + shopId)

    // MongoDB Aggregate stage to convert string to ObjectID
    let shopIdObjectId = mongoose.Types.ObjectId(shopId)


    let shopifySession = await ShopifySessionToken.aggregate([
        {
            $match: {
                shop_id: shopIdObjectId,
            }
        },
        {
            $lookup: {
                from: 'shopifystores',
                // localField: 'shop_id',
                // foreignField: '_id',
                let: { shop_id: '$shop_id' },
                as: 'shopify_store',
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
                            _id: 0,
                            myshopify_domain: 1
                        }
                    }
                ]
            }
        },
        {
            $project: {
                _id: 0,
                offline_session_token: 1,
                store: {
                    $arrayElemAt: ['$shopify_store.myshopify_domain', 0]
                }
            }
        }
    ])

    // !TODO Pickup here -- Why TF is this aggregation not returning anything..
    // ! Needed to cast the shop_id to ObjectId

    // # test 
    // console.log("Get Shopify Session Token Return")
    // objectLog(shopifySession);

    if (shopifySession.length > 0) {
        return shopifySession[0]
    } else {
        return false
    }
}

// #endregion
/* =======  End of NFTC ShopifyStores Collection   ======= */

/**================================================== *
 * ==========  Shopify Shop API Calls  ========== *
 * ================================================== */
//#region Shopify API Calls
// TODO NOT BEING USED ACROSS APP
//https://shopify.dev/api/admin-rest/2021-10/resources/shop#resource_object
const getShopifyStoreDetails = async (shopify_store, shopify_session_token) => {
    // Shopify Session should have .shop and a .accessToken
    console.log('ShopifyService::GetShopifyStoreDetails')
    console.log(shopify_store, shopify_session_token)

    const client = new Shopify.Clients.Rest(
        shopify_store,
        shopify_session_token
    )

    // console.log(client);

    // We just collect the bare mienimum data from the shopify store to create a local ShopifyStore DB entry

    const shopDetails = await client.get({
        path: 'shop',
        query: {
            fields: 'id,name,email,shop_owner,myshopify_domain,domain,subscription_level',
        },
        // query: {"fields" : "name%2Cemail%2Cshop%5Fowner%2Cmyshopify%5Fdomain"}
    })

    console.log('Get Shopify Store Details Return')
    console.log(shopDetails.body.shop)

    return shopDetails.body.shop
}
// #endregion
/* =======  End of Shopify Shop API Calls  ======= */



module.exports = {
    getShopifySessionToken,
}

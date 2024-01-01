const httpStatus = require('http-status')
const { TargetNftCollection } = require('../models')
const catchAsync = require('../utils/catchAsync')

const ApiError = require('../utils/ApiError')

// CRUD operations for Target NFT Collections

/**
 * Create a Target NFT Collection
 * @param {TargetNftCollection} targetNftCollectionBody
 * @returns {Promise<TargetNftCollection>}
 */
const createTargetNftCollection = async (userId, targetNftCollectionBody) => {
    // Check if the user already has a target collection with this name
    if (
        await TargetNftCollection.isLabelUserDuplicate(
            targetNftCollectionBody.target_label,
            userId
        )
    ) {
        // User already has target collection with this label, cant create duplicate
        // Either change label or edit existing target collection
        console.log(
            'User already has target collection with this label, cant create duplicate'
        )
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Target NFT Collection with this label already exists'
        )
    }

    console.log('After create target collection duplicate label check')

    // No Target Label conflict, create new target collection
    return TargetNftCollection.create(targetNftCollectionBody)
}

/**
 * Query for Target NFT Collections
 * @param {ObjectId} userId
 * @returns {Promise<TargetNftCollection[]>}
 */
const getOwnedTargetNftCollections = async (userId) => {
    console.log('Getting owned target collections for user: ' + userId)
    return TargetNftCollection.find({ owner_id: userId })
}

/**
 * Updates a target collection by id
 * @param {ObjectID} targetNftCollectionId
 * @param {TargetCollectionModel} targetNftCollectionBody
 * @returns
 */
const updateTargetNftCollection = async (
    targetNftCollectionId,
    targetNftCollectionBody
) => {
    // Make sure target NFT Collection exists
    const targetNftCollection = await getTargetCollectionById(
        targetNftCollectionId
    )

    if (!targetNftCollection) {
        // No Collection Found
        throw new ApiError(
            httpStatus.NOT_FOUND,
            'Target NFT Collection not found'
        )
    }

    // Make sure user not updating the target label to a label that already exists
    if (
        targetNftCollection.target_label &&
        (await TargetNftCollection.canUpdateTargetLabel(
            targetNftCollectionId,
            targetNftCollectionBody.target_label,
            targetNftCollection.owner_id
        ))
    ) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Target NFT Collection with this label already exists for user'
        )
    }

    console.log(targetNftCollectionBody.token_matching_rules.matching_bins)

    // targetNFTCollection holds the original targetNftCollection object
    //  Strip out the _id on all the targetNftCollectionBody.token_matching_rules.matching_bins
    targetNftCollectionBody.token_matching_rules.matching_bins.forEach(
        (matching_bin) => {
            if (matching_bin._id) {
                if (matching_bin._id.length == 0) {
                    delete matching_bin._id
                }
            }
        }
    )

    // Update target NFT Collection
    Object.assign(targetNftCollection, targetNftCollectionBody)

    await targetNftCollection.save()
    return targetNftCollection
}

/**
 * @param {ObjectId} id
 * @returns {Promise<TargetNftCollection>}
 */
const getTargetCollectionById = async (id) => {
    return TargetNftCollection.findById(id)
}

const deleteTargetNftCollection = async (id) => {
    // TODO verify that this target collection is not currently in use by any campaigns or coupon generations
    return TargetNftCollection.findByIdAndDelete(id)
}


/**
 * Used to verify that a TargetNFTCollection specified exists and is owned by the shop trying to 
 * use it
 * @param {Shopify Shop ObjectID} shop_id 
 * @param {TargetNFtCollection ObjectID} target_nft_collection_id 
 */
const getTargetCollectionByShopAndId = async (shop_id, target_nft_collection_id) => {
    return TargetNftCollection.findOne({
        _id: target_nft_collection_id,
        owner_id: shop_id
    })
}

module.exports = {
    createTargetNftCollection,
    getOwnedTargetNftCollections,
    updateTargetNftCollection,
    deleteTargetNftCollection,
    getTargetCollectionById,
    getTargetCollectionByShopAndId
}

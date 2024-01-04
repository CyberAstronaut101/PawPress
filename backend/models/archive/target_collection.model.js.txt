const { toJSON } = require('./plugins')
const mongoose = require('../config/mongoose')

const targetNftCollectionSchema = new mongoose.Schema({
    owner_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'ShopifyStore',
        required: true,
    },
    target_label: {
        type: String,
        required: true,
    },
    target_description: String,
    contract_metadata: {
        contract_type: String,
        name: String,
        symbol: String,
        synced_at: String,
        token_address: String,
    },
    token_matching_rules: {
        collection_min_id: {
            type: Number,
            default: 0,
        },
        collection_max_id: {
            type: Number,
            default: 1,
        },
        token_match_type: {
            type: String,
            enum: ['all_tokens', 'specific_tokens'],
            default: 'all_tokens',
            required: true,
        },
        matching_bins: [
            {
                target_name: String,
                target_min_id: {
                    type: Number,
                },
                target_max_id: {
                    type: Number,
                },
                ownership_type: {
                    type: String,
                    enum: ['currently_own', 'have_ever_owned'],
                    default: 'currently_own',
                },
            },
        ],
    },
})

targetNftCollectionSchema.plugin(toJSON)

/**
 * Used when creating a targetNftCollection to make sure target_label is unique for user
 * Different users can have the same target_label for a collection
 * @param {String} targetLabel
 * @param {ObjectId<User>} userId
 * @returns true if targetLabel does not conflict with any other targetNftCollection, false if there is target_label conflict
 */
targetNftCollectionSchema.statics.isLabelUserDuplicate = async function (
    targetLabel,
    userId
) {
    // Called when creating a new targetNftCollection
    // User cannot make multiple target collections with the same label
    console.log(
        'Checking if userId ' +
            userId +
            ' has targetNftCollection with target_label ' +
            targetLabel
    )
    const targetNftCollection = await TargetNftCollection.findOne({
        owner_id: userId,
        target_label: targetLabel,
    })
    console.log(
        'Target NFT Collection:: isLabelUserDuplicate ' + !!targetNftCollection
    )
    return !!targetNftCollection
}

/**
 * Used when updating a targetNftCollection to make sure target_label is unique for user
 * @param {ObjectId<TargetNftCollection>} updateObjectId
 * @param {String} targetLabel
 * @param {ObjectId<User>} userId
 * @returns true if targetLabel does not conflict with any other targetNftCollection, false if there is target_label conflict
 */
targetNftCollectionSchema.statics.canUpdateTargetLabel = async function (
    updateObjectId,
    targetLabel,
    userId
) {
    // Called when updating a targetNftCollection
    // User cannot update a collection to have a conflict with another target collection label they own

    // Search for targetNftCollection with targetLabel, owner_id of userId and _id != updateObjectId
    const targetNftCollection = await TargetNftCollection.findOne({
        owner_id: userId,
        target_label: targetLabel,
        _id: { $ne: updateObjectId },
    })

    console.log(
        'Target NFT Collection:: canUpdateTargetLabel ' + !!targetNftCollection
    )
    return !!targetNftCollection
}

/**
 * @typedef TargetNftCollection
 */
const TargetNftCollection = mongoose.model(
    'TargetNftCollection',
    targetNftCollectionSchema
)

module.exports = TargetNftCollection

const Joi = require('joi')
const { password, objectId } = require('./custom.validation')

const getShopTargetCollections = {
    query: Joi.object().keys({
        shopId: Joi.string().required().custom(objectId),
    }),
}

const createTargetCollection = {
    body: Joi.object().keys({
        owner_id: Joi.string().required().custom(objectId),
        target_label: Joi.string().required(),
        target_description: Joi.string(),
        contract_metadata: Joi.object().keys({
            contract_type: Joi.string().required(),
            name: Joi.string().required(),
            symbol: Joi.string().required(),
            synced_at: Joi.string().required(),
            token_address: Joi.string().required(),
        }),
        token_matching_rules: Joi.object(),
    }),
}

const updateTargetCollection = {
    params: Joi.object().keys({
        targetCollectionId: Joi.string().required().custom(objectId),
    }),
    body: Joi.object().keys({
        owner_id: Joi.string().required().custom(objectId),
        target_label: Joi.string().required(),
        target_description: Joi.string(),
        contract_metadata: Joi.object().keys({
            contract_type: Joi.string().required(),
            name: Joi.string().required(),
            symbol: Joi.string().required(),
            synced_at: Joi.string().required(),
            token_address: Joi.string().required(),
        }),
        token_matching_rules: Joi.object(),
    }),
}

const deleteTargetCollection = {
    params: Joi.object().keys({
        targetCollectionId: Joi.string().required().custom(objectId),
    }),
}

module.exports = {
    getShopTargetCollections,
    createTargetCollection,
    updateTargetCollection,
    deleteTargetCollection,
}

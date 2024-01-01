const Joi = require('joi')

const { ethAddress, moralisChain, objectId } = require('./custom.validation')

/*********  Validators for Campaign Calls  **********/
const getOwnedCampaigns = {
    params: Joi.object().keys({
        userId: Joi.string().custom(objectId),
    }),
}

const searchSmartContract = {
    body: Joi.object().keys({
        contractAddress: Joi.string().required().custom(ethAddress),
        chain: Joi.string().required().custom(moralisChain),
    }),
}

module.exports = {
    // Coupon Campaign Validators
    getOwnedCampaigns,

    // NFT Contract Collection Validators
    searchSmartContract,
}

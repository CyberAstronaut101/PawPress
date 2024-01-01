const httpStatus = require('http-status')

const EtherScanApi = require('etherscan-api')
const Moralis = require('moralis/node')
const config = require('../config/config')
const logger = require('../config/logger')
const ApiError = require('../utils/ApiError')

var {
    getInfoMessage,
    getWarnMessage,
    getSuccessMessage,
} = require('../utils/PrimeNgMessage')

const catchAsync = require('../utils/catchAsync')
const { NOT_IMPLEMENTED } = require('http-status')

const searchForNFTCollection = catchAsync(async (req, res) => {
    console.log('Searching for NFT Collection')
    console.log(req.body)

    // Validator ensures that we have a contractAddress and chain
    //  - And that address is 42 char and hex
    //  - And that chain is [eth, rinkeby] (see validatons/custom)

    let search_options = {
        address: req.body.contractAddress,
        chain: req.body.chain,
    }

    returnObject = {}

    // Try to get Moralis NFT MetaData
    try {
        returnObject.moralis_nft_metadata =
            await Moralis.Web3API.token.getNFTMetadata(search_options)
    } catch (error) {
        logger.error('Moralis NFT Search Failed: ')
        console.error(error)
        // throw new ApiError(httpStatus, "Moralis NFT Search Failed", error);
        return res.status(200).json({
            message: getWarnMessage(
                'NFT Collection Search Failed',
                error.error
            ),
        })
    }

    console.log(
        'Moralis NFT Metadata for contract: ',
        returnObject.moralis_nft_metadata
    )

    // Get the contract ABI if verified
    let etherScanApi

    if (search_options.chain !== 'eth') {
        // use testnet
        etherScanApi = new EtherScanApi.init(
            config.etherscan.key,
            search_options.chain
        )
    } else {
        // use eth mainnet
        etherScanApi = new EtherScanApi.init(config.etherscan.key)
    }

    let etherscan_return
    try {
        etherscan_return = await etherScanApi.contract.getabi(
            search_options.address
        )
    } catch (error) {
        logger.error(search_options)
        logger.error('Etherscan API Error: ')
        console.log(error)
        return res.status(200).json({
            message: getWarnMessage('Etherscan ABI Lookup Failed', error),
        })
    }

    returnObject.contract_abi = JSON.parse(etherscan_return.result)

    console.log(
        'Contract ABI return from Etherscan: ',
        returnObject.contract_abi
    )
    // console.log(typeof returnObject.contract_abi);

    // TODO ensure that contract ABI has the ERC721 minimum functions -- might not actually need to do this??

    let compliant_functions = [
        'totalSupply',
        // 'tokenByIndex',
        // 'tokenOfOwnerByIndex',
    ]

    // Use ContractABI to natively call the contract to get details
    //  - Get the total supply of the token
    // compliant
    //  - Get the token name

    // Get Total Supply Function abi

    let moralisNativeQuery = {
        chain: search_options.chain,
        address: search_options.address,
        abi: returnObject.contract_abi,
        function_name: 'totalSupply',
    }

    let function_returns = {}

    // compliant_functions.forEach(function_name => {
    //     // Iterate over the functions we want to get values for
    //     moralisNativeQuery['function'] = function_name;

    //     try {
    //         function_returns[function_name] = await Moralis.Web3API.native.query(moralisNativeQuery)
    //     } catch (error) {
    //         logger.error("Moralis Native Query Failed: ", error);
    //     }
    // })

    try {
        function_returns['totalSupply'] =
            await Moralis.Web3API.native.runContractFunction(moralisNativeQuery)
    } catch (error) {
        logger.error('Moralis Native Query Failed: ')
        console.log(error)
    }

    console.log('After Moralis Native Query: ', function_returns)

    // Validate

    // If we get here, return success message
    return res.status(200).json({
        message: getSuccessMessage(
            'NFT Collection Search Successful',
            'Found Collection at ' + search_options.address
        ),
        data: returnObject,
    })
})

module.exports = {
    searchForNFTCollection,
}

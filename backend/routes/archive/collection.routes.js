/* =================================================================================================

Routes for validating NFT collections during the selection process for a 
coupon campaign.

Main focus first is on deployed ERC721 contracts

OpenSea Collections that were deployed on OS all share the same ERC721 contract address, OPENSTORE
    which will make it harded to validate the collection bounds.

==============================================================================================*/

const express = require('express')

const Moralis = require('moralis/node')

const router = express.Router()
require('dotenv').config()

// Base API Route: /api/collection

// const etherScanApi = require('etherscan-api').init(process.env.ETHERSCAN_API_KEY);
const EtherScanApi = require('etherscan-api')
//https://sebs.github.io/etherscan-api/#getabi

/**
 * Validates if a smart contract is deployed at current address
 * - Validate ERC721 contract via etherscan API
 */
router.post('/search', async (req, res, next) => {
    /* Expected request body
     {
        address: "0x...",
        chain: "0x..."
    */

    let returnObject = {}

    console.log('Search Body: ', req.body)

    // If the req.body does not have address and chain, return error
    if (!req.body.address || !req.body.chain) {
        returnObject.error = 'Missing address or chain'
        returnObject.success = false
        return res.status(400).send(returnObject)
    }

    // Validate address is valid form
    if (!isValidAddress(req.body.address)) {
        returnObject.message = {
            severity: 'error',
            summary: 'Invalid Contract Address',
            detail: 'Contract Address must be a valid ETH address',
        }

        return res.status(400).send(returnObject)
    }

    // Validate via Moralis if the contract has NFT Metadata
    // - If it does, use etherscan to get the contract ABI
    // Use Moralis Native Function calls to get supply of the token

    let options = {
        address: req.body.address,
        chain: req.body.chain,
    }

    // Try to get the Moralis NFT Metadataa
    try {
        returnObject.moralis_nft_metadata =
            await Moralis.Web3API.token.getNFTMetadata(options)
    } catch (error) {
        console.log('Error on Moralis API call: ', error)
        returnObject.message = {
            severity: 'error',
            summary: 'Moralis NFT Metadata Lookup API Error',
            detail: error.error,
        }
        return res.status(500).json(returnObject)
    }

    console.log(
        'Moralis Has NFT Metadata for Contract: ',
        returnObject.moralis_nft_metadata
    )

    let contract_abi

    // Build the etherscan API library for specific chain
    let etherScanApi = new EtherScanApi.init(process.env.ETHERSCAN_API_KEY)
    try {
        contract_abi = await etherScanApi.contract.getabi(options.address)
    } catch (error) {
        console.log('Error on Etherscan Contract ABI GET: ', error)
        returnObject.message = {
            severity: 'error',
            summary: 'Etherscan Contract ABI Lookup API Error',
            detail: error,
        }
        return res.status(500).json(returnObject)
    }

    console.log('Got Contract ABI from Etherscan')
    // console.log(contract_abi.result);

    // Attempt to use Moralis to use native function calls to get supply of the token
    let erc721_function_returns = {} //

    let erc721FunctionNames = ['totalSupply']

    // The abi contains an array of objects for each function
    // - Loop through the array and find the function that matches the name fo the function we want to run

    let native_query_options = {
        chain: req.body.chain,
        address: req.body.address,
        abi: [
            {
                inputs: [],
                name: 'totalSupply',
                outputs: [
                    { internalType: 'uint256', name: '', type: 'uint256' },
                ],
                stateMutability: 'view',
                type: 'function',
            },
        ],
        function_name: 'totalSupply',
    }

    try {
        erc721_function_returns.totalSupply =
            await Moralis.Web3API.native.runContractFunction(
                native_query_options
            )
    } catch (error) {
        console.log('Error on Moralis API call: ', error)

        returnObject.message = {
            severity: 'error',
            summary: 'Moralis Token Supply Lookup API Error',
            detail: error,
        }
        return res.status(500).json(returnObject)
    }

    console.log('Native Function returns: ', erc721_function_returns)

    // Respond to request with returnObject
    return res.status(200).json(returnObject)

    // let moralis_nft_metadata = await Moralis.Web3API.token.getNFTMetadata(options)
    //     .catch(err => {
    //         console.error("Error on Moralis API call: ", err);
    //         returnObject.message = {
    //             severity: 'error',
    //             summary: 'Moralis NFT Metadata Lookup API Error',
    //             detail: err.error
    //         }

    //         // throw new Error('BROKEN');
    //         return res.status(500).json(returnObject);
    //         // next(res);?
    //         // return next(new Error('BROKEN'));
    //     })

    // console.log(moralis_nft_metadata)

    // console.log(returnObject.moralis_nft_metadata)

    // console.log(moralis_nft_metadata)

    // console.log("THIS SHOULD NOT BE EXECUTING IF WE HAVE A CATCH ERROR RETURNED");

    // Moralis.Web3API.token.getNFTMetadata(options)
    //     .then(nftMetadata => {
    //         console.log("Moralis Return NFT Metadata: ", nftMetadata);

    //         returnObject.moralis_nft_metadata = nftMetadata;

    //         //  Glean additional information from etherscan
    //         //  - ABI
    //         //      - Supply
    //         // Glean Additional Info from OpenSea (if the contract endpoint returns??)
    //         etherScanApi.contract.getabi(options.address)
    //             .then(abi => {
    //                 console.log("Etherscan Return ABI: ", abi);
    //                 return abi.result;
    //             })
    //             .catch(err => {
    //                 console.log("Etherscan Return ABI Error: ", err);
    //             })

    //     })
    //     .catch(err => {
    //         // Error on Moralis API call
    //         console.log("Error on Moralis API call: ", err);
    //         returnObject.message = {
    //             severity: 'error',
    //             summary: 'Moralis NFT Metadata Lookup API Error',
    //             detail: err.error
    //         }

    //         return res.status(500).json(returnObject);
    //     })

    // console.log(nftMoralisMetadata);

    // moralis.Web3API.token.getNftMetadata(req.body.address)

    // Return Not Implemented  Status  Code
})

function isValidAddress(address) {
    if (address.length !== 42) {
        return false
    } else {
        // Validate address is a valid ETH address
        if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
            // update results with empty array to stop loading spinner
            this.searchResults = []
            this.searchResultsUpdated.next(this.searchResults)
            return false
        } else {
            // Address is 42 long and matches HEX regex
            return true
        }
    }
}

module.exports = router

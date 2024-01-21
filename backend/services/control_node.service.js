const { ControlNode } = require('../models')
const ApiError = require('../utils/ApiError')
const logger = require('../config/logger');


const getControlNode = async (nodeId) => {
    logger.verbose('ControlNodeService::getControlNode(' + nodeId + ')')
    return ControlNode.findById(nodeId)
}

const createControlNode = async (nodeData) => {
    logger.verbose('ControlNodeService::createControlNode()')
    logger.verbose(nodeData)
    return ControlNode.create(nodeData)
}

const getControlNodeIPMac = async (ip, mac) => {
    logger.verbose('ControlNodeService::getControlNodeIPMac(' + ip + ', ' + mac + ')')
    return ControlNode.findOne({ ip_address: ip, mac_address: mac })
}


const orphanControlNode = async (nodeId) => {
    return "not implemented"
    // Just needs to make adopted false, 
}

const adoptControlNode = async (nodeId) => {
    logger.verbose('ControlNodeService::adoptControlNode(' + nodeId + ')')

    // Check if there is a node with same ID and adopted == false
    const adoptableNodeExists = await ControlNode.exists({ _id: nodeId, adopted: false })

    if (!adoptableNodeExists) {

        // there isn't a node that matches Id and is adopted == false.. check if it has already been adopted
        const adoptedNodeExists = await ControlNode.exists({ _id: nodeId, adopted: true })

        // Node Already Exists and is adopted
        if (adoptedNodeExists) throw new ApiError(500, "Control Node Exists and Already Adopted")

        // Node Does not exist at all based on MongoDB _ID
        else throw new ApiError(500, "Request to adopt non-existent Control Node ID. Make sure Control Node has identified to server");

    } else {
        // Node exists and is adoptable, adopt
        logger.info("Node is adoptable")
        const node = await ControlNode.findByIdAndUpdate(nodeId, { adopted: true, adopted_at: Date.now() }, { new: true })
        logger.info("Node adopted successfully: ")
        console.log(node)


        // Return the new created node if successful
        if (node) return node

        // Else throw error
        else throw new ApiError(500, "Adoption Failed")
    }
}


/**
 * Checks for existing nodes with the same MAC or IP
 * 
 * @param {string} ident_mac 
 * @param {string} ident_ip 
 * @returns empty if no matching nodes, otherwise returns the matching node
 */
const checkForExistingNodes = async (ident_mac, ident_ip) => {
    console.log('ControlNodeService::checkForExistingNodes(' + ident_mac + ', ' + ident_ip + ')')
    return ControlNode.find({ $or: [{ mac_address: ident_mac }, { ip_address: ident_ip }] })
}


/**
 * 
 * @returns All ControlNodes in the DB
 */
const getAllControlNodes = async () => {
    console.log('ControlNodeService::getAllControlNodes()');

    return ControlNode.find({})
}


module.exports = {
    getControlNode,
    createControlNode,
    checkForExistingNodes,
    getAllControlNodes,
    adoptControlNode,
    orphanControlNode,
    getControlNodeIPMac
}
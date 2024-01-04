const logger = require('../config/logger')
const httpStatus = require('http-status')
const catchAsync = require('../utils/catchAsync')

const { getSuccessMessage } = require('../utils/PrimeNgMessage')

// Import models that are needed

// Import services that are needed
// const { ControlNodeService } = require('../services')

const controlNodeService = require('../services/control_node.service')
const buttonService = require('../services/button.service')

const getControlNode = catchAsync(async (req, res) => {
    console.log("ControlNodeController::getControlNode(" + req.params.id + ")")

    const controlNode = await ControlNodeService.getControlNode(req.params.id)

    return res.status(httpStatus.OK).json({
        message: getSuccessMessage('Control Node retrieved successfully', ''),
        data: {
            "controlNode": controlNode
        }
    })
})

const getControlNodes = catchAsync(async (req, res) => {
    console.log("ControlNodeController::getControlNodes()")
    const controlNodes = await controlNodeService.getAllControlNodes()

    return res.status(httpStatus.OK).json({
        message: getSuccessMessage('Control Nodes retrieved successfully', ''),
        data: {
            "controlNodes": controlNodes
        }
    })

})

const identifyNode = catchAsync(async (req, res) => {
    // Needs to respond with - created, already created
    /*
        Expecting a payload from the 
        node with

        MAC, IP ADDRESS, PORT, DESCRIPTION, NUMBER BUTTONS (0 index)

        Possible situations...
        1. Node is already in the DB
            - Respond with already created
        2. Node is not in the DB (no matching IP or MAC)
        2. MAC Matches, IP Different - Update IP to match new IP (Possible w/ DHCP and not static assigning)

    */

    // Check if there is a matching node with the same MAC or IP



    console.log(req.body)
    console.log(req.body.mac_address)
    console.log(req.body.ip_address)

    const existingNodes = await controlNodeService.checkForExistingNodes(req.body.mac_address, req.body.ip_address)
    console.log(existingNodes);

    if (existingNodes.length > 0) {
        // Node already exists
        // TODO additional IP/MAC check
        return res.status(httpStatus.OK).json({
            message: getSuccessMessage('Control Node already exists', ''),
            data: {
                "controlNode": existingNodes[0]
            }
        })
    } else if (existingNodes.length == 0) {
        // Node does not exist
        // Create node
        const newNode = await controlNodeService.createControlNode(req.body)
        return res.status(httpStatus.OK).json({
            message: getSuccessMessage('Control Node created successfully', ''),
            data: {
                "controlNode": newNode
            }
        })
    }

    return res.status(httpStatus.OK).json({
        message: getSuccessMessage('Control Node identified successfully', ''),
        data: {
            "controlNode": req.body
        }
    })
})

const adoptNode = catchAsync(async (req, res) => {
    console.log("ControlNodeController::adoptNode(" + req.params.id + ")")
    console.log(req.params)

    const adoptedNode = await controlNodeService.adoptControlNode(req.params.id)

    // At this point we have adopted the control node successfully
    // Lets create/verify that enough buttons exist in this DB for the Control Node
    const verifiedButtons = await buttonService.verifyButtonsForControlNode(req.params.id)

    return res.status(httpStatus.OK).json({
        message: getSuccessMessage('Control Node adopted successfully', ''),
        data: {
            "controlNode": adoptedNode,
            "buttons": verifiedButtons
        }
    })
})

const orphanNode = catchAsync(async (req, res) => {
    console.log("ControlNodeController::orphanNode(" + req.params.id + ")")
    console.log(req.params)

    const adoptedNode = await controlNodeService.orphanControlNode(req.params.id)

    return res.status(httpStatus.OK).json({
        message: getSuccessMessage('Control Node orphaned successfully', ''),
        data: {
            "controlNode": adoptedNode
        }
    })
})

// TODO create node in DB
// TODO Create buttons in DB, that link back to node and have button num


module.exports = {
    identifyNode,
    getControlNode,
    getControlNodes,
    adoptNode,
    orphanNode
}
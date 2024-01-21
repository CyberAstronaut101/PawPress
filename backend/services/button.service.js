const { Button } = require('../models')
const { ControlNode } = require('../models')
const { Audio } = require('../models')
const ApiError = require('../utils/ApiError')
const logger = require('../config/logger')

//# CRUD OPERATIONS

const createButton = async (buttonData) => {
    logger.debug('ButtonService::createButton()')
    logger.debug(buttonData)
    return Button.create(buttonData)
}

const getButton = async (buttonId) => {
    logger.debug('ButtonService::getButton(' + buttonId + ')')
    return Button.findById(buttonId)
}

const getButtons = async () => {
    logger.debug('ButtonService::getButtons()')
    return Button.find({})
}

const updateButton = async (buttonId, buttonData) => {
    logger.debug('ButtonService::updateButton(' + buttonId + ')')
    console.log("Button Update Data:")
    console.log(buttonData)
    return Button.findByIdAndUpdate(buttonId, buttonData, { new: true })
}

const deleteButton = async (buttonId) => {
    logger.debug('ButtonService::deleteButton(' + buttonId + ')')
    return Button.findByIdAndDelete(buttonId)
}

//# END CRUD OPERATIONS

//# Button Helper Functions
const verifyButtonsForControlNode = async (controlNodeId) => {
    // First lookup the control node based on ID and get the number of buttons expected
    // Then lookup the number of buttons that exist for that control node
    // If the number of buttons that exist is less than the number of buttons expected, create the missing buttons
    // If the number of buttons that exist is greater than the number of buttons expected, delete the extra buttons
    // If the number of buttons that exist is equal to the number of buttons expected, do nothing
    console.log('ButtonService::verifyButtonsForControlNode(' + controlNodeId + ')')
    // Get the control node
    const controlNode = await ControlNode.findById(controlNodeId)
    console.log("Found Control Node");
    console.log(controlNode)

    // Get the number of buttons expected
    const numButtonsExpected = controlNode.number_buttons
    console.log("Expected Number of Buttons: " + numButtonsExpected)

    // Get the number of buttons that exist
    const numButtonsExisting = await Button.countDocuments({ control_node: controlNodeId })
    console.log("Existing Number of Buttons: " + numButtonsExisting)

    // If the number of buttons that exist is less than the number of buttons expected, create the missing buttons
    if (numButtonsExisting < numButtonsExpected) {
        console.log("Creating " + (numButtonsExpected - numButtonsExisting) + " buttons")
        const numButtonsToCreate = numButtonsExpected - numButtonsExisting
        return createControlNodeButtons(controlNodeId, numButtonsToCreate)
    }
    // If the number of buttons that exist is greater than the number of buttons expected, delete the extra buttons
    else if (numButtonsExisting > numButtonsExpected) {
        const numButtonsToDelete = numButtonsExisting - numButtonsExpected
        return deleteControlNodeButtons(controlNodeId, numButtonsToDelete)
    }
    // If the number of buttons that exist is equal to the number of buttons expected, do nothing
    else {
        return
    }


}

const getButtonByControlNodeAndButtonNumber = async (controlNodeId, buttonNumber) => {
    logger.debug('ButtonService::getButtonByControlNodeAndButtonNumber(' + controlNodeId + ', ' + buttonNumber + ')')
    return Button.findOne({ control_node: controlNodeId, button_number: buttonNumber }).populate('audio')
}

const getAllControlNodeButtons = async (controlNodeId) => {
    logger.verbose('ButtonService::getAllControlNodeButtons(' + controlNodeId + ')')
    return Button.find({ control_node: controlNodeId }).populate('audio')
}

/**
 * 
 * @param {ObjectID} controlNodeId _id of the controlNode of the buttons to create
 * @param {*} numButtons number of buttons to create
 * @returns Button[] array of buttons created
 */
const createControlNodeButtons = async (controlNodeId, numButtons) => {

    // ! This function is only called from the adoption process for parent control nodes
    // ! Adjust this to contain general logic for creating default values for remainder of customizable fields

    // Get the default audio clip objectId
    const defaultAudioClip = await Audio.findOne({ name: 'Default' })

    // Last 4 characters of the controlNodeId
    let controlNodeSubStr = controlNodeId.toString().substr(controlNodeId.toString().length - 4)

    console.log('ButtonService::createControlNodeButtons(' + controlNodeId + ', ' + numButtons + ')')
    let buttons = []
    for (let i = 0; i < numButtons; i++) {
        buttons.push(await createButton(
            {
                button_number: i,
                name: controlNodeSubStr + ' Button ' + i,
                icon: 'default_button.svg',
                description: 'Button created by adoption process for control node ' + controlNodeSubStr + ' with button number ' + i,
                audio: defaultAudioClip._id,
                control_node: controlNodeId
            }))
    }
    return buttons
}

const deleteControlNodeButtons = async (controlNodeId, numButtons) => {
    console.log('ButtonService::deleteControlNodeButtons(' + controlNodeId + ', ' + numButtons + ')')
    let buttons = []
    for (let i = 0; i < numButtons; i++) {
        buttons.push(await deleteButton({ control_node: controlNodeId, button_number: i }))
    }
    return buttons
}



module.exports = {
    createButton,
    getButton,
    getButtons,
    updateButton,
    deleteButton,
    verifyButtonsForControlNode,
    createControlNodeButtons,
    getAllControlNodeButtons,
    getButtonByControlNodeAndButtonNumber

}
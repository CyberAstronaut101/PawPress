const { Button } = require('../models')
const { ControlNode } = require('../models')
const ApiError = require('../utils/ApiError')

//# CRUD OPERATIONS

const createButton = async (buttonData) => {
    console.log('ButtonService::createButton()')
    console.log(buttonData)
    return Button.create(buttonData)
}

const getButton = async (buttonId) => {
    console.log('ButtonService::getButton(' + buttonId + ')')
    return Button.findById(buttonId)
}

const getButtons = async () => {
    console.log('ButtonService::getButtons()')
    return Button.find({})
}

const updateButton = async (buttonId, buttonData) => {
    console.log('ButtonService::updateButton(' + buttonId + ')')
    return Button.findByIdAndUpdate(buttonId, buttonData, { new: true })
}

const deleteButton = async (buttonId) => {
    console.log('ButtonService::deleteButton(' + buttonId + ')')
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
    console.log('ButtonService::getButtonByControlNodeAndButtonNumber(' + controlNodeId + ', ' + buttonNumber + ')')
    return Button.findOne({ control_node: controlNodeId, button_number: buttonNumber })
}

const createControlNodeButtons = async (controlNodeId, numButtons) => {
    console.log('ButtonService::createControlNodeButtons(' + controlNodeId + ', ' + numButtons + ')')
    let buttons = []
    for (let i = 0; i < numButtons; i++) {
        buttons.push(await createButton({ control_node: controlNodeId, button_number: i }))
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
    createControlNodeButtons

}
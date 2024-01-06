const logger = require('../config/logger')
const httpStatus = require('http-status')
const catchAsync = require('../utils/catchAsync')

const { getSuccessMessage } = require('../utils/PrimeNgMessage')

const buttonService = require('../services/button.service')


// Import models that are needed

// Import services that are needed

// Button Crud Operations
const updateButton = catchAsync(async (req, res) => {
    console.log("ButtonController::updateButton(" + req.params.id + ")")
    // Expecting a post body with the fields for the button model
    console.log(req.body)
    // Expecting :id url param to reference the button to update
    console.log(req.params.id)

    // Find the button by id and update it with the req.body
    // Return the updated button
    const updatedButton = await buttonService.updateButton(req.params.id, req.body)

    res.status(httpStatus.OK).json({
        message: getSuccessMessage('Button updated successfully', ''),
        data: {
            updatedButton
        }
    })

});


const getButtons = catchAsync(async (req, res) => {

    console.log("ButtonController::getButtons()")

    const buttons = await buttonService.getButtons()

    res.status(httpStatus.OK).json({
        message: getSuccessMessage('Buttons retrieved successfully', ''),
        data: {
            buttons
        }
    })
})

const pressButton = catchAsync(async (req, res) => {
    // get the post body contents
    console.log(req.body)

    /*
        We get a post JSON body with 3 fields,
        ip_address
        mac_address
        button
 
        First step is to make sure that the button is valid
        (new service function that looks up the controller based on ip and mac address)
        If a controller exists, 
    */



    res.status(httpStatus.OK).json({
        message: getSuccessMessage('Buttons pressed successfully', ''),
        data: {
            "buttons": ['button1', 'button2', 'button3']
        }
    })
})


module.exports = {
    getButtons,
    pressButton,
    updateButton
}
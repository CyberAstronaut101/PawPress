const logger = require('../config/logger')
const httpStatus = require('http-status')
const catchAsync = require('../utils/catchAsync')

const { getSuccessMessage } = require('../utils/PrimeNgMessage')

// Import models that are needed

// Import services that are needed


const getButtons = catchAsync(async (req, res) => {
    res.status(httpStatus.OK).json({
        message: getSuccessMessage('Buttons retrieved successfully', ''),
        data: {
            "buttons": ['button1', 'button2', 'button3']
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
    pressButton
}
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


module.exports = {
    getButtons,
}
const logger = require('../config/logger')
const httpStatus = require('http-status')
const catchAsync = require('../utils/catchAsync')

const { getSuccessMessage } = require('../utils/PrimeNgMessage')

const buttonService = require('../services/button.service')
const controlNodeService = require('../services/control_node.service')

let activeSockets = [];

let activeSocketsLimit = 5;

// Import models that are needed

// Import services that are needed

// Button Crud Operations
const updateButton = catchAsync(async (req, res) => {
    logger.verbose("ButtonController::updateButton(" + req.params.id + ")")

    // Find the button by id and update it with the req.body
    // Return the updated button
    const updatedButton = await buttonService.updateButton(req.params.id, req.body)

    console.log("Updated Button")
    console.log(updatedButton)


    res.status(httpStatus.OK).json({
        message: getSuccessMessage('Button updated successfully', ''),
        data: {
            updatedButton
        }
    })

});

const getButton = catchAsync(async (req, res) => {
    logger.verbose("ButtonController::getButton(" + req.params.id + ")")

    // Find the button by id and return it
    const button = await buttonService.getButton(req.params.id)

    res.status(httpStatus.OK).json({
        message: getSuccessMessage('Button retrieved successfully', ''),
        data: {
            button
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

    console.log(activeSockets)

    /*
        We get a post JSON body with 3 fields,
        ip_address
        mac_address
        button
 
        First step is to make sure that the button is valid
        (new service function that looks up the controller based on ip and mac address)
        If a controller exists, 
    */

    // first make sure that a controller exists with the ip and mac address passed in the POST request
    const controlNode = await controlNodeService.getControlNodeIPMac(req.body.ip_address, req.body.mac_address)

    // If there is a control Node, use the controlNode Id to find a button with the name number
    if (controlNode) {
        const button = await buttonService.getButtonByControlNodeAndButtonNumber(controlNode._id, req.body.button);

        console.log("Button Found")
        console.log(button)

        if (button) {
            console.log("within button jaz")
            // If there is a button, send the button press to the control node
            activeSockets.forEach(socket => {
                console.log("Sending Message to Socket")
                if (socket.readyState === 1) {
                    socket.send(JSON.stringify(button))
                }
            })

            res.status(httpStatus.OK).json({
                message: getSuccessMessage('Buttons pressed successfully', ''),
                data: {
                    button
                }
            })
        } else {
            // If there is no button, return an error
            res.status(httpStatus.NOT_FOUND).json({
                message: "Button Not Found",
                data: {}
            })

        }
    }
})

const subscribeToButtonPressWebsocket = function (ws, req) {
    console.log("ButtonController::subscribeToButtonPressWebsocket()")

    if (activeSockets.length >= activeSocketsLimit) {
        console.log("Too many websocket connections, try again later")
        ws.send("Too many connections, try again later")
        ws.close()
        return
    }

    // Add new connections to our list
    activeSockets.push(ws);
    console.log("New Web Socket Connection.. Concurrent Count: " + activeSockets.length)


    // We dont really need to listen to messages from the client
    ws.send("Connected to PawPress Control Server")

    // ws.on('message', function (msg) {
    //     console.log(`Received message: ${msg}`);
    // });

    ws.on('close', function () {
        console.log('Connection closed');
        activeSockets = activeSockets.filter(socket => socket !== ws);
    })
}


module.exports = {
    getButtons,
    getButton,
    pressButton,
    updateButton,
    subscribeToButtonPressWebsocket
}
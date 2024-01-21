const express = require('express')
const router = express.Router()

// Validators
const validate = require('../../middleware/validate')
const { buttonValidation } = require('../../validations')

// Controllers
const buttonController = require('../../controllers/button.controller')


// # Routes - base route == /api/vX/button
router.route('/')
    .get(buttonController.getButtons)

router.route('/pressed/')
    .post(buttonController.pressButton)

router.route('/:id')
    .get(validate(buttonValidation.validIdParam), buttonController.getButton)
    .put(
        validate(buttonValidation.validIdParam),
        // validate(buttonValidation.updateButton),
        buttonController.updateButton
    )

router.ws('/buttonListener', buttonController.subscribeToButtonPressWebsocket)

// Save this for modifying the specific buttons
// router.route('/:id')
//     .get(buttonController.getButton)
//     .put(buttonController.updateButton)
//     .delete(buttonController.deleteButton)

module.exports = router
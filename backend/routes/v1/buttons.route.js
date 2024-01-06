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
    .post(
        validate(buttonValidation.validIdParam),
        validate(buttonValidation.updateButton),
        buttonController.updateButton
    )


// Save this for modifying the specific buttons
// router.route('/:id')
//     .get(buttonController.getButton)
//     .put(buttonController.updateButton)
//     .delete(buttonController.deleteButton)

module.exports = router
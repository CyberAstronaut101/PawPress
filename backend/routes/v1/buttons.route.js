const express = require('express')
const router = express.Router()

// Controllers
const buttonController = require('../../controllers/button.controller')


// # Routes - base route == /api/vX/button
router.route('/')
    .get(buttonController.getButtons)

router.route('/pressed/')
    .post(buttonController.pressButton)

module.exports = router
const express = require('express')
const router = express.Router()

const validate = require('../../middleware/validate')
const { controlNodeValidation } = require('../../validations')
// // Controllers
// const buttonController = require('../../controllers/button.controller')
const nodeController = require('../../controllers/control_node.controller')


// # Routes - base route == /api/vX/controlNodes
router.route('/:id')
    .get(nodeController.getControlNode)

router.route('/')
    .get(nodeController.getControlNodes)

router.route('/identify')
    .post(
        validate(controlNodeValidation.identifyNode),
        nodeController.identifyNode
    )

router.route('/adopt/:id')
    .get(
        validate(controlNodeValidation.adoptNode),
        nodeController.adoptNode
    )
    .delete(
        validate(controlNodeValidation.adoptNode),
        nodeController.orphanNode
    )



module.exports = router
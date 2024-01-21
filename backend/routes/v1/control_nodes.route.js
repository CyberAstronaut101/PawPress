const express = require('express')
const router = express.Router()

const validate = require('../../middleware/validate')
const { controlNodeValidation } = require('../../validations')
// // Controllers
// const buttonController = require('../../controllers/button.controller')
const nodeController = require('../../controllers/control_node.controller')


// # Routes - base route == /api/vX/controlNodes

/**
 * Returns specific ControlNode DB Entry by ID
 */
router.route('/:id')
    .get(nodeController.getControlNode)

/**
 * Returns all ControlNode DB Entries
 */
router.route('/')
    .get(nodeController.getControlNodes)

/**
 * Lets IoT control nodes identify themselves to the server
 * Creates DB entry for the new node - in unadopted state
 */
router.route('/identify')
    .post(
        validate(controlNodeValidation.identifyNode),
        nodeController.identifyNode
    )

// Adopt or Orphan a node based on db ID after identifying
router.route('/adopt/:id')
    .get(
        validate(controlNodeValidation.adoptNode),
        nodeController.adoptNode
    )
    .delete(
        validate(controlNodeValidation.adoptNode),
        nodeController.orphanNode
    )


router.route('/manageNode/:id')
    .get(nodeController.manageControlNodeAndButtons)

module.exports = router
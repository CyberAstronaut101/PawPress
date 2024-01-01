const express = require('express')
const { auth, shopAuth } = require('../../middleware/auth')
const validate = require('../../middleware/validate')
const targetNftCollectionController = require('../../controllers/target_collection.controller')
const { targetCollectionValidation } = require('../../validations')

const router = express.Router()

/*********  /api/v1/target-collection  **********/

// api/v1/target-collection
// Admin level routes
router
    .route('/')
    .get(shopAuth(), targetNftCollectionController.getTargetNftCollections)
    .post(
        shopAuth(),
        validate(targetCollectionValidation.createTargetCollection),
        targetNftCollectionController.createTargetNftCollection
    )

router
    .route('/:targetCollectionId')
    .put(
        shopAuth(),
        validate(targetCollectionValidation.updateTargetCollection),
        targetNftCollectionController.updateTargetNftCollection
    )
    .delete(
        shopAuth(),
        validate(targetCollectionValidation.deleteTargetCollection),
        targetNftCollectionController.deleteTargetNftCollection
    )

// Shop Owner Routes -- only valid shop auth sessions can access
// router.route("/:shopId")
//     .get(shopAuth(), validate(targetCollectionValidation.getShopTargetCollections), targetNftCollectionController.getTargetNftCollection)

// Routes for managing specific target-collections

// router.get("/", (req, res) => {
//     res.status(400).send("GET @ /api/v1/target-collection Not Implemented");
// })

module.exports = router

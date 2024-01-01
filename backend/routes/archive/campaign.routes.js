const express = require('express')
const router = express.Router()

// Middleware

// Controllers
const campaignController = require('../controllers/campaign')

// Base API Route: /api/campaign

/*=========================== Coupon Campaign Management  ===========================*/
// Will create a known prefix to add to the coupon names, then remainder is random

// CRUD

router.get('/', campaignController.getAllCampaigns)
router.post('/', campaignController.createCampaign)
router.put('/:id', campaignController.updateCampaign)
router.delete('/:id', campaignController.deleteCampaign)

// router.get()

module.exports = router

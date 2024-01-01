const express = require('express')
const router = express.Router()

const statsController = require('../../controllers/stats.controller')

// /api/v1/stats/
router.route('/').get(statsController.getPlatformStats)

module.exports = router

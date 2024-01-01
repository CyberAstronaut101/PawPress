const express = require('express')
const { moralisSessionAuth } = require('../../middleware/auth')
const router = express.Router()

const couponController = require('../../controllers/coupon.controller')
const validate = require('../../middleware/validate')
const { userClaimCoupon } = require('../../validations/coupon.validation')

// Base Route: /api/v1/coupon

/*********  User Requests for their own Coupons  **********/
router.route('/').get(moralisSessionAuth, couponController.getUserCoupons)

// Claim Metdata
// Data to show before actual claim route hit

// Claim Coupon
router.route('/claim/')
    .post(moralisSessionAuth, validate(userClaimCoupon), couponController.userClaimCoupon)

module.exports = router

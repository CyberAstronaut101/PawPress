const express = require('express')
const router = express.Router()

const emailListController = require('../../controllers/email-list.controller')

const validate = require('../../middleware/validate')
const { generalValidators } = require('../../validations')

// Create rate limiter for email list addition
const rateLimit = require('express-rate-limit')
const { getInfoMessage } = require('../../utils/PrimeNgMessage')
const requestLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        message: getInfoMessage("We won't spam", "But our system thinks you are, try again later")
    },
    standardHeaders: true,
    legacyHeaders: false,
    statusCode: 201
})

// Create a slowdown for the 4 requests within the rate limiter window
const slowDown = require('express-slow-down')
const slowDownLimiter = slowDown({
    windowMs: 30 * 60 * 1000,
    delayAfter: 2,
    delayMs: 1500,
    maxDelayMs: 60000
})

// Base API Route: /api/v1/email/

router.route('/')
    .post(requestLimiter, slowDownLimiter, validate(generalValidators.addEmailToMailingList), emailListController.addEmailToMailingList)

router.route('/unsubscribe')
    .get(requestLimiter, slowDownLimiter, emailListController.removeEmailFromMailingList)

module.exports = router;
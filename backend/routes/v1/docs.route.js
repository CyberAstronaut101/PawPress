const express = require('express')
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const swaggerDefinition = require('../../docs/swaggerDef')

const router = express.Router()

const specs = swaggerJsdoc({
    swaggerDefinition,
    apis: ['docs/*.yml', 'routes/v1/*.js'],
})

var options = {
    explorer: true,
}

router.use('/', swaggerUi.serve)
router.get('/', swaggerUi.setup(specs, options))

module.exports = router

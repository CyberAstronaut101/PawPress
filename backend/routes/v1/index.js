const express = require('express')
const config = require('../../config/config')
const router = express.Router()

// # Routes
const docsRoute = require('./docs.route')
const buttonsRoute = require('./buttons.route')
const nodesRoute = require('./control_nodes.route')
const audiosRoute = require('./audio.route')
const buttonListenerRoute = require('./button_listener.route')

// Default routes loaded in all enviornments
const defaultRoutes = [
    {
        path: '/buttons',
        route: buttonsRoute
    },
    {
        path: '/controlNodes',
        route: nodesRoute
    },
    {
        path: '/audio',
        route: audiosRoute
    },
    {
        path: '/buttonListener',
        route: buttonListenerRoute
    }
]

// Dev Routes only loaded in development mode
const devRoutes = [
    {
        path: '/docs',
        route: docsRoute,
    },
]

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route)
    console.log('added route: ' + route.path)
})

/* istanbul ignore next */
if (config.env === 'development') {
    devRoutes.forEach((route) => {
        console.log('Adding dev route: ' + route.path)
        router.use(route.path, route.route)
    })
}

module.exports = router

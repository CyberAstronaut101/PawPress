var express = require('express')
var expressWs = require('express-ws')(express());

var cookieParser = require('cookie-parser')
require('dotenv').config()
const morgan = require('morgan')
const config = require('./config/config')
const logger = require('./config/logger')

const passport = require('passport')
const { jwtStrategy, jwtShopStrategy } = require('./config/passport')



var app = expressWs.app


/*********  Setup API Routes  **********/

app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

// CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, sentry-trace'
    )
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, PUT, DELETE, OPTIONS'
    )
    next()
})

/*********  JWT Auth Setup **********/
app.use(passport.initialize())
passport.use('jwt', jwtStrategy) // uses the User collection


// Setup Static directory for serving media
app.use('/media', express.static('media'))

// Setup Multer for saving files to 

/*--------  Endpoints  --------*/

// Use v1 API Routes
const routes = require('./routes/v1')

app.get('/healthcheck', (req, res) => res.sendStatus(200))
app.use('/api/v1', routes)

app.get('*', (req, res) => {
    res.status(202).json({
        message: 'Not Found',
    })
})

module.exports = app

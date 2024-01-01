/* eslint-disable no-undef */
var mongoose = require('mongoose')
const config = require('./config')
const logger = require('./logger')
var path = require('path')


/**================================================== *
 * ==========  NFTCoupon MongoDB Instance  ========== *
 * ================================================== */
// #region
// console.info('Connecting to NFTCoupon MongoDB...')

let connectionOptions = {}

if (process.env.NODE_ENV === 'development') {
    connectionOptions = {
        autoIndex: true,
        authSource: 'admin',
        retryWrites: true,
    }

}

// UPDATE: Using MongoDB Atlas Serverless, does not require?
// if (process.env.NODE_ENV === 'production') {
//     connectionOptions = {
//         ssl: true,
//         sslValidate: false,
//         sslCA: path.join(__dirname, 'do-mongodb-ssl.ca'),
//         autoIndex: true,
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//         authSource: 'admin',
//     }
// }

// mongoose.connect(config.mongoose.url,connectionOptions);

mongoose.connection = mongoose.createConnection(
    config.mongoose.url,
    connectionOptions
)

mongoose.set('strictQuery', false)

var db = mongoose.connection

db.on('connected', function () {
    logger.info('Mongoose successfully initialized DB connection')
})

// on mongoose error
db.on('error', function (err) {
    logger.error('Mongoose connection error for DB: ' + err)
})


module.exports = mongoose

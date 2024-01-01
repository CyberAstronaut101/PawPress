const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt')
const config = require('./config')
const { tokenTypes } = require('./tokens')
const { User, ShopifyStore } = require('../models')

const jwtOptions = {
    secretOrKey: config.jwt.secret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
}

/**================================================== *
 * ==========  JWT User  ========== *
 * ================================================== */
const jwtVerify = async (payload, done) => {
    try {
        if (payload.type !== tokenTypes.ACCESS) {
            throw new Error('Invalid token type')
        }
        const user = await User.findById(payload.sub)
        if (!user) {
            return done(null, false)
        }
        done(null, user)
    } catch (error) {
        done(error, false)
    }
}

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify)
/* =======  End of JWT User  ======= */

/**================================================== *
 * ==========  JWT Shop Session  ========== *
 * ================================================== */
const jwtShopUser = async (payload, done) => {
    //  console.log("Passport attempt to find shop with id: " + payload.sub);
    try {
        if (payload.type !== tokenTypes.ACCESS) {
            throw new Error('Invalid token type')
        }
        const shop = await ShopifyStore.findById(payload.sub)
        if (!shop) {
            return done(null, false)
        }
        done(null, shop)
    } catch (error) {
        done(error, false)
    }
}

const jwtShopStrategy = new JwtStrategy(jwtOptions, jwtShopUser)
/* =======  End of JWT Shop Session  ======= */

module.exports = {
    jwtStrategy,
    jwtShopStrategy,
}

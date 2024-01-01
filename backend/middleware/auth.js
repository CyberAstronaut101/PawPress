const passport = require('passport')
const httpStatus = require('http-status')
const ApiError = require('../utils/ApiError')
const { roleRights } = require('../config/roles')
const logger = require('../config/logger')

/*
    If user is authenticated AND meets the right required rights
      The user object is added to req.user and can be accessed in the controller functions.

*/

const verifyCallback =
    (req, resolve, reject, requiredRights) => async (err, user, info) => {
        console.log('Verify Callback Executing')

        if (err || info || !user) {
            logger.error('Auth Error on Verify Callback')
            console.log(err)
            console.log(info)
            console.log(user)
            return reject(
                new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate')
            )
        }

        console.log(
            'AuthMiddleware::verifyCallback() set  user to' +
            JSON.stringify(user)
        )
        req.user = user

        if (requiredRights.length) {
            // console.log("Checking required rights");
            const userRights = roleRights.get(user.role)
            const hasRequiredRights = requiredRights.every((requiredRight) =>
                userRights.includes(requiredRight)
            )
            if (!hasRequiredRights && req.params.userId !== user.id) {
                return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'))
            }
        }

        // console.log("Before verifyCallback Resolve")
        resolve()
    }

/*
  Auth requires that the request has a valid JWT bearer token on the Authorization header.
  If the token is valid, then verifyCallback is called
    Verify Callback will take the passed requiredRights (getUsers, manageUsers, etc)
      - Makes sure all required rights are present in the users role
                                  AND
      - If the user id of requester within bearer matches userId in req params
      - Then resolve the request
*/
const auth =
    (...requiredRights) =>
        async (req, res, next) => {
            console.log('Auth Middleware')
            return new Promise((resolve, reject) => {
                passport.authenticate(
                    'jwt',
                    { session: false },
                    verifyCallback(req, resolve, reject, requiredRights)
                )(req, res, next)
            })
                .then(() => next())
                .catch((err) => next(err))
        }

/**================================================== *
 * ==========  Shopify Shop App JWT Auth  ========== *
 * ================================================== */
const verifyShopCallback =
    (req, resolve, reject, requiredRights) => async (err, shop, info) => {
        // console.log("Verify Shop Callback Executing");

        if (err || info || !shop) {
            console.log(err)
            console.log(info)
            console.log(shop)
            return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized'))
        }

        // console.log("AuthMiddleware::verifyCallback() set shop to" + JSON.stringify(shop));

        req.shop = shop

        if (requiredRights.length) {
            // console.log("Checking required rights");
            const userRights = roleRights.get(user.role)
            const hasRequiredRights = requiredRights.every((requiredRight) =>
                userRights.includes(requiredRight)
            )
            if (!hasRequiredRights && req.params.userId !== user.id) {
                return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'))
            }
        }

        // console.log("Before verifyCallback Resolve")
        resolve()
    }

/// ! Might need to extend this to include session type == shopify/bigcommerce/etc
const shopAuth =
    (...requiredRights) =>
        async (req, res, next) => {
            // console.log("Shopify User Session Auth Middleware");
            return new Promise((resolve, reject) => {
                passport.authenticate(
                    'jwtShopifyShop',
                    { session: false },
                    verifyShopCallback(req, resolve, reject, requiredRights)
                )(req, res, next)
            })
                .then(() => next())
                .catch((err) => next(err))
        }

/* =======  End of Shopify Shop App JWT Auth  ======= */

const moralisSessionAuth = async (req, res, next) => {
    console.log('Moralis Session Ath Middleware')
    return new Promise(async (resolve, reject) => {
        // passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
        console.log('TODO verify moralis session passed on request')
        console.log(req.headers.authorization)

        // If req.headers.authorization is not set, then reject
        if (!req.headers.authorization) {
            return reject(
                new ApiError(
                    httpStatus.UNAUTHORIZED,
                    'Request must come from authorized session'
                )
            )
        }

        let params = {
            sessionToken: req.headers.authorization,
        }

        const sessionUserResults = await Moralis.Cloud.run(
            'validateRequestSession',
            params
        )
        console.log('Session User Results')
        console.log(sessionUserResults)

        if (!sessionUserResults) {
            // Session is invalid, return error
            return reject(
                new ApiError(
                    httpStatus.UNAUTHORIZED,
                    'Request must come from authorized session'
                )
            )
            //
        } else {
            // Session is valid, get the user details and add to req.web3User
            const userResult = await Moralis.Cloud.run('getUserFromId', {
                userId: sessionUserResults,
            })
            console.log('User Result from Cloud Function')
            console.log(userResult)
            // console.log(userResult.ethAddress)

            // TODO need to get the chain that the user is using...
            // Right now only support rinkeby and eth...

            let web3User = {
                id: sessionUserResults,
                address: userResult,
                chain: 'rinkeby'
            }

            req.web3User = web3User
        }

        // Check if the authorization matches a session in MoralisSession collection

        /*
    let sessions = await MoralisSession.find({ _session_token: req.headers.authorization});
    console.log(sessions)

    if (sessions.length === 0) {
      return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Request must come from authorized session'));
    }

    // TODO prob need to add more checks here to make sure this index exists?

    // Extract the User _id from the session
    let userId = sessions[0]._p_user.split('$')[1];
    let param = {
      userId: userId
    }

    console.log("username: " + userId);

    let userObject = await MoralisUser.find();

    console.log("Response from getUserFromSession Cloud Function");
    console.log(userObject);
*/

        // Moralis.User.become(req.headers.authorization)
        //   .then(user => {
        //     console.log("Moralis Session Auth Middleware::become() set user to" + JSON.stringify(user));
        //     req.user = user;
        //     resolve();
        //   })
        //   .catch(err => {
        //     console.log("Moralis Session Auth Middleware::become() error");
        //     console.log(err);
        //     reject(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid Session'));
        //   })

        resolve()
    })
        .then(() => next())
        .catch((err) => next(err))
}

module.exports = {
    auth,
    shopAuth,
    moralisSessionAuth,
}

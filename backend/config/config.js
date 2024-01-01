const dotenv = require('dotenv')
const path = require('path')
const Joi = require('joi')

dotenv.config({ path: path.join(__dirname, '../../.env') })

const envVarsSchema = Joi.object()
    .keys({
        NODE_ENV: Joi.string()
            .valid('production', 'development', 'test')
            .required(),
        PORT: Joi.number().default(8080),
        MONGODB_URL: Joi.string().required().description('Mongo DB url'),
        JWT_SECRET: Joi.string().required().description('JWT secret key'),
        JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
            .default(30)
            .description('minutes after which access tokens expire'),
        JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
            .default(30)
            .description('days after which refresh tokens expire'),
        JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
            .default(10)
            .description('minutes after which reset password token expires'),
        JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
            .default(10)
            .description('minutes after which verify email token expires'),
    })
    .unknown()

const { value: envVars, error } = envVarsSchema
    .prefs({ errors: { label: 'key' } })
    .validate(process.env)

if (error) {
    throw new Error(`Config validation error: ${error.message}`)
}

module.exports = {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    mongoose: {
        url:
            envVars.MONGODB_URL +
            (envVars.NODE_ENV === 'production' ? '-prod' : '') +
            (envVars.NODE_ENV === 'development' ? '-development' : ''),
        options: {
            ssl: true,
            sslValidate: false,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            sslCA: path.join(__dirname, 'do-mongodb-ssl.ca'),
        },
    },
    redis: {
        url: envVars.REDIS_URL,
    },
    shopify: {
        apiKey: envVars.SHOPIFY_API_KEY,
        apiSecret: envVars.SHOPIFY_API_SECRET,
        redirectUrl: envVars.SHOPIFY_API_REDIRECT_URL,
        admin_webapp_host: envVars.ADMIN_WEBAPP_HOST,
    },
    jwt: {
        secret: envVars.JWT_SECRET,
        accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
        refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
        resetPasswordExpirationMinutes:
            envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
        verifyEmailExpirationMinutes:
            envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
    },
    email: {
        smtp: {
            host: envVars.SMTP_HOST,
            port: envVars.SMTP_PORT,
            auth: {
                user: envVars.SMTP_USERNAME,
                pass: envVars.SMTP_PASSWORD,
            },
        },
        from: envVars.EMAIL_FROM,
    },
    etherscan: {
        url: envVars.ETHERSCAN_API_URL,
        key: envVars.ETHERSCAN_API_KEY,
    },
    sentry_dsn: envVars.SENTRY_DSN,
}

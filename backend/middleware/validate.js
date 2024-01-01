const Joi = require('joi')
const httpStatus = require('http-status')
const pick = require('../utils/pick')
const ApiError = require('../utils/ApiError.js')

const validate = (schema) => (req, res, next) => {
    // console.log("VALIDATING SCHEMA: " + JSON.stringify(schema));
    const validSchema = pick(schema, ['params', 'query', 'body'])

    const object = pick(req, Object.keys(validSchema))
    // console.log("VALIDAING OBJECT: " + JSON.stringify(object));

    const { value, error } = Joi.compile(validSchema)
        .prefs({ errors: { label: 'key' }, abortEarly: false })
        .validate(object)

    if (error) {
        const errorMessage = error.details
            .map((details) => details.message)
            .join(', ')
        // console.log("ERRORING FUCKING HERE")
        return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage))
    }
    Object.assign(req, value)
    return next()
}

module.exports = validate

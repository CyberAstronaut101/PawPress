const Joi = require('joi')


/**================================================== *
 * ==========  Email Mailing List Validations  ========== *
 * ================================================== */
const addEmailToMailingList = {
    body: Joi.object().keys({
        email: Joi.string().required(),
        product: Joi.string().required(),
    })
}



module.exports = {
    // Mailing List Validation
    addEmailToMailingList
}
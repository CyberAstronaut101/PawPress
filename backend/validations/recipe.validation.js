const Joi = require('joi');
const { objectId } = require('./custom.validation');

const randomRecipe = {
    body: Joi.object().keys({
        numRecipes: Joi.number().required(),
        excludeMeals: Joi.array().items(objectId)
    })
}

module.exports = {
    randomRecipe
}
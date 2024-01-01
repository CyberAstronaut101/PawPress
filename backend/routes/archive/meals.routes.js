const express = require('express')
const router = express.Router()

const validate = require('../../middleware/validate')
const { randomRecipes, recipeValidators } = require('../../validations');

// === Controllers ===
const mealController = require('../../controllers/meal.controller')

//* /api/v1/recipe/
router
    .route('/')
    .get(mealController.getAllRecipes)
    .post(mealController.createNewRecipe)

//* /api/v1/meal/search
router
    .route('/search')
    .post(mealController.getAllMealsPaginated)

//* /api/v1/meal/roll
router
    .route('/roll/')
    .post(
        validate(recipeValidators.randomRecipe),
        mealController.getRandomRecipes
    )

//* /api/v1/meal/seed
router
    .route('/seed')
    .get(mealController.seedDevDatabase)

module.exports = router
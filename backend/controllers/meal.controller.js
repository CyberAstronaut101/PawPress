const httpStatus = require('http-status')
const config = require('../config/config')
const logger = require('../config/logger')

const catchAsync = require('../utils/catchAsync')

// === Recipe MongoDB Service Imports ===
const mealService = require('../services/meals.service')

const getAllRecipes = catchAsync(async (req, res) => {
    logger.info("Get All Recipes");
    let recipes = await mealService.getAllRecipes();
    console.log(recipes);

    // Check if there was a filter/paginate as part of the query
    console.log(req.query)

    return res.status(httpStatus.OK).json({
        recipes: recipes
    })
})

const getAllMealsPaginated = catchAsync(async (req, res) => {
    logger.info("RecipeController:getAllMealsPaginated()");
    console.log(req.body)

    // TODO validate req.body for search on meals contains the fields we need

    let recipes = await mealService.getMealsPaginated(req.body)
    return res.status(httpStatus.OK).json(recipes)

})

const createNewRecipe = catchAsync(async (req, res) => {
    logger.log('info', 'Creating New Recipe')
    console.log(req.body)

    mealService.createRecipe(req.body)

    return res.status(httpStatus.OK).json({
        message: 'Recipe Created'
    })

})

const getRandomRecipes = catchAsync(async (req, res) => {


    // Verify Optional Parameters are defaulted if not included in request
    if (req.body.excludeMeals === undefined) {
        req.body.excludeMeals = []
    }

    // logger.info("Random Recipe Count: ", req.body.numRecipes)
    // console.log(req.body);
    let recipes = await mealService.getRandomRecipes(req.body.numRecipes, req.body.excludeMeals)
    console.log("Random Recipes")
    console.log(recipes)

    // Set a default return message
    let message = {
        severity: 'success',
        summary: 'Success'
    }


    // TODO: Add error handling?

    // * ====== Custom Messages For results ====== *

    // Case 1: Returned recipes length is less than numRecipes
    if (recipes.length < req.body.numRecipes) {
        message = {
            severity: 'warn',
            summary: 'Returned fewer recipes than requested',
            detail: 'Looks like we don\'t have enough remaining meals to satisfy your request, try altering filters to get more meal options!'
        }
    }

    return res.status(httpStatus.OK).json({
        message: message,
        resultsMetadata: {
            numRecipes: recipes.length
        },
        recipes: recipes
    })
})

const seedDevDatabase = catchAsync(async (req, res) => {
    let recipes = await mealService.seedDatabase().catch(err => {
        console.log(err)
        logger.error("Error Seeding Database: ", err)
    })
    return res.status(httpStatus.OK).json({
        message: 'Database Seeded',
        recipes: recipes
    })

})


module.exports = {
    getAllRecipes,
    createNewRecipe,
    getRandomRecipes,
    seedDevDatabase,
    getAllMealsPaginated,
}
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');

const { Recipe } = require('../models');
const httpStatus = require('http-status');
const { default: mongoose } = require('mongoose');
const Meal = require('../models/archive/meal.model');


/* ==================================================
===== Generation Stats Cache ========================
================================================== */
let cache_generation_count = 0;
let cache_meal_generation_count = 0;

const incrementGenerationCount = (mealCount) => {
    cache_generation_count += 1;
    cache_meal_generation_count += mealCount;
    console.log("STATS: Generation Count: ", cache_generation_count, "Meal Count: ", cache_meal_generation_count);
}

const clearGenerationCount = () => {
    cache_generation_count = 0;
    cache_meal_generation_count = 0;
}

const getCurrentGenerationStats = () => {
    return {
        totalGenerations: cache_generation_count,
        totalGenerationMeals: cache_meal_generation_count
    };
}

// ==================================================

const getVerifiedMealCount = async () => {
    return Recipe.countDocuments({ verified: true });
}

const getAllRecipes = async () => {
    return Recipe.find({});
}

const getMealsPaginated = async (paginateDetails) => {
    logger.info("RecipeService:getMealsPaginated()");
    console.log(paginateDetails)

    let filter = {}

    // Prepare the paginate/filter options

    const options = {
        sortBy: 'mealName:asc',
        limit: paginateDetails.rows,
        page: paginateDetails.first / paginateDetails.rows + 1
    }

    // Page will be the first/rows

    // If there is a global filter, then we need to filter on the mealName
    if (paginateDetails.globalFilter) {
        filter = {
            mealName: {
                $regex: paginateDetails.globalFilter,
                $options: 'i'
            }
        }
    }

    return Recipe.paginate(filter, options)
}

const getRandomRecipes = async (numRecipes, excludeMeals, taxonomy) => {
    // Given the num Recipes, get a random sample of recipes from the database
    // Return the array of recipes
    // return Recipe.find({})
    //     .limit(numRecipes).sample(numRecipes);

    // Update the stats cache
    incrementGenerationCount(numRecipes);

    console.log("Get Random Recipes")
    console.log("Num Recipes: ", numRecipes)
    console.log("Exclude Meals: ", excludeMeals)
    // turn excludeMeals array of string ids into array of object ids
    excludeMeals = excludeMeals.map(id => {
        return mongoose.Types.ObjectId(id)
    })
    // To return the mdb documents
    return Recipe.aggregate([
        {
            $match: {
                _id: {
                    $nin: excludeMeals
                }
            }
        },
        { $sample: { size: numRecipes } }
    ]).exec()
}


const createRecipe = async (recipeData) => {
    // Validator in route ensured that the data is valid
    // TODO create entry in DB
    logger.log('info', 'RecipeService::createRecipe()');
    logger.log('info', recipeData);
}


/* ==================================
Development Seed Database
================================== */
const seedDatabase = async () => {
    // Open the json file at ../data/recipes.json
    // Read the file
    // Parse the file
    // Loop through the array of recipes
    // For each recipe, create a new Recipe object
    // Save the Recipe object to the database
    // Return the array of recipes
    const fs = require('fs');
    const path = require('path');
    const meals = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/seed_meals.json'), 'utf8'));
    for (let i = 0; i < meals.length; i++) {
        const meal = meals[i];
        const newMeal = new Meal(meal)
        await newMeal.save().catch(err => {
            logger.error("Error Saving Recipe: ", err)
            // throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error Saving Recipe');
        });
    }
    // return meals;
}

module.exports = {
    getAllRecipes,
    createRecipe,
    getRandomRecipes,
    seedDatabase,
    getMealsPaginated,
    getVerifiedMealCount,
    // Stats Functions for schedule stats updater
    clearGenerationCount,
    getCurrentGenerationStats
}
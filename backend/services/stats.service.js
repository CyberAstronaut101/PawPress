const logger = require('../config/logger');

const { PlatformStats } = require('../models');
const mealService = require('./meals.service');

/*
    - Get the platform stats
    - Schedule to update platform stats every 30 minutes
      - This will check current firebase user count
      -
*/

/**
 * Called at the startup of the express server. This ensures that we have a document
 * in the platform stats to start with. Need 1 and only one
 * If there is no document, create one
 * ! If there is more than one document, delete all but the latest created one
 * Once document created - schedule the update of the stats
 */
const validateStatsDatabase = async () => {
    logger.info("Validating platform stats database");

    const currentStats = await getCurrentPlatformStats();

    // Make sure at least one document exists
    if (currentStats.length === 0) {
        logger.info("No platform stats document found. Creating one");
        const newStats = new PlatformStats();
        await newStats.save();
        // Since the document was just created, grab the current stats of the platform
        updateMealCount();
        // TODO get users
        // Assume total generations at this point is 0
    }

}

const getCurrentPlatformStats = async () => {
    return PlatformStats.find({});
}

/**
 * Increments the totalGenerations and totalMealsPresented fields in the platform stats document
 * This function is called every 30 minutes by the cron job
 * The totalGenerations and totalMealsPresented fields are incremented by the values in the
 * meal service hacky cache
 */
const incrementGenerationCount = async () => {
    // Get the current platform stats document
    const currentStats = await getCurrentPlatformStats();

    // Get the current generation counts from the meals service hacky cache
    const cacheGenerationCount = mealService.getCurrentGenerationStats().totalGenerations;
    const cacheMealGenerationCount = mealService.getCurrentGenerationStats().totalGenerationMeals;
    mealService.clearGenerationCount();

    // logger.info("Cache Stats - menu generations: ", cacheGenerationCount);
    // logger.info("Cache Stats - total meals: ", cacheMealGenerationCount);

    // Update the currentStats object with the counts
    currentStats[0].totalGenerations = currentStats[0].totalGenerations + cacheGenerationCount;
    currentStats[0].totalMealsPresented = currentStats[0].totalMealsPresented + cacheMealGenerationCount;

    // Save the updated document
    await currentStats[0].save();
}

const updateMealCount = async () => {
    // Get the current meal count of verified meals
    // Update the currentStats object with the count
    const currentStats = await getCurrentPlatformStats();
    const currentMealCount = await mealService.getVerifiedMealCount();
    currentStats[0].totalMeals = currentMealCount;
    await currentStats[0].save();
}

// TODO Function to increment user count

module.exports = {
    getCurrentPlatformStats,
    incrementGenerationCount,
    updateMealCount,
    validateStatsDatabase
}
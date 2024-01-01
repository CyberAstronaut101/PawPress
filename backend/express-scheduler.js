const CronJob = require("node-cron");
const logger = require("./config/logger");

// CronTab Helper Webiste https://crontab.guru/

const statsService = require("./services/stats.service");

// Cron for every 30 seconds 
// */30 * * * * *
exports.initScheduledJobs = () => {

    const scheduledJobFunction = CronJob.schedule("* * * * *", () => {
        console.log("I'm executed on a schedule!");
        // Add your custom logic here
    });


    const platformStatsUpdate = CronJob.schedule("* * * * * ", () => {
        logger.info("PLATFORM STATS SCHEDULED JOB STARTED")

        // Validate the stats database exists/good state
        statsService.validateStatsDatabase();

        // Update the menu creation and meals presented count
        statsService.incrementGenerationCount();

        // Update the verified meal count
        statsService.updateMealCount();

        // TODO Update User Count
    })

    // scheduledJobFunction.start();
    platformStatsUpdate.start();
}
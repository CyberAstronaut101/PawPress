const logger = require('../config/logger')
const catchAsync = require('../utils/catchAsync')

const statsService = require('../services/stats.service');
const httpStatus = require('http-status');


const getPlatformStats = catchAsync(async (req, res) => {
    logger.info("Get Platform Stats");
    let stats = await statsService.getCurrentPlatformStats();
    console.log(stats);
    return res.status(httpStatus.OK).json(stats[0])
})

module.exports = {
    getPlatformStats
}
const { Audio } = require('../models')
const logger = require('../config/logger')

//# CRUD OPERATIONS
const createAudio = async (audioData) => {
    logger.debug('AudioService::createAudio()')
    console.log(audioData)
    return Audio.create(audioData)
}

const getAudio = async (audioId) => {
    logger.debug('AudioService::getAudio(' + audioId + ')')
    return Audio.findById(audioId)
}

const getAllAudio = async () => {
    logger.debug('AudioService::getAllAudio()')
    return Audio.find({})
}

const deleteAudio = async (audioId) => {
    logger.debug('AudioService::deleteAudio(' + audioId + ')')
    return Audio.findByIdAndDelete(audioId)
}

module.exports = {
    createAudio,
    getAudio,
    getAllAudio,
    deleteAudio
}


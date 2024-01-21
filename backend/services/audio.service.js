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

// Extra Helpers
const verifyDefaultAudioExists = async () => {
    // There will always be a default audio clip - Only differentiator is that the name needs to be unique - "Default"
    logger.debug('AudioService::verifyDefaultAudioExists()')
    const defaultAudioClip = await Audio.findOne({ name: 'Default' })

    if (!defaultAudioClip) {

        logger.debug('AudioService::verifyDefaultAudioExists()::Default audio clip does not exist, creating now...')

        const defaultAudioClip = {
            "name": "Default",
            "description": "Default audio clip",
            "file": "default.ogg"
        }

        await createAudio(defaultAudioClip)
    }
}

module.exports = {
    createAudio,
    getAudio,
    getAllAudio,
    deleteAudio,
    verifyDefaultAudioExists
}


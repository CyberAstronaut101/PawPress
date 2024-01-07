const express = require('express')
const router = express.Router()

// Validators

// Controllers
const audioController = require('../../controllers/audio.controller')

// const multerUpload = require('../../config/multer')

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// #Routes -= base route = /api/vX/audio

router.route('/')
    .get(audioController.getAllAudio)
    .post(
        // Need validators here
        audioController.uploadAudioClip
    )




module.exports = router
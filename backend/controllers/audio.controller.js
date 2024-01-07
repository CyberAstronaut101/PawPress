const logger = require('../config/logger')
const httpStatus = require('http-status')
const catchAsync = require('../utils/catchAsync')
const path = require('path')
const fs = require('fs')

const { getSuccessMessage, getErrorMessage } = require('../utils/PrimeNgMessage')

const audioService = require('../services/audio.service');


// Setup and configure Multer

const multer = require('multer')

// Configure Multer Storage Options
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'media/')
    },
    filename: function (req, file, cb) {
        // need to manipulate the filename to include the date
        let date = new Date()
        let formattedDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
        let filename = formattedDate + '-' + file.originalname
        cb(null, filename)
    }
})


const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Make sure extension is correct
        var ext = path.extname(file.originalname);
        if (ext !== '.wav' && ext !== '.mp3' && ext !== '.ogg') {
            return cb(new Error('Only audio files are allowed'))
        }
        // Make sure file does not already exist

        // if (fs.existsSync('media/' + file.originalname)) {
        //     '))

        cb(null, true)
    },
    limits: {
        fileSize: 1024 * 1024 * 10 // 10MB
    }
});

// https://stackoverflow.com/questions/38652848/filter-files-on-the-basis-of-extension-using-multer-in-express-js


const getAllAudio = catchAsync(async (req, res) => {

    const audioClips = await audioService.getAllAudio()

    res.status(httpStatus.OK).json({
        message: getSuccessMessage('Audio Clips retrieved successfully', ''),
        data: {
            audioClips: audioClips
        }
    })
})

const uploadAudioClip = catchAsync(async (req, res) => {
    logger.verbose("AudioController::uploadAudioClip()")
    console.log(req.body)
    console.log(req.body)
    console.log(req.files)

    // Cant access the req.body yet.. Needs to happen in the upload.single() callback
    // fields are not populated until the upload.single() callback is called - which is weird,
    // it will also re-name the 'name' form filed to 'audioClip' - which is what we dont want
    // So for now, these uploads can only accept one file, and a name field that will be upadted
    // to audioClip within the callback for upload.single()... odd...

    try {
        upload.single('audioClip')(req, res, async (err) => {

            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading.
                return res.status(500).json({
                    message: getErrorMessage('Multer Upload Error', err.message)
                })
            } else if (err) {
                // An unknown error occurred when uploading.
                return res.status(500).json({
                    message: getErrorMessage('Unknown Error During File Upload', err.message)
                })
            }

            // If no file was sent
            if (!req.file) {
                return res.status(400).json({
                    message: getErrorMessage('No file uploaded', 'No file sent in the request')
                })
            }

            // At this point file has uploaded successfully
            // get the file name and path
            const filename = req.file.filename
            logger.verbose(filename)

            // Create a new audio clip object
            const audioClip = {
                "name": req.body.audioClip,
                "file": filename
            }

            try {
                const newAudioClip = await audioService.createAudio(audioClip)

                // File uploaded successfully
                res.status(httpStatus.OK).json({
                    message: getSuccessMessage('Audio Clip uploaded successfully', ''),
                    data: {
                        "audioClip": newAudioClip
                    }
                });
            } catch (error) {
                // Handle any errors that occur during audio service call
                console.log(error)
                res.status(500).send('Internal Server Error');
            }
        });
    } catch (error) {
        // Handle any other errors that may occur
        res.status(500).send('Internal Server Error');
    }
});


const uploadAudioClipOrig = catchAsync(async (req, res) => {
    // console.log("AudioController::uploadAudioClip()")

    logger.verbose("AudioController::uploadAudioClip()")
    logger.verbose("req.body")
    console.log(req.body)
    console.log(req.files)


    upload.single('audioClip')(req, res, (err) => {
        console.log("Within multer upload")
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            return res.status(500).send(err.message);
        } else if (err) {
            // An unknown error occurred when uploading.
            return res.status(500).send(err.message);
        }

        // If no file was sent
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }
    });

    // console.log(req)

    // const audioClip = await audioService.uploadAudioClip(req.file)

    // multerUpload.single('audioClip')

    res.status(httpStatus.OK).json({
        message: getSuccessMessage('Audio Clip uploaded successfully', ''),
        data: {
            "test": "test"
        }
    })

})



module.exports = {
    getAllAudio,
    uploadAudioClip
}
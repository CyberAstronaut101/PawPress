const multer = require('multer');
const path = require('path');


// Configure Multer Storage Options
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'media/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const multerUpload = multer({ storage: storage })

// Export the upload object
module.exports = multerUpload;
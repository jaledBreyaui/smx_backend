const multer = require("multer");
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/uploads/');
    },
    filename: function (req, file, cb) {

        const ext = path.extname(file.originalname);
        const fileName = Date.now() + '-audio' + ext;
        cb(null, fileName);
    }
});

const upload = multer({ storage: storage });

module.exports = upload;
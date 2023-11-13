const multer  = require('multer');
const path = require("path");

// Config Multer
module.exports = multer({
    dest: path.join(__dirname, 'uploads/'),
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, 'uploads/');
        },
        filename: function (req, file, cb) {
          cb(null, file.originalname);
        }}),
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png" && ext !== ".webp") {
            cb(new Error("El tipo de archivo no es compatible"), false);
            return;
        }
        cb(null, true);
    }
});
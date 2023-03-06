const util = require("util");
const multer = require("multer");
const dbConfig = require("../config/db.config");


const uploadFilesMiddleware = multer({
  limits: {
    fileSize: 10000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(docx|doc|pdf|png|jpg|jpeg)$/)) {
      return cb(new Error('Please upload an image'))
    }
    cb(undefined, true)
  }  
})



module.exports = uploadFilesMiddleware;

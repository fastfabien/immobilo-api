const { authJwt } = require("../middlewares")
const controller = require("../controllers/properties.controller");
const { verifyToken } = require("../middlewares/authJwt");
const uploadFilesMiddleware = require("../middlewares/upload")
const bodyParser = require('body-parser')
const multer = require("multer")
const upload = multer({ dest: './my-uploads/' })

module.exports = function (app) {
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "Access-Control-Allow-Origin",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });
    app.post("/api/properties", uploadFilesMiddleware.array('file', 20),controller.createProperties)
    app.get("/api/properties",controller.getAllProperties)
    app.get("/api/properties/:id", controller.getPropriety)
} 
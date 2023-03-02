const { authJwt } = require("../middlewares")
const controller = require("../controllers/user.controller");
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

    app.get("/api/user/all", controller.getAllUser)
    app.get("/api/user/:id", controller.getUser)

    app.get("/api/test/all", controller.allAccess);
    app.get("/api/test/user", [authJwt.verifyToken], controller.userBoard);
    app.get(
        "/api/test/mod",
        [authJwt.verifyToken, authJwt.isModerator],
        controller.moderatorBoard
    )
    app.patch("/api/user/completeInfo", [authJwt.verifyToken],controller.completeUserInformation)
    app.post(
        "/api/user/document",
        [authJwt.verifyToken],
        uploadFilesMiddleware.single('file'),
        controller.importUserDocument)
    app.post("/api/user/:id", [authJwt.verifyToken],controller.updateDocumentStatus)
} 
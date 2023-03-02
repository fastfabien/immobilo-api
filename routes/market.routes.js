const { authJwt } = require("../middlewares")
const controller = require("../controllers/market.controller");
const { verifyToken } = require("../middlewares/authJwt");
const bodyParser = require('body-parser')
const multer = require("multer")
const upload = multer({ dest: './my-uploads/' })

module.exports = function (app) {
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });
    app.post("/api/market", [authJwt.verifyToken],controller.createMarket)
    app.get("/api/market", [authJwt.verifyToken],controller.getUserMarket)
    app.get("/api/markets", [authJwt.verifyToken],controller.getAllMarket)
} 
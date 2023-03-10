const { verifySignUp } = require("../middlewares");
const controller = require("../controllers/auth.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "Access-Control-Allow-Origin",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post(
        "/api/auth/signup",
        [
            verifySignUp.checkDuplicateUsernameOrEmail,
            verifySignUp.checkRolesExisted
        ],
        controller.signup
    );

    app.post("/api/auth/signin", controller.signin);
    app.get("/api/auth/confirm/:confirmationCode", controller.verifyUser);
    app.post("/api/auth/signUpGoogle", controller.signupGoogle);
    app.post("/api/auth/signInGoogle", controller.signinGoogle);
    app.post("/api/auth/createUser", controller.createAccount)
};
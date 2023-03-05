const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;

verifyToken =  (req, res, next) => {
    let token = req.headers["x-access-token"];
    if (!token) {
        return res.status(403).send({ message: "No token provided" })
    }

    jwt.verify(token, config.secret, async (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Unauthorized!" });
        }
    

        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
        .populate({
            path: 'bricks', 
            populate: {
                path: 'propertie_id',
                select: "id nom zip rue valorisation rentabiliter reverser nb_brique_restant image_couverture prix_acquisition region"
                }
        })

        if (!user) {
            throw new Error()
        }

        req.user = user
        next();
    });
};

isAdmin = (req, res, next) => {
    User.findById(req.user.id).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        Role.find(
            {
                _id: { $in: user.roles }
            },
            (err, roles) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }

                for (let i = 0; i < roles.length; i++) {
                    if (roles[i].name = "admin") {
                        next();
                        return;
                    }
                }

                res.status(403).send({ message: "Require Admin Role" });
                return;
            }
        );
    });
};

isModerator = (req, res, next) => {
    User.findById(req.user.id).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        Role.find(
            {
                _id: { $in: user.roles }
            },
            (err, roles) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }

                for (let i = 0; i < roles.length; i++) {
                    if (roles[i].name === "moderator") {
                        next();
                        return;
                    }
                }

                res.status(403).send({ message: "Require Moderator Role!" });
                return;
            }
        );
    });
};

const authJwt = {
    verifyToken,
    isAdmin,
    isModerator
};

module.exports = authJwt;
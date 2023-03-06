const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;
const nodemailer = require('../config/nodeMailer.config')
const verifyGoogleToken = require('../config/OAuthClient.config')
const axios = require('axios')

const GOOGLE_API_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {

    const token = jwt.sign({ email: req.body.email }, config.secret)

    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
        confirmationCode: token,
    });

    user.save((err, user) => {
        if (err) {
            res.status(500).send({ message: "Impossible de creer votre compte!" });
            return;
        }

        if (req.body.roles) {
            Role.find(
                {
                    name: { $in: req.body.roles }
                },
                async (err, roles) => {
                    if (err) {
                        res.status(500).send({ message: "Impossible de creer votre compte!" });
                        return;
                    }

                    user.roles = roles.map(role => role_id);
                    tokens = await user.generateAuthToken()
                    await user.save(err => {
                        if (err) {
                            res.status(500).send({ message: "Impossible de creer votre compte" });
                            return;
                        }

                        res.send({ message: "User was registerd successfully! Please Check Your Email." });
                        nodemailer.sendConfirmationEmail(
                            user.username,
                            user.email,
                            user.confirmationCode
                        );
                    });
                }
            );
        } else {
            Role.findOne({ name: "user" }, async (err, role) => {
                if (err) {
                    res.status(500).send({ message: "Impossible de creer votre compte!" });
                    return;
                }
                user.roles = role;
                tokens = await user.generateAuthToken()
                user.save(err => {
                    if (err) {
                        res.status(500).send({ message: "Impossible de creer votre compte!" });
                        return;
                    }

                    res.send({ message: "User was registered successfully! Please Check Your Email." });
                    nodemailer.sendConfirmationEmail(
                        user.username,
                        user.email,
                        user.confirmationCode
                    );
                });
            });
        }
    });
};

exports.createAccount = (req, res) => {
    const token = jwt.sign({ email: req.body.email }, config.secret)

    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
        confirmationCode: token,
        status: "Active",
    });

    user.save((err, user) => {
        Role.findOne({ name: "admin" }, async (err, role) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            console.log(role)
            user.roles = role;
            console.log(user.roles)
            tokens = await user.generateAuthToken()
            await user.save(err => {
                console.log(err)
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }

                res.send({ message: "User was registered successfully!" });
            });
        });
    })
}

exports.signin = (req, res) => {
    User.findOne({
        username: req.body.username
    })
        .populate("roles", "-__v")
        .exec(async (err, user) => {
            if (err) {
                res.status(500).send({ message: err });
                return
            }

            if (!user) {
                return res.status(404).send({ message: "User Not found." });
            }

            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );

            if (!passwordIsValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Invalid Password!"
                });
            }

            if (user.status != "Active") {
                return res.status(401).send({
                    message: "Pending Account. Please Verify Your Email!",
                });
            }

            var token = await user.generateAuthToken()
            console.log(token)

            res.status(200).send({
                user, token
            });
        });
};

exports.verifyUser = (req, res, next) => {
    User.findOne({
        confirmationCode: req.params.confirmationCode,
    })
        .then((user) => {
            console.log(user);
            if (!user) {
                return res.status(404).send({ message: "User Not Found." });
            }
            user.status = "Active";
            user.save((err) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
            });
        }).catch((e) => console.log("error", e));
};

exports.signupGoogle = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).send({ message: "Missing credential" });
    }

    const { data } = await axios.get(GOOGLE_API_URL, {
      headers: { Authorization: `Bearer ${credential}` },
    });

    const { given_name: firstName, family_name: lastName, email } = data;
    const existUser = await User.findOne({ email });

    if (existUser) {
      return res.status(400).send({ message: "Failed! Email is already in use!" });
    }

    const user = new User({
      firstName,
      lastName,
      email,
      status: "Active",
    });

    const token = await user.generateAuthToken();
    user.confirmationCode = token;

    const role = await Role.findOne({ name: "user" });
    user.roles = role;

    await user.save();
    console.log(user);

    res.status(200).send({ user, token });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
};

exports.signinGoogle = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).send({ message: "Missing credential" });
    }

    const { data } = await axios.get(GOOGLE_API_URL, {
      headers: { Authorization: `Bearer ${credential}` },
    });

    const { given_name: firstName, family_name: lastName, email } = data;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send({ message: "You are not registered! Please sign up!" });
    }

    const token = await user.generateAuthToken();
    console.log(user);

    res.status(200).send({ user, token });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
};

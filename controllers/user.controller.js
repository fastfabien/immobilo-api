require("dotenv/config");
const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
var jwt = require("jsonwebtoken");


const paypal = require("@paypal/checkout-server-sdk");
const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

exports.allAccess = (req, res) => {
    res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
    res.status(200).send("User Contant.");
};

exports.adminBoard = (req, res) => {
    res.status(200).send("Admin Content.");
}

exports.moderatorBoard = (req, res) => {
    res.status(200).send("Moderator Content.");
}

exports.completeUserInformation = async (req, res, next) => {
    const updataValue = req.body.data
    const user = req.user

    const users = await User.findByIdAndUpdate(user.id, updataValue, { new: true })
    if (!users) {
        return res.status(400).send({ message: "Impossible d'enregistrer les informations!" })
    }

    user.save((err) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        return res.status(201).send({
            users
        })
    });
}

exports.getAllUser = async (req, res) => {
    const users = await User.find({})

    if (!users) {
        return res.status(404).send({ message: "Aucun utilisateur pour l'instant" })   
    }

    return res.status(200).send(users)

}

exports.binaryToBase64 = async(req, res) => {
    const user = await User.findById(req.params.id).exec()

    if (!user) {
        return res.status(404).send({ message: "Aucun utilisateur pour l'instant" })   
    }

    return res.status(201).send(docs)

}


exports.getUser = async (req, res) => {
    console.log(req.params.id)
    const user = await User.findById(req.params.id).exec()

    if(!user) {
        return res.status(404).send({ message: "User not found!" })   
    }

    console.log(user)

    return res.status(200).send({user})
}


exports.updateDocumentStatus = async (req, res, next) => {
    const body = req.body 
    const user = await User.findByIdAndUpdate(req.params.id, body, { new: true })
    console.log(user)

    if(!user) {
        return res.status(400).send({ message: "Impossible de changer le status!" })
    }

    console.log(user.verification)

    user.save((err) => {
        if(err) {
            res.status(500).send({ message: err })
        }
        return res.status(200).send({
            user
        })
    })

}

exports.importUserDocument = async (req, res, next) => {
    const currentUser = req.user
    const body = { verification: "En attente", documentMimetype: req.file.mimetype, document: req.file.buffer }


    const user = await User.findByIdAndUpdate(currentUser.id, body, { new: true })

    if (!user) {
        return res.status(400).send({ message: "Impossible d'enregistrer les informations!" })
    }

    var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
    });
    user.save((err) => {
        if(err) {
            res.status(500).send({ message: err })
        }
        return res.status(200).send({
            user
        })
    })
}

exports.refreshUserInformation = async (req, res) => {
    const currentUser = req.user._id

    const user = await User.findOne({ _id: currentUser }).populate('roles').lean()

    res.status(200).send({ user })

}

exports.refreshDashboard = async (req, res) => {

    const currentUser = req.user._id

    const user = await User.findOne({ _id: currentUser })
    .populate({
        path: 'bricks', 
        populate: {
            path: 'propertie_id',
            select: "id nom zip rue valorisation rentabiliter reverser nb_brique_restant image_couverture prix_acquisition region"
        }
    }).lean()

    if(!user) {
        return res.status(500).send({ message: "User not Found" });
    }

    return res.status(200).send({ user })

}

exports.sendPaypalKeys = (req, res) => {
    res.send(process.env.PAYPAL_CLIENT_ID || 'sb')
}


exports.createOrder = async (req, res) => {
    try {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: req.body.currency,
            value: req.body.amount,
          },
        },
      ],
    });
    const response = await client.execute(request);
    console.log(response.result.id)
    const orderId = response.result.id
    console.log(orderId)
    res.status(200).send({ orderId });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Server Error" });
    }
}

exports.capturePayment = async (req, res) => {
    console.log(req.body)
    try {
        const request = new paypal.orders.OrdersCaptureRequest(req.body.orderId);
        request.requestBody({
            amount: {
                currency_code: req.body.currency,
                value: req.body.amount,
            },
            final_capture: true,
            authorization_id: req.body.authorization,
        });
        const response = await client.execute(request);
        res.status(200).send({ message: "Payment captured successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server Error" });
    }
}
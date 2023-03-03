const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");

const user = new mongoose.Schema({
    firstName: String,
    lastName: String,
    username: String,
    email: String,
    password: String,
    typeCompte: String,
    pays: String,
    sexe: String,
    lieuNaissance: String,
    tel: String,
    adresse: String,
    boitePostal: String,
    paysActuel: String,
    wallet: {
        type: Number,
        default: 1000.0
    },
    document: {
        type: Buffer
    },
    documentMimetype: {
        type: String
    },
    status: {
        type: String,
        enum: ['Pending', 'Active'],
        default: 'Pending'
    },
    verification: {
        type: String,
        enum: ['Verifier', 'En attente', 'Refuser', 'Non verifier'],
        default: 'Non verifier'
    },
    confirmationCode: {
        type: String,
        unique: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    roles: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role"
        }
    ],
    bricks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bricks"
    }]
})

user.methods.toJSON  = function () {
    const user = this;
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.confirmationCode
    delete userObject.bricks

    return userObject
}

user.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, config.secret)

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token

}   

const User = mongoose.model(
    "User", user
)




module.exports = User
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");

const Market = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	bricks: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Bricks',
		required: true
	},
	prix: {
		type: Number,
		required: true
	},
	status: {
		type: String,
		enum: ['Sell', 'Selled'],
		default: 'Sell'
	},
}, { timestamps: true })

const market = mongoose.model(
	"Market", Market
)

module.exports = market
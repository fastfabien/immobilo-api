const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");

const Bricks = new mongoose.Schema({
	propertie_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Properties',
		required: true
	},
	nombre_bricks: {
		type: Number,
		required: true
	},
	prix_total: {
		type: Number,
		required: true
	},
	status: {
        type: String,
        enum: ['Sell', 'Selled'],
        default: 'Sell'
    },
}, {timestamp: {createdAt: 'created_at', updatedAt: 'updated_at'}})

const bricks = mongoose.model(
	"Bricks", Bricks
)

module.exports = bricks
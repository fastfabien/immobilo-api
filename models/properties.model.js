const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");

const Properties = new mongoose.Schema({
	nom: String,
	rue: String,
	region: String,
	zip: String,
	rentabiliter: Number,
	revenu_reverser: Number,
	reverser: Number,
	nb_brique: Number,
	nb_brique_restant: Number,
	valorisation: Number,
	prix_acquisition: Number,
	renumeration_service: Number,
	frais_notaire: Number,
	reserve_argent: Number,
	loyer_collecter_annuel: Number,
	frais_agence: Number,
	remboursement_emprunt: Number,
	taxes: Number,
	localisation: String,
	etat_immeuble: String,
	nature_lots: String,
	totalite_lots: String,
	nombre_lots: Number,
	loyer_mensuel: Number,
	aire: Number,
	revente: Number,
	renovation: Number,
	description: String,
	images: [{
		type: Buffer
	}],
	image_couverture: Buffer
})

const propriete = mongoose.model(
	"Properties", Properties
)

module.exports = propriete
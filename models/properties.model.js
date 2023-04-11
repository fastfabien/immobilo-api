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
	charge_co_proprietes: Number,
	taxe_foncières: Number,
	assurance: Number,
	aire: Number,
	potentiel_plus_value: Number,
	description: [{
		type: String
	}],
	about: [{
		type: String
	}],
	images: [{
		type: Buffer
	}],
	image_couverture: Buffer
}, { timestamps: true })

const propriete = mongoose.model(
	"Properties", Properties
)

module.exports = propriete
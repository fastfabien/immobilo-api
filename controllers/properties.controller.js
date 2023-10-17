const db = require("../models");
const config = require("../config/auth.config");
const Propriete = db.propriete
var jwt = require("jsonwebtoken");
const sharp = require("sharp")



exports.createProperties = async (req, res, next) => {
	const value = req.body;
	const files = req.files

	const filteredDescription = []
	const filteredAbout = []

	const valorisation = (parseFloat(value.prix_acquisition) + parseFloat(value.renumeration_service) + parseFloat(value.frais_notaire) + parseFloat(value.reserve_argent))
	const revenu_reverser = parseFloat(value.loyer_collecter_annuel) - parseFloat(value.charge_co_proprietes) - parseFloat(value.taxe_foncières) - parseFloat(value.frais_agence) - parseFloat(value.remboursement_emprunt) - parseFloat(value.taxes) - parseFloat(value.assurance)
	const reverser = ((parseFloat(revenu_reverser) / parseFloat(valorisation)) * 100).toFixed(2)

	for (const key in value) {
		if (key.startsWith("des")) {
			filteredDescription.push(value[key])
		}
	}

	for (const key in value) {
		if (key.startsWith("about")) {
			filteredAbout.push(value[key])
		}
	}

	const propriete = new Propriete({
		nom: value.nom,
		rue: value.rue,
		region: value.region,
		zip: value.zip,
		potentiel_plus_value: parseFloat(value.potentiel_plus_value),
		rentabiliter: parseFloat(reverser) + parseFloat(value.potentiel_plus_value),
		prix_acquisition: parseFloat(value.prix_acquisition),
		renumeration_service: parseFloat(value.renumeration_service),
		frais_notaire: parseFloat(value.frais_notaire),
		reserve_argent: parseFloat(value.reserve_argent),
		valorisation: valorisation,
		loyer_collecter_annuel: parseFloat(value.loyer_collecter_annuel),
		frais_agence: parseFloat(value.frais_agence),
		remboursement_emprunt: parseFloat(value.remboursement_emprunt),
		taxes: parseFloat(value.taxes),
		revenu_reverser: revenu_reverser,
		reverser: reverser,
		localisation: value.localisation,
		etat_immeuble: value.etat_immeuble,
		nature_lots: value.nature_lots,
		totalite_lots: value.totalite_lots,
		nombre_lots: parseFloat(value.nombre_lots),
		loyer_mensuel: parseFloat(value.loyer_mensuel),
		aire: parseFloat(value.aire),
		description: filteredDescription,
		charge_co_proprietes: value.charge_co_proprietes,
		taxe_foncières: value.taxe_foncières,
		assurance: value.assurance,
		about: filteredAbout,
		nb_brique: (parseFloat(value.prix_acquisition) + parseFloat(value.renumeration_service) + parseFloat(value.frais_notaire) + parseFloat(value.reserve_argent)) / 10,
		nb_brique_restant: (parseFloat(value.prix_acquisition) + parseFloat(value.renumeration_service) + parseFloat(value.frais_notaire) + parseFloat(value.reserve_argent)) / 10,
	})

	for (let i = 0; i < files.length; i++) {
		let compressedImage = null
		if (files[i].size >= 1000000) {
			compressedImage = await sharp(files[i].buffer)
				.resize({ width: 500 })
				.jpeg({ quality: 30 })
				.png({ compressionLevel: 5 })
				.toBuffer();
		} else {
			compressedImage = await sharp(files[i].buffer)
				.resize({ width: 500 })
				.jpeg({ quality: 80 })
				.png({ compressionLevel: 6 })
				.toBuffer();
		}
		propriete.images.push(compressedImage)
	}

	propriete.image_couverture = files[0].buffer

	await propriete.save((err, property) => {
		if (err) {
			res.status(500).send({ message: err });
			return;
		}

		res.status(201).send({
			propriete
		})
	})
}

exports.getAllProperties = async (req, res, next) => {
	const propriete = await Propriete.find({}, {

		id: 1,
		nom: 1,
		zip: 1,
		rue: 1,
		valorisation: 1,
		rentabiliter: 1,
		reverser: 1,
		nb_brique_restant: 1,
		image_couverture: 1,
		prix_acquisition: 1,
		nb_brique: 1,

	}).lean()

	if (!propriete) {
		return res.status(404).send({ message: "Aucun propriete pour l'instant" })
	}

	return res.status(200).send(propriete)
}

exports.getPropriety = async (req, res, next) => {
	const property = await Propriete.findById(req.params.id).lean().exec()

	if (!property) {
		return res.status(404).send({ message: "Aucun propriete trouver" })
	}

	return res.status(200).send({ property })
}
const db = require("../models");
const config = require("../config/auth.config");
const Bricks  = db.bricks
const User  = db.user
const Propriete = db.propriete
var jwt = require("jsonwebtoken");

exports.buyBrick = async (req, res) => {
	const user = req.user
	const brick = req.body
	const newBrick = new Bricks({
		propertie_id: brick.properties_id,
		nombre_bricks: parseFloat(brick.nombreBricks),
		prix_total: parseFloat(brick.prixTotalBricks)
	})

	/*Modification propriete*/
	const propriete = await Propriete.findOne({ id: brick.properties_id })

	if(!propriete) {
		return res.status(500).send({ message: 'Propriete Introuvable' })
	}

	if (parseFloat(propriete.nb_brique_restant) < parseFloat(brick.nombreBricks)) {
		return res.status(401).send({ message: "Brique restant insuffissant!" })
	}

	propriete.nb_brique_restant = parseFloat(propriete.nb_brique_restant) - parseFloat(brick.nombreBricks)

	/*Ajout id newBrick to user*/
	if (parseFloat(user.wallet) < parseFloat(brick.prixTotalBricks)) {
		return res.status(401).send({ message: "Fond insuffissant!" })
	}

	/*Verification si deja achete*/
	const existBrick = await Bricks.findOne({ propertie_id: brick.properties_id, _id: user.bricks, status: "Sell"  })
	if(existBrick && existBrick.status === "Sell") {
		console.log("efa misy")
		existBrick.nombre_bricks = parseFloat(existBrick.nombre_bricks) + parseFloat(brick.nombreBricks)
		existBrick.prix_total = parseFloat(existBrick.prix_total) + parseFloat(brick.prixTotalBricks)
		user.wallet = parseFloat(user.wallet) - parseFloat(brick.prixTotalBricks)
		await existBrick.save((err) => {
			if(err) {
				return res.status(500).send({ message: err.message })
			}
		})
		await user.save((err) => {
			if(err) {
				return res.status(500).send({ message: err.message })
			}
			res.status(200).send({
				user
			})
		})
	} else {
		user.wallet = parseFloat(user.wallet) - parseFloat(brick.prixTotalBricks)
		user.bricks.push(newBrick.id)

		
		await newBrick.save((err) => {
			if(err) {
				return res.status(500).send({ message: err.message })
			}
		})
		await propriete.save((err) => {
			if(err) {
				return res.status(500).send({ message: err.message })
			}
		})
		await user.save((err) => {
			if(err) {
				return res.status(500).send({ message: err.message })
			}
			res.status(200).send({
				user
			})
		})
	}
}


exports.getAllUserBricks = async (req, res) => {
  const { id: userId } = req.user;

  const currentUser = await User.findOne({ _id: userId })
    .populate({
      path: 'bricks', 
      populate: {
        path: 'propertie_id',
        select: 'id nom zip rue valorisation rentabiliter reverser nb_brique_restant image_couverture prix_acquisition region'
      },
      select: '-__v'
    })
    .lean();



  const bricks = currentUser.bricks;

  return res.status(200).send({
    bricks
  });
}

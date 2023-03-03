const db = require("../models");
const config = require("../config/auth.config");
const Market  = db.market
const Brick  = db.bricks
var jwt = require("jsonwebtoken");


exports.createMarket = async (req, res) => {
        const user = req.user
        const body = req.body

        const newMarket = new Market({
                user: user.id,
                bricks: body.bricks_id,
                prix: body.new_price
        })

        /*console.log(newMarket.populate({ path: 'bricks', populate: 'propertie_id' }))*/

        const editingBricks = await Brick.findById(body.bricks_id).exec() 

        if(editingBricks.status == "Sell") {
                editingBricks.status = "Selled"
        } else {
                res.status(500).send({ message: "Identifiant du bricks non trouvé" })
                return
        }

        newMarket.save( (err) => {
                if(err) {
                        return res.status(500).send({ message: err })
                }
                res.status(200).send({ newMarket })
        })
}


exports.getUserMarket = async (req, res) => {
        const user = req.user

        const markets = await Market.find({ user: user.id }).populate({ path: 'bricks', populate: 'propertie_id' })

        return res.status(200).send({
                markets
        })
}

exports.getAllMarket = async (req, res) => {
        console.log(req.query)
        const markets = await Market.find({}).populate({ path: 'bricks', populate: 'propertie_id' })

        return res.status(200).send({ markets })
}
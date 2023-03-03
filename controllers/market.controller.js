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

        const editingBricks = await Brick.find({ id: body.bricks_id, status: "Sell" })

        console.log(editingBricks[0]) 
        if (editingBricks[0]) {
                editingBricks[0].status = "Selled";
                await editingBricks[0].save((err) => {
                        if (err) {
                                console.log(err)
                               return res.status(500).send({ message: err }) 
                        }

                })
        }

        await newMarket.save( (err) => {
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
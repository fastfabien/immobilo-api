const db = require("../models");
const config = require("../config/auth.config");
const Market  = db.market
const Brick  = db.bricks
const User  = db.user
var jwt = require("jsonwebtoken");


exports.createMarket = async (req, res) => {
  try {
    const { user } = req;
    const { bricks_id: bricks, new_price: prix } = req.body;

    const newMarket = new Market({
      user: user.id,
      bricks,
      prix,
    });

    const editingBricks = await Brick.findOneAndUpdate(
      { _id: bricks, status: "Sell" },
      { $set: { status: "Selled" } },
      { new: true }
    ).lean();

    await Promise.all([newMarket.save(), editingBricks]);

    res.status(200).send({ id: newMarket.id, user: newMarket.user, bricks: newMarket.bricks, prix: newMarket.prix });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};







exports.getUserMarket = async (req, res) => {
        const { user } = req;

        const markets = await Market.find({ user: user.id, status: 'Sell' })
        .populate({
            path: 'bricks', 
            populate: {
              path: 'propertie_id',
              select: "id nom zip rue valorisation rentabiliter reverser nb_brique_restant image_couverture region prix_acquisition"
            }
        }).lean()

        return res.status(200).send({
                markets
        })
}

exports.getAllMarket = async (req, res) => {
        const markets = await Market.find({ user: { $ne: req.user.id }, status: 'Sell' })
        .populate({
            path: 'bricks', 
            populate: {
              path: 'propertie_id',
              select: "id nom zip rue valorisation rentabiliter reverser nb_brique_restant image_couverture region prix_acquisition"
            }
        }).lean()

        return res.status(200).send({ markets })
}


exports.sellMarket = async (req, res) => {
  const currentUser = req.user;
  const marketId = req.body.market_id;
  const selledMarket = await Market.findOne({ _id: marketId })
    .populate('bricks')
    .populate({ path: 'user', populate: 'bricks' })

  if (selledMarket) {
    const user = selledMarket.user;
    const bricks = selledMarket.bricks;

    /*Enlever l'identifiant du brick dans l'user et augmenter le wallet de l'user par le prix du market*/
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { $set: { bricks: user.bricks.filter(b => b._id.toString() !== bricks._id.toString()) }, $inc: { wallet: parseFloat(req.body.prix_total) } },
      { new: true }
    ).lean();

    /*Status brick revient sur Sell*/
    const bricks_owned = await Brick.findOneAndUpdate(
      { _id: bricks._id },
      { $set: { status: "Sell" } },
      { new: true }
    ).lean();

    /*Enlever le prix du bricks sur le wallet de currentUser et ajouter l'identifiant du bricks au currentUser*/
    const updatedCurrentUser = await User.findOneAndUpdate(
      { _id: currentUser._id },
      { $push: { bricks: bricks_owned._id }, $inc: { wallet: -parseFloat(req.body.prix_total) } },
      { new: true }
    ).lean();

    /*Changer le status du selledMarket en Selled*/
    await Market.findOneAndUpdate({ _id: marketId }, { status: "Selled" });
    return res.status(200).send({ markets: selledMarket });
  }
};


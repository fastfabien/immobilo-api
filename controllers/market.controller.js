const db = require("../models");
const config = require("../config/auth.config");
const Market = db.market
const Brick = db.bricks
const User = db.user
var jwt = require("jsonwebtoken");


exports.createMarket = async (req, res) => {
  const { user } = req;
  const { bricks_id: bricks, prix_total_sell: prix, quantity } = req.body;
  const prix_total_10 = parseFloat(quantity) * 10
  try {
    const { propertie_id } = await Brick.findById(bricks).populate({
      path: 'propertie_id',
      select: "_id"
    })


    const newBrick = new Brick({
      propertie_id: propertie_id._id,
      nombre_bricks: parseFloat(quantity),
      prix_total: parseFloat(prix_total_10),
      status: "Selled"
    })

    user.bricks.push(newBrick._id)

    const newMarket = new Market({
      user: user._id,
      bricks: newBrick.id,
      prix,
    });



    const editingBricks = await Brick.findOneAndUpdate(
      { _id: bricks, status: "Sell" },
      { $inc: { nombre_bricks: -parseFloat(quantity), prix_total: -parseFloat(prix_total_10) } },
      { new: true }
    ).lean();

    await Promise.all([newBrick.save(), user.save(), newMarket.save(), editingBricks]);

    res.status(200).send({ markets: newMarket });
  } catch (err) {
    console.log(err)
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

  console.log(markets)

  return res.status(200).send({
    markets
  })
}

exports.getAllMarket = async (req, res) => {
  const markets = await Market.find({ status: 'Sell' })
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
      { $push: { bricks: bricks_owned._id }, $inc: { wallet: -parseFloat(req.body.prix_total), invested_money: parseFloat(req.body.prix_total) } },
      { new: true }
    ).lean();

    /*Changer le status du selledMarket en Selled*/
    await Market.findOneAndUpdate({ _id: marketId }, { status: "Selled" });
    return res.status(200).send({ markets: selledMarket });
  }
};

exports.removeMarket = async (req, res) => {
  const currentUser = req.user;
  const { bricks_id: bricks } = req.body;

  try {
    const currentBricks = await Brick.findOneAndDelete({ _id: bricks, status: 'Selled' });

    if (!currentBricks) {
      return res.status(404).send({ message: 'Bricks not found' });
    }

    const lastBricks = await Brick.findOneAndUpdate(
      { propertie_id: currentBricks.propertie_id, status: 'Sell' },
      { $inc: { prix_total: parseFloat(currentBricks.prix_total), nombre_bricks: parseFloat(currentBricks.nombre_bricks) } },
      { new: true }
    );

    const market = await Market.findOneAndDelete({ bricks });

    await Promise.all([lastBricks, lastBricks, market]);

    res.status(200).send()
  } catch (err) {
    console.log(err)
  }

}


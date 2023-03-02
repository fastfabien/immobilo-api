const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require('./user.model');
db.role = require('./role.model');
db.propriete = require('./properties.model')
db.bricks = require('./bricks.model')
db.market = require('./market.model')
db.ROLES = ["user", "admin", "moderator"];

module.exports = db;
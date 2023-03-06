const express = require('express');
const cors = require('cors');
const dbConfig = require("./config/db.config")
const config = require("./config/auth.config")
const automate = require("./automateAction")

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

const app = express()

var corsOptions = {
    origin: [process.env.CLIENT_ORIGIN],
    methods: "GET,POST,PUT,DELETE,OPTIONS,PATCH"
};

app.use(cors(corsOptions));

const db = require("./models");
const { count } = require('./models/user.model');
const Role = db.role;
const User = db.user

const prod = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@immobilo.j6lt89y.mongodb.net/?retryWrites=true&w=majority`
const local= `mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`

db.mongoose.connect(prod, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
}).catch(err => {
    console.error("Connection error", err);
    process.exit();
})


automate.calculateUserBenefit()


function initial() {
    Role.estimatedDocumentCount( async (err, count) => {
        if (!err && count === 0) {
            await new Role({
                name: "user"
            }).save( async (err, role) => {
                if (err) {
                    console.log("error", err)
                }

                const token = jwt.sign({ email: "user@user.com" }, config.secret)

                const user = new User({
                    username: "user",
                    email: "user@user.com",
                    password: bcrypt.hashSync("user123456789", 8),
                    status: 'Active',
                    verification: 'Verifier'
                })

                user.roles = role;
                user.confirmationCode = token,
                tokens = await user.generateAuthToken()
                await user.save(err => {
                    if (err) {
                    console.log("error", err);
                    }
                })
             console.log("added 'user' to roles collection");
            });

            await new Role({
                name: "moderator"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }

                console.log("added 'moderator' to roles collection");
            });

            await new Role({
                name: "admin"
            }).save( async (err, role) => {
                if (err) {
                    console.log("error", err);
                }

                const token = jwt.sign({ email: "admin@admin.com" }, config.secret)
                const admin = new User({
                    username: "admin",
                    email: "admin@admin.com",
                    password: bcrypt.hashSync("admin123456789", 8),
                    status: 'Active',
                    verification: 'Verifier'
                })

                admin.roles = role;
                admin.confirmationCode = token,
                tokens = await admin.generateAuthToken()
                await admin.save(err => {
                    if (err) {
                    console.log("error", err);
                }
                    console.log("added 'admin' account to collection");
                })

                console.log("added 'admin' to roles collection");
            })
        }
    })
}

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to samagang application" });
})
require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);
require('./routes/properties.routes')(app);
require('./routes/bricks.routes')(app);
require('./routes/market.routes')(app);

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
})
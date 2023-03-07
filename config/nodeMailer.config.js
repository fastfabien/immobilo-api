require("dotenv/config");
const nodemailer = require('nodemailer')
const config = require("../config/auth.config")


const user = config.user
const origin_url = process.env.CLIENT_ORIGIN

var transport = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

module.exports.sendConfirmationEmail = (name, email, confirmationCode) => {
    transport.sendMail({
        from: '"No Reply" <no-reply@immobilo.com>',
        to: email,
        subject: "Please Confirm Your account",
        html: `<h1>Email Confirmation</h1>
        <h2>Hello ${name}</h2>
        <p>Merci de votre inscription. Pour le confirmer , s'il vous plait cliquez sur le lien suivant: </p>
        <a href=${origin_url}/confirm/${confirmationCode}> Click here</a>
        </div>`,
    }).catch(err => console.log(err));
};
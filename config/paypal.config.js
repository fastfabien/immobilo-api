require("dotenv/config");
// Set up PayPal SDK with your credentials
module.export = ({
  mode: "sandbox", // sandbox or live
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});
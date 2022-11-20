require("dotenv").config();

const express = require("express");
const cors = require("cors");

const isProduction = process.env.NODE_ENV === "production";
const stripeKey = isProduction
  ? process.env.LIVE_STRIPE_SECRET_KEY
  : process.env.TEST_STRIPE_SECRET_KEY;

const stripe = require("stripe")(stripeKey);

const app = express();
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

const path = require("path");

// Secure Cors
const origin = {
  origin: isProduction ? "https://www.heroku.com/" : "*",
};
app.use(cors(origin));

// serves the built version of your react app
app.use(express.static(path.join(__dirname, "client/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Runing on port ${port}`);
});

// ENDPOINTS

// Stripe payment intent
app.post("/get_intent", (req, res) => {
  const payload = req.body;
  const { amount, currency, paymentMethodId, customerEmail } = payload;

  // TODO: Look for user. If not present, Save user without a new date

  getStripeIntent(amount, currency, paymentMethodId, customerEmail)
    .then((data) => {
      const state = { clientSecret: data.client_secret };
      const response = JSON.stringify(state);

      res.send(response);
    })
    .catch((e) => res.json(JSON.stringify({ stripe_error: e })));
});

// TODO:
// app.post("/set_expiry", (req, res) => {});

const getStripeIntent = async (
  amount,
  currency,
  paymentMethodId,
  customerEmail
) => {
  const description = "Kurku MIDI controller - subscription";
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: currency,
    payment_method_types: ["card"],
    description: description,
    receipt_email: customerEmail,
    payment_method: paymentMethodId,
    confirmation_method: "automatic",
    // confirm: true
  });

  return await paymentIntent;
};

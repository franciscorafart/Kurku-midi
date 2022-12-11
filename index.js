require("dotenv").config();
const mongoose = require("mongoose");

const express = require("express");
const cors = require("cors");
const Transaction = require("./Models/Transaction.ts");

const isProduction = process.env.NODE_ENV === "production";
const url = process.env.MONGO;
mongoose.connect(
  // isProduction ? process.env.MONGO : "mongodb://127.0.0.1:27017/test",
  url,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

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
  origin: isProduction
    ? [
        "https://www.heroku.com/",
        "https://app.kurku.tech",
        "https://herokuapp.com",
      ]
    : "*",
};
app.use(cors(origin));

// serves the built version of your react app
console.log("__dirname", __dirname);
app.use(express.static(path.join(__dirname, "/client/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

const port = process.env.PORT || 8000;

// TODO: Try this and roll back static file
app.listen(port, "0.0.0.0", () => {
  console.log(`Runing on port ${port}`);
});

mongoose.connection.on("error", (err) => {
  console.log("err", err);
});
mongoose.connection.on("connected", (err, res) => {
  console.log("mongoose is connected");
});

// ENDPOINTS

// Stripe payment intent
app.post("/get_intent", (req, res) => {
  const payload = req.body;
  const { amount, currency, paymentMethodId, customerEmail } = payload;
  console.log("[auload", payload);
  // TODO: Look for user. If not present, Save user without a new date

  getStripeIntent(amount, currency, paymentMethodId, customerEmail)
    .then((data) => {
      console.log("intent data", data);
      const state = { clientSecret: data.client_secret };
      const response = JSON.stringify(state);

      res.status(200);
      res.send(response);
    })
    .catch((e) => {
      res.status(400);
      res.send(JSON.stringify({ stripe_error: e }));
    });
});

app.post("/addTransaction", (req, res) => {
  const payload = req.body;
  const { walletId, intent } = payload;

  // TODO: Validate: Find intent with stripe to avoid rouge api calls
  const valid = true;

  if (valid && walletId) {
    const now = new Date();
    let expiry = new Date();
    expiry = new Date(expiry.setFullYear(expiry.getFullYear() + 1));

    new Transaction({
      walletId,
      date: now.toUTCString(),
      expiry: expiry.toUTCString(),
      dev: !isProduction,
    })
      .save()
      .then(
        () => res.status(200).json({ expiry: expiry.toUTCString() }).send() // TODO: Encrypt date and send
      )
      .catch((error) => {
        res.status(500).json({ error, message: "Invalid transaction" }).send();
      });
  } else {
    res.status(400).json({ message: "Invalid transaction" }).send();
  }
});

app.post("/getTransactions", (req, res) => {
  const payload = req.body;
  const { walletId } = payload;
  // res.status(400).json({ message: "Invalid transaction" }).send();

  Transaction.find({ walletId: walletId })
    .then((transactions) => res.status(200).json({ data: transactions }))
    .catch((e) => res.status(400).json(e));
});

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

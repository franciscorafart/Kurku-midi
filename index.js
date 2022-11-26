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

  getStripeIntent(amount, currency, paymentMethodId, customerEmail)
    .then((data) => {
      const state = { clientSecret: data.client_secret };
      res.status(200).json(state);
    })
    .catch((e) => {
      res.status(400).json({ stripe_error: e });
    });
});

app.post("/addTransaction", (req, res) => {
  const payload = req.body;
  const { walletId, intent } = payload;
  // TODO: Validate: Find intent with stripe to avoid rouge api calls
  const valid = true;

  if (valid && walletId) {
    const now = new Date();
    const date = new Date(now.setFullYear(now.getFullYear() + 1)).toUTCString();
    new Transaction({
      walletId,
      date: date,
      dev: !isProduction,
    })
      .save()
      .then(
        // TODO: Encrypt date and send
        () => res.status(200).json({ date: date })
      )
      .catch((error) =>
        res.status(400).json({ error, message: "Invalid transaction" })
      );

    // console.log("transaction", t);
  } else {
    res.status(400).json({ message: "Invalid transaction" });
  }
});

app.post("/getLatestTransaction", (req, res) => {
  const payload = req.body;
  const { walletId } = payload;

  // TODO: Validation and sort (Return only 1)
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

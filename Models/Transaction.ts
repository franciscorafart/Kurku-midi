const mongoose = require("mongoose");
// const uniqueValidator = require('mongoose-unique-validator');

const transactionSchema = mongoose.Schema({
  walletId: { type: String, required: true },
  date: { type: String, required: true },
  dev: { type: Boolean, required: true, default: false },
});

// userSchema.plugin(uniqueValidator)

module.exports = mongoose.model("Transaction", transactionSchema);

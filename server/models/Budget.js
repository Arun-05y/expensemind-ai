const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  monthlyLimit: { type: Number, required: true },
  savingsGoal: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Budget', budgetSchema);

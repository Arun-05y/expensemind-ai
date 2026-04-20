const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { body, validationResult } = require('express-validator');
const xss = require('xss');

/**
 * @route GET /api/expenses
 * @desc Get all expenses sorted by date
 */
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Server error while fetching expenses' });
  }
});

/**
 * @route POST /api/expenses
 * @desc Add a new expense with validation and sanitization
 */
router.post(
  '/',
  [
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('category').trim().notEmpty().escape().withMessage('Category is required'),
    body('date').notEmpty().withMessage('Date is required'),
    body('note').trim().escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const expense = new Expense({
      amount: req.body.amount,
      category: req.body.category,
      date: req.body.date,
      note: xss(req.body.note), // Double protection with xss sanitization
      icon: req.body.icon,
    });

    try {
      const newExpense = await expense.save();
      res.status(201).json(newExpense);
    } catch (err) {
      res.status(400).json({ message: 'Failed to save expense' });
    }
  }
);

// Delete an expense
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    
    await expense.deleteOne();
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/insights', aiController.getAIInsights);
router.post('/personality', aiController.getSpendingPersonality);
router.post('/chat', aiController.chatWithAI);
router.post('/predict', aiController.getPrediction);

module.exports = router;

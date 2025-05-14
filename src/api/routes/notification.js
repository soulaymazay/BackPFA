const express = require('express');
const router = express.Router();
const Notification = require('../models/notification.model');

// Obtenir les notifications d’un utilisateur
router.get('/notifications/:userId', async (req, res) => {
  try {
    const notifications = await Notification.find({ destinataireId: req.params.userId }).sort({ date: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des notifications', error: err });
  }
});

module.exports = router;

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  projetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Projet' },
  utilisateurId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // encadrant ciblé
  lu: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);

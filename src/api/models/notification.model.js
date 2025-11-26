const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  sujetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sujet' },
  utilisateurId: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' },
  date: { type: Date, default: Date.now },
  lu: { type: Boolean, default: false }
});

module.exports = mongoose.model('Notification', notificationSchema);
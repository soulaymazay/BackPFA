const mongoose = require('mongoose');

const sujetSchema = new mongoose.Schema({
  titre: String,
  description: String,
  technologie: String,
  entreprise: String,
  emailEntreprise: String,
  encadrantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cvPath: String, // chemin du fichier uploadé
  dateProposition: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Sujet', sujetSchema);

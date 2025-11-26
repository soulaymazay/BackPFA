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
   candidatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // ou 'Candidat' selon ton modèle
    required: true},
  cvPath: String, // chemin du fichier uploadé
  dateProposition: {
    type: Date,
    default: Date.now
  },
  cvPath: {
    type: String, // ✅ ce champ contient le chemin du fichier CV
  }
}, { timestamps: true });


module.exports = mongoose.model('Sujet', sujetSchema);

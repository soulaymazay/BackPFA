const mongoose = require('mongoose');

const projetSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['PFA', 'PFE', 'Stage'], required: true },
  encadrantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  candidatId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sujets: [{ type: String }],
  statut: {
    type: String,
    enum: ['en_attente', 'valide', 'refuse'], // ✅ Ajoute ici les valeurs autorisées
    default: 'en_attente'
  }
}, { timestamps: true });

module.exports = mongoose.model('Projet', projetSchema);

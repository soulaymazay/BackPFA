const mongoose = require('mongoose');

const candidatureSchema = new mongoose.Schema({
  projetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Projet',
    required: true,
  },
  statut: {
    type: String,
    enum: ['en_attente', 'accepte', 'refuse'],
    default: 'en_attente'
  },
  candidatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidat', required: true },
  cv: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Candidature', candidatureSchema);
const mongoose = require('mongoose');

const candidatRefuseeSchema = new mongoose.Schema({
  candidatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidat',
    required: true
  },
  projetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Projet',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CandidatRefusee', candidatRefuseeSchema);
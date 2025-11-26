const mongoose = require('mongoose');

const encadrantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nom: { type: String, required: true },
  prenom: String,
  telephone: String,
  domaine: String,
  specialite: String,
  image: String,
  role: { type: String, default: 'encadrant' }
});

const modelName = 'Encadrant';

module.exports = mongoose.models[modelName] || mongoose.model(modelName, encadrantSchema);

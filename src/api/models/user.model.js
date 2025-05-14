const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['candidat', 'encadrant'], required: true },
  // Tu peux ajouter d'autres champs spécifiques selon le rôle si besoin
});
const loginSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

module.exports = mongoose.model('Login', loginSchema);
module.exports = mongoose.model('User', userSchema);

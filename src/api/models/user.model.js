const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['candidat', 'encadrant'], required: true },
  nom: { type: String, required: true, unique: true }, // <- virgule ici !
  profil: { type: mongoose.Schema.Types.ObjectId, ref: 'Profil' } // <- champ relationnel
});

const loginSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// ⚠️ Attention : il faut exporter correctement les deux modèles
const Login = mongoose.model('Login', loginSchema);
const User = mongoose.model('User', userSchema);

module.exports = { Login, User };

const mongoose = require('mongoose');

// Schéma principal pour les utilisateurs
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
 role: { type: String, enum: ['candidat', 'encadrant'], required: true, default: 'candidat' },


encadrant: { type: mongoose.Schema.Types.ObjectId, ref: 'Encadrant' },



  nom: { type: String},
  profil: { type: mongoose.Schema.Types.ObjectId, ref: 'Profil' }
});

// Schéma pour les connexions (non obligatoire si inutilisé)
const loginSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Création des modèles
const Login = mongoose.model('Login', loginSchema);
const User = mongoose.model('User', userSchema);

// Exportation des modèles
module.exports = { Login, User };

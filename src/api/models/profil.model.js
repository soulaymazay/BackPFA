const mongoose = require('mongoose');

const ProfilSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    telephone: { type: String },
    niveau: { type: String },
    adresse: { type: String },
    experience: { type: String },
    competences: { type: String },
    formation: { type: String },
    domaine: { type: String },
    email: { type: String, required: true, unique: true },
    image: { type: String, default: 'default-profile.png' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Profil', ProfilSchema);
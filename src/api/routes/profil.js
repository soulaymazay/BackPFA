const express = require('express');
const router = express.Router();
const Profil = require('../models/profil.model');

// ➕ POST - Créer un nouveau profil
router.post('/completer-profil', async (req, res) => {
  const {
    nom,
    prenom,
    telephone,
    niveau,
    adresse,
    experience,
    competences,
    formation,
    domaine,
    email,
    image
  } = req.body;

  try {
    const nouveauProfil = new Profil({
      nom,
      prenom,
      telephone,
      niveau,
      adresse,
      experience,
      competences,
      formation,
      domaine,
      email,
      image
    });

    await nouveauProfil.save();

    res.status(201).json({ message: "Profil enregistré avec succès !" });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du profil :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ GET - Obtenir tous les profils (manquait !)
router.get('/profils', async (req, res) => {
  try {
    const profils = await Profil.find();
    res.json(profils);
  } catch (error) {
    console.error("Erreur lors de la récupération des profils :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
// GET profil par ID

router.get('/profils/:id', async (req, res) => {
  try {
    const profil = await Profil.findById(req.params.id);
    if (!profil) return res.status(404).json({ message: 'Profil non trouvé' });
    res.json(profil);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Profil = require('../models/profil.model');

// ➕ POST - Créer un nouveau profil
router.post('/completer-profil/:userId', async (req, res) => {
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
    const userId = req.params.userId;
    const existing = await Profil.findOne({ userId });
    if (existing) {
      return res.status(400).json({ message: "Profil existe déjà pour cet utilisateur." });
    }    
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
      image,
      userId
    });

    await nouveauProfil.save();

    res.status(201).json({ message: "Profil enregistré avec succès !" });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du profil :", error.message, error.stack);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 🔁 PUT - Mettre à jour un profil existant
router.put('/update-profil/:userId', async (req, res) => {
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
    const userId = req.params.userId;

    const profilMisAJour = await Profil.findOneAndUpdate(
      { userId },
      {
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
      },
      { new: true } // return updated document
    );

    if (!profilMisAJour) {
      return res.status(404).json({ message: "Profil non trouvé pour mise à jour" });
    }

    res.status(200).json({ message: "Profil mis à jour avec succès", profil: profilMisAJour });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ GET - Obtenir tous les profils
router.get('/profils', async (req, res) => {
  try {
    const profils = await Profil.find();
    res.json(profils);
  } catch (error) {
    console.error("Erreur lors de la récupération des profils :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ GET - Obtenir un profil par son ID
router.get('/profils/:id', async (req, res) => {
  try {
    const profil = await Profil.findById(req.params.id);
    if (!profil) return res.status(404).json({ message: 'Profil non trouvé' });
    res.json(profil);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ GET - Obtenir un profil par UserID
router.get('/profils/usersId/:id', async (req, res) => {
  try {
    const profil = await Profil.findOne({ userId: req.params.id });
    if (!profil) return res.status(404).json({ message: 'Profil non trouvé' });
    res.json(profil);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
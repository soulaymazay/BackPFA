const express = require('express');
const router = express.Router();
const Encadrant = require('../models/encadrant.model');

router.post('/completer-profil-encadrant/:userId', async (req, res) => {
  const { nom, prenom, telephone, domaine, specialite, email, image } = req.body;

  try {
    const userId = req.params.userId;
    const existing = await Encadrant.findOne({ userId });
    if (existing) {
      return res.status(400).json({ message: "Encadrant existe déjà pour cet utilisateur." });
    }

    if (!nom) {
      return res.status(400).json({ message: "Le champ 'nom' est obligatoire." });
    }

    const nouveauEncadrant = new Encadrant({
      nom,
      prenom,
      telephone,
      domaine,
      specialite,
      email,
      image,
      userId,
      role: 'encadrant'
    });

    await nouveauEncadrant.save();
    res.status(201).json({ message: "Profil encadrant enregistré avec succès !" });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du profil encadrant :", error.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get('/encadrant', async (req, res) => {
  try {
    const encadrants = await Encadrant.find();
    res.status(200).json(encadrants);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
});

router.get('/encadrant/usersId/:id', async (req, res) => {
  try {
    const encadrant = await Encadrant.findOne({ userId: req.params.id });
    if (!encadrant) return res.status(404).json({ message: 'Encadrant non trouvé' });
    res.json(encadrant);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;

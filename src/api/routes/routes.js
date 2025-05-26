const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../models/user.model');
const authController = require('../controllers/auth.controller');
const sujetController = require('../controllers/sujet.controller');
const upload = require('../middlewares/upload');

// Route Register
router.post('/register', async (req, res) => {
  console.log('Données reçues dans req.body:', req.body);

  try {
    const { email, password, role, nom, numero, niveau } = req.body;

    if (!['candidat', 'encadrant'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Utilisateur déjà existant' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      role,
      nom,
      numero,
      niveau
    });

    await newUser.save();

    res.status(201).json({ message: 'Utilisateur enregistré avec succès', user: newUser });

  } catch (error) {
    console.error('Erreur dans /register:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Route Login
router.post('/login', authController.login);

// Récupérer tous les noms des encadrants
router.get('/encadrants', async (req, res) => {
  try {
    const encadrants = await User.find({ role: 'encadrant' }, 'nom _id'); // récupérer seulement nom et _id
    res.status(200).json(encadrants);
  } catch (error) {
    console.error('Erreur lors de la récupération des encadrants:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/proposer avec upload de fichier (cv)
// Propositions de sujet
router.post('/proposer', upload.single('cv'), sujetController.proposerSujet);

module.exports = router;
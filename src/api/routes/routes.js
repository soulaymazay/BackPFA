const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../models/user.model');

const authController = require('../controllers/auth.controller');
// par exemple


// Route Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, nom } = req.body;

    if (!['candidat', 'encadrant'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide' });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Utilisateur déjà existant' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer le nouvel utilisateur
    const newUser = new User({ email, password: hashedPassword, role, nom });

    await newUser.save();

    res.status(201).json({ message: 'Utilisateur enregistré avec succès', user: newUser });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

 // ou autre nom de fichier

router.post('/login', authController.login);
module.exports = router;

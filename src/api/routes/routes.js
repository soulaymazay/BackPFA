const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../models/user.model');
const authController = require('../controllers/auth.controller');
const sujetController = require('../controllers/sujet.controller');
const upload = require('../middlewares/upload');
const Profil = require('../models/profil.model'); // <-- ce fichier est nécessaire
const authenticateToken = require('../middlewares/auth'); // chemin à adapter
const Encadrant = require('../models/encadrant.model');
candidatureController = require('../controllers/candidature.controller');

// ---------- Auth Routes ----------


router.post('/login', authController.login);

 router.post('/register-encadrant', authController.registerencadrant);


router.post('/register', upload.single('image'), async (req, res) => {
  try {
    const {
      email,
      password,
      nom,
      prenom,
      telephone,
      niveau,
      adresse,
      experience,
      competences,
      formation,
      domaineRecherche,
      role
    } = req.body;

    // Vérification des champs obligatoires
    if (!email || !password || !nom) {
      return res.status(400).json({ message: 'Email, mot de passe et nom sont obligatoires.' });
    }

    console.log('Reçu dans /register:', req.body);

    // Vérification si email déjà existant
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Gestion de l'image (fichier uploadé)
    const imageProfil = req.file ? req.file.filename : 'default-profile.png';

    // Création User
    const newUser = new User({
      email,
      password: hashedPassword,
      role: role || 'candidat',
      nom
    });

    let savedUser;
    try {
      console.log('Avant création user');
      savedUser = await newUser.save();
      console.log('User créé:', savedUser._id);
    } catch (userSaveError) {
      console.error('Erreur lors de la création de l’utilisateur:', userSaveError);
      return res.status(500).json({ message: 'Erreur lors de la création de l’utilisateur', error: userSaveError.message });
    }

    // Création Profil associé
    const newProfil = new Profil({
      nom,
      prenom,
      telephone,
      niveau,
      adresse,
      experience,
      competences,
      formation,
      domaine: domaineRecherche,
      email,
      image: imageProfil,
      userId: savedUser._id
    });

    let savedProfil;
    try {
      console.log('Avant création profil');
      savedProfil = await newProfil.save();
      console.log('Profil créé:', savedProfil._id);
    } catch (profilSaveError) {
      console.error('Erreur lors de la création du profil:', profilSaveError);
      // En cas d'erreur lors de la création du profil, supprimer l'utilisateur créé pour garder la cohérence
      await User.findByIdAndDelete(savedUser._id);
      return res.status(500).json({ message: 'Erreur lors de la création du profil', error: profilSaveError.message });
    }

    // Liaison User -> Profil
    try {
      savedUser.profil = savedProfil._id;
      await savedUser.save();
      console.log('User mis à jour avec profil');
    } catch (updateUserError) {
      console.error('Erreur lors de la mise à jour de l’utilisateur avec le profil:', updateUserError);
      return res.status(500).json({ message: 'Erreur lors de la mise à jour de l’utilisateur', error: updateUserError.message });
    }

    res.status(201).json({
      message: 'Utilisateur enregistré avec succès',
      user: savedUser,
      profil: savedProfil
    });

  } catch (err) {
    console.error('Erreur globale lors de l’inscription:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email déjà utilisé.' });
    }
    res.status(500).json({ message: 'Erreur serveur lors de l\'inscription', error: err.message });
  }
});


// ---------- Utilisateurs (Encadrants) ----------
router.get('/encadrants', async (req, res) => {
  try {
    const encadrants = await User.find({ role: 'encadrant' }, 'nom _id');
    res.status(200).json(encadrants);
  } catch (error) {
    console.error('Erreur lors de la récupération des encadrants:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ---------- Sujet Routes ----------
router.post(
  '/proposer',
  authenticateToken,           // ⬅️ ajoute ça AVANT upload
  upload.single('cv'),
  sujetController.proposerSujet
);

router.get('/sujets', sujetController.getAllSujets);

router.get('/sujets/avec-candidat', sujetController.getSujetsAvecCandidat);
router.get(
  '/mes-sujets',
  authenticateToken, // 🔐 pour récupérer l'utilisateur connecté
  sujetController.getSujetsByCandidatConnecte
);
router.get('/mes-sujets', authenticateToken, sujetController.getSujetsByEncadrantConnecte);
router.get(
  '/mes-projets-avec-candidats',
  authenticateToken,
  sujetController.getProjetsAvecCandidatParEncadrant
);
// ✅ Un seul export
router.put('/candidatures/:id/accepter', candidatureController.accepter);
router.put('/candidatures/:id/refuser', candidatureController.refuser);
router.get('/candidatures/statuts', candidatureController.getStatutsCandidatures);
module.exports = router;

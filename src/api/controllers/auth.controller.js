const bcrypt = require('bcryptjs');

const { User } = require('../models/user.model');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;

// Fonction d'enregistrement

const Profil = require('../models/profil.model'); // Modèle Profil

const SECRET = 'ton_secret'; 
const Encadrant = require('../models/encadrant.model');



exports.registerencadrant = async (req, res) => {
  try {
    const { email, password, nom, prenom, telephone, domaine, specialite, image } = req.body;

    if (!nom || !email || !password) {
      return res.status(400).json({ message: 'Les champs email, password et nom sont obligatoires.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Utilisateur déjà enregistré' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      nom,
      role: 'encadrant',
    });

    const savedUser = await newUser.save();

    const newEncadrant = new Encadrant({
      userId: savedUser._id,
      nom,
      prenom,
      telephone,
      domaine,
      specialite,
      image,
      email,
      role: 'encadrant',
    });

    await newEncadrant.save();

    res.status(201).json({ message: 'Encadrant enregistré avec succès' });
  } catch (error) {
    console.error('Erreur lors de l’enregistrement :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};





exports.register = async (req, res) => {
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

    // Vérifie si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Utilisateur déjà enregistré' });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création de l'utilisateur
    const newUser = new User({
      email,
      password: hashedPassword,
      role: role || 'candidat',
      nom  // si tu veux garder nom dans User aussi
    });

    const savedUser = await newUser.save();

    // Création du profil lié
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
      userId: savedUser._id // référence vers User
    });

    const savedProfil = await newProfil.save();

    // Liaison profil dans User
    savedUser.profil = savedProfil._id;
    await savedUser.save();

    res.status(201).json({
      message: 'Utilisateur et profil enregistrés avec succès',
      user: savedUser,
      profil: savedProfil
    });

  } catch (error) {
    console.error('Erreur lors de l’inscription :', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'inscription' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).send({ message: 'Utilisateur non trouvé' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send({ message: 'Mot de passe incorrect' });

const token = jwt.sign(
  { id: user._id, role: user.role, nom: user.nom }, // ← ici le nom
  SECRET_KEY,
  { expiresIn: '1h' }
);



    const safeUser = {
      id: user._id,
      email: user.email,
      role: user.role,
      nom: user.nom // 👈 Ajouté ici aussi si tu veux l'afficher dans le frontend
    };

    res.status(200).send({ message: 'Connexion réussie', token, user: safeUser });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Erreur serveur' });
  }
};






const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

// Fonction d'enregistrement
exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Vérifie si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send({ message: 'Utilisateur déjà enregistré' });
        }

        // Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Création de l'utilisateur
        const newUser = new User({
            email,
            password: hashedPassword,
        });

        await newUser.save();
        res.status(201).send({ message: 'Utilisateur enregistré avec succès', email });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Erreur serveur' });
    }
};

// Fonction de connexion
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Vérifie si l'utilisateur existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send({ message: 'Utilisateur non trouvé' });
        }

        // Compare les mots de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send({ message: 'Mot de passe incorrect' });
        }

        res.status(200).send({ message: 'Connexion réussie', user });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Erreur serveur' });
    }
};

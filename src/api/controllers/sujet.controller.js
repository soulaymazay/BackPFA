const mongoose = require('mongoose');
const Sujet = require('../models/sujet.model');

const proposerSujet = async (req, res) => {
  try {
    console.log('--- req.body ---');
    console.log(req.body);
    console.log('--- req.file ---');
    console.log(req.file);

    const { titre, description, technologie, entreprise, emailEntreprise, encadrantId } = req.body;

    // Vérification du encadrantId : doit être défini et valide (ObjectId MongoDB)
    if (!encadrantId || !mongoose.Types.ObjectId.isValid(encadrantId)) {
      return res.status(400).json({ message: 'encadrantId invalide ou manquant' });
    }

    const cvPath = req.file ? req.file.path : null;

    const newSujet = new Sujet({
      titre,
      description,
      technologie,
      entreprise,
      emailEntreprise,
      encadrantId,
      cvPath
    });

    await newSujet.save();

    res.status(201).json({ message: 'Sujet proposé avec succès', sujet: newSujet });
  } catch (error) {
    console.error('Erreur lors de la proposition de sujet :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = {
  proposerSujet
};

const mongoose = require('mongoose');
const Sujet = require('../models/sujet.model');

// ✅ API pour proposer un sujet
const proposerSujet = async (req, res) => {
  try {
    console.log('--- req.body ---');
    console.log(req.body);
    console.log('--- req.file ---');
    console.log(req.file);

    const { titre, description, technologie, entreprise, emailEntreprise, encadrantId } = req.body;

    // Vérifier l'encadrantId
    if (!encadrantId || !mongoose.Types.ObjectId.isValid(encadrantId)) {
      return res.status(400).json({ message: 'encadrantId invalide ou manquant' });
    }

    // ✅ Récupération du candidatId depuis l'utilisateur connecté
    const candidatId = req.user && req.user.id;  // <-- correction ici
    if (!candidatId) {
      return res.status(401).json({ message: 'Candidat non authentifié' });
    }

    const cvPath = req.file ? req.file.path : null;

    const newSujet = new Sujet({
      titre,
      description,
      technologie,
      entreprise,
      emailEntreprise,
      encadrantId,
      candidatId,
      cvPath
    });

    await newSujet.save();

    res.status(201).json({ message: 'Sujet proposé avec succès', sujet: newSujet });
  } catch (error) {
    console.error('Erreur lors de la proposition de sujet :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ✅ API pour afficher tous les sujets avec le nom du candidat
const getSujetsAvecCandidat = async (req, res) => {
  try {
    const sujets = await Sujet.find()
      .populate('candidatId', 'nom prenom') // Récupérer uniquement le nom/prénom du candidat
      .select('titre description technologie entreprise emailEntreprise candidatId cvPath');

    const formatted = sujets.map(s => ({
      nomCandidat: `${s.candidatId?.nom || ''} ${s.candidatId?.prenom || ''}`.trim(),
      titre: s.titre,
      description: s.description,
      technologie: s.technologie,
      entreprise: s.entreprise,
      emailEntreprise: s.emailEntreprise,
      cvPath: s.cvPath || '' // ajouter le chemin vers le CV
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error('Erreur lors de la récupération des sujets :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
// sujetController.js ou .ts
const getAllSujets = async (req, res) => {
  try {
    const sujets = await Sujet.find();
    res.status(200).json(sujets);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};
// ✅ API pour afficher les sujets proposés par le candidat connecté
const getSujetsByCandidatConnecte = async (req, res) => {
  try {
    const candidatId = req.user && req.user.id;

    if (!candidatId) {
      return res.status(401).json({ message: 'Candidat non authentifié' });
    }

    const sujets = await Sujet.find({ candidatId })
      .select('titre description technologie entreprise emailEntreprise cvPath');

    res.status(200).json(sujets);
  } catch (error) {
    console.error('Erreur lors de la récupération des sujets du candidat :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
// Dans ton controller sujet.controller.js (ou nouveau controller)

const getSujetsByEncadrantConnecte = async (req, res) => {
  try {
    const encadrantId = req.user.id;
    const sujets = await Sujet.find({ encadrantId });
    res.status(200).json(sujets);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

const getProjetsAvecCandidatParEncadrant = async (req, res) => {
  try {
    const encadrantId = req.user.id;
    const sujets = await Sujet.find({ encadrantId })
      .populate('candidatId', 'nom prenom');

    // Filtrer en JS uniquement les sujets où candidat existe
    const projetsAvecCandidat = sujets.filter(s => s.candidatId);

    res.status(200).json(projetsAvecCandidat);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};





module.exports = {
  proposerSujet,
  getSujetsAvecCandidat,
  getSujetsByEncadrantConnecte,
   getAllSujets ,
   getProjetsAvecCandidatParEncadrant,
     getSujetsByCandidatConnecte// ✅ ajouter cette fonction ici
};

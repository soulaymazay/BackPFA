const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Candidature = require('../models/candidature.model');
const Sujet = require('../models/sujet.model');

const Candidat = require('../models/candidat.model');
const CandidatRefusee = require('../models/candidatrefus.js');
 const CandidatAccepte = require('../models/candidataccepte.model');
 const Projet = require('../models/projet.model');
const Notification = require('../models/notification.model');

exports.create = async (req, res) => {
  try {
    const { nom, prenom, email, telephone, domaine, projetId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'CV non envoyé' });
    }

    const cvPath = req.file.path;

    if (!mongoose.Types.ObjectId.isValid(projetId)) {
      return res.status(400).json({ message: "projetId invalide" });
    }

    let candidat = await Candidat.findOne({ email });
    if (!candidat) {
      candidat = new Candidat({ nom, prenom, email, telephone, domaine });
      await candidat.save();
    }

    const candidature = new Candidature({
      projetId: new mongoose.Types.ObjectId(projetId),
      candidatId: candidat._id,
      cv: cvPath
    });

    await candidature.save();

    const projet = await Projet.findById(projetId).populate('encadrantId');
    if (projet && projet.encadrantId) {
      const notification = new Notification({
        utilisateurId: projet.encadrantId._id,
       message: `Nouveau candidat pour le projet : ${projet.titre}`,

        type: 'candidature',
        candidatureId: candidature._id
      });
      await notification.save();
    }

    // Re-populer la candidature pour inclure projet.titre
    const candidaturePopulated = await Candidature.findById(candidature._id)
      .populate({ path: 'projetId', select: 'titre' })
      .populate({ path: 'candidatId', select: 'nom prenom email' });

    res.status(201).json({
      message: "Candidature envoyée avec succès",
      candidature: {
        _id: candidaturePopulated._id,
        titreProjet: candidaturePopulated.projetId?.titre || "Titre non trouvé",
        candidat: candidaturePopulated.candidatId,
        cv: candidaturePopulated.cv,
      }
    });

  } catch (err) {
    console.error("Erreur dans POST /candidatures:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
exports.getStatutsCandidatures = async (req, res) => {
  try {
    const candidatures = await Candidature.find()
      .populate({ path: 'projetId', select: 'titre' }) // juste le titre du projet
      .select('statut projetId'); // ne retourne que statut et projetId

    // Formater les données pour ne retourner que ce que tu veux
    const result = candidatures.map(c => ({
      titreProjet: c.projetId?.titre || 'Projet inconnu',
      statut: c.statut
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error("Erreur dans getStatutsCandidatures:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
exports.getAll = async (req, res) => {
  try {
    const candidatures = await Candidature.find()
      .populate({
        path: 'projetId',
        select: 'titre' // On ne sélectionne que le titre du sujet
      })
      .populate({
        path: 'candidatId',
        select: 'nom prenom email' // Optionnel : on sélectionne des champs spécifiques du candidat
      });

    res.json(candidatures);
  } catch (err) {
    console.error("Erreur dans GET /postulations:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
 

};
exports.accepter = async (req, res) => {
  try {
    const { id } = req.params;

    const candidature = await Candidature.findByIdAndUpdate(
      id,
      { statut: 'accepte' },
      { new: true }
    );

    if (!candidature) {
      return res.status(404).json({ message: 'Candidature non trouvée' });
    }

    await CandidatAccepte.create({
      candidatId: candidature.candidatId,
      projetId: candidature.projetId
    });

    res.json({ message: 'Candidature acceptée et notification envoyée' });

  } catch (err) {
    console.error('Erreur dans accepter:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.refuser = async (req, res) => {
  try {
    const { id } = req.params;

    const candidature = await Candidature.findByIdAndUpdate(
      id,
      { statut: 'refuse' },
      { new: true }
    );

    if (!candidature) {
      return res.status(404).json({ message: 'Candidature non trouvée' });
    }

    await CandidatRefusee.create({
      candidatId: candidature.candidatId,
      projetId: candidature.projetId
    });

    res.json({ message: 'Candidature refusée et notification envoyée' });

  } catch (err) {
    console.error('Erreur dans refuser:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

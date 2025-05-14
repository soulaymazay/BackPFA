const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Projet = require('../models/projet.model'); // si "models" est dans "src/api"
 // Assure-toi que ce chemin est correct
const Notification = require('../models/notification.model');

router.post('/projets', async (req, res) => {
  try {
    const { titre, description, type, candidatId, encadrantId, sujets } = req.body;

    if (!candidatId || !encadrantId) {
      return res.status(400).json({ message: 'candidatId et encadrantId sont requis.' });
    }

    // 📌 Création du projet
    const nouveauProjet = new Projet({
      titre,
      description,
      type,
      candidatId,
      encadrantId,
      sujets: sujets || [],
      statut: 'en_attente'
    });

    await nouveauProjet.save();

    // 🔔 Notification vers l'encadrant
    const notification = new Notification({
      message: `Le candidat a proposé un nouveau projet : ${titre}`,
      projetId: nouveauProjet._id,
      utilisateurId: encadrantId
    });

    await notification.save();

    res.status(201).json({
      message: 'Projet proposé avec succès, notification envoyée à l’encadrant.',
      projet: nouveauProjet
    });

  } catch (error) {
    console.error('Erreur lors de la proposition de projet :', error);
    res.status(500).json({ message: 'Erreur serveur', error });
  }
});

 // PATCH : mise à jour du statut par l'admin
router.patch('/projets/:id/statut', async (req, res) => {
    try {
      const { statut } = req.body;
      const { id } = req.params;
  
      // Vérifier que le statut demandé est valide
      if (!['valide', 'refuse'].includes(statut)) {
        return res.status(400).json({ message: 'Statut invalide. Utilisez "valide" ou "refuse".' });
      }
  
      const projet = await Projet.findByIdAndUpdate(
        id,
        { statut },
        { new: true } // renvoie le document mis à jour
      );
  
      if (!projet) {
        return res.status(404).json({ message: 'Projet non trouvé.' });
      }
  
      res.status(200).json({ message: `Projet ${statut} avec succès.`, projet });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut :', error);
      res.status(500).json({ message: 'Erreur serveur', error });
    }
  });
  router.put('/projets/:id/statut', async (req, res) => {
    try {
      const projetId = req.params.id;
      const { statut } = req.body; // doit être "validé" ou "refusé"
  
      if (!["valide", "refuse"].includes(statut)) {
        return res.status(400).json({ message: "Statut invalide. Utilisez 'valide' ou 'refuse'." });
      }
  
      const projet = await Projet.findById(projetId);
      if (!projet) {
        return res.status(404).json({ message: "Projet introuvable." });
      }
  
      projet.statut = statut;
      await projet.save();
  
      // 🔔 Notification au candidat
      const notification = new Notification({
        message: `Votre projet "${projet.titre}" a été ${statut} par l'encadrant.`,
        projetId: projet._id,
        utilisateurId: projet.candidatId
      });
  
      await notification.save();
  
      res.status(200).json({ message: `Projet ${statut} avec succès.`, projet });
    } catch (error) {
      console.error('Erreur lors de la validation/refus du projet :', error);
      res.status(500).json({ message: 'Erreur serveur', error });
    }
  });
// Obtenir les projets proposés par un encadrant
router.get('/projets/encadrant/:encadrantId', async (req, res) => {
    try {
      const candidatId = req.params.candidatId;
      console.log('Recherche projets pour encadrantId :', encadrantId);
  
      const projets = await Projet.find({ encadrantId: new mongoose.Types.ObjectId(encadrantId) });
      res.status(200).json(projets);
    } catch (error) {
      console.error('Erreur complète lors de la récupération des projets :', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des projets', error: error.message });
    }
  });
  // Modifier un projet existant
router.put('/projets/:id', async (req, res) => {
    try {
      const projetId = req.params.id;
      const misesAJour = req.body;
  
      const projetModifie = await Projet.findByIdAndUpdate(projetId, misesAJour, { new: true });
  
      if (!projetModifie) {
        return res.status(404).json({ message: 'Projet non trouvé' });
      }
  
      res.status(200).json({ message: 'Projet modifié avec succès', projet: projetModifie });
    } catch (error) {
      console.error('Erreur lors de la modification du projet :', error);
      res.status(500).json({ message: 'Erreur lors de la modification du projet', error });
    }
  });

  // Supprimer un projet
router.delete('/projets/:id', async (req, res) => {
    try {
      const projetId = req.params.id;
  
      const projetSupprime = await Projet.findByIdAndDelete(projetId);
  
      if (!projetSupprime) {
        return res.status(404).json({ message: 'Projet non trouvé' });
      }
  
      res.status(200).json({ message: 'Projet supprimé avec succès' });
    } catch (error) {
      console.error('Erreur lors de la suppression du projet :', error);
      res.status(500).json({ message: 'Erreur lors de la suppression du projet', error });
    }
  });
  
  
    
// ✅ Route : Créer un projet par un encadrant 
router.post('/projetsencad', async (req, res) => {
  try {
    const { titre, description, type, encadrantId } = req.body;

    // Vérification simple
    if (!titre || !description || !type || !encadrantId ) {
      return res.status(400).json({ message: 'Champs manquants' });
    }

    const nouveauProjet = new Projet({
      titre,
      description,
      type,
      encadrantId 
    });

    const savedProjet = await nouveauProjet.save();
    res.status(201).json(savedProjet);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});
//home
router.get('/projets/encadrant/:encadrantId/valides', async (req, res) => {
  try {
    const { encadrantId } = req.params;

    const projets = await Projet.find({
      encadrantId,
      statut: "valide"
    });

    res.status(200).json(projets);
  } catch (error) {
    console.error("Erreur lors de la récupération des projets validés de l'encadrant :", error);
    res.status(500).json({ message: "Erreur lors de la récupération des projets", error });
  }
});
//choisir
// PUT /api/projets/:projetId/choisir
// Choisir un projet par le candidat
router.post('/projets/:id/choisir', async (req, res) => {
  try {
    const { candidatId } = req.body;
    const projet = await Projet.findById(req.params.id);

    if (!projet) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    projet.candidatId = candidatId;
    projet.statut = 'en_attente'; // ✅ valeur autorisée par le schéma
    await projet.save();

    // Créer une notification pour l’encadrant
    await Notification.create({
      destinataireId: projet.encadrantId,
      message: `Un candidat a choisi le projet : ${projet.titre}`
    });

    res.status(200).json({ message: 'Projet choisi avec succès', projet });
  } catch (error) {
    console.error('Erreur lors du choix du projet :', error);
    res.status(500).json({ message: 'Erreur lors du choix du projet', error });
  }
});


//valider le projet
// PUT /api/projets/:projetId/statut
// Exemple : PUT /api/projets/:id/statut
router.put('/projets/:id/statut', async (req, res) => {
  try {
    const { statut } = req.body;
    const projet = await Projet.findById(req.params.id);

    if (!projet) return res.status(404).json({ message: 'Projet non trouvé' });

    projet.statut = statut;
    await projet.save();

    // Notification au candidat
    if (projet.candidatId) {
      await Notification.create({
        destinataireId: projet.candidatId,
        message: `Votre projet "${projet.titre}" a été ${statut === 'valide' ? 'validé' : 'refusé'} par l’encadrant.`
      });
    }

    res.status(200).json({ message: 'Statut mis à jour avec succès', projet });
  } catch (error) {
    console.error('Erreur lors de la validation/refus du projet :', error);
    res.status(500).json({ message: 'Erreur serveur', error });
  }
});





module.exports = router;

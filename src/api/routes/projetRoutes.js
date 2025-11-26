const express = require('express');
const router = express.Router();
const Projet = require('../models/projet.model');
const User = require('../models/user.model');
const authenticateToken = require('../middlewares/auth'); // chemin à adapter

// ✅ Créer un projet par un candidat
router.post('/projets', async (req, res) => {
  try {
    const { titre, description, type, candidatId, encadrantId, sujets } = req.body;

    if (!candidatId || !encadrantId) {
      return res.status(400).json({ message: 'candidatId et encadrantId sont requis.' });
    }

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

    await Notification.create({
      message: `Le candidat a proposé un nouveau projet : ${titre}`,
      projetId: nouveauProjet._id,
      utilisateurId: encadrantId
    });

    res.status(201).json({
      message: 'Projet proposé avec succès, notification envoyée à l’encadrant.',
      projet: nouveauProjet
    });

  } catch (error) {
    console.error('Erreur lors de la proposition de projet :', error);
    res.status(500).json({ message: 'Erreur serveur', error });
  }
});

// ✅ Créer un projet par un encadrant
router.post('/projetsencad', authenticateToken, async (req, res) => {
  try {
    const { titre, description, type, technologie, statut } = req.body;

    const encadrantId = req.user.id;
    const encadrantNom = req.user.nom;

    if (!titre || !description || !type) {
      return res.status(400).json({ message: 'Les champs titre, description et type sont obligatoires.' });
    }

    const nouveauProjet = new Projet({
      titre,
      description,
      type,
      technologie: technologie || '', // valeur par défaut si absente
      encadrantId,
      encadrantNom,
      statut: statut || 'disponible'
    });

    const savedProjet = await nouveauProjet.save();
    res.status(201).json(savedProjet);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});



// ✅ Modifier un projet
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

// ✅ Supprimer un projet
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

// ✅ Choisir un projet (par candidat)
router.post('/projets/:id/choisir', async (req, res) => {
  try {
    const { candidatId } = req.body;
    const projet = await Projet.findById(req.params.id);

    if (!projet) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    projet.candidatId = candidatId;
    projet.statut = 'en_attente';
    await projet.save();

    await Notification.create({
      utilisateurId: projet.encadrantId,
      message: `Un candidat a choisi le projet : ${projet.titre}`,
      projetId: projet._id
    });

    res.status(200).json({ message: 'Projet choisi avec succès', projet });
  } catch (error) {
    console.error('Erreur lors du choix du projet :', error);
    res.status(500).json({ message: 'Erreur lors du choix du projet', error });
  }
});

// ✅ Valider ou refuser un projet (encadrant)
router.put('/projets/:id/statut', async (req, res) => {
  try {
    const { statut } = req.body;

    if (!['valide', 'refuse'].includes(statut)) {
      return res.status(400).json({ message: 'Statut invalide. Utilisez "valide" ou "refuse".' });
    }

    const projet = await Projet.findById(req.params.id);
    if (!projet) return res.status(404).json({ message: 'Projet non trouvé' });

    projet.statut = statut;
    await projet.save();

    if (projet.candidatId) {
      await Notification.create({
        utilisateurId: projet.candidatId,
        message: `Votre projet "${projet.titre}" a été ${statut === 'valide' ? 'validé' : 'refusé'} par l’encadrant.`,
        projetId: projet._id
      });
    }

    res.status(200).json({ message: `Projet ${statut} avec succès.`, projet });
  } catch (error) {
    console.error('Erreur lors de la validation/refus du projet :', error);
    res.status(500).json({ message: 'Erreur serveur', error });
  }
});

// ✅ Voir les projets valides (page d’accueil)
router.get('/projets/encadrant/valides', async (req, res) => {
  try {
    const projets = await Projet.find({ statut: 'valide' }).populate('encadrantId');

    const projetsAvecNom = projets.map(p => {
      const projet = {
        _id: p._id,
        titre: p.titre,
        description: p.description,
        technologie:p.technologie,
        type: p.type,
        statut: p.statut,
        createdAt: p.createdAt
      };
      if (p.encadrantId && p.encadrantId.nom) {
        projet.encadrantNom = p.encadrantId.nom;
      }
      return projet;
    });

    res.status(200).json(projetsAvecNom);
  } catch (error) {
    console.error("Erreur lors de la récupération des projets :", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des projets",
      error: error.message
    });
  }
});

// ✅ Voir tous les projets d’un encadrant
router.get('/projets/encadrant/:encadrantId', async (req, res) => {
  try {
    const { encadrantId } = req.params;
    const projets = await Projet.find({ encadrantId });
    res.status(200).json(projets);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
});

module.exports = router;

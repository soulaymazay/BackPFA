const bcrypt = require('bcrypt');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:65220', // Angular
    methods: ['GET', 'POST']
  }
});


const app = express();
app.use(express.json());
app.use(cors());

// Stocker les sockets des encadrants connectés
const connectedEncadrants = new Map();

io.on('connection', (socket) => {
  console.log('Nouvelle connexion Socket.io');

  socket.on('registerEncadrant', (encadrantId) => {
    connectedEncadrants.set(encadrantId, socket.id);
    console.log(`Encadrant ${encadrantId} connecté`);
  });

  socket.on('disconnect', () => {
    for (const [key, value] of connectedEncadrants.entries()) {
      if (value === socket.id) {
        connectedEncadrants.delete(key);
        console.log(`Encadrant ${key} déconnecté`);
      }
    }
  });
});
// Exemple route POST où tu veux notifier :
const multer = require('multer');
const upload = multer();

app.post('/api/proposer', upload.single('cv'), (req, res) => {
  const data = req.body;

  const encadrantId = data.encadrantId;
  const socketId = connectedEncadrants.get(encadrantId);

  if (socketId) {
    io.to(socketId).emit('notificationSujet', {
      nom: data.nom || 'Candidat inconnu',
      prenom: data.prenom || '',
      sujet: {
        titre: data.titre,
        description: data.description,
        technologie: data.technologie,
        entreprise: data.entreprise,
        emailEntreprise: data.emailEntreprise,
      }
    });
  }

  // Enregistrer dans la base ou autre logique...
  res.status(200).json({ message: 'Sujet proposé et notification envoyée' });
});
// Middlewares globaux
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Pour servir les fichiers statiques (ex: cv uploadés)

// 📦 IMPORTER LES ROUTES
const userRoutes = require('./src/api/routes/routes');
app.use('/api', userRoutes);

const projetRoutes = require('./src/api/routes/projetRoutes');
app.use('/api', projetRoutes);

const notificationRoutes = require('./src/api/routes/notification');
app.use('/api', notificationRoutes);


// ✅ AJOUT DE PROFIL ROUTES (CE QUI MANQUAIT)
const profilRoutes = require('./src/api/routes/profil');
app.use('/api', profilRoutes); // ✅ rend /api/profils accessible

// 🌐 CONNEXION A MONGODB
mongoose.connect('mongodb://localhost:27017/stages', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch((error) => console.error('MongoDB connection error:', error));

// 🚀 DEMARRER SERVEUR
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

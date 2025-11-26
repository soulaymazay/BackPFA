const bcrypt = require('bcrypt');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const upload = multer();

// ✅ Middleware à mettre en tout premier
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

app.use(cors());
app.use('/uploads', express.static('uploads')); // Pour servir les fichiers statiques

// 📦 IMPORTER LES ROUTES
const userRoutes = require('./src/api/routes/routes');
app.use('/api', userRoutes);

const projetRoutes = require('./src/api/routes/projetRoutes');
app.use('/api', projetRoutes);

const candidatureRoutes = require('./src/api/routes/candidature');
app.use('/api', candidatureRoutes);

const profilRoutes = require('./src/api/routes/profil');
app.use('/api', profilRoutes);

// 🌐 CONNEXION A MONGODB
mongoose.connect('mongodb://localhost:27017/stages', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch((error) => console.error('MongoDB connection error:', error));

// ✅ Exemple route test
app.post('/api/proposer', upload.single('cv'), (req, res) => {
  const data = req.body;
  res.status(200).json({ message: 'Sujet proposé avec succès (sans notification)' });
});
const encadrantRoutes = require('./src/api/routes/encadrant');

// Monte les routes sous /api
app.use('/api', encadrantRoutes);


// 🚀 DEMARRER SERVEUR
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const bcrypt = require('bcrypt');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

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

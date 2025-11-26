const jwt = require('jsonwebtoken');

module.exports = function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"


  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  } 

  const secret = process.env.JWT_SECRET || 'votre_clé_secrète';
  console.log('JWT_SECRET utilisée:', secret);
  console.log('Token reçu:', token);
  console.log('process.env.JWT_SECRET:', process.env.JWT_SECRET);


  jwt.verify(token, secret, (err, user) => {
    if (err) {
      console.log('Erreur jwt.verify:', err.message);
      return res.status(403).json({ message: 'Token invalide' });
    }

    req.user = user;
    next();
  });
};

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Vérifie le champ de formulaire
    if (file.fieldname === 'cv') {
      cb(null, 'uploads/cv');
    } else if (file.fieldname === 'image') {
      cb(null, 'uploads/images');
    } else {
      cb(null, 'uploads/others');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

module.exports = upload;

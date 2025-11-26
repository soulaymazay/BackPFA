
const express = require('express');
const router = express.Router();
const multer = require('multer');
const candidatureController = require('../controllers/candidature.controller');

const upload = multer({ dest: 'uploads/cv/' });

router.post('/postuler', upload.single('cv'), candidatureController.create);

router.get('/postulations', candidatureController.getAll);


module.exports = router;
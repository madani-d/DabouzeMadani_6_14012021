const express = require('express');
const router = express.Router();

const sauceCtrl = require('../controllers/sauce');
const multer = require('../middleware/multer-config');


router.post('/', multer, sauceCtrl.createSauce);
router.get('/', sauceCtrl.getAllSauce);
router.get('/:id', sauceCtrl.getOneSauce);
router.put('/:id', multer, sauceCtrl.modifySauce);
router.delete('/:id', sauceCtrl.deleteSauce);

module.exports = router;
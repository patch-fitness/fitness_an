const express = require('express');
const trainerController = require('../controllers/trainerController');

const router = express.Router();

router.get('/', trainerController.getTrainers);
router.get('/:id', trainerController.getTrainerById);
router.post('/', trainerController.createTrainer);
router.put('/:id', trainerController.updateTrainer);
router.delete('/:id', trainerController.deleteTrainer);

module.exports = router;


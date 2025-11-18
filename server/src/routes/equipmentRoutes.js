const express = require('express');
const equipmentController = require('../controllers/equipmentController');

const router = express.Router();

router.get('/', equipmentController.getEquipment);
router.get('/:id', equipmentController.getEquipmentById);
router.post('/', equipmentController.createEquipment);
router.put('/:id', equipmentController.updateEquipment);
router.delete('/:id', equipmentController.deleteEquipment);

module.exports = router;


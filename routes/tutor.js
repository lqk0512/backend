const express = require('express');
const router = express.Router();
const tutorController = require('../controllers/tutorController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateToken, tutorController.getAllTutors);
router.get('/:tutor_id/slots', authenticateToken, tutorController.getTutorSlots);
router.post('/create', authenticateToken, authorizeRoles('admin','tutor'), tutorController.createSlot);
router.get('/my-slots', authenticateToken, authorizeRoles('tutor'), tutorController.getMySlots);
router.get('/subject/:subject', authenticateToken,authorizeRoles('student'), tutorController.getTutorsByExpertise);
router.delete('/slot/:slot_id', authenticateToken, authorizeRoles('tutor'), tutorController.deleteSlot);
router.put('/slot/:slot_id', authenticateToken, authorizeRoles('tutor'), tutorController.updateSlot);
router.get('/bookings/:tutor_id', authenticateToken, authorizeRoles('tutor'), tutorController.getTutorBookings);
module.exports = router;

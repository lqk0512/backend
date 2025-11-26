const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.post('/create', authenticateToken, authorizeRoles('student'), bookingController.createBooking);
router.get('/student/:student_id', authenticateToken, authorizeRoles('student'), bookingController.getStudentBookings);
router.put('/cancel/:booking_id', authenticateToken, authorizeRoles('student','tutor'), bookingController.cancelSlot);
router.get('/free-slots/:booking_id', authenticateToken, authorizeRoles('student','tutor'), bookingController.getFreeSlotsForBooking);
router.put('/reschedule', authenticateToken, authorizeRoles('student','tutor'), bookingController.rescheduleBooking);
router.get('/recommend/:student_id', authenticateToken, authorizeRoles('student'), bookingController.aiRecommendTutors);

module.exports = router;

const { 
  bookings, 
  students, 
  availabilities, 
  tutors, 
  bookingFile, 
  availabilityFile, 
  writeJSON 
} = require('../data/database');

const fs = require('fs');

/**
 * CREATE BOOKING — thêm 1 sinh viên vào slot
 */
exports.createBooking = (req, res) => {
  const { slot_id, tutor_id } = req.body;
  const student_id = req.user.id;
  const availabilities = JSON.parse(fs.readFileSync(availabilityFile, 'utf8'));
  const slot = availabilities.find(s => s.slot_id == slot_id);
  if (!slot) return res.status(404).json({ message: "Slot không tồn tại" });

  // slot full
  if (slot.current_students >= slot.max_students) {
    return res.status(400).json({ message: "Slot đã đủ số lượng" });
  }

  const booking_id = bookings.length + 1;
  const booking = { booking_id, student_id, tutor_id, slot_id };
  bookings.push(booking);

  // tăng số lượng đăng ký
  slot.current_students += 1;

  writeJSON(bookingFile, bookings);
  writeJSON(availabilityFile, availabilities);

  res.json({
    message: "Đăng ký thành công",
    booking
  });
};


/**
 * GET STUDENT BOOKINGS — lịch đã đăng ký của 1 student
 */
exports.getStudentBookings = (req, res) => {
  const student_id = parseInt(req.params.student_id);
  if (isNaN(student_id)) {
    return res.status(400).json({ error: 'Invalid student ID' });
  }

  const storedSlots = JSON.parse(fs.readFileSync(availabilityFile, 'utf8'));

  const studentBookings = bookings
    .filter(b => b.student_id === student_id)
    .map(b => {
      const slot = storedSlots.find(s => s.slot_id == b.slot_id) || {};
      const tutor = tutors.find(t => t.tutor_id == b.tutor_id) || {};

      return {
        booking_id: b.booking_id,
        tutor: {
          tutor_id: tutor.tutor_id,
          name: tutor.name,
          email: tutor.email
        },
        slot: {
          slot_id: slot.slot_id,
          start_time: slot.start_time,
          end_time: slot.end_time,
          room: slot.room,
          subject: slot.subject,
          current_students: slot.current_students,
          max_students: slot.max_students
        }
      };
    });

  res.json(studentBookings);
};


/**
 * CANCEL BOOKING — hủy đăng ký 1 slot
 */
exports.cancelSlot = (req, res) => {
  const booking_id = parseInt(req.params.booking_id);
  const user_id = req.user.id;
  const role = req.user.role;

  const bookingIndex = bookings.findIndex(b => b.booking_id === booking_id);
  if (bookingIndex === -1) {
    return res.status(404).json({ message: 'Booking không tồn tại' });
  }

  const booking = bookings[bookingIndex];

  // Check quyền hủy
  if ((role === 'student' && booking.student_id !== user_id) ||
      (role === 'tutor' && booking.tutor_id !== user_id)) {
    return res.status(403).json({ message: 'Không có quyền hủy booking này' });
  }

  const storedSlots = JSON.parse(fs.readFileSync(availabilityFile, 'utf8'));
  const slot = storedSlots.find(s => s.slot_id === booking.slot_id);

  // trừ current_students
  if (slot && slot.current_students > 0) {
    slot.current_students -= 1;
  }

  // xóa booking
  bookings.splice(bookingIndex, 1);

  writeJSON(availabilityFile, storedSlots);
  writeJSON(bookingFile, bookings);

  res.json({ message: 'Booking đã bị hủy', booking });
};


/**
 * GET FREE SLOTS — tìm các slot còn chỗ để đổi lịch
 * (cùng tutor)
 */
exports.getFreeSlotsForBooking = (req, res) => {
  const booking_id = parseInt(req.params.booking_id);
  const booking = bookings.find(b => b.booking_id === booking_id);

  if (!booking) return res.status(404).json({ message: 'Booking không tồn tại' });

  const storedSlots = JSON.parse(fs.readFileSync(availabilityFile, 'utf8'));

  const freeSlots = storedSlots
    .filter(s =>
      s.tutor_id === booking.tutor_id &&
      s.current_students < s.max_students
    )
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

  res.json({ booking, freeSlots });
};


/**
 * RESCHEDULE BOOKING — đổi 1 slot sang slot khác
 */
exports.rescheduleBooking = (req, res) => {
  const { booking_id, new_slot_id } = req.body;
  const user_id = req.user.id;
  const role = req.user.role;

  const booking = bookings.find(b => b.booking_id === booking_id);
  if (!booking) return res.status(404).json({ message: 'Booking không tồn tại' });

  // Check quyền
  if ((role === 'student' && booking.student_id !== user_id) ||
      (role === 'tutor' && booking.tutor_id !== user_id)) {
    return res.status(403).json({ message: 'Không có quyền đổi slot này' });
  }

  const storedSlots = JSON.parse(fs.readFileSync(availabilityFile, 'utf8'));

  const oldSlot = storedSlots.find(s => s.slot_id === booking.slot_id);
  const newSlot = storedSlots.find(s => s.slot_id === new_slot_id);

  if (!newSlot) {
    return res.status(400).json({ message: "Slot mới không tồn tại" });
  }

  if (newSlot.tutor_id !== booking.tutor_id) {
    return res.status(400).json({ message: "Slot mới không cùng tutor" });
  }

  if (newSlot.current_students >= newSlot.max_students) {
    return res.status(400).json({ message: "Slot mới đã đầy" });
  }

  // cập nhật số lượng
  if (oldSlot && oldSlot.current_students > 0) oldSlot.current_students -= 1;
  newSlot.current_students += 1;

  booking.slot_id = new_slot_id;

  writeJSON(availabilityFile, storedSlots);
  writeJSON(bookingFile, bookings);

  res.json({ message: 'Booking đã được đổi slot', booking });
};


/**
 * AI RECOMMENDATION — gợi ý tutor phù hợp
 */
exports.aiRecommendTutors = (req, res) => {
  const student_id = parseInt(req.params.student_id);
  const student = students.find(s => s.student_id === student_id);

  if (!student) return res.status(404).json({ message: 'Student không tồn tại' });

  const needs = (student.listNeeds || []).map(n => n.toLowerCase());

  const recommendations = tutors
    .map(tutor => {
      const expertise = (tutor.listExpertise || []).map(e => e.toLowerCase());

      const skillMatched = needs.filter(n => expertise.includes(n));
      const skillScore = skillMatched.length * 3;

      const facultyScore =
        student.faculty &&
        tutor.faculty &&
        student.faculty.toLowerCase() === tutor.faculty.toLowerCase() ? 2 : 0;

      const yearScore =
        tutor.minYear && student.yearOfStudy >= tutor.minYear ? 1 : 0;

      const tutorSlots = availabilities.filter(
        s => s.tutor_id == tutor.tutor_id && s.current_students < s.max_students
      );

      const availabilityScore = tutorSlots.length > 0 ? 2 : 0;

      return {
        ...tutor,
        skillMatched,
        availableSlots: tutorSlots,
        matchScore: skillScore + facultyScore + yearScore + availabilityScore
      };
    })
    .filter(t => t.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);

  res.json({ student, recommendations });
};

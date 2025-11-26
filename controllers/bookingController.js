const { bookings, students , availabilities, tutors, bookingFile, availabilityFile, writeJSON } = require('../data/database');
const fs = require('fs');

exports.createBooking = (req, res) => {
  const { slot_id, tutor_id } = req.body;
  const student_id = req.user.id;

  const availabilities = JSON.parse(fs.readFileSync(availabilityFile, 'utf8'));


  const slot = availabilities.find(s => s.slot_id == slot_id && !s.is_booked);
  if (!slot) return res.status(400).json({ message: 'Slot đã được đặt' });

  const booking_id = bookings.length + 1;
  const booking = { booking_id, student_id, tutor_id, slot_id };
  bookings.push(booking);
  slot.is_booked = true;

  writeJSON(bookingFile, bookings);
  writeJSON(availabilityFile, availabilities);

  res.json(booking);
};

exports.getStudentBookings = (req, res) => {
  const student_id = parseInt(req.params.student_id);
  if (isNaN(student_id)) {
    return res.status(400).json({ error: 'Invalid student ID' });
  }

  const availabilities = JSON.parse(fs.readFileSync(availabilityFile, 'utf8'));
  const studentBookings = bookings
    .filter(b => b.student_id === student_id)
    .map(b => {
      const slot = availabilities.find(s => s.slot_id == b.slot_id) || {};
      const tutor = tutors.find(t => t.tutor_id == b.tutor_id) || {};
      return {
        booking_id: b.booking_id,
        student_id: b.student_id,
        tutor: { tutor_id: tutor.tutor_id, name: tutor.name, email: tutor.email },
        slot: { slot_id: slot.slot_id, start_time: slot.start_time, end_time: slot.end_time },
      };
    });

  res.json(studentBookings);
};

exports.cancelSlot = (req, res) => {
  const booking_id = parseInt(req.params.booking_id);
  const user_id = req.user.id;
  const role = req.user.role;

  const bookingIndex = bookings.findIndex(b => b.booking_id === booking_id);
  if (bookingIndex === -1) {
    return res.status(404).json({ message: 'Booking không tồn tại' });
  }

  const booking = bookings[bookingIndex];

  if ((role === 'student' && booking.student_id !== user_id) ||
      (role === 'tutor' && booking.tutor_id !== user_id)) {
    return res.status(403).json({ message: 'Không có quyền hủy booking này' });
  }

  const availabilities = JSON.parse(fs.readFileSync(availabilityFile, 'utf8'));
  const slot = availabilities.find(s => s.slot_id === booking.slot_id);
  if (slot) slot.is_booked = false;

  bookings.splice(bookingIndex, 1);

  writeJSON(availabilityFile, availabilities);
  writeJSON(bookingFile, bookings);

  res.json({ message: 'Booking đã bị hủy', booking });
};

exports.getFreeSlotsForBooking = (req, res) => {
  const booking_id = parseInt(req.params.booking_id);
  const booking = bookings.find(b => b.booking_id === booking_id);
  if (!booking) return res.status(404).json({ message: 'Booking không tồn tại' });

  const tutor_id = booking.tutor_id;

  // Lấy tất cả slot trống của tutor
  const availabilities = JSON.parse(fs.readFileSync(availabilityFile, 'utf8'));
  const freeSlots = availabilities
    .filter(s => s.tutor_id === tutor_id && !s.is_booked)
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

  res.json({ booking, freeSlots });
};

exports.rescheduleBooking = (req, res) => {
  const { booking_id, new_slot_id } = req.body;
  const user_id = req.user.id;
  const role = req.user.role;

  const booking = bookings.find(b => b.booking_id === booking_id);
  if (!booking) return res.status(404).json({ message: 'Booking không tồn tại' });

  // Kiểm tra quyền
  if ((role === 'student' && booking.student_id !== user_id) ||
      (role === 'tutor' && booking.tutor_id !== user_id)) {
    return res.status(403).json({ message: 'Không có quyền đổi slot này' });
  }
  
  const availabilities = JSON.parse(fs.readFileSync(availabilityFile, 'utf8'));
  const oldSlot = availabilities.find(s => s.slot_id === booking.slot_id);
  const newSlot = availabilities.find(s => s.slot_id === new_slot_id);

  if (!newSlot || newSlot.is_booked || newSlot.tutor_id !== booking.tutor_id) {
    return res.status(400).json({ message: 'Slot mới không hợp lệ hoặc đã được đặt' });
  }

  // Cập nhật slots
  if (oldSlot) oldSlot.is_booked = false;
  newSlot.is_booked = true;
  booking.slot_id = new_slot_id;

  writeJSON(availabilityFile, availabilities);
  writeJSON(bookingFile, bookings);

  res.json({ message: 'Booking đã được đổi slot', booking });
};

exports.aiRecommendTutors = (req, res) => {
  const student_id = parseInt(req.params.student_id);

  const student = students.find(s => s.student_id === student_id);
  if (!student) {
    return res.status(404).json({ message: 'Student không tồn tại' });
  }

  const needs = (student.listNeeds || []).map(n => n.toLowerCase());
  
  const suggestions = tutors.map(tutor => {
    const expertise = (tutor.listExpertise || []).map(e => e.toLowerCase());

    // 1) Skill match
    const skillMatched = needs.filter(n => expertise.includes(n));
    const skillScore = skillMatched.length * 3;

    // 2) Faculty match (ưu tiên mạnh)
    const facultyScore =
      student.faculty &&
      tutor.faculty &&
      student.faculty.toLowerCase() === tutor.faculty.toLowerCase()
        ? 2
        : 0;

    // 3) Năm học (ưu tiên nhẹ)
    const yearScore =
      tutor.minYear && student.yearOfStudy >= tutor.minYear ? 1 : 0;

    // 4) Availability match (slot trống)
    const tutorSlots = availabilities.filter(
      s => s.tutor_id == tutor.tutor_id && !s.is_booked
    );
    const availabilityScore = tutorSlots.length > 0 ? 2 : 0;

    const totalScore = skillScore + facultyScore + yearScore + availabilityScore;

    return {
      ...tutor,
      matchScore: totalScore,
      skillMatched,
      availableSlots: tutorSlots
    };
  })
  .filter(t => t.matchScore > 0)
  .sort((a, b) => b.matchScore - a.matchScore);

  res.json({
    student,
    recommendations: suggestions
  });
};

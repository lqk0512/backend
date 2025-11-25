class Booking {
  constructor({ booking_id, student_id, tutor_id, slot_id }) {
    this.booking_id = booking_id;
    this.student_id = student_id;
    this.tutor_id = tutor_id;
    this.slot_id = slot_id;
  }
}

module.exports = Booking;

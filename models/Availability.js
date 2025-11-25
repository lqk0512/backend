class Availability {
  constructor({ slot_id, tutor_id, start_time, end_time, is_booked }) {
    this.slot_id = slot_id;
    this.tutor_id = tutor_id;
    this.start_time = start_time;
    this.end_time = end_time;
    this.is_booked = is_booked || false;
  }
}

module.exports = Availability;

class Availability {
  constructor({ 
    slot_id, 
    tutor_id, 
    start_time, 
    end_time, 
    room, 
    subject, 
    current_students, 
    max_students 
  }) {
    this.slot_id = slot_id;
    this.tutor_id = tutor_id;
    this.start_time = start_time;
    this.end_time = end_time;
    this.room = room;
    this.subject = subject;
    this.current_students = current_students || 0;
    this.max_students = max_students || 1;  
  }
}

module.exports = Availability;

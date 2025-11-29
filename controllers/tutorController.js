const { tutors, availabilityFile, writeJSON } = require('../data/database');
const fs = require('fs');

exports.getAllTutors = (req, res) => res.json(tutors);

// ===============================
// 1) Lấy slot trống của tutor
// ===============================
exports.getTutorSlots = (req, res) => {
  const tutor_id = parseInt(req.params.tutor_id);
  if (isNaN(tutor_id)) return res.status(400).json({ error: "Invalid tutor ID" });

  const availabilities = JSON.parse(fs.readFileSync(availabilityFile, 'utf8'));

  const slots = availabilities
    .filter(s =>
      parseInt(s.tutor_id) === tutor_id &&
      s.current_students < s.max_students
    )
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

  res.json(slots);
};


// ===============================
// 2) Tutor tạo slot mới
// ===============================
exports.createSlot = (req, res) => {
  let { tutor_id, start_time, end_time, max_students, room, subject } = req.body;

  if (req.user.role === 'tutor') tutor_id = req.user.id;

  if (!max_students || max_students <= 0)
    return res.status(400).json({ message: "max_students phải > 0" });

  const availabilities = JSON.parse(fs.readFileSync(availabilityFile, 'utf8'));

  const slot_id = availabilities.length + 1;

  const slot = {
    slot_id,
    tutor_id,
    start_time,
    end_time,
    room: room || "TBD",
    subject: subject || "General",
    max_students,
    current_students: 0
  };

  availabilities.push(slot);
  writeJSON(availabilityFile, availabilities);

  res.json(slot);
};


// ===============================
// 3) Lấy slot của tutor hiện tại
// ===============================
exports.getMySlots = (req, res) => {
  const tutor_id = req.user.id;
  const availabilities = JSON.parse(fs.readFileSync(availabilityFile, 'utf8'));

  const slots = availabilities
    .filter(s => parseInt(s.tutor_id) === tutor_id)
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

  res.json(slots);
};


// ===============================
// 4) Tìm tutor theo chuyên môn
// ===============================
exports.getTutorsByExpertise = (req, res) => {
  const subject = req.params.subject?.trim().toLowerCase();
  if (!subject) return res.status(400).json({ error: "Subject is required" });

  const availabilities = JSON.parse(fs.readFileSync(availabilityFile, 'utf8'));

  const matchedTutors = tutors
    .filter(t =>
      Array.isArray(t.listExpertise) &&
      t.listExpertise.some(ex => ex.toLowerCase() === subject)
    )
    .map(tutor => {
      const freeSlots = availabilities.filter(s =>
        s.tutor_id === tutor.tutor_id &&
        s.current_students < s.max_students &&
        s.subject.toLowerCase() === subject
      );

      return {
        ...tutor,
        freeSlots
      };
    });

  res.json(matchedTutors);
};


// ===============================
// 5) Xóa slot
// ===============================
exports.deleteSlot = (req, res) => {
  const tutor_id = req.user.id;
  const slot_id = parseInt(req.params.slot_id);

  let availabilities = JSON.parse(fs.readFileSync(availabilityFile, 'utf8'));

  const index = availabilities.findIndex(s => s.slot_id === slot_id);
  if (index === -1) return res.status(404).json({ message: "Slot không tồn tại" });

  const slot = availabilities[index];

  if (slot.tutor_id !== tutor_id)
    return res.status(403).json({ message: "Không thể xóa slot của tutor khác" });

  if (slot.current_students > 0)
    return res.status(400).json({ message: "Slot đã có người đăng ký, không thể xóa" });

  availabilities.splice(index, 1);
  writeJSON(availabilityFile, availabilities);

  res.json({ message: "Xóa thành công", deleted_slot: slot });
};


// ===============================
// 6) Cập nhật slot
// ===============================
exports.updateSlot = (req, res) => {
  const tutor_id = req.user.id;
  const slot_id = parseInt(req.params.slot_id);
  const { start_time, end_time, max_students, room, subject } = req.body;

  let availabilities = JSON.parse(fs.readFileSync(availabilityFile, 'utf8'));

  const slot = availabilities.find(s => s.slot_id === slot_id);
  if (!slot) return res.status(404).json({ message: "Slot không tồn tại" });

  if (slot.tutor_id !== tutor_id)
    return res.status(403).json({ message: "Không thể sửa slot của tutor khác" });

  if (slot.current_students > 0)
    return res.status(400).json({ message: "Slot đã có người đăng ký, không thể sửa" });

  if (start_time) slot.start_time = start_time;
  if (end_time) slot.end_time = end_time;
  if (max_students) slot.max_students = max_students;
  if (room) slot.room = room;
  if (subject) slot.subject = subject;

  writeJSON(availabilityFile, availabilities);

  res.json({ message: "Cập nhật thành công", slot });
};


// ===============================
// 7) Lấy slot đã được đăng ký của tutor
// ===============================
exports.getTutorBookings = (req, res) => {
  const tutor_id = parseInt(req.params.tutor_id);
  if (isNaN(tutor_id)) return res.status(400).json({ error: "Invalid tutor ID" });

  const availabilities = JSON.parse(fs.readFileSync(availabilityFile, 'utf8'));

  const slots = availabilities.filter(
    s => s.tutor_id === tutor_id && s.current_students > 0
  );

  res.json(slots);
};

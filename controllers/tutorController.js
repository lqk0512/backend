const { tutors } = require('../data/database');
const { availabilityFile, writeJSON } = require('../data/database');
const fs = require('fs');

exports.getAllTutors = (req, res) => res.json(tutors);

exports.getTutorSlots = (req, res) => {
  const tutor_id = parseInt(req.params.tutor_id);
  if (isNaN(tutor_id)) {
    return res.status(400).json({ error: "Invalid tutor ID" });
  }

  // Đọc file trực tiếp để luôn cập nhật dữ liệu mới
  const availabilities = JSON.parse(fs.readFileSync(availabilityFile, 'utf8'));

  const slots = availabilities
    .filter(s => parseInt(s.tutor_id) === tutor_id && s.is_booked === false)
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

  res.json(slots);
};


exports.createSlot = (req, res) => {
  let { tutor_id, start_time, end_time } = req.body;
  if (req.user.role === 'tutor') tutor_id = req.user.id;
  const availabilities = JSON.parse(fs.readFileSync(availabilityFile, 'utf8'));
  const slot_id = availabilities.length + 1;
  const slot = { slot_id, tutor_id, start_time, end_time, is_booked: false };
  availabilities.push(slot);
  writeJSON(availabilityFile, availabilities);
  res.json(slot);
};

exports.getMySlots = (req, res) => {
  const tutor_id = req.user.id; 
  const availabilities = JSON.parse(fs.readFileSync(availabilityFile, 'utf8'));

  const mySlots = availabilities
    .filter(s => parseInt(s.tutor_id) === tutor_id)
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

  res.json(mySlots);
};

exports.getTutorsByExpertise = (req, res) => {
  const subject = req.params.subject?.trim().toLowerCase();
  if (!subject) {
    return res.status(400).json({ error: "Subject is required" });
  }

  // Lọc tutor theo môn dạy
  const matchedTutors = tutors
    .filter(tutor => 
      Array.isArray(tutor.listExpertise) &&
      tutor.listExpertise.some(ex => typeof ex === 'string' && ex.trim().toLowerCase() === subject)
    );

  // Đọc availabilities để lấy các slot trống
  const availabilities = JSON.parse(fs.readFileSync(availabilityFile, 'utf8'));

  // Gắn thêm slots trống cho từng tutor
  const result = matchedTutors.map(tutor => {
    const freeSlots = availabilities
      .filter(slot => slot.tutor_id === tutor.tutor_id && !slot.is_booked)
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

    return {
      ...tutor,
      freeSlots
    };
  });

  res.json(result);
};

exports.deleteSlot = (req, res) => {
  const tutor_id = req.user.id; 
  const slot_id = parseInt(req.params.slot_id);

  let availabilities = JSON.parse(fs.readFileSync(availabilityFile, 'utf8'));

  const index = availabilities.findIndex(s => s.slot_id === slot_id);

  if (index === -1) {
    return res.status(404).json({ message: "Slot không tồn tại" });
  }

  const slot = availabilities[index];

  if (parseInt(slot.tutor_id) !== tutor_id) {
    return res.status(403).json({ message: "Bạn không thể xoá slot của tutor khác" });
  }

  if (slot.is_booked) {
    return res.status(400).json({ message: "Slot đã được book, không thể xoá" });
  }

  availabilities.splice(index, 1);
  writeJSON(availabilityFile, availabilities);

  res.json({ message: "Xoá slot thành công", deleted_slot: slot });
};

exports.updateSlot = (req, res) => {
  const tutor_id = req.user.id;
  const slot_id = parseInt(req.params.slot_id);
  const { start_time, end_time } = req.body;

  let availabilities = JSON.parse(fs.readFileSync(availabilityFile, 'utf8'));

  const slot = availabilities.find(s => s.slot_id === slot_id);

  if (!slot) {
    return res.status(404).json({ message: "Slot không tồn tại" });
  }

  if (parseInt(slot.tutor_id) !== tutor_id) {
    return res.status(403).json({ message: "Không thể cập nhật slot của tutor khác" });
  }

  if (slot.is_booked) {
    return res.status(400).json({ message: "Slot đã được book, không thể chỉnh sửa" });
  }

  if (start_time) slot.start_time = start_time;
  if (end_time) slot.end_time = end_time;

  writeJSON(availabilityFile, availabilities);

  res.json({ message: "Cập nhật slot thành công", slot });
};

exports.getTutorBookings = (req, res) => {
  const tutor_id = parseInt(req.params.tutor_id);
  if (isNaN(tutor_id)) {
    return res.status(400).json({ error: "Invalid tutor ID" });
  }

  // Đọc file trực tiếp để luôn cập nhật dữ liệu mới
  const availabilities = JSON.parse(fs.readFileSync(availabilityFile, 'utf8'));

  const slots = availabilities
    .filter(s => parseInt(s.tutor_id) === tutor_id && s.is_booked === true)
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

  res.json(slots);
};
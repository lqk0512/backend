const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const users = [
  { id: 1, username: 'admin', password: bcrypt.hashSync('admin123', 10), role: 'admin' },
  { id: 2, username: 'alice', password: bcrypt.hashSync('alice123', 10), role: 'tutor' },
  { id: 3, username: 'john', password: bcrypt.hashSync('john123', 10), role: 'student' },
  { id: 4, username: 'bob', password: bcrypt.hashSync('bob123', 10), role: 'tutor' },
  { id: 5, username: 'eve', password: bcrypt.hashSync('eve123', 10), role: 'student' },
  { id: 6, username: 'charlie', password: bcrypt.hashSync('charlie123', 10), role: 'tutor' }
];

const tutors = [
  { tutor_id: 2, name: 'Nguyen Thi A', email: 'nguyenthia@hcmut.edu.vn', listExpertise: ['Database Systems', 'Introduction to Computing'] },
  { tutor_id: 4, name: 'Le Van B', email: 'levanb@hcmut.edu.vn', listExpertise: ['Computer Architecture', 'Digital Systems'] },
  { tutor_id: 6, name: 'Tran Thi C', email: 'tranthic@hcmut.edu.vn', listExpertise: ['Mathematical Modeling', 'Data Structures and Algorithms'] }
];

const students = [
  { student_id: 3, name: 'Tran Van J', email: 'j.tranvan@hcmut.edu.vn', listNeeds: ["Digital Systems", "Database System"],
    faculty: "Computer Science", yearOfStudy: 2},
  { student_id: 5, name: 'Nguyen Thi E', email: 'e.nguyenthi@hcmut.edu.vn', listNeeds: ["Mathematical Modeling", "Computer Architecture"],
    faculty: "Computer Science", yearOfStudy: 3}
];

const availabilityFile = path.join(__dirname, 'availabilities.json');
const bookingFile = path.join(__dirname, 'bookings.json');

function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    return [];
  }
}

// Hàm ghi JSON
function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

let availabilities = readJSON(availabilityFile);
let bookings = readJSON(bookingFile);

module.exports = {
  users,
  tutors,
  students,
  availabilities,
  bookings,
  availabilityFile,
  bookingFile,
  writeJSON
};

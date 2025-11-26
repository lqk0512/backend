const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const users = [
  { id: 1, username: 'admin', password: bcrypt.hashSync('admin123', 10), role: 'admin' },
  { id: 2, username: 'alice', password: bcrypt.hashSync('alice123', 10), role: 'tutor' },
  { id: 3, username: 'john', password: bcrypt.hashSync('john123', 10), role: 'student' },
  { id: 4, username: 'bob', password: bcrypt.hashSync('bob123', 10), role: 'tutor' },
];

const tutors = [
  { tutor_id: 2, name: 'Alice', email: 'alice@example.com', listExpertise: ['Math', 'Physics'] },
  { tutor_id: 4, name: 'Bob', email: 'bob@example.com', listExpertise: ['Chemistry', 'Biology'] }
];

const students = [
  { student_id: 3, name: 'John', email: 'john@example.com', listNeeds: ["Math", "Programming"],
    faculty: "Computer Science", yearOfStudy: 2}
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

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { users, students, tutors } = require('../data/database');
const SECRET = 'mysecretkey';

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ message: 'Invalid username or password' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Invalid username or password' });

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET, { expiresIn: '1h' });
  res.json({ token, role: user.role });
};

exports.getProfile = (req, res) => {
  const { id, role } = req.user; 

  let profile = null;

  if (role === "student") {
    profile = students.find(s => s.student_id === id);
  }

  if (role === "tutor") {
    profile = tutors.find(t => t.tutor_id === id);
  }

  if (!profile) {
    return res.status(404).json({ message: "Không tìm thấy người dùng" });
  }

  res.json({
    role,
    profile
  });
};
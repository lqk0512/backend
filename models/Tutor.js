class Tutor {
  constructor({ tutor_id, name, email, listExpertise = [] }) {
    this.tutor_id = tutor_id;
    this.name = name;
    this.email = email;
    this.listExpertise = listExpertise;
  }
}

module.exports = Tutor;

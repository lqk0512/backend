class Student {
  constructor({ 
    student_id, 
    name, 
    email,
    listNeeds = [],      
    faculty = "",        
    yearOfStudy = 1    
  }) {

    this.student_id = student_id;
    this.name = name;
    this.email = email;
    this.listNeeds = listNeeds;
    this.faculty = faculty;
    this.yearOfStudy = yearOfStudy;
  }
}

module.exports = Student;


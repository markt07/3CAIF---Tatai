const students = [
  { name: "Anna", age: 17, grade: 2 },
  { name: "Ben", age: 16, grade: 4 },
  { name: "Clara", age: 18, grade: 1 },
  { name: "David", age: 17, grade: 5 },
  { name: "Elena", age: 16, grade: 3 },
  { name: "Felix", age: 19, grade: 2 },
  { name: "Gina", age: 17, grade: 1 },
  { name: "Hugo", age: 18, grade: 4 },
];

// Task 1 – filter: students who passed (grade <= 4)
const passed = students.filter(s => s.grade <= 4);
console.log("Task 1 – passed:", passed);

// Task 2 – map: "Name (age)" strings
const labels = students.map(s => `${s.name} (${s.age})`);
console.log("Task 2 – labels:", labels);

// Task 3 – filter + map: names of passed students
const passedNames = passed.map(s => s.name);
console.log("Task 3 – passedNames:", passedNames);

// Task 4 – reduce: average grade
const averageGrade = students.reduce((sum, s) => sum + s.grade, 0) / students.length;
console.log("Task 4 – averageGrade:", averageGrade);

// Task 5 – chaining: names of students aged >= 17 who passed, comma-separated
const result = students
  .filter(s => s.age >= 17 && s.grade <= 4)
  .map(s => s.name)
  .join(", ");
console.log("Task 5 – result:", result);

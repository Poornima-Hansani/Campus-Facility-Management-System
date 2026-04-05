const LectureSession = require("../models/LectureSession");
const TimetableSession = require("../models/TimetableSession");
const AssignmentExamTask = require("../models/AssignmentExamTask");
const StudyGoal = require("../models/StudyGoal");
const HelpRequest = require("../models/HelpRequest");
const EncouragementEmail = require("../models/EncouragementEmail");

function toISODate(y, m0, d) {
  return `${y}-${String(m0 + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const LECTURES = [
  {
    numericId: 1,
    moduleCode: "IT3040",
    moduleName: "Project Management",
    venueType: "Lecture Hall",
    venueName: "LH-201",
    lecturer: "Dr. Perera",
    day: "Monday",
    startTime: "08:00",
    endTime: "10:00",
  },
  {
    numericId: 2,
    moduleCode: "IT3050",
    moduleName: "Software Engineering",
    venueType: "Laboratory",
    venueName: "Lab A",
    lecturer: "Mr. Silva",
    day: "Wednesday",
    startTime: "13:00",
    endTime: "15:00",
  },
  {
    numericId: 3,
    moduleCode: "IT3060",
    moduleName: "Database Systems",
    venueType: "Lecture Hall",
    venueName: "LH-105",
    lecturer: "Ms. Fernando",
    day: "Tuesday",
    startTime: "10:00",
    endTime: "12:00",
  },
  {
    numericId: 4,
    moduleCode: "IT3070",
    moduleName: "Information Security",
    venueType: "Laboratory",
    venueName: "Lab C",
    lecturer: "Dr. Nirmala",
    day: "Thursday",
    startTime: "09:00",
    endTime: "11:00",
  },
  {
    numericId: 5,
    moduleCode: "IT3080",
    moduleName: "Human Computer Interaction",
    venueType: "Lecture Hall",
    venueName: "LH-302",
    lecturer: "Mr. Jayasinghe",
    day: "Friday",
    startTime: "11:00",
    endTime: "13:00",
  },
  {
    numericId: 6,
    moduleCode: "IT3090",
    moduleName: "Data Analytics",
    venueType: "Laboratory",
    venueName: "Lab B",
    lecturer: "Ms. Wickrama",
    day: "Saturday",
    startTime: "08:30",
    endTime: "10:30",
  },
];

async function seedDatabase() {
  const n = new Date();
  const midMonth = toISODate(n.getFullYear(), n.getMonth(), 15);
  const firstMonth = toISODate(n.getFullYear(), n.getMonth(), 1);

  if ((await LectureSession.countDocuments()) === 0) {
    await LectureSession.insertMany(LECTURES);
    console.log("Seeded lecture catalog");
  }

  if ((await TimetableSession.countDocuments()) === 0) {
    await TimetableSession.insertMany([
      {
        numericId: 1,
        moduleCode: "IT3040",
        moduleName: "Project Management",
        sessionType: "Lecture",
        venueName: "LH-201",
        lecturer: "Mr. Perera",
        day: "Monday",
        startTime: "08:00",
        endTime: "10:00",
      },
      {
        numericId: 2,
        moduleCode: "IT3050",
        moduleName: "Software Engineering",
        sessionType: "Lab",
        venueName: "Lab A",
        lecturer: "Miss. Silva",
        day: "Wednesday",
        startTime: "13:00",
        endTime: "15:00",
      },
    ]);
    console.log("Seeded timetable sessions");
  }

  if ((await AssignmentExamTask.countDocuments()) === 0) {
    await AssignmentExamTask.insertMany([
      {
        numericId: 1,
        title: "Project Proposal Submission",
        moduleCode: "IT3040",
        moduleName: "Project Management",
        type: "Assignment",
        dueDate: toISODate(n.getFullYear(), n.getMonth(), 20),
        description: "Submit the project proposal document.",
      },
      {
        numericId: 2,
        title: "Mid Theory Exam",
        moduleCode: "IT3050",
        moduleName: "Software Engineering",
        type: "Exam",
        dueDate: toISODate(n.getFullYear(), n.getMonth(), 18),
        description: "Covers UML, SDLC, and requirement engineering.",
      },
    ]);
    console.log("Seeded assignments & exams");
  }

  if ((await StudyGoal.countDocuments()) === 0) {
    await StudyGoal.insertMany([
      {
        numericId: 1,
        title: "Core modules — morning focus",
        goalType: "Daily",
        targetHours: 4,
        completedHours: 2,
        status: "Active",
        dueDate: null,
      },
      {
        numericId: 2,
        title: "Lab prep & tutorials",
        goalType: "Weekly",
        targetHours: 18,
        completedHours: 11,
        status: "Active",
        dueDate: midMonth,
      },
      {
        numericId: 3,
        title: "Semester revision sprint",
        goalType: "Monthly",
        targetHours: 60,
        completedHours: 60,
        status: "Completed",
        dueDate: firstMonth,
      },
    ]);
    console.log("Seeded study goals");
  }

  if ((await HelpRequest.countDocuments()) === 0) {
    await HelpRequest.insertMany([
      {
        numericId: 1,
        studentName: "Nimal Perera",
        moduleCode: "IT3050",
        moduleName: "Software Engineering",
        requestTo: "Lecturer",
        sessionType: "Group",
        topic: "Requirement Engineering",
        description:
          "Need help understanding functional and non-functional requirements.",
        status: "Pending",
      },
      {
        numericId: 2,
        studentName: "Kavindi Silva",
        moduleCode: "IT3060",
        moduleName: "Database Systems",
        requestTo: "Senior Student",
        sessionType: "Individual",
        topic: "Normalization",
        description:
          "Need one-to-one support for 1NF, 2NF, and 3NF questions.",
        status: "Scheduled",
      },
    ]);
    console.log("Seeded help requests");
  }

  if ((await EncouragementEmail.countDocuments()) === 0) {
    await EncouragementEmail.insertMany([
      {
        numericId: 1,
        studentId: "IT23200001",
        studentEmail: "student1@my.sliit.lk",
        moduleCode: "IT3040",
        moduleName: "Project Management",
        subject: "Encouragement for Your Module Progress",
        message:
          "Keep working steadily on your module activities. You can request help sessions whenever needed.",
        sentDate: toISODate(n.getFullYear(), n.getMonth(), n.getDate() - 1),
        status: "Sent",
      },
      {
        numericId: 2,
        studentId: "IT23200015",
        studentEmail: "student15@my.sliit.lk",
        moduleCode: "IT3050",
        moduleName: "Software Engineering",
        subject: "Academic Support Reminder",
        message:
          "Please continue your effort with the module. Use the help request feature if you need academic support.",
        sentDate: toISODate(n.getFullYear(), n.getMonth(), n.getDate() - 2),
        status: "Sent",
      },
    ]);
    console.log("Seeded management emails");
  }
}

module.exports = { seedDatabase };

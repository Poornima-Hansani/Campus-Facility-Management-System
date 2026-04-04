import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import TaskDashboardPage from "./pages/TaskDashboardPage";
import LectureAvailabilityPage from "./pages/LectureAvailabilityPage";
import TimetablePage from "./pages/TimetablePage";
import AssignmentExamPage from "./pages/AssignmentExamPage";
import StudyGoalsPage from "./pages/StudyGoalsPage";
import HelpRequestPage from "./pages/HelpRequestPage";
import ManagementDashboard from "./pages/ManagementDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<TaskDashboardPage />} />
        <Route path="/lecture-availability" element={<LectureAvailabilityPage />} />
        <Route path="/timetable" element={<TimetablePage />} />
        <Route path="/assignments-exams" element={<AssignmentExamPage />} />
        <Route path="/study-goals" element={<StudyGoalsPage />} />
        <Route path="/help-requests" element={<HelpRequestPage />} />
        <Route path="/management-dashboard" element={<ManagementDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
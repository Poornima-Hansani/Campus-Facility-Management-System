import { BrowserRouter, Routes, Route } from "react-router-dom";
import TaskDashboardPage from "./pages/TaskDashboardPage";
import AddTaskPage from "./pages/AddTaskPage";
import StudyGoalsPage from "./pages/StudyGoalsPage";
import HelpRequestPage from "./pages/HelpRequestPage";
import TimetablePage from "./pages/TimetablePage";
import LectureAvailabilityPage from "./pages/LectureAvailabilityPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TaskDashboardPage />} />
        <Route path="/add-task" element={<AddTaskPage />} />
        <Route path="/study-goals" element={<StudyGoalsPage />} />
        <Route path="/help" element={<HelpRequestPage />} />
        <Route path="/timetable" element={<TimetablePage />} />
        <Route path="/lecture-availability" element={<LectureAvailabilityPage />} />
      
      </Routes>
    </BrowserRouter>
  );
}

export default App;
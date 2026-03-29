import { BrowserRouter, Routes, Route } from "react-router-dom";
import TaskDashboardPage from "./pages/TaskDashboardPage";
import AddTaskPage from "./pages/AddTaskPage";
import StudyGoalsPage from "./pages/StudyGoalsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TaskDashboardPage />} />
        <Route path="/add-task" element={<AddTaskPage />} />
        <Route path="/study-goals" element={<StudyGoalsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
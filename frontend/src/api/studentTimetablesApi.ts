import axios from "axios";

export interface TimetableSession {
  sessionId: string;
  day: string;
  startTime: string;
  endTime: string;
  type: 'LECTURE' | 'LAB';
  subject: string;
  lecturer: {
    _id: string;
    name: string;
    userId: string;
  };
  location: string;
}

export interface TimetableGroup {
  group: string;
  sessions: TimetableSession[];
  totalSessions: number;
}

export interface StudentTimetable {
  year: string;
  semester: string;
  batch: string;
  specialization: string;
  groups: TimetableGroup[];
}

export interface StudentTimetablesResponse {
  timetables: StudentTimetable[];
  totalTimetables: number;
  summary: {
    years: string[];
    semesters: string[];
    batches: string[];
    specializations: string[];
  };
}

const API = "http://localhost:3000";

export const getStudentTimetables = (filters?: {
  year?: string;
  semester?: string;
  batch?: string;
  specialization?: string;
  group?: string;
}) =>
  axios.get<StudentTimetablesResponse>(`${API}/api/lab-gap/admin/student-timetables`, {
    params: filters
  });

import axios from "axios";

export interface LabAlert {
  _id: string;
  labName: string;
  day: string;
  start: number;
  end: number;
  duration: number;
  lecturerName: string;
  lecturerId: string;
  weekNumber: number;
  year: number;
  confirmed: boolean;
  confirmedAt?: string;
  createdAt: string;
}

const API = "http://localhost:3000";

export const getLecturerLabAlerts = (lecturerId: string) =>
  axios.get<LabAlert[]>(`${API}/api/lab-gap/alerts/${lecturerId}`);

export const confirmLabAlert = (alertId: string) =>
  axios.post(`${API}/api/lab-gap/confirm/${alertId}`);

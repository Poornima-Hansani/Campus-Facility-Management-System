import axios from "axios";

export interface LecturerAlertSummary {
  lecturerId: string;
  lecturerName: string;
  totalAlerts: number;
  confirmedAlerts: number;
  pendingAlerts: number;
  alerts: Array<{
    _id: string;
    labName: string;
    day: string;
    start: number;
    end: number;
    duration: number;
    weekNumber: number;
    year: number;
    confirmed: boolean;
    confirmedAt?: string;
    createdAt: string;
  }>;
}

export interface AdminAlertsResponse {
  summary: LecturerAlertSummary[];
  totalAlerts: number;
  totalConfirmed: number;
  totalPending: number;
}

const API = "http://localhost:3000";

export const getAllLecturerAlerts = () =>
  axios.get<AdminAlertsResponse>(`${API}/api/lab-gap/admin/all-alerts`);

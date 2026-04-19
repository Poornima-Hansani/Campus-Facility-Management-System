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

export interface WeeklyReportAlert {
  lecturerName: string;
  lecturerId: string;
  day: string;
  timeSlot: string;
  duration: number;
  confirmedAt?: string;
  createdAt?: string;
}

export interface LabWeeklyReport {
  labName: string;
  confirmedAlerts: WeeklyReportAlert[];
  pendingAlerts: WeeklyReportAlert[];
  totalConfirmed: number;
  totalPending: number;
}

export interface WeeklyReport {
  weekKey: string;
  weekNumber: number;
  year: number;
  labs: LabWeeklyReport[];
  totalAlerts: number;
  confirmedAlerts: number;
  pendingAlerts: number;
}

export interface WeeklyReportResponse {
  report: WeeklyReport[];
  currentWeek: number;
  currentYear: number;
  summary: {
    totalWeeks: number;
    totalAlerts: number;
    totalConfirmed: number;
    totalPending: number;
  };
}

const API = "http://localhost:3000";

export const getAllLecturerAlerts = () =>
  axios.get<AdminAlertsResponse>(`${API}/api/lab-gap/admin/all-alerts`);

export const getWeeklyConfirmationReport = (weekNumber?: number, year?: number) =>
  axios.get<WeeklyReportResponse>(`${API}/api/lab-gap/admin/weekly-report`, {
    params: { weekNumber, year }
  });

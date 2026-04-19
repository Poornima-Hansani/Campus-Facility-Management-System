import { apiGet, apiPost, apiDelete } from '../lib/api';

export interface StudyArea {
  _id: string;
  name: string;
  location: string;
  capacity: number;
  description: string;
  amenities: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudyAreaBooking {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  studyArea: {
    _id: string;
    name: string;
    location: string;
    capacity: number;
  };
  date: string;
  day: string;
  startTime: string;
  endTime: string;
  startNum: number;
  endNum: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  purpose: string;
  numberOfStudents: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface FreeTimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  startNum: number;
  endNum: number;
  duration: number;
}

export interface FreeTimeResponse {
  success: boolean;
  data: {
    date?: string;
    day?: string;
    freeSlots?: FreeTimeSlot[];
    userInfo?: {
      year: string;
      semester: string;
      batch: string;
      specialization: string;
      group: string;
    };
    weeklyFreeSlots?: Record<string, FreeTimeSlot[]>;
  };
}

export interface BookingResponse {
  success: boolean;
  data: StudyAreaBooking;
}

export interface BookingsResponse {
  success: boolean;
  data: {
    bookings: StudyAreaBooking[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

// Study Area APIs
export const studyAreaApi = {
  // Get all study areas
  getStudyAreas: async (params?: { page?: number; limit?: number; search?: string; location?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.location) queryParams.append('location', params.location);
    
    return apiGet<{ success: boolean; data: { studyAreas: StudyArea[]; pagination: any } }>(
      `/api/study-areas?${queryParams.toString()}`
    );
  },

  // Get single study area
  getStudyArea: async (id: string) => {
    return apiGet<{ success: boolean; data: StudyArea }>(`/api/study-areas/${id}`);
  },

  // Get user's free time slots
  getFreeTimeSlots: async (userId: string, date?: string) => {
    const queryParams = date ? `?date=${date}` : '';
    return apiGet<FreeTimeResponse>(`/api/student-timetables/free-slots/${userId}${queryParams}`);
  },

  // Create booking
  createBooking: async (bookingData: {
    userId: string;
    studyAreaId: string;
    date: string;
    startTime: string;
    endTime: string;
    purpose?: string;
    numberOfStudents?: number;
    notes?: string;
  }) => {
    return apiPost<BookingResponse>('/api/study-areas/bookings', bookingData);
  },

  // Get user's bookings
  getUserBookings: async (userId: string, params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return apiGet<BookingsResponse>(
      `/api/study-areas/bookings/user/${userId}?${queryParams.toString()}`
    );
  },

  // Get study area bookings for specific date
  getStudyAreaBookings: async (studyAreaId: string, date: string) => {
    return apiGet<{ success: boolean; data: { date: string; day: string; bookings: StudyAreaBooking[] } }>(
      `/api/study-areas/bookings/study-area/${studyAreaId}?date=${date}`
    );
  },

  // Update booking status
  updateBookingStatus: async (bookingId: string, status: 'confirmed' | 'cancelled' | 'completed') => {
    return apiPost<{ success: boolean; data: StudyAreaBooking }>(
      `/api/study-areas/bookings/${bookingId}/status`,
      { status }
    );
  },

  // Cancel booking
  cancelBooking: async (bookingId: string) => {
    return apiDelete<{ success: boolean }>(`/api/study-areas/bookings/${bookingId}`);
  }
};

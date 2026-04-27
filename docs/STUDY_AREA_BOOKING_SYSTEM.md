# Study Area Booking System - Complete Documentation

## Overview
The study area booking system allows students to reserve study spaces during their free time slots based on their academic timetable. It integrates with student timetables to ensure bookings only occur during available free periods.

## System Architecture & Files

### Frontend Files

#### 1. StudyAreaBooking.tsx
- **Location:** `/frontend/src/pages/`
- **Purpose:** Main student booking interface
- **Key Features:**
  - Date selection with free time slot fetching
  - Study area selection with capacity and amenities display
  - Booking form with purpose and notes
  - My Bookings management with cancellation

#### 2. studyAreaApi.ts
- **Location:** `/frontend/src/api/`
- **Purpose:** Centralized API calls with TypeScript interfaces
- **Key Functions:**
  - `getStudyAreas()` - Fetch available study areas
  - `getFreeTimeSlots()` - Get student's free time for date
  - `createBooking()` - Create new booking
  - `getUserBookings()` - Fetch student's bookings
  - `cancelBooking()` - Cancel existing booking

### Backend Files

#### 3. studyAreaRoutes.js
- **Location:** `/backend/routes/`
- **Purpose:** Core backend logic for study area management
- **Key Endpoints:**
  - `GET /api/study-areas` - List study areas with pagination
  - `POST /api/study-areas` - Create new study area
  - `POST /api/study-areas/bookings` - Create booking
  - `GET /api/study-areas/bookings/user/:userId` - Get user bookings
  - `DELETE /api/study-areas/bookings/:bookingId` - Cancel booking

#### 4. bookingRoutes.js
- **Location:** `/backend/routes/`
- **Purpose:** Legacy booking routes and study area management

#### 5. studentTimetableRoutes.js
- **Location:** `/backend/routes/`
- **Purpose:** Free time slot calculation
- **Key Function:** `GET /api/student-timetables/free-slots/:userId`

### Database Models

#### 6. StudyArea.js
```javascript
{
  name: String (required, max 100 chars),
  location: String (required, max 200 chars),
  capacity: Number (1-500, default 30),
  description: String (max 500 chars),
  amenities: [String] (array of amenity names),
  isActive: Boolean (default true),
  createdAt: Date,
  updatedAt: Date
}
```

#### 7. StudyAreaBooking.js
```javascript
{
  userId: String (required),
  userName: String,
  areaId: String (required),
  areaName: String (required),
  day: String (required),
  date: String (required, YYYY-MM-DD),
  startTime: String (required, HH:MM format),
  endTime: String (required, HH:MM format),
  status: String (Confirmed/Cancelled),
  bookedAt: Date (default now)
}
```

#### 8. StudentTimeTable.js (Referenced)
- Contains class sessions and calculated free time
- Used for validating booking time slots

## Complete Booking Workflow

### Step 1: Initial Load
```
Frontend: Component mounts, calls fetchAreas()
    ↓
API: GET /api/study-areas returns active study areas
    ↓
Database: Queries studyareas collection with isActive: true
    ↓
Frontend: Displays study areas in sidebar
```

### Step 2: Date Selection & Free Time Fetch
```
Frontend: User selects date → triggers fetchFreeTimeSlots()
    ↓
API: GET /api/student-timetables/free-slots/:userId?date={date}
    ↓
Backend Logic:
  - Find user's academic profile (year, semester, batch, group)
  - Fetch student timetable from StudentTimeTable
  - Calculate free time slots by subtracting class sessions from working hours
    ↓
Response: Returns array of free time slots for selected date
```

### Step 3: Study Area Selection
- User clicks study area → updates `selectedArea`
- Display shows area details (capacity, location, amenities)
- Validation ensures area is active and available

### Step 4: Time Slot Selection
- User selects from available free time slots
- Only shows slots calculated from student's timetable
- UI highlights selected slot with duration display

### Step 5: Booking Details
User fills optional fields:
- Number of students (1-50)
- Purpose (e.g., "Group study", "Exam prep")
- Additional notes

### Step 6: Booking Creation
**API:** `POST /api/study-areas/bookings`

Backend Validation Sequence:
1. User Validation - Confirm user exists and is student
2. Study Area Validation - Check area exists and is active
3. Date Validation - Prevent past date bookings
4. Free Time Validation - Verify slot is in student's free time
5. Conflict Detection - Check for overlapping bookings

### Step 7: Booking Management
**View My Bookings:** `GET /api/study-areas/bookings/user/:userId`
- Filtering by status, date range, pagination
- Shows booking details with area information

**Cancel Booking:** `DELETE /api/study-areas/bookings/:bookingId`
- Updates booking status to 'Cancelled'
- Refreshes bookings list

## Key Features & Business Logic

### Time Management
| Setting | Value |
|---------|-------|
| Weekday Hours | 8:00 AM - 5:30 PM (8.0 - 17.5) |
| Weekend Hours | 8:00 AM - 8:00 PM (8.0 - 20.0) |
| Time Format | 24-hour numeric storage (8.5 = 8:30 AM) |

### Access Control
- **Student Only:** Only students can book study areas
- **Academic Profile:** Uses student's year, semester, batch, group
- **Free Time Only:** Bookings only allowed during calculated free slots
- **No Overlap:** Prevents conflicting bookings for same area/time

### Capacity Management
- Default capacity: 30 students per area
- Flexible: Configurable per study area
- No hard enforcement limit (tracks but doesn't prevent)

### Data Integrity
- **Soft Delete:** Study areas marked inactive instead of deletion
- **Status Tracking:** Booking statuses (Confirmed, Cancelled, Completed)
- **Timestamps:** Created/updated timestamps for audit trail
- **Indexes:** Optimized queries for performance

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/study-areas | List study areas |
| POST | /api/study-areas | Create study area |
| POST | /api/study-areas/bookings | Create booking |
| GET | /api/study-areas/bookings/user/:userId | Get user's bookings |
| PUT | /api/study-areas/bookings/:id/status | Update booking status |
| DELETE | /api/study-areas/bookings/:id | Cancel booking |

## Database Collections
- **studyareas** - Study area information
- **studyareabookings** - Booking records
- **studenttimetables** - Student academic schedules
- **users** - User information and academic details

## Technical Highlights

### Performance
- Database indexes for optimized queries
- Pagination for large datasets
- MongoDB populate for related data
- Frontend state management reduces API calls

### Security
- Input validation prevents malicious data
- Access control with role-based permissions
- Data sanitization (trim and validate all inputs)
- Graceful error handling

### User Experience
- Step-by-step booking flow with validation
- Real-time feedback on actions
- Mobile-friendly responsive design
- Visual indicators for selection states
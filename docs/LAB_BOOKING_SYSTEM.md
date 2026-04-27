# Lab Booking System - Complete Documentation

## Overview
The lab booking system allows students to reserve computer lab slots based on their academic schedule and available lab capacity. It's a sophisticated system that matches student free time with lab availability.

## System Architecture

### Frontend Components
- **LabBooking.tsx** - Main student booking interface
- **LabTimetableList.tsx** - Admin view of all lab schedules
- **LabTimetableView.tsx** - Individual lab detailed view

### Backend Components
- **labBookingRoutes.js** - Core booking API endpoints
- **bookingRoutes.js** - General booking utilities
- **labTimetableRoutes.js** - Lab schedule management
- **Models** - Data structures for bookings and schedules

## Data Models

### LabBooking Model
```javascript
{
  studentId: String (required),
  studentName: String (required),
  labName: String (required),
  day: String (Monday-Sunday),
  date: String (YYYY-MM-DD),
  startTime: Number (24h format),
  endTime: Number (24h format),
  status: String (Confirmed/Pending/Cancelled),
  createdAt: Date,
  cancelledAt: Date
}
```

### LabStudentCommonFree Model
```javascript
{
  year: String (Y1, Y2, etc.),
  semester: String (S1, S2),
  batch: String (WD/WE),
  specialization: String,
  group: String,
  labs: [{
    labName: String,
    days: {
      Monday: [{ start: Number, end: Number }],
      Tuesday: [{ start: Number, end: Number }],
      // ... all week days
    }
  }]
}
```

## Complete Booking Workflow

### Step 1: Student Authentication & Academic Profile
When student accesses lab booking:
- System gets studentId from localStorage
- Fetches student academic details (year, semester, batch, group, specialization)
- Converts to database format:
  - Year: 1 → Y1
  - Semester: 1 → S1
  - Schedule Type: Weekday → WD, Weekend → WE

### Step 2: Fetch Allowed Labs
**API:** `GET /api/lab-booking/allowed-slots?studentId={studentId}`

Queries LabStudentCommonFree collection with student's academic profile
Returns array of labs with available time slots for that student's group

### Step 3: Student Selection Process
The student goes through a 4-step selection:

**Step 3.1: Select Lab**
- Dropdown shows all allowed labs for their academic group
- Selection triggers available days loading

**Step 3.2: Select Day**
- Shows days with available slots for selected lab
- Only displays days that have time slots

**Step 3.3: Select Time Slot**
- Shows available time slots for selected lab and day
- Time slots are in 24-hour format (e.g., 9.0 = 9:00 AM, 13.5 = 1:30 PM)

**Step 3.4: Select Date**
- Date picker with minimum date = today
- Student selects specific date for the booking

### Step 4: Check Availability
**API:** `GET /api/lab-booking/slot-availability?labName={lab}&date={date}&start={start}&end={end}`

```javascript
{
  seatsAvailable: Number,
  totalCapacity: 30,
  isAvailable: Boolean
}
```

### Step 5: Booking Validation & Creation
**API:** `POST /api/lab-booking/book-lab`

Validation Sequence:
1. Student Validation: Confirms student exists
2. Academic Profile Match: Verifies student's profile matches allowed slots
3. Lab Permission: Confirms lab is in student's allowed labs list
4. Slot Existence: Verifies requested time slot exists
5. Capacity Check: Ensures lab isn't fully booked (max 30 students)
6. Duplicate Prevention: Prevents same slot booking twice

### Step 6: Booking Management
**View My Bookings:** `GET /api/lab-booking/my-bookings?studentId={studentId}`
**Cancel Booking:** `DELETE /api/lab-booking/cancel-booking/{bookingId}`

## Admin Features

### Lab Timetable Management
LabTimetableList.tsx provides:
- Overview Dashboard with total labs, filtered labs, total sessions
- Filtering by lab name and time range
- Detailed 7-day schedule per lab with busy/free slots
- Utilization rates and statistics

### Lab Schedule Generation
labTimetableRoutes.js logic:
- Extract all LAB sessions from student timetables
- Group sessions by lab location
- Calculate free time between sessions
- Generate lab timetables with busy/free slots

## Key Features & Rules

### Access Control
- Students can only book labs assigned to their academic group
- Based on year, semester, batch, specialization, and group
- No cross-group booking allowed

### Capacity Management
- Standard lab capacity: 30 students
- Real-time availability checking
- Automatic booking prevention when full

### Time Management
- Working hours: 8:00 AM - 8:00 PM (8.0 - 20.0)
- Time slots in 30-minute increments
- 24-hour format for storage
- User-friendly 12-hour display with AM/PM

### Booking Rules
- No duplicate bookings for same student/time
- Past date booking prevented
- Same-day booking allowed
- Instant confirmation (no pending state)

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/lab-booking/allowed-slots | Get available labs for student |
| GET | /api/lab-booking/slot-availability | Check seat availability |
| POST | /api/lab-booking/book-lab | Create new booking |
| GET | /api/lab-booking/my-bookings | Get student's bookings |
| DELETE | /api/lab-booking/cancel-booking/:id | Cancel booking |
| GET | /api/lab-booking/all-bookings | Admin: all bookings |
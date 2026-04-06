const express = require('express');
const cors = require('cors');

const { connectDB, getConnectionStatus } = require('./config/database');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const studentRoutes = require('./routes/studentRoutes');
const labRoutes = require('./routes/labRoutes');
const labFreeTimeRoutes = require('./routes/labFreeTimeRoutes');
const studyAreaRoutes = require('./routes/studyAreaRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const studentFreeTimeRoutes = require('./routes/studentFreeTimeRoutes');
const labBookingRoutes = require('./routes/labBookingRoutes');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/timetables', timetableRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/lab-free-time', labFreeTimeRoutes);
app.use('/api/student-free-time', studentFreeTimeRoutes);
app.use('/api/lab-booking', labBookingRoutes);
app.use('/api/study-areas', studyAreaRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Facility Management System API',
    database: getConnectionStatus().status,
  });
});

app.listen(5000, () => {
  console.log('🚀 Server running on port 5000');
});
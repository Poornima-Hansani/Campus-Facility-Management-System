import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../styles/admin.css';
import '../../styles/lecturer.css';

const LecturerTimetablePage = () => {
  // Basic Info State
  const [batchType, setBatchType] = useState('weekday');
  const [faculty, setFaculty] = useState('Faculty of Computing');
  const [year, setYear] = useState(1);
  const [semester, setSemester] = useState(1);
  const [group, setGroup] = useState('1.1');
  
  // Day & Slot Management
  const [selectedDay, setSelectedDay] = useState('');
  const [daysData, setDaysData] = useState({});
  const [currentSlots, setCurrentSlots] = useState([]);
  
  // Slot Form State
  const [labNumber, setLabNumber] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedLecturer, setSelectedLecturer] = useState('');
  
  // Lecturers Data
  const [lecturers, setLecturers] = useState([]);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingSlotIndex, setEditingSlotIndex] = useState(null);
  
  // Available days based on batch type
  const AVAILABLE_DAYS = {
    weekday: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    weekend: ['Saturday', 'Sunday']
  };

  const availableDays = AVAILABLE_DAYS[batchType];

  // Fetch lecturers on component mount
  useEffect(() => {
    const fetchLecturers = async () => {
      try {
        const res = await api.get('/api/users/role/lecturer');
        setLecturers(res.data);
      } catch (err) {
        console.error('Failed to load lecturers:', err);
        setError('Failed to load lecturers');
      }
    };

    fetchLecturers();
  }, []);

  // Generate title
  const generateTitle = () => {
    const batchCode = batchType === 'weekday' ? 'WD' : 'WE';
    const groupCode = group.replace('.', '');
    return `Y${year}_S${semester}_${batchCode}${groupCode}`;
  };

  // Check for time overlap
  const checkTimeOverlap = (newStartTime, newEndTime, excludeIndex = null) => {
    return currentSlots.some((slot, index) => {
      if (excludeIndex !== null && index === excludeIndex) return false;
      return (newStartTime < slot.endTime && newEndTime > slot.startTime);
    });
  };

  // Check for lecturer conflict
  const checkLecturerConflict = (lecturerId, newStartTime, newEndTime, excludeIndex = null) => {
    return currentSlots.some((slot, index) => {
      if (excludeIndex !== null && index === excludeIndex) return false;
      return slot.lecturer === lecturerId && 
             (newStartTime < slot.endTime && newEndTime > slot.startTime);
    });
  };

  // Add or update slot
  const handleAddSlot = () => {
    // Validation
    if (!labNumber || !startTime || !endTime || !selectedLecturer) {
      setError('Please fill all slot fields including lecturer');
      return;
    }

    if (startTime >= endTime) {
      setError('End time must be after start time');
      return;
    }

    // Debug: Log selected lecturer
    console.log('Selected lecturer:', selectedLecturer);
    console.log('Lecturer type:', typeof selectedLecturer);

    // Check for time overlap (skip if editing the same slot)
    if (editingSlotIndex === null) {
      if (checkTimeOverlap(startTime, endTime)) {
        setError('Time slot overlaps with existing slot');
        return;
      }
      
      // Check for lecturer conflict
      if (checkLecturerConflict(selectedLecturer, startTime, endTime)) {
        setError('This lecturer is already assigned to an overlapping time slot');
        return;
      }
    } else {
      if (checkTimeOverlap(startTime, endTime, editingSlotIndex)) {
        setError('Time slot overlaps with existing slot');
        return;
      }
      
      // Check for lecturer conflict (skip current slot)
      if (checkLecturerConflict(selectedLecturer, startTime, endTime, editingSlotIndex)) {
        setError('This lecturer is already assigned to an overlapping time slot');
        return;
      }
    }

    const newSlot = {
      labNumber,
      startTime,
      endTime,
      lecturer: selectedLecturer
    };

    let updatedSlots;
    if (editingSlotIndex !== null) {
      // Update existing slot
      updatedSlots = [...currentSlots];
      updatedSlots[editingSlotIndex] = newSlot;
      setEditingSlotIndex(null);
    } else {
      // Add new slot and sort by time
      updatedSlots = [...currentSlots, newSlot].sort(
        (a, b) => a.startTime.localeCompare(b.startTime)
      );
    }

    setCurrentSlots(updatedSlots);

    // Reset form
    setLabNumber('');
    setStartTime('');
    setEndTime('');
    setSelectedLecturer('');
    setError('');
  };

  // Edit slot
  const handleEditSlot = (index) => {
    const slot = currentSlots[index];
    setLabNumber(slot.labNumber);
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
    setSelectedLecturer(slot.lecturer);
    setEditingSlotIndex(index);
  };

  // Delete slot
  const handleDeleteSlot = (index) => {
    const updatedSlots = currentSlots.filter((_, i) => i !== index);
    setCurrentSlots(updatedSlots);
  };

  // Submit day data
  const handleDaySubmit = () => {
    if (!selectedDay) {
      setError('Please select a day');
      return;
    }

    if (currentSlots.length === 0) {
      setError('Please add at least one slot');
      return;
    }

    setDaysData(prev => ({
      ...prev,
      [selectedDay]: currentSlots
    }));

    // Reset for next day
    setCurrentSlots([]);
    setSelectedDay('');
    setLabNumber('');
    setStartTime('');
    setEndTime('');
    setSelectedLecturer('');
    setError('');
  };

  // Final submission
  const handleFinalSubmit = async () => {
    if (Object.keys(daysData).length === 0) {
      setError('Please add at least one day with slots');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const timetableData = {
        title: generateTitle(),
        faculty,
        year,
        semester,
        group,
        batchType,
        days: Object.keys(daysData).map(day => ({
          day,
          slots: daysData[day]
        }))
      };

      console.log('Submitting timetable:', JSON.stringify(timetableData, null, 2));

      const res = await api.post('/api/timetables', timetableData);
      
      console.log('Response:', res);
      
      if (res.data) {
        alert('Timetable created successfully!');
        // Reset form
        setBatchType('weekday');
        setFaculty('Faculty of Computing');
        setYear(1);
        setSemester(1);
        setGroup('1.1');
        setDaysData({});
        setCurrentSlots([]);
        setSelectedDay('');
        setLabNumber('');
        setStartTime('');
        setEndTime('');
        setSelectedLecturer('');
      }
    } catch (err) {
      console.error('Error creating timetable:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 400) {
        setError('Bad request: Please check all fields and try again');
      } else if (err.response?.status === 500) {
        setError('Server error: Please try again later');
      } else {
        setError('Failed to create timetable: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Render slot form
  const renderSlotForm = () => (
    <div className="slot-form">
      <h4>Slot Details</h4>
      <div className="form-grid">
        <div className="form-group">
          <label>Lab Number:</label>
          <input
            type="text"
            value={labNumber}
            onChange={(e) => setLabNumber(e.target.value)}
            placeholder="e.g., LAB-001"
          />
        </div>
        
        <div className="form-group">
          <label>Start Time:</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>End Time:</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>Lecturer:</label>
          <select
            value={selectedLecturer}
            onChange={(e) => setSelectedLecturer(e.target.value)}
          >
            <option value="">Select Lecturer</option>
            {lecturers.map(lecturer => (
              <option key={lecturer._id} value={lecturer._id}>
                {lecturer.name} ({lecturer.email})
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="form-actions">
        <button
          onClick={handleAddSlot}
          className="btn-primary"
        >
          {editingSlotIndex !== null ? 'Update Slot' : 'Add Slot'}
        </button>
        {editingSlotIndex !== null && (
          <button
            onClick={() => {
              setEditingSlotIndex(null);
              setLabNumber('');
              setStartTime('');
              setEndTime('');
              setSelectedLecturer('');
            }}
            className="btn-secondary"
          >
            Cancel Edit
          </button>
        )}
      </div>
    </div>
  );

  // Render current slots
  const renderCurrentSlots = () => (
    <div className="current-slots">
      <h4>Current Slots for {selectedDay}</h4>
      {currentSlots.length === 0 ? (
        <p>No slots added yet</p>
      ) : (
        <div className="slots-list">
          {currentSlots.map((slot, index) => (
            <div key={index} className="slot-item">
              <div className="slot-info">
                <span><strong>Lab:</strong> {slot.labNumber}</span>
                <span><strong>Time:</strong> {slot.startTime} - {slot.endTime}</span>
                <span><strong>Lecturer:</strong> {
                  lecturers.find(l => l._id === slot.lecturer)?.name || 'Unknown'
                }</span>
              </div>
              <div className="slot-actions">
                <button onClick={() => handleEditSlot(index)} className="btn-edit">Edit</button>
                <button onClick={() => handleDeleteSlot(index)} className="btn-delete">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render preview
  const renderPreview = () => (
    <div className="timetable-preview">
      <h4>Timetable Preview</h4>
      <div className="preview-info">
        <p><strong>Title:</strong> {generateTitle()}</p>
        <p><strong>Faculty:</strong> {faculty}</p>
        <p><strong>Year:</strong> {year}</p>
        <p><strong>Semester:</strong> {semester}</p>
        <p><strong>Group:</strong> {group}</p>
        <p><strong>Batch Type:</strong> {batchType}</p>
      </div>
      
      <div className="preview-schedule">
        {Object.keys(daysData).length === 0 ? (
          <p>No days added yet</p>
        ) : (
          Object.keys(daysData).map(day => (
            <div key={day} className="day-preview">
              <h5>{day}</h5>
              {daysData[day].map((slot, index) => (
                <div key={index} className="slot-preview">
                  <span>{slot.startTime} - {slot.endTime}</span>
                  <span>Lab {slot.labNumber}</span>
                  <span>{lecturers.find(l => l._id === slot.lecturer)?.name || 'Unknown'}</span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="timetable-management">
      <div className="page-header">
        <h2>Create Timetable</h2>
        <p>Create a new student timetable</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="timetable-form">
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Batch Type:</label>
              <select
                value={batchType}
                onChange={(e) => setBatchType(e.target.value)}
              >
                <option value="weekday">Weekday</option>
                <option value="weekend">Weekend</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Faculty:</label>
              <select
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
              >
                <option value="Faculty of Computing">Faculty of Computing</option>
                <option value="Faculty of Engineering">Faculty of Engineering</option>
                <option value="Faculty of Business">Faculty of Business</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Year:</label>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
              >
                <option value={1}>Year 1</option>
                <option value={2}>Year 2</option>
                <option value={3}>Year 3</option>
                <option value={4}>Year 4</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Semester:</label>
              <select
                value={semester}
                onChange={(e) => setSemester(parseInt(e.target.value))}
              >
                <option value={1}>Semester 1</option>
                <option value={2}>Semester 2</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Group:</label>
              <input
                type="text"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                placeholder="e.g., 1.1"
              />
            </div>
          </div>
        </div>

        {/* Day Selection */}
        <div className="form-section">
          <h3>Add Schedule</h3>
          <div className="form-group">
            <label>Select Day:</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
            >
              <option value="">Select a day</option>
              {availableDays.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          {selectedDay && (
            <>
              {renderSlotForm()}
              {currentSlots.length > 0 && renderCurrentSlots()}
              
              <div className="form-actions">
                <button
                  onClick={handleDaySubmit}
                  className="btn-primary"
                  disabled={currentSlots.length === 0}
                >
                  Add Day to Timetable
                </button>
              </div>
            </>
          )}
        </div>

        {/* Preview */}
        {Object.keys(daysData).length > 0 && (
          <div className="form-section">
            {renderPreview()}
          </div>
        )}

        {/* Submit */}
        <div className="form-actions">
          <button
            onClick={handleFinalSubmit}
            className="btn-primary btn-large"
            disabled={loading || Object.keys(daysData).length === 0}
          >
            {loading ? 'Creating...' : 'Create Timetable'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LecturerTimetablePage;

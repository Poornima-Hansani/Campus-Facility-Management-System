import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Save, X, AlertCircle } from 'lucide-react';
import { v4 as uuid } from 'uuid';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Session {
  sessionId: string;
  day: string;
  startTime: string;
  endTime: string;
  startNum: number;
  endNum: number;
  type: 'LECTURE' | 'LAB';
  subject: string;
  lecturer: string | {
    _id: string;
    name: string;
  };
  location: string;
}

interface Lecturer {
  _id: string;
  name: string;
  code: string;
  department: string;
}


interface TimeTable {
  year: string;
  semester: string;
  batch: 'WD' | 'WE';
  specialization: string;
  group: string;
  sessions: {
    day: string;
    startTime: string;
    endTime: string;
    lecturer: string;
    location: string;
    type: 'LECTURE' | 'LAB';
    subject: string;
  }[];
}

export default function TimetableBuilderPage() {
  const navigate = useNavigate();
  
  // State for filters
  const [year, setYear] = useState('Y2');
  const [semester, setSemester] = useState('S1');
  const [batch, setBatch] = useState<'WD' | 'WE'>('WD');
  const [specialization, setSpecialization] = useState('SE');
  const [group, setGroup] = useState('1.1');
  
  // State for sessions
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedCell, setSelectedCell] = useState<{day: string, time: string} | null>(null);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  
  // Master data for dropdowns
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  
  // Modal state
  const [sessionType, setSessionType] = useState<'LECTURE' | 'LAB'>('LECTURE');
  const [subject, setSubject] = useState('');
  const [lecturer, setLecturer] = useState('');
  const [location, setLocation] = useState('');
  const [endTime, setEndTime] = useState('');

  // Generate time slots based on batch
  const generateTimeSlots = (batchType: 'WD' | 'WE') => {
    const end = batchType === 'WD' ? 17.5 : 20;
    let slots = [];
    for (let t = 8; t < end; t += 0.5) {
      slots.push(t);
    }
    return slots;
  };

  // Get days based on batch
  const getDays = () => {
    return batch === 'WD' 
      ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      : ['Saturday', 'Sunday'];
  };

  // Format time for display
  const formatTime = (time: number) => {
    const hours = Math.floor(time);
    const minutes = (time % 1) * 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes === 0 ? '00' : '30'} ${period}`;
  };

  // Convert time to string format
  const timeToString = (time: number) => {
    const hours = Math.floor(time);
    const minutes = (time % 1) * 60;
    return `${hours.toString().padStart(2, '0')}:${minutes === 0 ? '00' : '30'}`;
  };

  // Convert string time to number
  const timeToNumber = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + (minutes / 60);
  };

  // Normalize day name to full format (Monday, Tuesday, etc.)
  const normalizeDayFull = (d: string) => {
    const x = d.trim().toLowerCase();
    if (x.startsWith('mon')) return 'Monday';
    if (x.startsWith('tue')) return 'Tuesday';
    if (x.startsWith('wed')) return 'Wednesday';
    if (x.startsWith('thu')) return 'Thursday';
    if (x.startsWith('fri')) return 'Friday';
    if (x.startsWith('sat')) return 'Saturday';
    if (x.startsWith('sun')) return 'Sunday';
    return d;
  };


  // Check if session overlaps with existing sessions
  const isOverlapping = (
    day: string,
    startTime: string,
    endTime: string,
    excludeSessionId?: string
  ) => {
    const newStart = timeToNumber(startTime);
    const newEnd = timeToNumber(endTime);

    return sessions.some(session => {
      if (excludeSessionId && session.sessionId === excludeSessionId) return false;
      if (session.day !== day) return false;

      const existingStart = timeToNumber(session.startTime);
      const existingEnd = timeToNumber(session.endTime);

      return newStart < existingEnd && newEnd > existingStart;
    });
  };

  
  // Validate time based on batch
  const validateTime = (batchType: 'WD' | 'WE', startTime: string, endTime: string) => {
    const start = timeToNumber(startTime);
    const end = timeToNumber(endTime);
    
    if (start < 8) return false; // Before 8 AM
    if (batchType === 'WD' && end > 17.5) return false; // After 5:30 PM on weekdays
    if (batchType === 'WE' && end > 20) return false; // After 8 PM on weekends
    
    return true;
  };

  
  
  // Save session
  const saveSession = async () => {
    // Debug log to verify fix
    console.log('Save session - selectedCell.time:', selectedCell?.time, 'editingSession?.startTime:', editingSession?.startTime);
    
    // Validate required fields
    if (
      !selectedCell ||
      !subject.trim() ||
      !lecturer ||
      !location.trim()
    ) {
      setError('Please fill all required fields');
      return;
    }

    // Validate time
    if (!validateTime(batch, selectedCell.time, endTime)) {
      setError('Invalid time slot for selected batch');
      return;
    }

    // Validate end time is after start time
    if (timeToNumber(endTime) <= timeToNumber(selectedCell.time)) {
      setError('End time must be after start time');
      return;
    }

    // Check for overlaps
    if (isOverlapping(selectedCell.day, selectedCell.time, endTime, editingSession?.sessionId)) {
      setError('Session time conflicts with existing session');
      return;
    }

    
    const realStart = selectedCell.time;

    const newSession: Session = {
      sessionId: editingSession?.sessionId || uuid(),
      day: normalizeDayFull(selectedCell.day),
      startTime: realStart,
      endTime,
      startNum: timeToNumber(realStart),
      endNum: timeToNumber(endTime),
      type: sessionType,
      subject,
      lecturer,
      location
    };

    // Update local state only
    if (editingSession) {
      // Update existing session by sessionId - remove old first to prevent ghost blocks
      setSessions(prev => {
        const withoutOld = prev.filter(s => s.sessionId !== editingSession?.sessionId);
        return [...withoutOld, newSession];
      });
    } else {
      // Add new session
      setSessions(prev => [...prev, newSession]);
    }

    closeModal();
  };

  // Delete session
  const deleteSession = () => {
    if (!editingSession) return;
    
    setSessions(prev => prev.filter(s => s.sessionId !== editingSession.sessionId));
    closeModal();
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedCell(null);
    setEditingSession(null);
    setSubject('');
    setLecturer('');
    setLocation('');
    setEndTime('');
    setError('');
  };

  // Load master data for dropdowns
  const loadMasterData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/lecturers`);
      const json = await res.json();

      // IMPORTANT FIX - Handle API response shape
      const lecturerArray = Array.isArray(json) ? json : json.data;
      
      console.log('Lecturers from API:', lecturerArray);
      setLecturers(lecturerArray || []);
    } catch (error) {
      console.error('Error loading lecturers:', error);
      setLecturers([]);
    }
  };

  // Load existing timetable
  const loadTimetable = async () => {
    try {
      setLoading(true);
      
      // Clear stale currentTimetableId
      localStorage.removeItem('currentTimetableId');
      
      // Cancel previous request if still pending
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      
      const response = await fetch(`${API_BASE}/api/studenttimetables/filter?year=${year}&semester=${semester}&batch=${batch}&specialization=${specialization}&group=${group}`, {
        signal: abortRef.current.signal
      });
      
      if (response.ok) {
        const data = await response.json();
        if (!abortRef.current?.signal.aborted) {
          if (data && data.sessions) {
            const withIds = (data.sessions || []).map((s: any) => ({
              ...s,
              sessionId: s.sessionId || uuid(), // Add sessionId if missing from DB
              startNum: timeToNumber(s.startTime),
              endNum: timeToNumber(s.endTime),
            }));
            setSessions(withIds);
            // Store current timetable ID for clash detection
            localStorage.setItem('currentTimetableId', data._id || '');
          } else {
            setSessions([]);
            localStorage.setItem('currentTimetableId', '');
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error loading timetable:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Save entire timetable
  const saveTimetable = async () => {
    setError(''); // Clear any existing error
    try {
      setLoading(true);
      
      // Sanitize sessions for API calls (remove UI-only fields)
      const sanitizedSessions = sessions.map(s => ({
        day: normalizeDayFull(s.day),
        startTime: s.startTime,
        endTime: s.endTime,
        lecturer: typeof s.lecturer === 'string' ? s.lecturer : s.lecturer._id,
        location: s.location,
        type: s.type,
        subject: s.subject
      }));
      
      // Call DB clash check first with current timetable ID
      const currentTimetableId = localStorage.getItem('currentTimetableId');
      const clashRes = await fetch(`${API_BASE}/api/studenttimetables/check-clash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessions: sanitizedSessions, 
          currentTimetableId 
        })
      });

      const clashData = await clashRes.json();

      if (clashData.clash) {
        const clashType = clashData.type || 'UNKNOWN';
        const clashMessage = clashData.message || 'Unknown clash detected';
        setError(`${clashType} CLASH: ${clashMessage} (${clashData.timetableInfo.year} ${clashData.timetableInfo.semester} ${clashData.timetableInfo.batch} ${clashData.timetableInfo.specialization} ${clashData.timetableInfo.group})`);
        setLoading(false);
        return;
      }

      const timetableData: TimeTable = {
        year,
        semester,
        batch,
        specialization,
        group,
        sessions: sanitizedSessions
      };

      const response = await fetch(`${API_BASE}/api/studenttimetables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(timetableData)
      });

      if (response.ok) {
        const saved = await response.json();
        localStorage.setItem('currentTimetableId', saved._id);
        alert('Timetable saved successfully!');
      } else {
        alert('Error saving timetable');
      }
    } catch (error) {
      console.error('Error saving timetable:', error);
      alert('Error saving timetable');
    } finally {
      setLoading(false);
    }
  };

  // Load master data on component mount
  useEffect(() => {
    loadMasterData();
  }, []);

  // Auto load timetable when filters change
  useEffect(() => {
    setSessions([]); // Clear sessions to prevent UI confusion
    loadTimetable();
  }, [year, semester, batch, specialization, group]);

  // Close modal if batch change makes current time invalid
  useEffect(() => {
    if (selectedCell) {
      const startNum = timeToNumber(selectedCell.time);
      const max = batch === 'WD' ? 17.5 : 20;

      if (startNum >= max) {
        closeModal();
      }
    }
  }, [batch]);

  // Auto-fix end time when start time changes
  useEffect(() => {
    if (!selectedCell) return;

    const start = timeToNumber(selectedCell.time);
    const end = timeToNumber(endTime);

    if (!endTime || end <= start) {
      const next = start + 1;
      setEndTime(timeToString(next));
    }
  }, [selectedCell]);

  // Filter invalid sessions when batch changes
  useEffect(() => {
    const max = batch === 'WD' ? 17.5 : 20;

    setSessions(prev =>
      prev.filter(s => timeToNumber(s.endTime) <= max)
    );
  }, [batch]);

  // Force re-render validation when day/time changes in modal
  useEffect(() => {
    // This effect forces re-evaluation of overlap checks when modal day/time changes
  }, [selectedCell?.day, selectedCell?.time]);

  // Ensure lecturers are loaded when modal opens
  useEffect(() => {
    if (showModal && lecturers.length === 0) {
      loadMasterData();
    }
  }, [showModal]);

  const timeSlots = generateTimeSlots(batch);
  const days = getDays();

  // Create lecturer map for efficient name lookup
  const lecturerMap = useMemo(() => {
    const map: Record<string, string> = {};
    lecturers.forEach(l => map[l._id] = l.name);
    return map;
  }, [lecturers]);

  // Build grid map ONCE for performance optimization (React safe)
  const gridMap = useMemo(() => {
    const map: Record<string, Session> = {};
    sessions.forEach(s => {
      const start = timeToNumber(s.startTime);
      const end = timeToNumber(s.endTime);
      for (let t = start; t < end; t += 0.5) {
        const key = `${normalizeDayFull(s.day)}-${timeToString(t)}`;
        map[key] = s;
      }
    });
    return map;
  }, [sessions, editingSession]);

  // Handle cell click
  const handleCellClick = (day: string, time: number) => {
    if (showModal) return; // Prevent rapid double clicks
    
    const existingSession = gridMap[`${normalizeDayFull(day)}-${timeToString(time)}`];
    
    if (existingSession) {
      // Edit existing session - use session's actual start time
      setEditingSession(existingSession);
      setSessionType(existingSession.type);
      setSubject(existingSession.subject);
      setLecturer(typeof existingSession.lecturer === 'string' ? existingSession.lecturer : existingSession.lecturer._id);
      setLocation(existingSession.location);
      setEndTime(existingSession.endTime);
    } else {
      // Add new session
      setEditingSession(null);
      setSessionType('LECTURE');
      setSubject('');
      setLecturer('');
      setLocation('');
      setEndTime(''); // Clear old endTime first
      const max = batch === 'WD' ? 17.5 : 20;
      const defaultEnd = Math.min(time + 1, max);
      setEndTime(timeToString(defaultEnd));
    }
    
    setSelectedCell({ 
      day,
      time: existingSession ? existingSession.startTime : timeToString(time)
    });
    setShowModal(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Visual Timetable Builder</h1>
        <p className="text-gray-600">Create and manage class schedules with drag-and-drop simplicity</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select 
              value={year} 
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Y1">Year 1</option>
              <option value="Y2">Year 2</option>
              <option value="Y3">Year 3</option>
              <option value="Y4">Year 4</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <select 
              value={semester} 
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="S1">Semester 1</option>
              <option value="S2">Semester 2</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
            <select 
              value={batch} 
              onChange={(e) => setBatch(e.target.value as 'WD' | 'WE')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="WD">Weekday (Mon-Fri)</option>
              <option value="WE">Weekend (Sat-Sun)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
            <select 
              value={specialization} 
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="SE">Software Engineering</option>
              <option value="CS">Computer Science</option>
              <option value="IT">Information Technology</option>
              <option value="DS">Data Science</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
            <select 
              value={group} 
              onChange={(e) => setGroup(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {["1.1","1.2","2.1","2.2","3.1","3.2","4.1","4.2","5.1","5.2"].map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Preview Card */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-blue-900">
            Preview for {year} {semester} {batch} {specialization} Group {group}
          </h3>
          <button
            onClick={loadTimetable}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            {loading ? 'Loading...' : 'Load Timetable'}
          </button>
        </div>
        <div className="text-sm text-blue-700 mb-3">
          Total Sessions: {sessions.length} | 
          Lectures: {sessions.filter(s => s.type === 'LECTURE').length} | 
          Labs: {sessions.filter(s => s.type === 'LAB').length}
        </div>
        
        {/* Session Preview List */}
        {sessions.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Scheduled Sessions:</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {[...sessions].sort((a, b) => {
                const dayOrder =
                  batch === 'WD'
                    ? ['Monday','Tuesday','Wednesday','Thursday','Friday']
                    : ['Saturday','Sunday'];
                if (a.day !== b.day) {
                  return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
                }
                return timeToNumber(a.startTime) - timeToNumber(b.startTime);
              }).map(session => (
                <div key={session.sessionId} className="text-xs bg-white px-2 py-1 rounded border border-blue-200">
                  <span className="font-medium">{session.day}</span> {session.startTime}-{session.endTime} 
                  <span className={`ml-2 px-1 rounded text-white text-xs ${session.type === 'LECTURE' ? 'bg-blue-500' : 'bg-green-500'}`}>
                    {session.type}
                  </span>
                  <span className="ml-2 font-medium">{session.subject}</span>
                  <span className="text-gray-600 ml-2">
                  {typeof session.lecturer === 'string'
                    ? lecturerMap[session.lecturer] || 'Loading...'
                    : session.lecturer.name
                  } @ {session.location}
                </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-white p-3 rounded-lg shadow-sm mb-6">
        <div className="flex gap-6 items-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-700">Lecture</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-700">Lab</span>
          </div>
          <div className="text-sm text-gray-500">
            Click any cell to add/edit session • Click colored session to edit/delete
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-700">{error}</span>
          <button 
            onClick={() => setError('')}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Timetable Grid */}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 bg-gray-100 px-4 py-2 text-left font-medium text-gray-900">Time</th>
              {days.map(day => (
                <th key={day} className="border border-gray-300 bg-gray-100 px-4 py-2 text-center font-medium text-gray-900">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(time => (
              <tr key={time}>
                <td className="border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
                  {formatTime(time)}
                </td>
                {days.map(day => {
                  const session = gridMap[`${day}-${timeToString(time)}`];
                  return (
                    <td 
                      key={`${day}-${time}`}
                      className="border border-gray-300 px-2 py-1 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleCellClick(day, time)}
                    >
                      {session && (
                        <div 
                          className={`p-2 rounded text-xs text-white font-medium ${
                            session.type === 'LECTURE' ? 'bg-blue-500' : 'bg-green-500'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCellClick(day, time);
                          }}
                        >
                          <div>
                            <div className="font-semibold">{session.subject}</div>
                            <div>
                              {typeof session.lecturer === 'string'
                                ? lecturerMap[session.lecturer] || 'Loading...'
                                : session.lecturer?.name
                              }
                            </div>
                            <div>{session.location}</div>
                          </div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end gap-4">
        <button
          onClick={() => navigate(`/timetable-print/${year}/${semester}/${batch}/${specialization}/${group}`)}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Save size={20} />
          Print View
        </button>
        <button
          onClick={saveTimetable}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save size={20} />
          Save Timetable
        </button>
      </div>

      {/* Session Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative z-50 pointer-events-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingSession ? 'Edit Session' : 'Add Session'}
              </h3>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Type</label>
                <select 
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value as 'LECTURE' | 'LAB')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LECTURE">Lecture</option>
                  <option value="LAB">Lab</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input 
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Data Structures"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lecturer</label>
                <select
                  value={lecturer}
                  onChange={(e) => setLecturer(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Lecturer</option>
                  {Array.isArray(lecturers) && lecturers.map(l => (
                    <option key={l._id} value={l._id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter Location"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                <select
                  value={selectedCell?.day}
                  onChange={(e) =>
                    setSelectedCell(prev => prev ? { ...prev, day: e.target.value } : null)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {days.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <select
                  value={selectedCell?.time}
                  onChange={(e) => setSelectedCell(prev => prev ? { ...prev, time: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeSlots.map(t => (
                    <option key={t} value={timeToString(t)}>
                      {formatTime(t)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <select 
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeSlots
                    .filter(t => t > timeToNumber(selectedCell?.time || '08:00'))
                    .map(t => (
                      <option key={t} value={timeToString(t)}>
                        {formatTime(t)}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex justify-between gap-3 mt-6">
              {editingSession && (
                <button
                  onClick={deleteSession}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              )}
              <div className="flex gap-3 ml-auto">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSession}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save size={16} />
                  {editingSession ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Session {
  sessionId: string;
  day: string;
  startTime: string;
  endTime: string;
  type: 'LECTURE' | 'LAB';
  subject: string;
  lecturer: string;
  location: string;
}

interface TimeTable {
  year: string;
  semester: string;
  batch: 'WD' | 'WE';
  specialization: string;
  group: string;
  sessions: Session[];
}

export default function TimetablePrintPage() {
  const { year, semester, batch, specialization, group } = useParams();
  const navigate = useNavigate();
  const [timetable, setTimetable] = useState<TimeTable | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTimetable = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/studenttimetables/filter?year=${year}&semester=${semester}&batch=${batch}&specialization=${specialization}&group=${group}`);
        
        if (response.ok) {
          const raw = await response.json();

          const sessionsArray = Array.isArray(raw.sessions) ? raw.sessions : [];

          const mappedSessions: Session[] = sessionsArray.map((s: any) => ({
            sessionId: s._id,
            day: s.day.trim().charAt(0).toUpperCase() + s.day.trim().slice(1).toLowerCase(),
            startTime: normalizeTimeString(s.startTime),
            endTime: normalizeTimeString(s.endTime),
            type: s.type,
            subject: s.subject,
            lecturer:
            typeof s.lecturer === 'object'
              ? s.lecturer?.name
              : s.lecturer || 'N/A',
            location: s.location
          }));

          setTimetable({
            year: raw.year,
            semester: raw.semester,
            batch: raw.batch,
            specialization: raw.specialization,
            group: raw.group,
            sessions: mappedSessions
          });
        }
      } catch (error) {
        console.error('Error loading timetable:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTimetable();
  }, [year, semester, batch, specialization, group]);

  const generateTimeSlots = (batchType: 'WD' | 'WE') => {
    const end = batchType === 'WD' ? 17.5 : 20;
    let slots = [];
    for (let t = 8; t < end; t += 0.5) {
      slots.push(t);
    }
    return slots;
  };

  const getDays = () => {
    return batch === 'WD' 
      ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      : ['Saturday', 'Sunday'];
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time);
    const minutes = (time % 1) * 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes === 0 ? '00' : '30'} ${period}`;
  };

  const timeToString = (time: number) => {
    const hours = Math.floor(time);
    const minutes = (time % 1) * 60;
    return `${hours.toString().padStart(2, '0')}:${minutes === 0 ? '00' : '30'}`;
  };

  const timeToNumber = (timeStr: string) => {
    const clean = timeStr.trim();           // remove spaces
    const [h, m] = clean.split(':');

    const hours = parseInt(h, 10);
    const minutes = parseInt(m, 10);

    if (isNaN(hours) || isNaN(minutes)) return -1;

    return hours + minutes / 60;
  };

  const normalizeDayFull = (d: string) => {
    const x = d.trim().toLowerCase();

    if (x.startsWith('mon')) return 'monday';
    if (x.startsWith('tue')) return 'tuesday';
    if (x.startsWith('wed')) return 'wednesday';
    if (x.startsWith('thu')) return 'thursday';
    if (x.startsWith('fri')) return 'friday';
    if (x.startsWith('sat')) return 'saturday';
    if (x.startsWith('sun')) return 'sunday';

    return x;
  };

  const normalizeTimeString = (t: string) => {
    // remove seconds if exist (08:00:00 -> 08:00)
    if (t.includes(':')) {
      const parts = t.split(':');
      return `${parts[0].padStart(2,'0')}:${parts[1].padStart(2,'0')}`;
    }

    // handle 8.30 , 8.00
    if (t.includes('.')) {
      const [h, m] = t.split('.');
      return `${h.padStart(2,'0')}:${m === '5' ? '30' : '00'}`;
    }

    return t;
  };

  const getSlotsBetween = (start: number, end: number) => {
    let arr = [];
    for (let t = start; t < end; t += 0.5) {
      arr.push(t);
    }
    return arr;
  };

  // Pre-build grid map for performance optimization
  const gridMap = useMemo(() => {
    const map: { [key: string]: Session } = {};

    if (!timetable) return map;

    timetable.sessions.forEach(s => {
      const start = timeToNumber(s.startTime);
      const end = timeToNumber(s.endTime);

      if (start === -1 || end === -1) return;

      getSlotsBetween(start, end).forEach(t => {
        map[`${normalizeDayFull(s.day)}-${timeToString(t)}`] = s;
      });
    });

    return map;
  }, [timetable]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading timetable...</div>
      </div>
    );
  }

  if (!timetable) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 mb-4">Timetable not found</div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const timeSlots = generateTimeSlots(timetable.batch);
  const days = getDays();

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Header - Hidden in print */}
      <div className="print:hidden bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <h1 className="text-xl font-bold text-gray-900">Timetable Print View</h1>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Printer size={20} />
            Print
          </button>
        </div>
      </div>

      {/* Printable Content */}
      <div className="p-8 max-w-7xl mx-auto">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {timetable.year} {timetable.semester} {timetable.batch} {timetable.specialization} Group {timetable.group}
          </h1>
          <p className="text-gray-600">Class Timetable</p>
          <p className="text-sm text-gray-500 mt-2">
            Generated on {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-8 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-700">Lecture</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-700">Lab</span>
          </div>
        </div>

        {/* Timetable Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
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
                    const session = gridMap[`${normalizeDayFull(day)}-${timeToString(time)}`];
                    return (
                      <td 
                        key={`${day}-${time}`}
                        className="border border-gray-300 px-2 py-1"
                      >
                        {session && (
                          <div 
                            className={`p-2 rounded text-xs text-white font-medium ${
                              session.type === 'LECTURE' ? 'bg-blue-500' : 'bg-green-500'
                            }`}
                          >
                            <div className="font-semibold">{session.subject}</div>
                            <div>{session.lecturer}</div>
                            <div>{session.location}</div>
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

        {/* Summary */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Total Sessions: {timetable.sessions.length} | 
            Lectures: {timetable.sessions.filter(s => s.type === 'LECTURE').length} | 
            Labs: {timetable.sessions.filter(s => s.type === 'LAB').length}
          </p>
        </div>
      </div>

      <style>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .bg-blue-500 {
            background-color: #3b82f6 !important;
          }
          
          .bg-green-500 {
            background-color: #10b981 !important;
          }
          
          .bg-gray-100 {
            background-color: #f3f4f6 !important;
          }
          
          .border-gray-300 {
            border-color: #d1d5db !important;
          }
        }
      `}</style>
    </div>
  );
}

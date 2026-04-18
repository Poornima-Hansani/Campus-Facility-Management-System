import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import '../styles/adminDashboard.css';
import '../styles/timetablePresentation.css';

interface LabSession {
  start: number;
  end: number;
  year: string;
  semester: string;
  batch: string;
  specialization: string;
  group: string;
  lecturerName: string;
  subject: string;
}

interface DaySchedule {
  busy: LabSession[];
  free: { start: number; end: number }[];
}

interface LabTimetable {
  _id: string;
  labName: string;
  days: {
    Monday: DaySchedule;
    Tuesday: DaySchedule;
    Wednesday: DaySchedule;
    Thursday: DaySchedule;
    Friday: DaySchedule;
    Saturday: DaySchedule;
    Sunday: DaySchedule;
  };
  lastUpdated: string;
}

const LabTimetableList: React.FC = () => {
  const [labTimetables, setLabTimetables] = useState<LabTimetable[]>([]);
  const [filteredTimetables, setFilteredTimetables] = useState<LabTimetable[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRangeFilter, setTimeRangeFilter] = useState<string>('all');

  useEffect(() => {
    fetchLabTimetables();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [labTimetables, searchTerm, timeRangeFilter]);

  const applyFilters = () => {
    let filtered = [...labTimetables];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lab =>
        lab.labName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Time range filter
    if (timeRangeFilter !== 'all') {
      filtered = filtered.map(lab => {
        const filteredDays = { ...lab.days };
        Object.keys(filteredDays).forEach(day => {
          if (timeRangeFilter === 'morning') {
            filteredDays[day as keyof typeof lab.days] = {
              ...filteredDays[day as keyof typeof lab.days],
              busy: filteredDays[day as keyof typeof lab.days].busy.filter(session => session.start < 12),
              free: filteredDays[day as keyof typeof lab.days].free.filter(slot => slot.end <= 12)
            };
          } else if (timeRangeFilter === 'afternoon') {
            filteredDays[day as keyof typeof lab.days] = {
              ...filteredDays[day as keyof typeof lab.days],
              busy: filteredDays[day as keyof typeof lab.days].busy.filter(session => session.start >= 12 && session.start < 17),
              free: filteredDays[day as keyof typeof lab.days].free.filter(slot => slot.start >= 12 && slot.end <= 17)
            };
          } else if (timeRangeFilter === 'evening') {
            filteredDays[day as keyof typeof lab.days] = {
              ...filteredDays[day as keyof typeof lab.days],
              busy: filteredDays[day as keyof typeof lab.days].busy.filter(session => session.start >= 17),
              free: filteredDays[day as keyof typeof lab.days].free.filter(slot => slot.start >= 17)
            };
          }
        });
        return { ...lab, days: filteredDays };
      });
    }

    setFilteredTimetables(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTimeRangeFilter('all');
  };

  const fetchLabTimetables = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/labtimetable');
      const data = await response.json();
      setLabTimetables(data);
    } catch (error) {
      console.error('Error fetching lab timetables:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: number): string => {
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const getTotalFreeHours = (daySchedule: DaySchedule): number => {
    return daySchedule.free.reduce((total, slot) => total + (slot.end - slot.start), 0);
  };

  const getTotalBusyHours = (daySchedule: DaySchedule): number => {
    return daySchedule.busy.reduce((total, session) => total + (session.end - session.start), 0);
  };

  const getUtilizationRate = (daySchedule: DaySchedule): number => {
    const totalHours = getTotalFreeHours(daySchedule) + getTotalBusyHours(daySchedule);
    return totalHours > 0 ? (getTotalBusyHours(daySchedule) / totalHours) * 100 : 0;
  };

  if (loading) {
    return (
      <Layout>
        <div className="admin-dashboard-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading lab timetables...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="timetable-presentation">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${((filteredTimetables.length > 0 ? 100 : 0))}%` }}></div>
        </div>
        
        <div className="presentation-container">
          <div className="presentation-header">
            <h1 className="presentation-title slide-top">Laboratory Timetables</h1>
            <p className="presentation-subtitle slide-bottom delay-200">
              Advanced Laboratory Management System - {new Date().getFullYear()}
            </p>
          </div>

          <div className="stats-container">
            <div className="stat-card slide-left delay-300">
              <div className="stat-number">{labTimetables.length}</div>
              <div className="stat-label">Total Labs</div>
            </div>
            <div className="stat-card slide-right delay-400">
              <div className="stat-number">{filteredTimetables.length}</div>
              <div className="stat-label">Filtered Labs</div>
            </div>
            <div className="stat-card slide-top delay-500">
              <div className="stat-number">
                {filteredTimetables.reduce((acc, lab) => 
                  acc + Object.values(lab.days).reduce((dayAcc, day) => 
                    dayAcc + day.busy.length + day.free.length, 0
                  ), 0
                )}
              </div>
              <div className="stat-label">Total Sessions</div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="timetable-card slide-top delay-300">
            <div className="p-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Search Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">{'\ud83d\udd0d'}</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search lab..."
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 w-40"
                  />
                </div>

                {/* Time Range Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">{'\ud83d\udd50'}</span>
                  <select
                    value={timeRangeFilter}
                    onChange={(e) => setTimeRangeFilter(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="all">All Day</option>
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                  </select>
                </div>

                {/* Clear Filters Button */}
                <button
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 text-sm rounded-md hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center gap-1"
                >
                  <span>{'\ud83d\udd04'}</span>
                  Clear
                </button>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="presentation-loading">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <>
              {filteredTimetables.length === 0 ? (
                <div className="timetable-card flip-in">
                  <div className="timetable-header">
                    <h2 className="timetable-title">No Lab Timetables Found</h2>
                    <p className="timetable-info">No laboratories match your current search criteria</p>
                  </div>
                  <div className="p-6 text-center">
                    <div className="text-6xl mb-4">{'\ud83d\udd2c'}</div>
                    <button 
                      onClick={clearFilters}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-full font-semibold hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {filteredTimetables.map((lab, labIndex) => (
                    <div 
                      key={lab._id} 
                      className={`timetable-card ${labIndex % 2 === 0 ? 'slide-left' : 'slide-right'} delay-${(labIndex * 100) + 700}`}
                    >
                      <div className="timetable-header">
                        <div className="timetable-title">
                          <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <span className="text-4xl">{'\ud83c\udfe2'}</span>
                            {lab.labName}
                          </h2>
                          <p className="text-green-100">Advanced Laboratory Management System</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl mb-2">{'\ud83d\udd50'}</div>
                          <div className="text-lg font-bold text-white">
                            {new Date(lab.lastUpdated).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {Object.entries(lab.days).map(([day, schedule], dayIndex) => {
                            const freeHours = getTotalFreeHours(schedule);
                            const busyHours = getTotalBusyHours(schedule);
                            const utilizationRate = getUtilizationRate(schedule);
                            const hasActivity = schedule.busy.length > 0 || schedule.free.length > 0;
                            
                            return (
                              <div
                                key={day}
                                className={`day-card ${dayIndex % 4 === 0 ? 'zoom-rotate' : dayIndex % 4 === 1 ? 'flip-in' : dayIndex % 4 === 2 ? 'slide-top' : 'slide-bottom'} delay-${(dayIndex * 100) + 900}`}
                              >
                                <div className="day-header">
                                  <div className="day-icon">
                                    {day === 'Monday' ? 'M' : 
                                     day === 'Tuesday' ? 'T' : 
                                     day === 'Wednesday' ? 'W' : 
                                     day === 'Thursday' ? 'Th' : 
                                     day === 'Friday' ? 'F' : 
                                     day === 'Saturday' ? 'Sa' : 'Su'}
                                  </div>
                                  <div>
                                    <h3 className="text-xl font-bold">{day}</h3>
                                    <p className="text-sm opacity-75">{utilizationRate.toFixed(0)}% Utilized</p>
                                  </div>
                                </div>
                                
                                <div className="space-y-3 mt-4">
                                  {hasActivity ? (
                                    <>
                                      {/* Stats */}
                                      <div className="flex gap-2 text-sm">
                                        <div className="flex-1 bg-green-50 rounded-lg p-2 text-center">
                                          <div className="font-bold text-green-700">{freeHours.toFixed(1)}h</div>
                                          <div className="text-xs text-green-600">Free</div>
                                        </div>
                                        <div className="flex-1 bg-red-50 rounded-lg p-2 text-center">
                                          <div className="font-bold text-red-700">{busyHours.toFixed(1)}h</div>
                                          <div className="text-xs text-red-600">Busy</div>
                                        </div>
                                      </div>
                                      
                                      {/* Busy Sessions */}
                                      {schedule.busy.length > 0 && (
                                        <div className="space-y-2">
                                          <div className="text-sm font-semibold text-red-600 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                            Busy ({schedule.busy.length})
                                          </div>
                                          {schedule.busy.slice(0, 2).map((session, idx) => (
                                            <div key={idx} className="session-card lab-card">
                                              <div className="session-time">
                                                <span>{formatTime(session.start)} - {formatTime(session.end)}</span>
                                              </div>
                                              <div className="session-subject">{session.subject}</div>
                                              <div className="session-details text-xs">
                                                {session.lecturerName} | {session.batch}
                                              </div>
                                            </div>
                                          ))}
                                          {schedule.busy.length > 2 && (
                                            <div className="text-xs text-red-600 text-center">
                                              +{schedule.busy.length - 2} more sessions
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      
                                      {/* Free Slots */}
                                      {schedule.free.length > 0 && (
                                        <div className="space-y-2">
                                          <div className="text-sm font-semibold text-green-600 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                            Available ({schedule.free.length})
                                          </div>
                                          {schedule.free.slice(0, 2).map((slot, idx) => (
                                            <div key={idx} className="session-card free-slot">
                                              <div className="session-time">
                                                <span>{formatTime(slot.start)} - {formatTime(slot.end)}</span>
                                              </div>
                                              <div className="session-details text-xs">
                                                Available for booking
                                              </div>
                                            </div>
                                          ))}
                                          {schedule.free.length > 2 && (
                                            <div className="text-xs text-green-600 text-center">
                                              +{schedule.free.length - 2} more slots
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <div className="text-center py-8 text-gray-500">
                                      <div className="text-3xl mb-2">{'\ud83d\udcc5'}</div>
                                      <div className="text-sm font-medium">No Activity</div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LabTimetableList;
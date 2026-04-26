import React, { useState } from "react";
import Layout from "../components/Layout";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Plus, CheckCircle2, Circle, X } from "lucide-react";

// Dummy Data
const chartData = [
  { name: 'Jan', completed: 22 },
  { name: 'Feb', completed: 28 },
  { name: 'Mar', completed: 5 },
  { name: 'Apr', completed: 18 },
  { name: 'May', completed: 23 },
  { name: 'Jun', completed: 20 },
  { name: 'Jul', completed: 10 },
  { name: 'Aug', completed: 8 },
  { name: 'Sep', completed: 22 },
  { name: 'Oct', completed: 35 },
  { name: 'Nov', completed: 12 },
  { name: 'Dec', completed: 25 },
];

const initialHistoryData = [
  { name: "Book Reading", date: "Aug. 7, 2022", period: "Short Term", status: "Completed" },
  { name: "Savings", date: "Jan. 7, 2023", period: "Long Term", status: "Ongoing" },
  { name: "Workout", date: "Feb. 12, 2023", period: "Short Term", status: "Completed" },
  { name: "Learn a Skill", date: "Mar. 1, 2023", period: "Long Term", status: "Ongoing" },
];

const initialProgressData = [
  { name: "Book Reading", current: 10, total: 10, label: "Days" },
  { name: "Workout", current: 20, total: 30, label: "Days" },
  { name: "Learn a Skill", current: 10, total: 60, label: "Days" },
  { name: "Savings ($2,000)", current: 15, total: 60, label: "Days" },
];

const StudyGoalsPage = () => {
  const [historyList, setHistoryList] = useState(initialHistoryData);
  const [progressList, setProgressList] = useState(initialProgressData);
  const [showModal, setShowModal] = useState(false);
  const [totalGoals, setTotalGoals] = useState(30);
  const [activeGoals, setActiveGoals] = useState(8);
  
  const [formData, setFormData] = useState({
    name: "",
    total: 30,
    period: "Short Term",
    date: "",
    time: ""
  });

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.date || !formData.time) return;

    // Add to Progress List
    const newProgress = {
      name: formData.name,
      current: 0,
      total: formData.total,
      label: "Days"
    };
    
    // Add to History List
    const goalDate = new Date(formData.date);
    const newHistory = {
      name: formData.name,
      date: goalDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      period: formData.period,
      status: "Ongoing"
    };

    // Save to localStorage for TaskDashboardPage
    const savedEvents = JSON.parse(localStorage.getItem('customAcademicEvents') || '[]');
    const newEvent = {
      date: goalDate.getDate(),
      month: goalDate.getMonth(),
      year: goalDate.getFullYear(),
      title: formData.name,
      type: "Study Goal",
      time: formData.time,
      color: "bg-teal-50 text-teal-600"
    };
    localStorage.setItem('customAcademicEvents', JSON.stringify([...savedEvents, newEvent]));

    setProgressList([newProgress, ...progressList]);
    setHistoryList([newHistory, ...historyList]);
    setTotalGoals(prev => prev + 1);
    setActiveGoals(prev => prev + 1);
    
    // Reset and close
    setFormData({ name: "", total: 30, period: "Short Term", date: "", time: "" });
    setShowModal(false);
  };

  return (
    <Layout>
      {/* Modal overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-teal-100">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-teal-600 transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-teal-950 mb-2">Create New Goal</h2>
            <p className="text-teal-700 text-sm mb-6">Set a new target and track your consistency.</p>
            
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-teal-900 mb-1">Goal Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Learn Python"
                  className="w-full bg-teal-50 border border-teal-200 text-teal-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-teal-300"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-teal-900 mb-1">Target Days</label>
                  <input 
                    type="number" 
                    required
                    min={1}
                    className="w-full bg-teal-50 border border-teal-200 text-teal-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={formData.total}
                    onChange={e => setFormData({...formData, total: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-teal-900 mb-1">Period</label>
                  <select 
                    className="w-full bg-teal-50 border border-teal-200 text-teal-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={formData.period}
                    onChange={e => setFormData({...formData, period: e.target.value})}
                  >
                    <option value="Short Term">Short Term</option>
                    <option value="Long Term">Long Term</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-teal-900 mb-1">Date</label>
                  <input 
                    type="date" 
                    required
                    className="w-full bg-teal-50 border border-teal-200 text-teal-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-teal-900 mb-1">Time</label>
                  <input 
                    type="time" 
                    required
                    className="w-full bg-teal-50 border border-teal-200 text-teal-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-teal-500 to-green-500 text-white font-bold py-4 rounded-xl mt-4 shadow-lg hover:shadow-teal-500/30 transform hover:-translate-y-0.5 transition-all"
              >
                Start Tracking Goal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Light Theme Container */}
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 p-6 text-gray-800 font-sans mt-4 rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Top Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          
          {/* Highlighted Total Goals Card */}
          <div className="bg-gradient-to-br from-teal-400 to-green-500 rounded-xl p-6 flex flex-col justify-center items-center shadow-lg relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-20 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
            <p className="text-teal-900 font-semibold text-sm mb-1 relative z-10">Total Goals</p>
            <h2 className="text-5xl font-bold text-teal-950 tracking-tight relative z-10">{totalGoals}</h2>
          </div>

          <div className="bg-teal-50 border border-teal-100 rounded-xl p-6 flex flex-col justify-center items-center shadow-sm hover:border-teal-200 transition-colors">
            <p className="text-teal-700 text-sm mb-1">Active Goals</p>
            <h2 className="text-4xl font-bold text-teal-950 tracking-tight">{activeGoals}</h2>
          </div>

          <div className="bg-teal-50 border border-teal-100 rounded-xl p-6 flex flex-col justify-center items-center shadow-sm hover:border-teal-200 transition-colors">
            <p className="text-teal-700 text-sm mb-1">Goal in progress</p>
            <h2 className="text-4xl font-bold text-teal-950 tracking-tight">13</h2>
          </div>

          <div className="bg-teal-50 border border-teal-100 rounded-xl p-6 flex flex-col justify-center items-center shadow-sm hover:border-teal-200 transition-colors">
            <p className="text-teal-700 text-sm mb-1">Completed</p>
            <h2 className="text-4xl font-bold text-teal-950 tracking-tight">11</h2>
          </div>

          <div className="bg-teal-50 border border-teal-100 rounded-xl p-6 flex flex-col justify-center items-center shadow-sm hover:border-teal-200 transition-colors">
            <p className="text-teal-700 text-sm mb-1">Canceled</p>
            <h2 className="text-4xl font-bold text-teal-950 tracking-tight">02</h2>
          </div>

          {/* Create Goal Card */}
          <button 
            onClick={() => setShowModal(true)}
            className="bg-teal-50 border border-teal-100 rounded-xl p-6 flex flex-col justify-center items-center hover:bg-teal-100 shadow-sm transition-all cursor-pointer group"
          >
            <p className="text-teal-700 text-sm mb-2 group-hover:text-teal-900 transition-colors">Create New Goal</p>
            <Plus size={40} strokeWidth={2} className="text-teal-500 group-hover:text-teal-700 transition-colors" />
          </button>
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Chart Container (Takes up 2 columns) */}
          <div className="lg:col-span-2 bg-teal-50 border border-teal-100 rounded-xl p-6 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold text-teal-950">Overview</h3>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
                    <span className="text-xs text-teal-700 font-medium">Task Completed</span>
                 </div>
                 <select className="bg-white border border-teal-200 text-teal-800 font-medium text-sm rounded-lg px-3 py-1 outline-none focus:border-teal-500 shadow-sm">
                   <option>Monthly</option>
                   <option>Weekly</option>
                 </select>
              </div>
            </div>
            
            <div className="flex-1 w-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccfbf1" />
                  <XAxis dataKey="name" stroke="#0f766e" tick={{ fill: '#0f766e', fontSize: 12, fontWeight: 500 }} tickLine={false} axisLine={false} />
                  <YAxis stroke="#0f766e" tick={{ fill: '#0f766e', fontSize: 12, fontWeight: 500 }} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#2dd4bf', borderRadius: '8px', border: 'none', color: '#134e4a', fontWeight: 'bold' }}
                    itemStyle={{ color: '#134e4a' }}
                    cursor={{ stroke: '#0f766e', strokeWidth: 1, strokeDasharray: '5 5' }}
                  />
                  <Line type="monotone" dataKey="completed" stroke="#2dd4bf" strokeWidth={4} dot={false} activeDot={{ r: 6, fill: '#2dd4bf', stroke: '#134e4a', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* This Month's Goal */}
          <div className="bg-teal-50 border border-teal-100 rounded-xl p-6 flex flex-col shadow-sm">
            <h3 className="text-lg font-bold text-teal-950 mb-2">This Month's Goal</h3>
            <p className="text-xs text-teal-700 font-medium mb-8 leading-relaxed">
              A percentage of goals successfully accomplished for this current month.
            </p>
            
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative w-40 h-40">
                {/* Custom SVG Circular Progress */}
                <svg className="w-full h-full transform -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ccfbf1" strokeWidth="8" />
                  {/* Progress Circle (44%) - Circumference is ~251 */}
                  <circle 
                    cx="50" cy="50" r="40" 
                    fill="transparent" 
                    stroke="#2dd4bf" 
                    strokeWidth="8" 
                    strokeDasharray="251.2" 
                    strokeDashoffset={251.2 - (251.2 * 0.44)} 
                    strokeLinecap="round" 
                  />
                </svg>
                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-teal-950">44%</span>
                </div>
              </div>
            </div>

            <button className="text-xs text-teal-600 hover:text-teal-800 text-left mt-4 font-bold transition-colors">
              Want to view?
            </button>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* History Table */}
          <div className="bg-teal-50 border border-teal-100 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-teal-950 mb-6">History</h3>
            
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-teal-700 text-xs font-bold border-b border-teal-200">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Period</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {historyList.map((item, idx) => (
                    <tr key={idx} className="border-b border-teal-100 hover:bg-white/60 transition-colors">
                      <td className="py-4 font-bold text-teal-950">{item.name}</td>
                      <td className="py-4 text-teal-700 font-medium">{item.date}</td>
                      <td className="py-4 text-teal-700 font-medium">{item.period}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          item.status === 'Completed' ? 'text-green-700 border-green-200 bg-green-100' : 'text-teal-700 border-teal-200 bg-teal-100'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Goal Progress List */}
          <div className="bg-teal-50 border border-teal-100 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-teal-950 mb-6">Goal Progress</h3>
            
            <div className="space-y-6">
              {progressList.map((item, idx) => {
                const percentage = (item.current / item.total) * 100;
                
                return (
                  <div key={idx} className="group cursor-pointer">
                    <div className="flex items-center gap-4 mb-2">
                       <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-teal-500 border border-teal-200 group-hover:border-teal-400 group-hover:shadow-sm transition-all">
                          {percentage === 100 ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                       </div>
                       <div className="flex-1 flex justify-between items-center">
                          <span className="text-sm font-bold text-teal-950 group-hover:text-teal-700 transition-colors">{item.name}</span>
                          <span className="text-xs font-bold text-teal-600">
                             {item.current}/{item.total} <span className="font-medium text-teal-500">{item.label}</span>
                          </span>
                       </div>
                    </div>
                    {/* Progress Bar Container */}
                    <div className="pl-12">
                       <div className="w-full bg-teal-100/50 rounded-full h-2 overflow-hidden shadow-inner">
                         <div 
                           className="bg-gradient-to-r from-teal-400 to-green-400 h-2 rounded-full" 
                           style={{ width: `${percentage}%` }}
                         ></div>
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default StudyGoalsPage;

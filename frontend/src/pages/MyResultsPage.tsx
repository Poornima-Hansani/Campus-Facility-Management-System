import React from 'react';
import Layout from '../components/Layout';
import { Award, BookOpen, CheckCircle, ChevronRight } from 'lucide-react';

const MyResultsPage = () => {
  const results = [
    { module: "Database Systems", code: "CS301", grade: "A", credits: 4, status: "Passed" },
    { module: "Software Engineering", code: "CS302", grade: "A-", credits: 3, status: "Passed" },
    { module: "Computer Networks", code: "CS303", grade: "B+", credits: 3, status: "Passed" },
    { module: "Algorithms", code: "CS304", grade: "A", credits: 4, status: "Passed" },
    { module: "Operating Systems", code: "CS305", grade: "B", credits: 3, status: "Passed" },
  ];

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto bg-slate-50 min-h-[calc(100vh-80px)] pb-20 shadow-xl border border-gray-100 rounded-3xl overflow-hidden relative mt-4">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-teal-500 to-green-500 p-8 md:p-12 rounded-b-3xl shadow-lg relative overflow-hidden text-white mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full transform translate-x-1/4 -translate-y-1/4 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold mb-3 flex items-center justify-center md:justify-start gap-3"><Award size={36}/> High Achiever!</h1>
              <p className="text-teal-50 text-base md:text-lg leading-relaxed opacity-90 max-w-2xl mx-auto md:mx-0">Every grade is a stepping stone. Be proud of your progress and keep aiming higher!</p>
            </div>
            
            <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 flex gap-6 md:gap-12 text-center border border-white/20 shadow-sm w-full md:w-auto">
              <div className="flex-1 md:flex-none md:min-w-[120px]">
                <p className="text-4xl font-bold tracking-tight">3.65</p>
                <p className="text-xs uppercase tracking-wider font-bold text-teal-100 mt-2">Cumulative GPA</p>
              </div>
              <div className="w-px bg-white/20"></div>
              <div className="flex-1 md:flex-none md:min-w-[120px]">
                <p className="text-4xl font-bold tracking-tight">17</p>
                <p className="text-xs uppercase tracking-wider font-bold text-teal-100 mt-2">Credits Earned</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-teal-100 text-teal-600 rounded-2xl">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Semester Grades</h2>
              <p className="text-xs text-gray-400 font-medium">Your recent modules</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {results.map((item, idx) => (
              <div key={idx} className="bg-teal-50 rounded-2xl p-5 shadow-sm border border-teal-100 flex items-center justify-between hover:border-teal-300 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{item.code}</span>
                    <span className="text-[10px] uppercase font-bold text-teal-500 tracking-wider flex items-center gap-1">
                      <CheckCircle size={12} /> {item.status}
                    </span>
                  </div>
                  <p className="font-bold text-gray-800 text-base">{item.module}</p>
                  <p className="text-sm text-gray-500 font-medium">{item.credits} Credits</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xl border border-teal-100 group-hover:bg-teal-500 group-hover:text-white transition-colors shadow-inner">
                    {item.grade}
                  </div>
                  <ChevronRight size={20} className="text-gray-300 group-hover:text-teal-400 transform group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default MyResultsPage;

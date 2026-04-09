import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ShieldCheck } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const FloatingLeaves = () => (
  <div className="floating-leaves">
    <svg className="leaf leaf-1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 C30 25, 10 50, 50 95 C90 50, 70 25, 50 5Z" fill="currentColor"/>
    </svg>
    <svg className="leaf leaf-2" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 C30 25, 10 50, 50 95 C90 50, 70 25, 50 5Z" fill="currentColor"/>
    </svg>
    <svg className="leaf leaf-3" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 C30 25, 10 50, 50 95 C90 50, 70 25, 50 5Z" fill="currentColor"/>
    </svg>
    <svg className="leaf leaf-4" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 C30 25, 10 50, 50 95 C90 50, 70 25, 50 5Z" fill="currentColor"/>
    </svg>
    <svg className="leaf leaf-5" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 C30 25, 10 50, 50 95 C90 50, 70 25, 50 5Z" fill="currentColor"/>
    </svg>
    <svg className="leaf leaf-6" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 C30 25, 10 50, 50 95 C90 50, 70 25, 50 5Z" fill="currentColor"/>
    </svg>
    <svg className="leaf leaf-7" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 C30 25, 10 50, 50 95 C90 50, 70 25, 50 5Z" fill="currentColor"/>
    </svg>
    <svg className="leaf leaf-8" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 C30 25, 10 50, 50 95 C90 50, 70 25, 50 5Z" fill="currentColor"/>
    </svg>
    <div className="branch branch-1">
      <svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 300 Q80 250 60 200 Q40 150 20 100" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round"/>
        <path d="M60 200 Q90 180 120 160" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <path d="M40 150 Q70 130 100 110" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round"/>
      </svg>
    </div>
    <div className="branch branch-2">
      <svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 300 Q120 250 140 200 Q160 150 180 100" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round"/>
        <path d="M140 200 Q110 180 80 160" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <path d="M160 150 Q130 130 100 110" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round"/>
      </svg>
    </div>
  </div>
);

export default function RegisterPage() {
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState<any>({
    name: '',
    email: '',
    password: '',
    phone: '',
    faculty: '',
    year: '',
    semester: '',
    scheduleType: 'Weekday',
    moduleCode: '',
    moduleName: '',
    department: '',
    jobType: ''
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const payload: any = {
        role,
        name: formData.name,
        email: formData.email,
        password: formData.password
      };

      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccessMsg(`Registration successful! Your Unique Login ID is: ${data.userId}`);
      setTimeout(() => navigate('/login'), 5000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <FloatingLeaves />
      
      <div className="relative z-10 flex flex-col justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link to="/" className="flex justify-center">
            <img src="/logo.png" alt="UniManage Logo" className="h-20 w-auto" />
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
             Or{' '}
             <Link to="/login" className="font-medium text-teal-600 hover:text-teal-500 transition-colors">
               sign in to an existing account
             </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/80 backdrop-blur-sm py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-white/50">
            
            {successMsg ? (
              <div className="text-center py-6 animate-fadeIn">
                <ShieldCheck className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-bold text-gray-900">Success!</h3>
                <p className="mt-2 text-gray-600 bg-green-50 p-4 border border-green-200 rounded-xl font-mono text-xl">{successMsg}</p>
                <p className="mt-4 text-sm text-gray-500">Please save this ID. Redirecting to login...</p>
                <Link to="/login" className="mt-6 inline-block text-teal-600 font-bold hover:underline">Go to Login Now</Link>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleRegister}>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm animate-shake">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Select Role</label>
                  <select 
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base text-gray-900 border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-lg bg-white/90"
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="student">Student</option>
                    <option value="lecturer">Lecturer</option>
                    <option value="management">Management</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <input 
                    required 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    placeholder="Full Name" 
                    className="flex-1 appearance-none border border-gray-300 rounded-lg py-3 px-4 bg-white/90 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" 
                  />
                  <input 
                    required 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    placeholder="Email Address" 
                    className="flex-1 appearance-none border border-gray-300 rounded-lg py-3 px-4 bg-white/90 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" 
                  />
                  <input 
                    required 
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleInputChange} 
                    placeholder="Password" 
                    className="flex-1 appearance-none border border-gray-300 rounded-lg py-3 px-4 bg-white/90 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" 
                  />
                </div>

                {role === "student" && (
                  <div className="space-y-4 bg-teal-50/50 p-4 rounded-xl border border-teal-100 mt-6">
                    <h4 className="text-sm font-bold text-teal-700 uppercase tracking-wide">Student Details</h4>
                    <input 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange} 
                      placeholder="Phone" 
                      className="w-full appearance-none border border-gray-300 rounded-lg py-2 px-4 text-sm text-gray-900 bg-white/90 focus:ring-teal-500 focus:border-transparent" 
                    />
                    <input 
                      name="faculty" 
                      value={formData.faculty} 
                      onChange={handleInputChange} 
                      placeholder="Faculty (e.g. Computing)" 
                      className="w-full appearance-none border border-gray-300 rounded-lg py-2 px-4 text-sm text-gray-900 bg-white/90 focus:ring-teal-500 focus:border-transparent" 
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <select 
                        name="year" 
                        value={formData.year} 
                        onChange={handleInputChange} 
                        className="w-full border border-gray-300 rounded-lg py-2 px-4 text-sm text-gray-900 bg-white focus:ring-teal-500"
                      >
                        <option value="">Select Year</option>
                        <option value="1">Year 1</option>
                        <option value="2">Year 2</option>
                        <option value="3">Year 3</option>
                        <option value="4">Year 4</option>
                      </select>
                      <select 
                        name="semester" 
                        value={formData.semester} 
                        onChange={handleInputChange} 
                        className="w-full border border-gray-300 rounded-lg py-2 px-4 text-sm text-gray-900 bg-white focus:ring-teal-500"
                      >
                        <option value="">Select Semester</option>
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                      </select>
                    </div>
                    <select 
                      name="scheduleType" 
                      value={formData.scheduleType} 
                      onChange={handleInputChange} 
                      className="w-full border border-gray-300 rounded-lg py-2 px-4 text-sm text-gray-900 bg-white focus:ring-teal-500"
                    >
                      <option value="Weekday">Weekday</option>
                      <option value="Weekend">Weekend</option>
                    </select>
                  </div>
                )}

                {role === "lecturer" && (
                  <div className="space-y-4 bg-teal-50/50 p-4 rounded-xl border border-teal-100 mt-6">
                    <h4 className="text-sm font-bold text-teal-700 uppercase tracking-wide">Lecturer Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        name="moduleCode" 
                        value={formData.moduleCode} 
                        onChange={handleInputChange} 
                        placeholder="Module Code" 
                        className="w-full border border-gray-300 rounded-lg py-2 px-4 text-sm text-gray-900 bg-white/90" 
                      />
                      <input 
                        name="department" 
                        value={formData.department} 
                        onChange={handleInputChange} 
                        placeholder="Department" 
                        className="w-full border border-gray-300 rounded-lg py-2 px-4 text-sm text-gray-900 bg-white/90" 
                      />
                    </div>
                    <input 
                      name="moduleName" 
                      value={formData.moduleName} 
                      onChange={handleInputChange} 
                      placeholder="Module Name" 
                      className="w-full border border-gray-300 rounded-lg py-2 px-4 text-sm text-gray-900 bg-white/90" 
                    />
                  </div>
                )}

                {role === "management" && (
                  <div className="space-y-4 bg-teal-50/50 p-4 rounded-xl border border-teal-100 mt-6">
                    <h4 className="text-sm font-bold text-teal-700 uppercase tracking-wide">Management Details</h4>
                    <input 
                      name="department" 
                      value={formData.department} 
                      onChange={handleInputChange} 
                      placeholder="Department" 
                      className="w-full border border-gray-300 rounded-lg py-2 px-4 text-sm text-gray-900 bg-white/90" 
                    />
                  </div>
                )}

                {role === "staff" && (
                  <div className="space-y-4 bg-teal-50/50 p-4 rounded-xl border border-teal-100 mt-6">
                    <h4 className="text-sm font-bold text-teal-700 uppercase tracking-wide">Staff Details</h4>
                    <input 
                      name="jobType" 
                      value={formData.jobType} 
                      onChange={handleInputChange} 
                      placeholder="Job Type (e.g. Electrician, Admin)" 
                      className="w-full border border-gray-300 rounded-lg py-2 px-4 text-sm text-gray-900 bg-white/90" 
                    />
                  </div>
                )}

                {role === "admin" && (
                  <div className="mt-6">
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Registering...
                      </span>
                    ) : 'Register'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .floating-leaves {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          color: #10b981;
        }

        .leaf {
          position: absolute;
          opacity: 0.15;
          filter: blur(1px);
        }

        .leaf-1 {
          width: 80px;
          height: 80px;
          top: 5%;
          left: 8%;
          animation: floatLeaf1 15s ease-in-out infinite;
        }

        .leaf-2 {
          width: 60px;
          height: 60px;
          top: 15%;
          right: 10%;
          animation: floatLeaf2 18s ease-in-out infinite;
          animation-delay: -3s;
        }

        .leaf-3 {
          width: 100px;
          height: 100px;
          top: 40%;
          left: 3%;
          animation: floatLeaf3 20s ease-in-out infinite;
          animation-delay: -5s;
        }

        .leaf-4 {
          width: 50px;
          height: 50px;
          top: 60%;
          right: 5%;
          animation: floatLeaf4 16s ease-in-out infinite;
          animation-delay: -8s;
        }

        .leaf-5 {
          width: 70px;
          height: 70px;
          bottom: 20%;
          left: 15%;
          animation: floatLeaf5 22s ease-in-out infinite;
          animation-delay: -2s;
        }

        .leaf-6 {
          width: 90px;
          height: 90px;
          bottom: 10%;
          right: 20%;
          animation: floatLeaf6 19s ease-in-out infinite;
          animation-delay: -7s;
        }

        .leaf-7 {
          width: 40px;
          height: 40px;
          top: 30%;
          left: 50%;
          animation: floatLeaf7 14s ease-in-out infinite;
          animation-delay: -4s;
        }

        .leaf-8 {
          width: 55px;
          height: 55px;
          bottom: 40%;
          left: 75%;
          animation: floatLeaf8 17s ease-in-out infinite;
          animation-delay: -9s;
        }

        .branch {
          position: absolute;
          color: #059669;
          opacity: 0.1;
        }

        .branch-1 {
          width: 200px;
          height: 300px;
          top: 0;
          left: 0;
          animation: swayBranch 12s ease-in-out infinite;
        }

        .branch-2 {
          width: 200px;
          height: 300px;
          top: 0;
          right: 0;
          animation: swayBranch2 15s ease-in-out infinite;
          animation-delay: -5s;
        }

        @keyframes floatLeaf1 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-20px) rotate(5deg); }
          50% { transform: translateY(-10px) rotate(-3deg); }
          75% { transform: translateY(-25px) rotate(8deg); }
        }

        @keyframes floatLeaf2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-30px) rotate(-8deg); }
          66% { transform: translateY(-15px) rotate(5deg); }
        }

        @keyframes floatLeaf3 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          20% { transform: translateY(-25px) rotate(10deg); }
          40% { transform: translateY(-35px) rotate(-5deg); }
          60% { transform: translateY(-20px) rotate(8deg); }
          80% { transform: translateY(-30px) rotate(-3deg); }
        }

        @keyframes floatLeaf4 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-40px) rotate(12deg); }
        }

        @keyframes floatLeaf5 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          30% { transform: translateY(-18px) rotate(-6deg); }
          70% { transform: translateY(-28px) rotate(10deg); }
        }

        @keyframes floatLeaf6 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-22px) rotate(7deg); }
          75% { transform: translateY(-32px) rotate(-9deg); }
        }

        @keyframes floatLeaf7 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-35px) rotate(-10deg); }
        }

        @keyframes floatLeaf8 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          40% { transform: translateY(-25px) rotate(8deg); }
          80% { transform: translateY(-15px) rotate(-4deg); }
        }

        @keyframes swayBranch {
          0%, 100% { transform: rotate(0deg); transform-origin: top left; }
          50% { transform: rotate(3deg); transform-origin: top left; }
        }

        @keyframes swayBranch2 {
          0%, 100% { transform: rotate(0deg); transform-origin: top right; }
          50% { transform: rotate(-3deg); transform-origin: top right; }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

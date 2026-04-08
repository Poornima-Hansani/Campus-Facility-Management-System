import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ShieldCheck } from 'lucide-react';

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
      // Build a clean payload without empty unneeded fields
      const payload: any = {
        role,
        name: formData.name,
        email: formData.email,
        password: formData.password
      };

      if (role === 'student') {
        payload.phone = formData.phone;
        payload.faculty = formData.faculty;
        payload.year = formData.year;
        payload.semester = formData.semester;
        payload.scheduleType = formData.scheduleType;
      } else if (role === 'lecturer') {
        payload.moduleCode = formData.moduleCode;
        payload.moduleName = formData.moduleName;
        payload.department = formData.department;
      } else if (role === 'management') {
        payload.department = formData.department;
      } else if (role === 'staff') {
        payload.jobType = formData.jobType;
      }

      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccessMsg(`Registration successful! Your Unique Login ID is: ${data.userId}`);
      
      // Auto redirect to login after a few seconds
      setTimeout(() => navigate('/login'), 5000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center shadow-xl">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create an Account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
           Or{' '}
           <Link to="/login" className="font-medium text-teal-600 hover:text-teal-500">
             sign in to an existing account
           </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          
          {successMsg ? (
            <div className="text-center py-6">
              <ShieldCheck className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-bold text-gray-900">Success!</h3>
              <p className="mt-2 text-gray-600 bg-green-50 p-4 border border-green-200 rounded-xl font-mono text-xl">{successMsg}</p>
              <p className="mt-4 text-sm text-gray-500">Please save this ID. Redirecting to login...</p>
              <Link to="/login" className="mt-6 inline-block text-teal-600 font-bold hover:underline">Go to Login Now</Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleRegister}>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-black">Select Role</label>
                <select 
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base text-black border-gray-300 focus:outline-none border focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
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

              {/* COMMON FIELDS */}
              <div className="grid grid-cols-1 gap-4">
                <input required name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name" className="flex-1 appearance-none border border-gray-300 rounded-md py-2 px-4 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email Address" className="flex-1 appearance-none border border-gray-300 rounded-md py-2 px-4 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                <input required type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Password" className="flex-1 appearance-none border border-gray-300 rounded-md py-2 px-4 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
              </div>

              {/* DYNAMIC FIELDS */}
              {role === "student" && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200 mt-6">
                  <h4 className="text-sm font-bold text-gray-500 uppercase">Student Details</h4>
                  <input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone" className="w-full appearance-none border border-gray-300 rounded-md py-2 px-4 text-sm text-black focus:ring-teal-500 focus:border-transparent" />
                  <input name="faculty" value={formData.faculty} onChange={handleInputChange} placeholder="Faculty (e.g. Computing)" className="w-full appearance-none border border-gray-300 rounded-md py-2 px-4 text-sm text-black focus:ring-teal-500 focus:border-transparent" />
                  <div className="grid grid-cols-2 gap-4">
                    <select name="year" value={formData.year} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md py-2 px-4 text-sm text-black focus:ring-teal-500 bg-white">
                      <option value="" disabled>Select Year</option>
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                    </select>
                    <select name="semester" value={formData.semester} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md py-2 px-4 text-sm text-black focus:ring-teal-500 bg-white">
                      <option value="" disabled>Select Semester</option>
                      <option value="1">Semester 1</option>
                      <option value="2">Semester 2</option>
                    </select>
                  </div>
                  <select name="scheduleType" value={formData.scheduleType} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md py-2 px-4 text-sm text-black focus:ring-teal-500 bg-white">
                    <option value="Weekday">Weekday</option>
                    <option value="Weekend">Weekend</option>
                  </select>
                </div>
              )}

              {role === "lecturer" && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200 mt-6">
                  <h4 className="text-sm font-bold text-gray-500 uppercase">Lecturer Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <input name="moduleCode" value={formData.moduleCode} onChange={handleInputChange} placeholder="Module Code" className="w-full border border-gray-300 rounded-md py-2 px-4 text-sm text-black" />
                    <input name="department" value={formData.department} onChange={handleInputChange} placeholder="Department" className="w-full border border-gray-300 rounded-md py-2 px-4 text-sm text-black" />
                  </div>
                  <input name="moduleName" value={formData.moduleName} onChange={handleInputChange} placeholder="Module Name" className="w-full border border-gray-300 rounded-md py-2 px-4 text-sm text-black" />
                </div>
              )}

              {role === "management" && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200 mt-6">
                   <h4 className="text-sm font-bold text-gray-500 uppercase">Management Details</h4>
                  <input name="department" value={formData.department} onChange={handleInputChange} placeholder="Department" className="w-full border border-gray-300 rounded-md py-2 px-4 text-sm text-black" />
                </div>
              )}

              {role === "staff" && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200 mt-6">
                   <h4 className="text-sm font-bold text-gray-500 uppercase">Staff Details</h4>
                  <input name="jobType" value={formData.jobType} onChange={handleInputChange} placeholder="Job Type (e.g. Electrician, Admin)" className="w-full border border-gray-300 rounded-md py-2 px-4 text-sm text-black" />
                </div>
              )}

              {role === "admin" && (
                <div className="mt-6">
                  {/* Nothing extra for admin */}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                >
                  {isLoading ? 'Registering...' : 'Register'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

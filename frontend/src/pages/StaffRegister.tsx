import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wrench, User, Phone, Mail, Briefcase, Lock, AlertCircle, CheckCircle, ChevronDown, Copy, Download } from 'lucide-react';

const ROLES = [
  { value: 'Electrician', label: 'Electrician', specialty: 'A/C & Electronics' },
  { value: 'Plumber', label: 'Plumber', specialty: 'Water & Drainage' },
  { value: 'Cleaner', label: 'Cleaner', specialty: 'Hygiene & Sanitation' },
  { value: 'Technician', label: 'Technician', specialty: 'General Repairs' },
  { value: 'Supervisor', label: 'Supervisor', specialty: 'All Rounder' },
  { value: 'Carpenter', label: 'Carpenter', specialty: 'Wood & Furniture' },
  { value: 'Painter', label: 'Painter', specialty: 'Painting & Decorating' },
  { value: 'Security', label: 'Security', specialty: 'Safety & Security' }
];

export default function StaffRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    specialty: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [registeredStaffId, setRegisteredStaffId] = useState('');
  const [registeredName, setRegisteredName] = useState('');
  const [registeredPassword, setRegisteredPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'role') {
      const selectedRole = ROLES.find(r => r.value === value);
      setFormData(prev => ({ 
        ...prev, 
        role: value,
        specialty: selectedRole?.specialty || ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/staff/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      setRegisteredStaffId(data.staff.id);
      setRegisteredName(data.staff.name);
      setRegisteredPassword(formData.password);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/staff');
      }, 10000);
    } catch (err) {
      setError('Unable to connect to server');
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const text = `STAFF CREDENTIALS\n===============\nName: ${registeredName}\nStaff ID: ${registeredStaffId}\nPassword: ${registeredPassword}\n\nLogin URL: http://localhost:5173/staff`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCredentials = () => {
    const text = `STAFF CREDENTIALS
===============
Name: ${registeredName}
Staff ID: ${registeredStaffId}
Password: ${registeredPassword}

Login URL: http://localhost:5173/staff

Created: ${new Date().toLocaleString()}`;
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Staff_Credentials_${registeredStaffId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (success) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-green-700 via-teal-800 to-blue-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Registration Successful!</h2>
              <p className="text-gray-500 mt-1">Welcome, {registeredName}!</p>
            </div>
            
            <div className="bg-gradient-to-r from-[#004905] to-green-600 rounded-xl p-6 mb-6">
              <p className="text-white/80 text-sm mb-2">Your Staff ID</p>
              <p className="text-4xl font-bold text-white tracking-wider">{registeredStaffId}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Name</span>
                <span className="font-medium text-gray-900">{registeredName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Staff ID</span>
                <span className="font-medium text-gray-900">{registeredStaffId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Password</span>
                <span className="font-medium text-gray-900">{registeredPassword}</span>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <p className="text-yellow-800 text-sm text-center">
                <strong>Save your credentials!</strong> You'll need them to login.
              </p>
            </div>
            
            <div className="flex gap-3 mb-4">
              <button
                onClick={copyToClipboard}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                <Copy size={18} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={downloadCredentials}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                <Download size={18} />
                Download
              </button>
            </div>
            
            <Link 
              to="/staff"
              className="block w-full py-3 bg-[#004905] text-white font-semibold rounded-xl hover:bg-[#003804] transition-colors text-center"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-green-700 via-teal-800 to-blue-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative z-10 w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
            <Wrench className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Staff Registration</h1>
          <p className="text-white/80">Create your staff account</p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004905] focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <button
                  type="button"
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-left bg-white focus:ring-2 focus:ring-[#004905] focus:border-transparent outline-none transition-all flex items-center justify-between"
                >
                  {formData.role || 'Select your role'}
                  <ChevronDown size={18} className={`text-gray-400 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showRoleDropdown && (
                  <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {ROLES.map(role => (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, role: role.value, specialty: role.specialty }));
                          setShowRoleDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                          formData.role === role.value ? 'bg-[#004905]/10 text-[#004905]' : 'text-gray-700'
                        }`}
                      >
                        {role.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  placeholder="e.g., A/C & Electronics"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004905] focus:border-transparent outline-none transition-all bg-gray-50"
                  readOnly
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Auto-filled based on role</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g., +94 71 234 5678"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004905] focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g., name@university.edu"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004905] focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004905] focus:border-transparent outline-none transition-all"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004905] focus:border-transparent outline-none transition-all"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#004905] text-white font-semibold rounded-xl hover:bg-[#003804] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Registering...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/staff" className="text-[#004905] font-medium hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <Link 
          to="/"
          className="block text-center mt-6 text-white/80 hover:text-white transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

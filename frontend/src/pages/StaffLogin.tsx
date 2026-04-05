import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wrench, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function StaffLogin() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      localStorage.setItem('staffLoggedIn', 'true');
      localStorage.setItem('staffId', data.staff.id);
      localStorage.setItem('staffName', data.staff.name);
      localStorage.setItem('staffRole', data.staff.role);

      navigate('/staff/dashboard');
    } catch (err) {
      setError('Unable to connect to server');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-green-700 via-teal-800 to-blue-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
            <Wrench className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Staff Portal</h1>
          <p className="text-white/80">Sign in to manage your tasks</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Staff ID / Email</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter Staff ID or Email"
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
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004905] focus:border-transparent outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
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
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-center text-sm text-gray-500 mb-3">Demo Credentials (Staff ID)</p>
            <div className="grid grid-cols-5 gap-2 text-xs">
              {['STF001', 'STF002', 'STF003', 'STF004', 'STF005'].map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setIdentifier(id);
                    setPassword(id.replace('STF', '').toLowerCase() + '123');
                  }}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
                >
                  {id}
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-gray-400 mt-3">
              Or use email: kamal@university.edu (pass: kamal123)
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              New staff member?{' '}
              <Link to="/staff/register" className="text-[#004905] font-medium hover:underline">
                Register here
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

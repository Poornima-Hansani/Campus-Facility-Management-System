import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Eye, EyeOff, AlertCircle, Loader2, ArrowLeft, GraduationCap, Wrench, Shield, BookOpen, Users } from 'lucide-react';

const ROLES = [
  { value: 'student', label: 'Student', icon: GraduationCap },
  { value: 'staff', label: 'Staff', icon: Wrench },
  { value: 'management', label: 'Management', icon: Shield },
  { value: 'lecturer', label: 'Lecturer', icon: BookOpen },
  { value: 'admin', label: 'Admin', icon: Users }
];

const STAFF_ROLES = [
  { value: 'Electrician', specialty: 'A/C & Electronics' },
  { value: 'Plumber', specialty: 'Water & Drainage' },
  { value: 'Cleaner', specialty: 'Hygiene & Sanitation' },
  { value: 'Technician', specialty: 'General Repairs' },
  { value: 'Supervisor', specialty: 'All Rounder' }
];

const USERS_KEY = 'uni_registeredUsers';

interface UserData {
  id: string;
  password: string;
  role: string;
  name: string;
  email?: string;
  phone?: string;
  faculty?: string;
  year?: string;
  semester?: string;
  group?: string;
  weekendType?: string;
  moduleCode?: string;
  moduleName?: string;
  department?: string;
  staffRole?: string;
  specialty?: string;
}

function getRegisteredUsers(): UserData[] {
  try {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveUser(user: UserData) {
  const users = getRegisteredUsers();
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '12px',
  backgroundColor: 'rgba(255,255,255,0.15)',
  color: 'white',
  outline: 'none',
  border: '1px solid rgba(255,255,255,0.2)',
  transition: 'all 0.3s',
  fontSize: '15px'
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '12px',
  backgroundColor: 'rgba(255,255,255,0.15)',
  color: 'white',
  outline: 'none',
  border: '1px solid rgba(255,255,255,0.2)',
  transition: 'all 0.3s',
  fontSize: '15px',
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  backgroundSize: '20px'
};

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    id: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    name: '',
    email: '',
    phone: '',
    faculty: '',
    year: '',
    semester: '',
    group: '',
    weekendType: '',
    moduleCode: '',
    moduleName: '',
    department: '',
    staffRole: '',
    specialty: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');
  const [isDesktop, setIsDesktop] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const fillDemoLogin = () => {
    setFormData({ ...formData, id: 'demo123', password: 'demo123', role: 'student', name: 'demo123' });
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.id.trim()) newErrors.id = 'ID is required';
    if (!formData.password) newErrors.password = 'Password is required';
    
    if (mode === 'register') {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      
      if (formData.role === 'student') {
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.faculty) newErrors.faculty = 'Faculty is required';
        if (!formData.year) newErrors.year = 'Year is required';
      }

      if (formData.role === 'staff') {
        if (!formData.staffRole) newErrors.staffRole = 'Staff Role is required';
      }
      
      if (formData.role === 'lecturer') {
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.moduleCode) newErrors.moduleCode = 'Module Code is required';
        if (!formData.department) newErrors.department = 'Department is required';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const renderRoleFields = () => {
    switch (formData.role) {
      case 'student':
        return (
          <>
            <div>
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={inputStyle}
              />
              {errors.email && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '6px' }}>{errors.email}</p>}
            </div>
            <div>
              <input
                type="tel"
                placeholder="Contact Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Faculty"
                value={formData.faculty}
                onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                style={inputStyle}
              />
              {errors.faculty && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '6px' }}>{errors.faculty}</p>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  style={selectStyle}
                >
                  <option value="" style={{ color: '#bbb' }}>Select Year</option>
                  <option value="1" style={{ color: 'white' }}>Year 1</option>
                  <option value="2" style={{ color: 'white' }}>Year 2</option>
                  <option value="3" style={{ color: 'white' }}>Year 3</option>
                  <option value="4" style={{ color: 'white' }}>Year 4</option>
                </select>
                {errors.year && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '6px' }}>{errors.year}</p>}
              </div>
              <div>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  style={selectStyle}
                >
                  <option value="" style={{ color: '#bbb' }}>Semester</option>
                  <option value="1" style={{ color: 'white' }}>Semester 1</option>
                  <option value="2" style={{ color: 'white' }}>Semester 2</option>
                </select>
              </div>
            </div>
            <div>
              <input
                type="text"
                placeholder="Group"
                value={formData.group}
                onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <select
                value={formData.weekendType}
                onChange={(e) => setFormData({ ...formData, weekendType: e.target.value })}
                style={selectStyle}
              >
                <option value="" style={{ color: '#bbb' }}>Weekday / Weekend</option>
                <option value="weekday" style={{ color: 'white' }}>Weekday</option>
                <option value="weekend" style={{ color: 'white' }}>Weekend</option>
              </select>
            </div>
          </>
        );

      case 'management':
        return (
          <>
            <div>
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={inputStyle}
              />
            </div>
          </>
        );

      case 'staff':
        return (
          <>
            <div>
              <select
                value={formData.staffRole}
                onChange={(e) => {
                  const selected = STAFF_ROLES.find(r => r.value === e.target.value);
                  setFormData({
                    ...formData,
                    staffRole: e.target.value,
                    specialty: selected?.specialty || ''
                  });
                }}
                style={selectStyle}
              >
                <option value="" style={{ color: '#bbb' }}>Select Staff Role</option>
                {STAFF_ROLES.map(r => (
                  <option key={r.value} value={r.value} style={{ color: 'white' }}>{r.value}</option>
                ))}
              </select>
              {errors.staffRole && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '6px' }}>{errors.staffRole}</p>}
            </div>
            <div>
              <input
                value={formData.specialty}
                placeholder="Specialty (auto-filled)"
                style={{ ...inputStyle, backgroundColor: 'rgba(255,255,255,0.1)' }}
                readOnly
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                style={inputStyle}
              />
            </div>
          </>
        );

      case 'lecturer':
        return (
          <>
            <div>
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={inputStyle}
              />
              {errors.email && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '6px' }}>{errors.email}</p>}
            </div>
            <div>
              <input
                type="text"
                placeholder="Module Code"
                value={formData.moduleCode}
                onChange={(e) => setFormData({ ...formData, moduleCode: e.target.value })}
                style={inputStyle}
              />
              {errors.moduleCode && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '6px' }}>{errors.moduleCode}</p>}
            </div>
            <div>
              <input
                type="text"
                placeholder="Module Name"
                value={formData.moduleName}
                onChange={(e) => setFormData({ ...formData, moduleName: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Department / Faculty"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                style={inputStyle}
              />
              {errors.department && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '6px' }}>{errors.department}</p>}
            </div>
          </>
        );

      case 'admin':
        return (
          <>
            <div>
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={inputStyle}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    if (!validate()) {
      setIsLoading(false);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const users = getRegisteredUsers();

      if (mode === 'login') {
        const user = users.find(u => u.id === formData.id && u.password === formData.password);
        
        if (!user) {
          setErrors({ general: 'Invalid credentials. Please try again.' });
          setIsLoading(false);
          return;
        }

        localStorage.setItem('user', JSON.stringify({ name: user.name, role: user.role, id: user.id }));
        
        if (user.role === 'staff') {
          localStorage.setItem('staffLoggedIn', 'true');
          localStorage.setItem('staffId', user.id);
          localStorage.setItem('staffName', user.name);
          localStorage.setItem('staffRole', user.staffRole || 'Staff');
        }
        
        switch (user.role) {
          case 'student': navigate('/student'); break;
          case 'staff': navigate('/staff/dashboard'); break;
          case 'management': navigate('/management/dashboard'); break;
          case 'lecturer': navigate('/lecturer'); break;
          case 'admin': navigate('/admin'); break;
          default: navigate('/student');
        }
      } else {
        const exists = users.find(u => u.id === formData.id);
        if (exists) {
          setErrors({ id: 'This ID is already registered' });
          setIsLoading(false);
          return;
        }

        const newUser: UserData = {
          id: formData.id,
          password: formData.password,
          role: formData.role,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          faculty: formData.faculty,
          year: formData.year,
          semester: formData.semester,
          group: formData.group,
          weekendType: formData.weekendType,
          moduleCode: formData.moduleCode,
          moduleName: formData.moduleName,
          department: formData.department,
          staffRole: formData.staffRole,
          specialty: formData.specialty
        };
        saveUser(newUser);
        
        if (newUser.role === 'staff') {
          try {
            await fetch('http://localhost:3000/api/staff/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: newUser.name,
                role: newUser.staffRole || 'Staff',
                specialty: newUser.specialty || newUser.staffRole || 'General',
                phone: newUser.phone || '',
                email: newUser.email || '',
                password: newUser.password,
                confirmPassword: newUser.password
              })
            });
          } catch (err) {
            console.error('Staff registration sync error:', err);
          }
          
          localStorage.setItem('staffLoggedIn', 'true');
          localStorage.setItem('staffId', newUser.id);
          localStorage.setItem('staffName', newUser.name);
          localStorage.setItem('staffRole', newUser.staffRole || 'Staff');
        }
        
        localStorage.setItem('user', JSON.stringify({ name: newUser.name, role: newUser.role, id: newUser.id }));
        switch (newUser.role) {
          case 'student': navigate('/student'); break;
          case 'staff': navigate('/staff/dashboard'); break;
          case 'management': navigate('/management/dashboard'); break;
          case 'lecturer': navigate('/lecturer'); break;
          case 'admin': navigate('/admin'); break;
          default: navigate('/student');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #134e4a 50%, #0f172a 100%)', padding: '24px' }}>
      <div style={{ position: 'absolute', top: '10%', left: '10%', width: '400px', height: '400px', backgroundColor: '#14b8a6', borderRadius: '50%', opacity: 0.15, filter: 'blur(100px)' }}></div>
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '400px', height: '400px', backgroundColor: '#34d399', borderRadius: '50%', opacity: 0.15, filter: 'blur(100px)' }}></div>

      <div className="auth-container" style={{ width: '100%', maxWidth: '1000px', display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        
        {/* LEFT IMAGE */}
        <div className="auth-image" style={{ display: isDesktop ? 'block' : 'none', position: 'relative' }}>
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"
            alt="Campus"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.9), rgba(15,23,42,0.4))' }}></div>
          <div style={{ position: 'absolute', bottom: '40px', left: '40px', right: '40px' }}>
            <h3 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>UniManage</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', lineHeight: 1.6 }}>Smart campus facility management system designed to improve student life and optimize university resources.</p>
          </div>
        </div>

        {/* RIGHT LOGIN CARD */}
        <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', maxHeight: '90vh', overflowY: 'auto' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '14px', marginBottom: '24px', textDecoration: 'none', transition: 'color 0.2s', position: 'absolute', top: '24px', right: '24px' }}>
            <ArrowLeft size={16} /> Back to Home
          </Link>

          {/* ICON & TITLE */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ width: '64px', height: '64px', margin: '0 auto', borderRadius: '16px', background: 'linear-gradient(135deg, #14b8a6, #34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '28px', boxShadow: '0 8px 20px rgba(20,184,166,0.3)' }}>
              🔒
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginTop: '20px' }}>
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '15px', marginTop: '8px' }}>
              {mode === 'login' ? 'Sign in to continue' : 'Join UniManage today'}
            </p>
          </div>

          {errors.general && (
            <div style={{ marginBottom: '16px', padding: '14px', backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', color: '#fca5a5', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} /> {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* ROLE SELECTOR - Always visible in register mode */}
            {mode === 'register' && (
              <div>
                <p style={{ color: '#d1d5db', fontSize: '14px', marginBottom: '10px' }}>Select Role</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '16px' }}>
                  {ROLES.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => { setFormData({ ...formData, role: role.value }); setSelectedRole(role.value); }}
                      style={{
                        padding: '10px 4px',
                        borderRadius: '10px',
                        border: selectedRole === role.value ? '2px solid #2dd4bf' : '2px solid rgba(255,255,255,0.15)',
                        backgroundColor: selectedRole === role.value ? 'rgba(45,212,191,0.15)' : 'rgba(255,255,255,0.08)',
                        color: selectedRole === role.value ? '#2dd4bf' : '#d1d5db',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                    >
                      <role.icon size={18} />
                      <span style={{ fontSize: '11px', fontWeight: 500 }}>{role.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={inputStyle}
                />
                {errors.name && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '6px' }}>{errors.name}</p>}
              </div>
            )}

            <div>
              <input
                type="text"
                placeholder={mode === 'register' ? 'User ID' : 'User ID'}
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                style={inputStyle}
              />
              {errors.id && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '6px' }}>{errors.id}</p>}
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{ ...inputStyle, paddingRight: '48px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {errors.password && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '6px' }}>{errors.password}</p>}
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    style={inputStyle}
                  />
                  {errors.confirmPassword && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '6px' }}>{errors.confirmPassword}</p>}
                </div>

                {/* ROLE-BASED FIELDS */}
                {renderRoleFields()}
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                marginTop: '8px',
                background: 'linear-gradient(135deg, #14b8a6, #34d399)',
                color: 'white',
                padding: '14px',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '16px',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.3s',
                boxShadow: '0 4px 15px rgba(20,184,166,0.3)'
              }}
            >
              {isLoading ? (
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <LogIn size={20} />
              )}
              {isLoading ? (mode === 'login' ? 'Signing in...' : 'Creating account...') : (mode === 'login' ? 'Sign In →' : 'Create Account')}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: '#9ca3af', marginTop: '20px', fontSize: '14px' }}>
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button onClick={() => { setMode('register'); setErrors({}); }} style={{ color: '#2dd4bf', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button onClick={() => { setMode('login'); setErrors({}); }} style={{ color: '#2dd4bf', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                  Sign In
                </button>
              </>
            )}
          </p>

          {mode === 'login' && (
            <div style={{ marginTop: '16px', padding: '14px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
              <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '8px' }}>Demo credentials: ID: demo123, Password: demo123</p>
              <button onClick={fillDemoLogin} style={{ fontSize: '13px', backgroundColor: 'rgba(20,184,166,0.2)', color: '#2dd4bf', padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                Fill Demo
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (min-width: 768px) {
          .auth-image { display: block !important; }
          .auth-container { grid-template-columns: 1fr 1fr !important; }
        }
        input::placeholder { color: #bbb !important; }
        select option { color: white; background: #1f2937; }
      `}</style>
    </div>
  );
}

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Globe, Zap, ShieldCheck, GraduationCap, Check, Users, Clock, Star, Mail, Phone, MapPin, ArrowRight, ChevronDown } from 'lucide-react';

export default function LandingPage() {
  useEffect(() => {
    const featuresTimer = setTimeout(() => {
      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    }, 2500);
    return () => clearTimeout(featuresTimer);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:text-white">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center cursor-pointer" onClick={() => scrollToSection('home')}>
              <img src="/logo.png" alt="UniManage Logo" className="h-12 w-auto" />
            </div>
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-green-600 px-4 py-2 rounded-lg font-medium transition-all duration-200">Home</button>
              <button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-green-600 px-4 py-2 rounded-lg font-medium transition-all duration-200">Features</button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-gray-700 hover:text-green-600 px-4 py-2 rounded-lg font-medium transition-all duration-200">How It Works</button>
              <button onClick={() => scrollToSection('about')} className="text-gray-700 hover:text-green-600 px-4 py-2 rounded-lg font-medium transition-all duration-200">About</button>
              <Link to="/management" className="ml-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold px-6 py-2.5 rounded-xl hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-green-500/30 transition-all duration-200 flex items-center gap-2">
                Login
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-20 pb-32 overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80" 
            alt="University Campus" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/40"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-400/30 text-green-300 font-medium text-sm mb-6 backdrop-blur-sm">
              <Users className="h-4 w-4" />
              <span className="tracking-wide">Trusted by 5000+ students</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              Manage Spaces.<br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Save Energy.</span><br/>
              Study Better.
            </h1>
            
            <p className="text-xl text-gray-200 max-w-2xl mb-10 leading-relaxed">
              A real-time, integrated campus system designed to improve student life, optimize facility usage, and make our university truly green.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/student-login"
                className="px-8 py-4 text-lg font-bold rounded-2xl text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-xl hover:shadow-green-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
              >
                Get Started
                <ArrowRight size={20} />
              </Link>
              <button 
                onClick={() => scrollToSection('features')}
                className="px-8 py-4 text-lg font-bold rounded-2xl text-white border-2 border-white/30 hover:bg-white/10 backdrop-blur-sm transition-all duration-300 flex items-center gap-2"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => scrollToSection('features')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/80 hover:text-white animate-bounce transition-colors"
        >
          <ChevronDown size={32} />
        </button>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">Platform Features</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">Everything you need to navigate campus life efficiently and make the most of university facilities.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Smart Booking', icon: ShieldCheck, desc: 'Reserve rooms & labs instantly with real-time availability.', color: 'from-green-500 to-emerald-600' },
              { title: 'Issue Reporting', icon: Zap, desc: 'Report facility faults quickly and track resolution.', color: 'from-amber-500 to-orange-600' },
              { title: 'Energy Alerts', icon: Globe, desc: 'Monitor campus power usage and get smart insights.', color: 'from-blue-500 to-cyan-600' },
              { title: 'Academic Support', icon: GraduationCap, desc: 'Access resources, track tasks, and get help.', color: 'from-purple-500 to-pink-600' }
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className="bg-gray-50 rounded-3xl p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 hover:border-gray-200 group"
              >
                <div className={`h-14 w-14 bg-gradient-to-br ${feature.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">How It Works</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">Three simple steps to a better campus experience</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Report an Issue', desc: 'Found a broken light or messy area? Just tap to report it in seconds.', icon: Zap, color: 'bg-amber-500' },
              { step: '02', title: 'Staff Gets Assigned', desc: 'Our team reviews and assigns the right person to fix it quickly.', icon: ShieldCheck, color: 'bg-blue-500' },
              { step: '03', title: 'Issue Resolved', desc: 'Get notified when it\'s fixed. Rate the service to help us improve!', icon: Star, color: 'bg-green-500' }
            ].map((item, idx) => (
              <div key={idx} className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className={`absolute -top-4 left-8 ${item.color} text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg`}>
                  {item.step}
                </div>
                <div className="mt-6">
                  <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-4`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section: Mission & Advantages */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Mission */}
            <div className="bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 rounded-3xl p-12 text-white shadow-2xl overflow-hidden relative hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 cursor-pointer group">
              <div className="absolute top-0 right-0 -mt-16 -mr-16 opacity-10 group-hover:opacity-20 transition-opacity">
                <Leaf className="w-64 h-64" />
              </div>
              <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-green-300 to-emerald-300"></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-extrabold mb-6 tracking-tight flex items-center gap-3">
                  <Star className="h-8 w-8 text-yellow-400" />
                  Our Mission
                </h2>
                <p className="text-xl text-gray-100 leading-relaxed font-medium">
                  "To build a smart campus with efficient energy usage, empowering students with seamless, real-time facility management."
                </p>
                <div className="mt-8 flex gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">98%</div>
                    <div className="text-sm text-green-200">Satisfaction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">30%</div>
                    <div className="text-sm text-green-200">Energy Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">2hrs</div>
                    <div className="text-sm text-green-200">Avg Response</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Advantages */}
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">System Advantages</h2>
              <ul className="space-y-6">
                {[
                  'Real-time issue tracking & instant updates',
                  'Saves energy through smart monitoring',
                  'Improves student life and campus experience',
                  'Quick resolution with staff assignment'
                ].map((text, idx) => (
                  <li key={idx} className="flex items-start group">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-500 transition-colors duration-300">
                        <Check className="h-5 w-5 text-green-600 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                    <p className="ml-4 text-lg text-gray-600 font-medium group-hover:text-gray-900 transition-colors">{text}</p>
                  </li>
                ))}
              </ul>
              
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-2xl font-bold text-gray-900">5000+</span>
                    </div>
                    <p className="text-gray-500 text-sm">Active students using the system daily</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-2xl font-bold text-gray-900">24/7</span>
                    </div>
                    <p className="text-gray-500 text-sm">System uptime with reliable monitoring</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Ready to improve your campus?</h2>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">Join thousands of students who are making a difference. Report issues, track progress, and help build a better university.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/student-login"
              className="px-10 py-4 text-lg font-bold rounded-2xl text-green-600 bg-white hover:bg-gray-100 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
            >
              Get Started
              <ArrowRight size={20} />
            </Link>
            <Link 
              to="/management"
              className="px-10 py-4 text-lg font-bold rounded-2xl text-white border-2 border-white/50 hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
            >
              Login
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            {/* Logo & About */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="UniManage Logo" className="h-10 w-auto" />
                <span className="text-xl font-bold text-white">UniManage</span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
                A smart campus facility management system helping students and staff work together for a better university experience.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-green-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-green-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-green-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                </a>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li><button onClick={() => scrollToSection('home')} className="text-gray-400 hover:text-green-400 transition-colors">Home</button></li>
                <li><button onClick={() => scrollToSection('features')} className="text-gray-400 hover:text-green-400 transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('how-it-works')} className="text-gray-400 hover:text-green-400 transition-colors">How It Works</button></li>
                <li><Link to="/student-login" className="text-gray-400 hover:text-green-400 transition-colors">Report Issue</Link></li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h4 className="text-white font-bold mb-4">Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-400">
                  <MapPin size={18} className="text-green-500 flex-shrink-0" />
                  <span>University Campus, Main Building</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <Phone size={18} className="text-green-500 flex-shrink-0" />
                  <span>+94 11 234 5678</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <Mail size={18} className="text-green-500 flex-shrink-0" />
                  <span>support@unimanage.edu</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} UniManage. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-500 hover:text-green-400 transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-500 hover:text-green-400 transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-500 hover:text-green-400 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

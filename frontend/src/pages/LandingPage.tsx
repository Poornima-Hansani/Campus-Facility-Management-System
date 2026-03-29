import { Link } from 'react-router-dom';
import { Leaf, Globe, Zap, ShieldCheck, GraduationCap, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <img src="/logo.png" alt="UniManage Logo" className="h-20 w-auto" />
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">Home</a>
              <a href="#features" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">Features</a>
              <a href="#about" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">About</a>
              <Link to="/management" className="text-emerald-700 hover:text-emerald-800 font-bold px-4 py-2 hover:bg-emerald-50 rounded-lg transition-colors">
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 font-medium text-sm mb-8 animate-fade-in-up">
            <Globe className="h-4 w-4" />
            <span className="tracking-wide">UniManage</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
            Manage Spaces. <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">Save Energy.</span><br/>
            Study Better.
          </h1>
          <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto mb-10">
            A real-time, integrated campus system designed to improve student life, optimize facility usage, and make our university truly green.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              to="/student-login"
              className="px-8 py-4 text-lg font-bold rounded-2xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg hover:shadow-emerald-200 hover:-translate-y-0.5 transition-all duration-200 ring-2 ring-transparent focus:ring-emerald-600 focus:outline-none"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Platform Features</h2>
            <p className="mt-4 text-lg text-gray-500">Everything you need to navigate campus life efficiently.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Smart Booking', icon: ShieldCheck, desc: 'Reserve rooms & labs instantly.' },
              { title: 'Issue Reporting', icon: Zap, desc: 'Report facility faults quickly.' },
              { title: 'Energy Alerts', icon: Globe, desc: 'Monitor campus power usage.' },
              { title: 'Academic Support', icon: GraduationCap, desc: 'Access resources & help.' }
            ].map((feature, idx) => (
              <div key={idx} className="bg-gray-50 rounded-3xl p-8 hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-100 group">
                <div className="h-12 w-12 bg-white text-emerald-600 rounded-xl flex items-center justify-center mb-6 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section: Mission & Advantages */}
      <section id="about" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Mission */}
            <div className="bg-emerald-600 rounded-3xl p-12 text-white shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 -mt-16 -mr-16 opacity-10">
                <Leaf className="w-64 h-64" />
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl font-extrabold mb-6 tracking-tight">Our Mission</h2>
                <p className="text-xl text-emerald-50 leading-relaxed font-medium">
                  "To build a smart campus with efficient energy usage, empowering students with seamless, real-time facility management."
                </p>
              </div>
            </div>

            {/* Advantages */}
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">System Advantages</h2>
              <ul className="space-y-6">
                {[
                  'Real-time system updates and tracking',
                  'Saves energy through smart monitoring',
                  'Improves student life and campus experience'
                ].map((adv, idx) => (
                  <li key={idx} className="flex items-start">
                    <div className="flex-shrink-0">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    </div>
                    <p className="ml-4 text-lg text-gray-600 font-medium">{adv}</p>
                  </li>
                ))}
              </ul>
              
              <div className="mt-10 pt-10 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">5K+</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Active Students</h4>
                    <p className="text-gray-500">Using the system daily</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0 bg-white p-2 rounded-xl">
            <img src="/logo.png" alt="UniManage Logo" className="h-8 w-auto" />
          </div>
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} UniManage. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

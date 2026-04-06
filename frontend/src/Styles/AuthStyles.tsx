// Auth Styles - Split background with white left and green right
export const authStyles = {
  // Container styles - Split background: white left, green right
  container: "min-h-screen bg-gradient-to-r from-white via-white to-green-500 flex items-center justify-center p-4 relative",
  
  // Enhanced animated background elements with green only - positioned on right side
  bgDecoration: "absolute inset-0",
  bgCircle1: "absolute top-10 right-10 w-64 h-64 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-3xl animate-pulse-slow hover:scale-110 transition-transform duration-1000",
  bgCircle2: "absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-green-500 to-green-600 rounded-full blur-3xl animate-pulse-slow animation-delay-2000 hover:scale-110 transition-transform duration-1000",
  bgCircle3: "absolute top-1/3 right-1/4 w-56 h-56 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full blur-2xl animate-float hover:scale-105 transition-transform duration-1000",
  bgCircle4: "absolute bottom-1/3 right-1/3 w-48 h-48 bg-gradient-to-r from-green-300 to-emerald-400 rounded-full blur-2xl animate-float animation-delay-3000 hover:scale-105 transition-transform duration-1000",
  bgCircle5: "absolute top-1/2 right-1/2 transform translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-green-400 to-green-500 rounded-full blur-2xl animate-pulse-slow animation-delay-4000",
  
  // Campus building image
  bgImage: "absolute right-0 top-0 h-full w-1/2 object-cover opacity-20 pointer-events-none",
  
  // Interactive gradient overlay - green only
  bgGradient: "absolute inset-0 bg-gradient-to-t from-green-600/30 via-green-500/20 to-emerald-600/30 pointer-events-none animate-gradient-shift",
  
  // Floating particles with green only - positioned on right side
  bgParticle1: "absolute top-20 right-20 w-2 h-2 bg-green-400 rounded-full animate-bounce-slow",
  bgParticle2: "absolute bottom-32 right-32 w-3 h-3 bg-green-500 rounded-full animate-bounce-slow animation-delay-1500",
  bgParticle3: "absolute top-1/2 right-1/3 w-2 h-2 bg-emerald-400 rounded-full animate-bounce-slow animation-delay-3000",
  bgParticle4: "absolute bottom-1/4 right-1/4 w-4 h-4 bg-green-300 rounded-full animate-bounce-slow animation-delay-4500",
  
  // Card styles - Enhanced glass morphism for green background
  card: "bg-white/95 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/80 p-8 w-full max-w-md transform transition-all duration-700 hover:shadow-green-500/30 hover:shadow-3xl hover:scale-[1.03] hover:bg-white/98 relative overflow-hidden group",
  cardInner: "absolute inset-0 bg-gradient-to-r from-green-500/10 via-transparent to-green-400/10 pointer-events-none group-hover:from-green-500/15 group-hover:via-transparent group-hover:to-green-400/15 transition-all duration-500",
  cardGlow: "absolute inset-0 bg-gradient-to-r from-green-400/10 to-green-300/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
  
  // Header styles - Enhanced typography for green background
  header: "text-center mb-16 relative z-10",
  title: "text-4xl font-bold bg-gradient-to-r from-green-800 via-green-700 to-emerald-800 bg-clip-text text-transparent mb-8 transition-all duration-500 hover:from-green-700 hover:via-green-600 hover:to-emerald-700 transform hover:scale-105 hover:drop-shadow-lg",
  subtitle: "text-gray-700 text-lg transition-all duration-300 hover:text-gray-600 animate-fade-in hover:scale-105 transform",
  
  // Form styles
  form: "space-y-8 relative z-10",
  formGroup: "space-y-3 transform transition-all duration-300 hover:translate-x-1",
  label: "block text-sm font-semibold text-gray-800 mb-3 transition-all duration-300 hover:text-green-700 hover:scale-105 transform",
  
  // Input styles - Enhanced for green background
  input: "w-full px-5 py-4 bg-white/90 backdrop-blur-sm border-2 border-gray-300/60 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/70 focus:border-green-500 transition-all duration-300 hover:border-green-400/70 hover:bg-white/95 focus:bg-gradient-to-r focus:from-green-50/90 focus:to-green-100/90 focus:shadow-xl focus:shadow-green-500/30 transform hover:scale-[1.02]",
  inputError: "border-red-400/80 focus:ring-red-500/70 bg-red-50/90 hover:border-red-500/90 focus:bg-red-100/95 animate-shake",
  
  // Button styles - Enhanced for green background
  button: "w-full bg-gradient-to-r from-green-700 via-green-600 to-emerald-700 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-green-600 hover:via-green-500 hover:to-emerald-600 focus:outline-none focus:ring-4 focus:ring-green-500/50 focus:ring-offset-2 focus:ring-offset-white transform transition-all duration-300 hover:scale-[1.05] active:scale-[0.95] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-xl hover:shadow-2xl hover:shadow-green-500/50 relative overflow-hidden group",
  buttonGlow: "absolute inset-0 bg-gradient-to-r from-green-400/30 to-green-300/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:animate-pulse",
  
  // Error styles - Enhanced for colorful background
  errorContainer: "bg-red-50/95 backdrop-blur-sm border-2 border-red-300/80 text-red-800 px-4 py-3 rounded-2xl mb-6 text-sm transition-all duration-300 animate-bounce-in shadow-lg hover:bg-red-100/95",
  errorText: "text-red-700 text-sm mt-2 transition-all duration-300 animate-fade-in hover:text-red-800",
  
  // Link styles - Enhanced for colorful background
  linkContainer: "text-center mt-10 relative z-10",
  link: "font-medium text-green-700 hover:text-green-800 transition-all duration-300 hover:underline inline-block hover:scale-110 transform hover:shadow-lg hover:shadow-green-500/40 px-3 py-2 rounded-lg hover:bg-green-50/90 hover:backdrop-blur-sm",
  
  // Loading spinner
  spinner: "animate-spin -ml-1 mr-3 h-5 w-5 text-white drop-shadow-lg",
  
  // Register specific styles
  registerCard: "bg-white/95 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/80 p-8 w-full max-w-2xl transform transition-all duration-700 hover:shadow-green-500/30 hover:shadow-3xl hover:scale-[1.02] relative overflow-hidden group",
  gridContainer: "grid grid-cols-1 md:grid-cols-2 gap-6",
  studentSection: "bg-gradient-to-r from-green-50/95 via-green-100/90 to-emerald-50/95 backdrop-blur-md p-6 rounded-2xl border border-green-300/70 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/20 transform hover:scale-[1.01]",
  sectionTitle: "text-xl font-semibold text-gray-800 mb-6 transition-colors duration-300 hover:text-green-800 transform hover:scale-105",
  
  // Select styles - Enhanced for green background
  select: "w-full px-5 py-4 bg-white/90 backdrop-blur-sm border-2 border-gray-300/60 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/70 focus:border-green-500 transition-all duration-300 hover:border-green-400/70 hover:bg-white/95 focus:bg-gradient-to-r focus:from-green-50/90 focus:to-green-100/90 focus:shadow-xl focus:shadow-green-500/30 transform hover:scale-[1.02]",
  
  // Footer
  footer: "text-center mt-8 text-gray-600 text-sm transition-colors duration-300 hover:text-gray-700"
};

// Animation classes
export const animations = {
  fadeIn: "animate-fadeIn",
  slideUp: "animate-slideUp",
  slideDown: "animate-slideDown",
  pulse: "animate-pulse",
  bounce: "animate-bounce",
  slideOutLeft: "animate-slide-out-left",
  slideInRight: "animate-slide-in-right"
};

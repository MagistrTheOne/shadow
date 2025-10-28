// Micro animations for enhanced UX
export const animations = {
  // Fade animations
  fadeIn: "animate-in fade-in duration-300",
  fadeInUp: "animate-in fade-in slide-in-from-bottom-4 duration-500",
  fadeInDown: "animate-in fade-in slide-in-from-top-4 duration-500",
  fadeInLeft: "animate-in fade-in slide-in-from-left-4 duration-500",
  fadeInRight: "animate-in fade-in slide-in-from-right-4 duration-500",
  
  // Scale animations
  scaleIn: "animate-in zoom-in-95 duration-200",
  scaleInUp: "animate-in zoom-in-95 slide-in-from-bottom-2 duration-300",
  scaleInDown: "animate-in zoom-in-95 slide-in-from-top-2 duration-300",
  
  // Slide animations
  slideInUp: "animate-in slide-in-from-bottom-4 duration-300",
  slideInDown: "animate-in slide-in-from-top-4 duration-300",
  slideInLeft: "animate-in slide-in-from-left-4 duration-300",
  slideInRight: "animate-in slide-in-from-right-4 duration-300",
  
  // Hover animations
  hoverScale: "hover:scale-105 transition-transform duration-200",
  hoverScaleUp: "hover:scale-110 transition-transform duration-200",
  hoverLift: "hover:-translate-y-1 transition-transform duration-200",
  hoverGlow: "hover:shadow-lg hover:shadow-blue-500/25 transition-shadow duration-300",
  
  // Pulse animations
  pulse: "animate-pulse",
  pulseSlow: "animate-pulse duration-1000",
  pulseFast: "animate-pulse duration-500",
  
  // Bounce animations
  bounce: "animate-bounce",
  bounceIn: "animate-in zoom-in-95 duration-500",
  
  // Stagger animations
  stagger1: "delay-0",
  stagger2: "delay-75",
  stagger3: "delay-150",
  stagger4: "delay-300",
  stagger5: "delay-500",
  
  // Loading animations
  spin: "animate-spin",
  ping: "animate-ping",
  
  // Custom micro animations
  shimmer: "animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent",
  float: "animate-bounce",
  wiggle: "animate-pulse",
  
  // Card animations
  cardHover: "hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300",
  cardEnter: "animate-in fade-in slide-in-from-bottom-2 duration-500",
  
  // Button animations
  buttonPress: "active:scale-95 transition-transform duration-150",
  buttonHover: "hover:scale-105 transition-transform duration-200",
  
  // Text animations
  textReveal: "animate-in fade-in slide-in-from-bottom-2 duration-700",
  textSlide: "animate-in slide-in-from-left-4 duration-500",
  
  // Icon animations
  iconSpin: "hover:rotate-180 transition-transform duration-500",
  iconBounce: "hover:animate-bounce",
  iconPulse: "hover:animate-pulse",
  
  // Page transitions
  pageEnter: "animate-in fade-in duration-500",
  pageExit: "animate-out fade-out duration-300",
  
  // List animations
  listItem: "animate-in fade-in slide-in-from-left-2 duration-300",
  listStagger: "animate-in fade-in slide-in-from-left-4 duration-500",
  
  // Modal animations
  modalEnter: "animate-in fade-in zoom-in-95 duration-300",
  modalExit: "animate-out fade-out zoom-out-95 duration-200",
  
  // Notification animations
  notificationEnter: "animate-in slide-in-from-right-4 fade-in duration-300",
  notificationExit: "animate-out slide-out-to-right-4 fade-out duration-200",
};

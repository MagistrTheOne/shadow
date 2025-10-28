// Additional micro animations for forms and modals
export const formAnimations = {
  // Form field animations
  fieldFocus: "focus:scale-[1.02] focus:shadow-lg focus:shadow-blue-500/25 transition-all duration-200",
  fieldError: "animate-pulse border-red-500",
  fieldSuccess: "border-green-500",
  
  // Form validation animations
  errorShake: "animate-pulse",
  successBounce: "animate-bounce",
  
  // Loading states
  loadingSpinner: "animate-spin",
  loadingPulse: "animate-pulse",
  
  // Form submission
  submitPress: "active:scale-95 transition-transform duration-150",
  submitLoading: "opacity-50 cursor-not-allowed",
  
  // Input animations
  inputFocus: "focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200",
  inputHover: "hover:border-white/30 transition-colors duration-200",
  
  // Button animations
  buttonPress: "active:scale-95 transition-transform duration-150",
  buttonHover: "hover:scale-105 transition-transform duration-200",
  buttonLoading: "opacity-75 cursor-not-allowed",
  
  // Card animations
  cardHover: "hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300",
  cardFocus: "focus:ring-2 focus:ring-blue-500/50 transition-all duration-200",
  
  // Modal animations
  modalBackdrop: "animate-in fade-in duration-300",
  modalContent: "animate-in zoom-in-95 slide-in-from-bottom-4 duration-300",
  modalExit: "animate-out fade-out zoom-out-95 duration-200",
  
  // Toast animations
  toastEnter: "animate-in slide-in-from-right-4 fade-in duration-300",
  toastExit: "animate-out slide-out-to-right-4 fade-out duration-200",
  
  // Dropdown animations
  dropdownEnter: "animate-in fade-in zoom-in-95 duration-200",
  dropdownExit: "animate-out fade-out zoom-out-95 duration-150",
  
  // Tooltip animations
  tooltipEnter: "animate-in fade-in slide-in-from-top-2 duration-200",
  tooltipExit: "animate-out fade-out slide-out-to-top-2 duration-150",
  
  // Progress animations
  progressBar: "transition-all duration-500 ease-out",
  progressPulse: "animate-pulse",
  
  // Skeleton animations
  skeleton: "animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent",
  skeletonShimmer: "animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent",
  
  // Stagger animations for lists
  staggerDelay: (index: number) => `delay-${index * 75}`,
  staggerFade: (index: number) => `animate-in fade-in slide-in-from-left-2 duration-300 delay-${index * 75}`,
  staggerScale: (index: number) => `animate-in zoom-in-95 duration-300 delay-${index * 100}`,
  
  // Page transitions
  pageEnter: "animate-in fade-in duration-500",
  pageExit: "animate-out fade-out duration-300",
  
  // Section animations
  sectionFadeIn: "animate-in fade-in slide-in-from-bottom-4 duration-700",
  sectionSlideIn: "animate-in slide-in-from-left-4 duration-500",
  
  // Icon animations
  iconSpin: "hover:rotate-180 transition-transform duration-500",
  iconBounce: "hover:animate-bounce",
  iconPulse: "hover:animate-pulse",
  iconWiggle: "hover:animate-pulse",
  
  // Text animations
  textReveal: "animate-in fade-in slide-in-from-bottom-2 duration-700",
  textSlide: "animate-in slide-in-from-left-4 duration-500",
  textFade: "animate-in fade-in duration-500",
  
  // Image animations
  imageHover: "hover:scale-105 transition-transform duration-300",
  imageFocus: "focus:scale-110 transition-transform duration-300",
  
  // Badge animations
  badgePulse: "animate-pulse",
  badgeBounce: "hover:animate-bounce",
  
  // Status animations
  statusOnline: "animate-pulse bg-green-500",
  statusOffline: "bg-gray-500",
  statusLoading: "animate-spin",
  
  // Custom micro interactions
  microBounce: "hover:animate-bounce",
  microPulse: "hover:animate-pulse",
  microWiggle: "hover:animate-pulse",
  microGlow: "hover:shadow-lg hover:shadow-blue-500/25 transition-shadow duration-300",
  microLift: "hover:-translate-y-1 transition-transform duration-200",
  microScale: "hover:scale-105 transition-transform duration-200",
};

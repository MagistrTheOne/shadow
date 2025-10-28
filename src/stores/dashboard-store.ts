import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useCallback, useMemo } from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface UserPresence {
  status: 'online' | 'offline' | 'away' | 'dnd' | 'invisible';
  customStatus?: string;
  richPresence?: {
    type: 'meeting' | 'call' | 'idle';
    meetingTitle?: string;
  };
  lastSeenAt?: Date;
}

interface DashboardState {
  // Sidebar state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  
  // Command palette state
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  toggleCommand: () => void;
  
  // Notifications state
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  toggleNotifications: () => void;
  
  // System status
  systemStatus: 'online' | 'offline' | 'maintenance';
  setSystemStatus: (status: 'online' | 'offline' | 'maintenance') => void;
  
  // Current page info
  currentPage: string;
  setCurrentPage: (page: string) => void;
  
  // Breadcrumbs
  breadcrumbs: Array<{ label: string; href?: string }>;
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; href?: string }>) => void;
  
  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Error state
  error: string | null;
  setError: (error: string | null) => void;
  
  // User presence state
  userPresence: UserPresence;
  setUserStatus: (status: UserPresence['status']) => void;
  setCustomStatus: (customStatus: string) => void;
  setRichPresence: (richPresence: UserPresence['richPresence']) => void;
  updateLastSeen: () => void;
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set, get) => ({
      // Sidebar state
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      // Command palette state
      commandOpen: false,
      setCommandOpen: (open) => set({ commandOpen: open }),
      toggleCommand: () => set((state) => ({ commandOpen: !state.commandOpen })),
      
      // Notifications state
      notificationsOpen: false,
      setNotificationsOpen: (open) => set({ notificationsOpen: open }),
      toggleNotifications: () => set((state) => ({ notificationsOpen: !state.notificationsOpen })),
      
      // System status
      systemStatus: 'online',
      setSystemStatus: (status) => set({ systemStatus: status }),
      
      // Current page info
      currentPage: 'Dashboard',
      setCurrentPage: (page) => set({ currentPage: page }),
      
      // Breadcrumbs
      breadcrumbs: [{ label: 'Dashboard', href: '/dashboard' }],
      setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
      
      // Loading states
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      
      // Error state
      error: null,
      setError: (error) => set({ error }),
      
      // User presence state
      userPresence: {
        status: 'online',
        customStatus: '',
        richPresence: { type: 'idle' },
        lastSeenAt: new Date(),
      },
      setUserStatus: (status) => set((state) => ({ 
        userPresence: { ...state.userPresence, status } 
      })),
      setCustomStatus: (customStatus) => set((state) => ({ 
        userPresence: { ...state.userPresence, customStatus } 
      })),
      setRichPresence: (richPresence) => set((state) => ({ 
        userPresence: { ...state.userPresence, richPresence } 
      })),
      updateLastSeen: () => set((state) => ({ 
        userPresence: { ...state.userPresence, lastSeenAt: new Date() } 
      })),
    }),
    {
      name: 'dashboard-store',
    }
  )
);

// Selectors for better performance - using stable references
export const useSidebarState = () => {
  const sidebarOpen = useDashboardStore((state) => state.sidebarOpen);
  const setSidebarOpen = useDashboardStore((state) => state.setSidebarOpen);
  const toggleSidebar = useDashboardStore((state) => state.toggleSidebar);
  
  return useMemo(() => ({
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
  }), [sidebarOpen, setSidebarOpen, toggleSidebar]);
};

export const useCommandState = () => {
  const commandOpen = useDashboardStore((state) => state.commandOpen);
  const setCommandOpen = useDashboardStore((state) => state.setCommandOpen);
  const toggleCommand = useDashboardStore((state) => state.toggleCommand);
  
  return useMemo(() => ({
    commandOpen,
    setCommandOpen,
    toggleCommand,
  }), [commandOpen, setCommandOpen, toggleCommand]);
};

export const useNotificationsState = () => {
  const notificationsOpen = useDashboardStore((state) => state.notificationsOpen);
  const setNotificationsOpen = useDashboardStore((state) => state.setNotificationsOpen);
  const toggleNotifications = useDashboardStore((state) => state.toggleNotifications);
  
  return useMemo(() => ({
    notificationsOpen,
    setNotificationsOpen,
    toggleNotifications,
  }), [notificationsOpen, setNotificationsOpen, toggleNotifications]);
};

export const useSystemState = () => {
  const systemStatus = useDashboardStore((state) => state.systemStatus);
  const setSystemStatus = useDashboardStore((state) => state.setSystemStatus);
  
  return useMemo(() => ({
    systemStatus,
    setSystemStatus,
  }), [systemStatus, setSystemStatus]);
};

export const usePageState = () => {
  const currentPage = useDashboardStore((state) => state.currentPage);
  const setCurrentPage = useDashboardStore((state) => state.setCurrentPage);
  const breadcrumbs = useDashboardStore((state) => state.breadcrumbs);
  const setBreadcrumbs = useDashboardStore((state) => state.setBreadcrumbs);
  
  return useMemo(() => ({
    currentPage,
    setCurrentPage,
    breadcrumbs,
    setBreadcrumbs,
  }), [currentPage, setCurrentPage, breadcrumbs, setBreadcrumbs]);
};

export const useLoadingState = () => {
  const isLoading = useDashboardStore((state) => state.isLoading);
  const setIsLoading = useDashboardStore((state) => state.setIsLoading);
  const error = useDashboardStore((state) => state.error);
  const setError = useDashboardStore((state) => state.setError);
  
  return useMemo(() => ({
    isLoading,
    setIsLoading,
    error,
    setError,
  }), [isLoading, setIsLoading, error, setError]);
};

export const useUserPresence = () => {
  const userPresence = useDashboardStore((state) => state.userPresence);
  const setUserStatus = useDashboardStore((state) => state.setUserStatus);
  const setCustomStatus = useDashboardStore((state) => state.setCustomStatus);
  const setRichPresence = useDashboardStore((state) => state.setRichPresence);
  const updateLastSeen = useDashboardStore((state) => state.updateLastSeen);
  
  return useMemo(() => ({
    userPresence,
    setUserStatus,
    setCustomStatus,
    setRichPresence,
    updateLastSeen,
  }), [userPresence, setUserStatus, setCustomStatus, setRichPresence, updateLastSeen]);
};

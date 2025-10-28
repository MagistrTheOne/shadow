import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface BreadcrumbItem {
  label: string;
  href?: string;
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
    }),
    {
      name: 'dashboard-store',
    }
  )
);

// Selectors for better performance
export const useSidebarState = () => useDashboardStore((state) => ({
  sidebarOpen: state.sidebarOpen,
  setSidebarOpen: state.setSidebarOpen,
  toggleSidebar: state.toggleSidebar,
}));

export const useCommandState = () => useDashboardStore((state) => ({
  commandOpen: state.commandOpen,
  setCommandOpen: state.setCommandOpen,
  toggleCommand: state.toggleCommand,
}));

export const useNotificationsState = () => useDashboardStore((state) => ({
  notificationsOpen: state.notificationsOpen,
  setNotificationsOpen: state.setNotificationsOpen,
  toggleNotifications: state.toggleNotifications,
}));

export const useSystemState = () => useDashboardStore((state) => ({
  systemStatus: state.systemStatus,
  setSystemStatus: state.setSystemStatus,
}));

export const usePageState = () => useDashboardStore((state) => ({
  currentPage: state.currentPage,
  setCurrentPage: state.setCurrentPage,
  breadcrumbs: state.breadcrumbs,
  setBreadcrumbs: state.setBreadcrumbs,
}));

export const useLoadingState = () => useDashboardStore((state) => ({
  isLoading: state.isLoading,
  setIsLoading: state.setIsLoading,
  error: state.error,
  setError: state.setError,
}));

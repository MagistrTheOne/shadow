import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardNavbar } from "@/modules/dashboard/ui/components/dashboard-navbar";
import { DashboardSidebar } from "@/modules/dashboard/ui/components/dashboard-sidebar";

interface Props{
    children: React.ReactNode
}

const Layout = async ({ children}: Props) => {
    // Аутентификация теперь проверяется в middleware.ts
    return ( 
        <SidebarProvider>
            <DashboardSidebar/>
            <main className="flex flex-col h-screen w-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
                <DashboardNavbar/>
                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </main>
        </SidebarProvider>
     );
}
 
export default Layout;
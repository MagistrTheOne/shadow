import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardNavbar } from "@/modules/dashboard/ui/components/dashboard-navbar";
import { DashboardSidebar } from "@/modules/dashboard/ui/components/dashboard-sidebar";
import { BreadcrumbManager } from "@/components/breadcrumb-manager";

interface Props{
    children: React.ReactNode
}

const Layout = async ({ children}: Props) => {
    // Аутентификация теперь проверяется в middleware.ts
    return ( 
        <SidebarProvider>
            <BreadcrumbManager />
            <DashboardSidebar/>
                <main className="flex flex-col h-screen w-screen bg-black">
                <DashboardNavbar/>
                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </main>
        </SidebarProvider>
     );
}
 
export default Layout;


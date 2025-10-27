import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardNavbar } from "@/modules/dashboard/ui/components/dashboard-navbar";
import { DashboardSidebar } from "@/modules/dashboard/ui/components/dashboard-sidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

interface Props{
    children: React.ReactNode
}

const Layout = async ({ children}: Props) => {
    // Проверяем аутентификацию на уровне layout
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

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
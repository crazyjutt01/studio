import { Header } from '@/components/header';
import { SidebarNav } from '@/components/sidebar-nav';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
} from '@/components/ui/sidebar';
import { FinSafeLogo } from '@/components/icons';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function SpendSpyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar
          variant="sidebar"
          collapsible="icon"
          className="bg-card border-r"
        >
          <SidebarHeader className="flex items-center gap-2 p-4">
            <FinSafeLogo className="w-8 h-8 text-primary" />
            <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
              FinSafe
            </span>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarNav />
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="bg-secondary/50">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

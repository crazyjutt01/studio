'use client';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  BotMessageSquare,
  CircleDollarSign,
  LayoutDashboard,
  LifeBuoy,
  ReceiptText,
  Settings,
  ShieldAlert,
  Target,
} from 'lucide-react';
import { usePathname } from 'next/navigation';

const menuItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/spend-spy', icon: ReceiptText, label: 'SpendSpy' },
  { href: '/budget-bot', icon: CircleDollarSign, label: 'BudgetBot' },
  { href: '/goal-guru', icon: Target, label: 'GoalGuru' },
  { href: '/advisor-ai', icon: BotMessageSquare, label: 'AdvisorAI' },
];

const secondaryMenuItems = [
    { href: '/help-support', icon: LifeBuoy, label: 'Help & Support' },
    { href: '/crisis-guardian', icon: ShieldAlert, label: 'CrisisGuardian' },
    { href: '/settings', icon: Settings, label: 'Settings' },
]

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarMenu>
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              tooltip={item.label}
            >
              <a href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <div className="mt-auto">
        <SidebarMenu>
            {secondaryMenuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
                >
                <a href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                </a>
                </SidebarMenuButton>
            </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </div>
    </>
  );
}

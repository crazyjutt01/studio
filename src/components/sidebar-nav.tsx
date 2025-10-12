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
  { href: '#', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '#', icon: ReceiptText, label: 'SpendSpy' },
  { href: '#', icon: CircleDollarSign, label: 'BudgetBot' },
  { href: '#', icon: Target, label: 'GoalGuru' },
  { href: '#', icon: BotMessageSquare, label: 'AdvisorAI' },
];

const secondaryMenuItems = [
    { href: '#', icon: LifeBuoy, label: 'Help & Support' },
    { href: '#', icon: ShieldAlert, label: 'CrisisGuardian' },
    { href: '#', icon: Settings, label: 'Settings' },
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

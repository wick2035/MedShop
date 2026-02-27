import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Stethoscope,
  Heart,
  Pill,
  Package,
  ClipboardList,
  FileText,
  Shield,
  Bell,
  User,
} from 'lucide-react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import type { SidebarItem } from './Sidebar';
import { cn } from '@/lib/utils';

const sidebarItems: SidebarItem[] = [
  { id: 'dashboard', label: '首页', icon: LayoutDashboard, href: '/patient' },
  { id: 'doctors', label: '找医生', icon: Stethoscope, href: '/patient/doctors' },
  { id: 'services', label: '医疗服务', icon: Heart, href: '/patient/services' },
  { id: 'pharmacy', label: '药房', icon: Pill, href: '/patient/products' },
  { id: 'packages', label: '健康套餐', icon: Package, href: '/patient/packages' },
  { id: 'orders', label: '我的订单', icon: ClipboardList, href: '/patient/orders' },
  { id: 'prescriptions', label: '我的处方', icon: FileText, href: '/patient/prescriptions' },
  { id: 'insurance', label: '医保', icon: Shield, href: '/patient/insurance' },
  { id: 'notifications', label: '通知', icon: Bell, href: '/patient/notifications' },
  { id: 'profile', label: '个人中心', icon: User, href: '/patient/profile' },
];

export default function PatientLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const sidebarWidth = sidebarCollapsed ? 72 : 240;

  return (
    <div className="min-h-screen bg-ivory-50">
      {/* Desktop sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar
          items={sidebarItems}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main content area */}
      <main
        className={cn(
          'min-h-screen pb-16 transition-[margin-left] duration-300 ease-out md:pb-0',
        )}
        style={{ marginLeft: `var(--sidebar-width, 0px)` }}
      >
        {/* CSS variable for sidebar width (only applies on md+) */}
        <style>{`
          @media (min-width: 768px) {
            :root { --sidebar-width: ${sidebarWidth}px; }
          }
          @media (max-width: 767px) {
            :root { --sidebar-width: 0px; }
          }
        `}</style>
        <Outlet />
      </main>

      {/* Mobile bottom navigation */}
      <BottomNav />
    </div>
  );
}

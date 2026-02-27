import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Bell,
  User,
} from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import type { SidebarItem } from './Sidebar';

const sidebarItems: SidebarItem[] = [
  { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard, href: '/doctor' },
  { id: 'schedules', label: '我的排班', icon: Calendar, href: '/doctor/schedules' },
  { id: 'patients', label: '我的患者', icon: Users, href: '/doctor/patients' },
  { id: 'prescriptions', label: '处方管理', icon: FileText, href: '/doctor/prescriptions' },
  { id: 'notifications', label: '通知', icon: Bell, href: '/doctor/notifications' },
  { id: 'profile', label: '个人中心', icon: User, href: '/doctor/profile' },
];

export default function DoctorLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sidebarWidth = sidebarCollapsed ? 72 : 240;

  return (
    <div className="min-h-screen bg-ivory-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          items={sidebarItems}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-sage-900/20 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar
              items={sidebarItems}
              collapsed={false}
              onToggleCollapse={() => setMobileMenuOpen(false)}
            />
          </div>
        </>
      )}

      {/* Main content area */}
      <div
        className="min-h-screen transition-[margin-left] duration-300 ease-out"
        style={{ marginLeft: `var(--doctor-sidebar-width, 0px)` }}
      >
        <style>{`
          @media (min-width: 1024px) {
            :root { --doctor-sidebar-width: ${sidebarWidth}px; }
          }
          @media (max-width: 1023px) {
            :root { --doctor-sidebar-width: 0px; }
          }
        `}</style>

        <TopBar onMenuClick={() => setMobileMenuOpen(true)} />

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

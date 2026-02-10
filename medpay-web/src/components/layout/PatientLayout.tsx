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
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/patient' },
  { id: 'doctors', label: 'Doctors', icon: Stethoscope, href: '/patient/doctors' },
  { id: 'services', label: 'Services', icon: Heart, href: '/patient/services' },
  { id: 'pharmacy', label: 'Pharmacy', icon: Pill, href: '/patient/products' },
  { id: 'packages', label: 'Packages', icon: Package, href: '/patient/packages' },
  { id: 'orders', label: 'My Orders', icon: ClipboardList, href: '/patient/orders' },
  { id: 'prescriptions', label: 'Prescriptions', icon: FileText, href: '/patient/prescriptions' },
  { id: 'insurance', label: 'Insurance', icon: Shield, href: '/patient/insurance' },
  { id: 'notifications', label: 'Notifications', icon: Bell, href: '/patient/notifications' },
  { id: 'profile', label: 'Profile', icon: User, href: '/patient/profile' },
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

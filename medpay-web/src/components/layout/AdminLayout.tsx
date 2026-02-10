import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  Calendar,
  ClipboardList,
  CreditCard,
  RotateCcw,
  Shield,
  Scale,
  BarChart3,
  Landmark,
  Bell,
  ScrollText,
} from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import type { SidebarGroup } from './Sidebar';

const sidebarGroups: SidebarGroup[] = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    ],
  },
  {
    title: 'Management',
    items: [
      { id: 'hospitals', label: 'Hospitals', icon: Building2, href: '/admin/hospitals' },
      { id: 'catalog', label: 'Catalog', icon: BookOpen, href: '/admin/catalog/services' },
      { id: 'schedules', label: 'Schedules', icon: Calendar, href: '/admin/schedules' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { id: 'orders', label: 'Orders', icon: ClipboardList, href: '/admin/orders' },
      { id: 'payments', label: 'Payments', icon: CreditCard, href: '/admin/payments' },
      { id: 'refunds', label: 'Refunds', icon: RotateCcw, href: '/admin/refunds' },
    ],
  },
  {
    title: 'Finance',
    items: [
      { id: 'insurance', label: 'Insurance', icon: Shield, href: '/admin/insurance/claims' },
      { id: 'reconciliation', label: 'Reconciliation', icon: Scale, href: '/admin/reconciliation' },
      { id: 'reports', label: 'Reports', icon: BarChart3, href: '/admin/reports' },
      { id: 'settlements', label: 'Settlements', icon: Landmark, href: '/admin/settlements' },
    ],
  },
  {
    title: 'System',
    items: [
      { id: 'notifications', label: 'Notifications', icon: Bell, href: '/admin/notifications' },
      { id: 'audit', label: 'Audit Log', icon: ScrollText, href: '/admin/audit' },
    ],
  },
];

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sidebarWidth = sidebarCollapsed ? 72 : 240;

  return (
    <div className="min-h-screen bg-ivory-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          groups={sidebarGroups}
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
              groups={sidebarGroups}
              collapsed={false}
              onToggleCollapse={() => setMobileMenuOpen(false)}
            />
          </div>
        </>
      )}

      {/* Main content area */}
      <div
        className="min-h-screen transition-[margin-left] duration-300 ease-out"
        style={{ marginLeft: `var(--admin-sidebar-width, 0px)` }}
      >
        <style>{`
          @media (min-width: 1024px) {
            :root { --admin-sidebar-width: ${sidebarWidth}px; }
          }
          @media (max-width: 1023px) {
            :root { --admin-sidebar-width: 0px; }
          }
        `}</style>

        <TopBar
          showHospitalSelector
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

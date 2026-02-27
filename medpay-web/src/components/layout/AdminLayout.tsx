import { useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { UserRole } from '@/types/enums';
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
    title: '概览',
    items: [
      { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard, href: '/admin' },
    ],
  },
  {
    title: '管理',
    items: [
      { id: 'hospitals', label: '医院', icon: Building2, href: '/admin/hospitals' },
      { id: 'catalog', label: '服务目录', icon: BookOpen, href: '/admin/catalog/services' },
      { id: 'schedules', label: '排班', icon: Calendar, href: '/admin/schedules' },
    ],
  },
  {
    title: '运营',
    items: [
      { id: 'orders', label: '订单', icon: ClipboardList, href: '/admin/orders' },
      { id: 'payments', label: '支付', icon: CreditCard, href: '/admin/payments' },
      { id: 'refunds', label: '退款', icon: RotateCcw, href: '/admin/refunds' },
    ],
  },
  {
    title: '财务',
    items: [
      { id: 'insurance', label: '医保', icon: Shield, href: '/admin/insurance/claims' },
      { id: 'reconciliation', label: '对账', icon: Scale, href: '/admin/reconciliation' },
      { id: 'reports', label: '报表', icon: BarChart3, href: '/admin/reports' },
      { id: 'settlements', label: '结算', icon: Landmark, href: '/admin/settlements' },
    ],
  },
  {
    title: '系统',
    items: [
      { id: 'notifications', label: '通知', icon: Bell, href: '/admin/notifications' },
      { id: 'audit', label: '审计日志', icon: ScrollText, href: '/admin/audit' },
    ],
  },
];

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

  const filteredGroups = useMemo(
    () =>
      sidebarGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => item.id !== 'hospitals' || isSuperAdmin),
        }))
        .filter((group) => group.items.length > 0),
    [isSuperAdmin],
  );

  const sidebarWidth = sidebarCollapsed ? 72 : 240;

  return (
    <div className="min-h-screen bg-ivory-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          groups={filteredGroups}
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
              groups={filteredGroups}
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

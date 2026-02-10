import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Heart,
  ClipboardList,
  FileText,
  Bell,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import { containerVariants, itemVariants } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuthStore } from '@/stores/auth.store';
import { ordersApi } from '@/api/orders.api';
import { notificationsApi } from '@/api/notifications.api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ORDER_TYPE_LABELS } from '@/lib/constants';
import type { OrderResponse } from '@/types/order';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [recentOrders, setRecentOrders] = useState<OrderResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const [ordersResult, unread] = await Promise.all([
          ordersApi.list(user.id, { page: 0, size: 5 }),
          notificationsApi.getUnreadCount(),
        ]);
        setRecentOrders(ordersResult.content);
        setUnreadCount(unread);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const quickActions = [
    {
      icon: Stethoscope,
      label: 'Book Appointment',
      description: 'Find a doctor and book',
      color: 'bg-sage-50 text-sage-600',
      onClick: () => navigate('/patient/doctors'),
    },
    {
      icon: Heart,
      label: 'Browse Services',
      description: 'Medical services catalog',
      color: 'bg-blue-50 text-blue-600',
      onClick: () => navigate('/patient/services'),
    },
    {
      icon: ClipboardList,
      label: 'My Orders',
      description: 'View order history',
      color: 'bg-amber-50 text-amber-600',
      onClick: () => navigate('/patient/orders'),
    },
    {
      icon: FileText,
      label: 'My Prescriptions',
      description: 'View prescriptions',
      color: 'bg-purple-50 text-purple-600',
      onClick: () => navigate('/patient/prescriptions'),
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
    >
      {/* Welcome section */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-sage-800 sm:text-3xl">
              Welcome back, {user?.fullName || 'User'}
            </h1>
            <p className="mt-1 text-sage-700/60">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {/* Notifications badge */}
          <button
            onClick={() => navigate('/patient/notifications')}
            className="relative rounded-lg bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
          >
            <Bell className="h-5 w-5 text-sage-600" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-terracotta px-1 text-[10px] font-bold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </motion.div>

      {/* Quick actions */}
      <motion.div variants={itemVariants} className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-sage-800">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Card
              key={action.label}
              hover
              className="cursor-pointer p-4"
            >
              <button
                onClick={action.onClick}
                className="flex w-full flex-col items-start gap-3 text-left"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color}`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-sage-800">{action.label}</p>
                  <p className="mt-0.5 text-xs text-sage-700/60">{action.description}</p>
                </div>
              </button>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Recent orders */}
      <motion.div variants={itemVariants}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-sage-800">Recent Orders</h2>
          <button
            onClick={() => navigate('/patient/orders')}
            className="flex items-center gap-1 text-sm font-medium text-sage-500 transition-colors hover:text-sage-600"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer h-20 rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <Card className="py-8 text-center">
            <p className="text-sm text-red-500">{error}</p>
          </Card>
        ) : recentOrders.length === 0 ? (
          <Card className="py-12 text-center">
            <ClipboardList className="mx-auto h-10 w-10 text-sage-300" />
            <p className="mt-3 text-sm text-sage-700/60">No orders yet</p>
            <button
              onClick={() => navigate('/patient/services')}
              className="mt-3 text-sm font-medium text-sage-500 hover:text-sage-600"
            >
              Browse services to get started
            </button>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Card
                key={order.id}
                hover
                className="cursor-pointer p-4"
              >
                <button
                  onClick={() => navigate(`/patient/orders/${order.id}`)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage-50">
                      <Calendar className="h-5 w-5 text-sage-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-sage-800">
                          {order.orderNo}
                        </span>
                        <Badge variant="sage" size="sm">
                          {ORDER_TYPE_LABELS[order.orderType] || order.orderType}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-sage-700/60">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-sage-800">
                      {formatCurrency(order.totalAmount)}
                    </span>
                    <StatusBadge status={order.status} type="order" />
                  </div>
                </button>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

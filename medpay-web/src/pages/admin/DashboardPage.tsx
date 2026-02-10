import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingCart,
  RotateCcw,
  Clock,
  TrendingUp,
  Package,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import type { DashboardKpiResponse, RevenueByMonth } from '@/types/report';
import type { HospitalResponse } from '@/types/hospital';
import { UserRole } from '@/types/enums';

import PageContainer, { containerVariants, itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import StatCard from '@/components/data/StatCard';
import { Button } from '@/components/ui/Button';

import { reportsApi } from '@/api/reports.api';
import { hospitalsApi } from '@/api/hospitals.api';
import { useAuthStore } from '@/stores/auth.store';
import { useHospitalContextStore } from '@/stores/hospital-context.store';

/* ── Mock chart components (fallback when chart components aren't available) ── */

function RevenueChartFallback({ data }: { data: RevenueByMonth[] }) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div className="rounded-lg border border-ivory-200/60 bg-white/70 p-6 backdrop-blur-sm">
      <h3 className="mb-4 font-display text-lg font-semibold text-sage-800">Revenue Trend</h3>
      <div className="flex items-end gap-2" style={{ height: 200 }}>
        {data.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t bg-sage-400 transition-all"
              style={{ height: `${(d.revenue / maxRevenue) * 160}px` }}
            />
            <span className="text-xs text-gray-500">{d.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderPieChartFallback({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data);
  const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
  const colors = [
    'bg-sage-400',
    'bg-terracotta',
    'bg-amber-400',
    'bg-blue-400',
    'bg-emerald-400',
    'bg-purple-400',
  ];
  return (
    <div className="rounded-lg border border-ivory-200/60 bg-white/70 p-6 backdrop-blur-sm">
      <h3 className="mb-4 font-display text-lg font-semibold text-sage-800">Orders by Status</h3>
      <div className="space-y-2">
        {entries.map(([key, value], i) => (
          <div key={key} className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${colors[i % colors.length]}`} />
            <span className="flex-1 text-sm text-gray-600">{key}</span>
            <span className="text-sm font-medium text-gray-800">{value}</span>
            <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full ${colors[i % colors.length]}`}
                style={{ width: `${(value / total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBarChartFallback({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data);
  const maxVal = Math.max(...entries.map(([, v]) => v), 1);
  return (
    <div className="rounded-lg border border-ivory-200/60 bg-white/70 p-6 backdrop-blur-sm">
      <h3 className="mb-4 font-display text-lg font-semibold text-sage-800">Revenue by Channel</h3>
      <div className="space-y-3">
        {entries.map(([key, value]) => (
          <div key={key}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-gray-600">{key}</span>
              <span className="font-medium text-gray-800">{value.toLocaleString()}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-terracotta transition-all"
                style={{ width: `${(value / maxVal) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Sample data for when API returns empty ── */

const SAMPLE_REVENUE_DATA: RevenueByMonth[] = [
  { month: '2024-07', revenue: 125000, orderCount: 342 },
  { month: '2024-08', revenue: 148000, orderCount: 398 },
  { month: '2024-09', revenue: 132000, orderCount: 367 },
  { month: '2024-10', revenue: 165000, orderCount: 421 },
  { month: '2024-11', revenue: 178000, orderCount: 456 },
  { month: '2024-12', revenue: 195000, orderCount: 489 },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { selectedHospitalId, setHospitalId } = useHospitalContextStore();

  const [kpi, setKpi] = useState<DashboardKpiResponse | null>(null);
  const [hospitals, setHospitals] = useState<HospitalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashData, hospitalData] = await Promise.all([
        reportsApi.getDashboard(selectedHospitalId ?? undefined),
        isSuperAdmin ? hospitalsApi.list() : Promise.resolve([]),
      ]);
      setKpi(dashData);
      if (isSuperAdmin) setHospitals(hospitalData);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load dashboard';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedHospitalId]);

  const revenueData =
    kpi?.revenueByMonth && kpi.revenueByMonth.length > 0
      ? kpi.revenueByMonth
      : SAMPLE_REVENUE_DATA;

  if (loading) {
    return (
      <PageContainer>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage-200 border-t-sage-500" />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-500">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <p>{error}</p>
          <Button variant="outline" onClick={fetchData}>
            Retry
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of key metrics and performance"
        actions={
          isSuperAdmin ? (
            <select
              value={selectedHospitalId ?? ''}
              onChange={(e) => setHospitalId(e.target.value || null)}
              className="rounded-md border border-ivory-200 bg-white px-3 py-2 text-sm text-sage-700 focus:border-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-500/20"
            >
              <option value="">All Hospitals</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          ) : undefined
        }
      />

      {/* Primary KPI Row */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={itemVariants}>
          <StatCard
            icon={DollarSign}
            label="Today Revenue"
            value={kpi?.todayRevenue ?? 0}
            prefix="¥"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            icon={ShoppingCart}
            label="Today Orders"
            value={kpi?.todayOrders ?? 0}
            prefix=""
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            icon={RotateCcw}
            label="Today Refunds"
            value={kpi?.totalRefunds ?? 0}
            prefix="¥"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            icon={Clock}
            label="Pending Refunds"
            value={kpi?.ordersByStatus?.REFUND_REQUESTED ?? 0}
            prefix=""
          />
        </motion.div>
      </motion.div>

      {/* Secondary KPI Row */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={itemVariants}>
          <StatCard
            icon={TrendingUp}
            label="Month Revenue"
            value={kpi?.totalRevenue ?? 0}
            prefix="¥"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            icon={Package}
            label="Month Orders"
            value={kpi?.totalOrders ?? 0}
            prefix=""
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            icon={RotateCcw}
            label="Month Refunds"
            value={kpi?.totalRefunds ?? 0}
            prefix="¥"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            icon={CreditCard}
            label="Settlement Pending"
            value={kpi?.ordersByStatus?.PAID ?? 0}
            prefix=""
          />
        </motion.div>
      </motion.div>

      {/* Revenue Chart */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="mb-8">
        <RevenueChartFallback data={revenueData} />
      </motion.div>

      {/* Side-by-side Charts */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        <motion.div variants={itemVariants}>
          <OrderPieChartFallback data={kpi?.ordersByStatus ?? {}} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatusBarChartFallback data={kpi?.revenueByChannel ?? {}} />
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}
